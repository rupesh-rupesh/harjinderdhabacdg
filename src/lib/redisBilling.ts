import { eq } from 'drizzle-orm';
import cache from './redis.js';

export interface Bill {
  id: number;
  userId: number;
  tableNumber?: string;
  items: any;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft';
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt?: string;
}

export const REDIS_KEYS = {
  HYDRATED: 'bills:hydrated',
  HYDRATING_LOCK: 'bills:hydrating',
  ACTIVE: 'bills:active',
  DRAFT: 'bills:draft',
  COMPLETED: 'bills:completed',
  CANCELLED: 'bills:cancelled',
  SEQ: 'bills:seq',
  POS_USER_ID: 'pos_system_user_id',
};

// Helper to extract tableNumber from items if not directly set
export function extractTableNumber(bill: any): string | undefined {
  if (bill.tableNumber) return String(bill.tableNumber);
  try {
    const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;
    if (Array.isArray(items)) {
      const marker = items.find((i: any) => i.isTableMarker || (i.name && i.name.startsWith('Table ')));
      if (marker && marker.name) {
        const match = marker.name.match(/Table\s+(\d+|Takeaway|Delivery|[A-Za-z0-9_-]+)/i);
        if (match) return match[1];
      }
    }
  } catch (_) {}
  return undefined;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * One-Time Hydration Strategy (NO Repeated DB Reads)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Checks if Redis has already been hydrated using `bills:hydrated`.
 * 2. If already hydrated, returns immediately (ZERO DB queries).
 * 3. On cold start, queries DB ONCE for ONLY completed bills.
 *    Active, draft, and cancelled bills are NEVER fetched from DB.
 */
export async function ensureHydrated(db: any, ordersTable: any): Promise<void> {
  try {
    if (!db || !ordersTable) return;

    const isHydrated = await cache.get(REDIS_KEYS.HYDRATED);
    if (isHydrated === 'true' || isHydrated === '1') {
      return; // Already hydrated! ZERO DB reads.
    }

    const hydrating = await cache.get(REDIS_KEYS.HYDRATING_LOCK);
    if (hydrating) {
      return;
    }
    await cache.setEx(REDIS_KEYS.HYDRATING_LOCK, 30, '1');

    console.log('🔄 Initializing one-time Redis hydration for completed bills from database...');

    // Fetch ONLY completed bills from primary DB
    const completedDbBills = await db.select().from(ordersTable)
      .where(eq(ordersTable.status, 'completed'))
      .orderBy(ordersTable.id);

    console.log(`📦 Loaded ${completedDbBills.length} completed bills from database into Redis.`);

    let maxId = 1000;
    for (const bill of completedDbBills) {
      const billId = Number(bill.id);
      if (billId > maxId) maxId = billId;

      const billData: Bill = {
        id: billId,
        userId: Number(bill.userId) || 1,
        tableNumber: extractTableNumber(bill),
        items: typeof bill.items === 'string' ? bill.items : JSON.stringify(bill.items),
        total: Number(bill.total) || 0,
        status: 'completed',
        createdAt: bill.createdAt ? new Date(bill.createdAt).toISOString() : new Date().toISOString(),
        completedAt: bill.createdAt ? new Date(bill.createdAt).toISOString() : new Date().toISOString()
      };

      await cache.hSet(REDIS_KEYS.COMPLETED, billId.toString(), JSON.stringify(billData));
    }

    // Migrate any legacy active_orders from Redis if present
    try {
      const legacyActive = await cache.hGetAll('active_orders');
      if (legacyActive && typeof legacyActive === 'object') {
        for (const [k, v] of Object.entries(legacyActive)) {
          if (v && typeof v === 'string') {
            const parsed = JSON.parse(v);
            const bId = Number(parsed.id || k);
            if (bId > maxId) maxId = bId;
            parsed.tableNumber = extractTableNumber(parsed);
            await cache.hSet(REDIS_KEYS.ACTIVE, bId.toString(), JSON.stringify(parsed));
          }
        }
      }
    } catch (_) {}

    // Migrate any legacy drafts from Redis if present
    try {
      const draftKeys = await cache.keys('draft:table:*');
      for (const dk of draftKeys) {
        const val = await cache.get(dk);
        if (val) {
          const tNum = dk.replace('draft:table:', '');
          await cache.hSet(REDIS_KEYS.DRAFT, tNum, val as string);
        }
      }
    } catch (_) {}

    // Initialize sequence counter so new bills never collide with old bills
    const existingSeq = await cache.get(REDIS_KEYS.SEQ);
    if (!existingSeq || Number(existingSeq) < maxId) {
      await cache.set(REDIS_KEYS.SEQ, Math.max(maxId, 1000).toString());
    }

    // Mark hydrated permanently
    await cache.set(REDIS_KEYS.HYDRATED, 'true');
    console.log('✅ One-time Redis billing hydration complete. All subsequent reads served from Redis.');
  } catch (err) {
    console.error('⚠️ Redis billing hydration error:', err);
  } finally {
    await cache.del(REDIS_KEYS.HYDRATING_LOCK).catch(() => {});
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Draft Bills (Redis-Only)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function saveDraft(tableNumber: string | number, items: any, total: number) {
  const tKey = String(tableNumber);
  const draftData = {
    tableNumber: tKey,
    items: typeof items === 'string' ? JSON.parse(items) : items,
    total: Number(total) || 0,
    updatedAt: Date.now()
  };
  const jsonStr = JSON.stringify(draftData);
  await cache.hSet(REDIS_KEYS.DRAFT, tKey, jsonStr);
  // Also keep legacy draft key for backwards compatibility
  await cache.set(`draft:table:${tKey}`, jsonStr);
  return draftData;
}

export async function getDrafts() {
  const draftsMap = await cache.hGetAll(REDIS_KEYS.DRAFT);
  let drafts = Object.values(draftsMap || {}).map((s: any) => {
    try { return JSON.parse(s); } catch (_) { return null; }
  }).filter(Boolean);

  if (drafts.length === 0) {
    // Check legacy keys
    try {
      const keys = await cache.keys('draft:table:*');
      for (const k of keys) {
        const val = await cache.get(k);
        if (val) drafts.push(JSON.parse(val as string));
      }
    } catch (_) {}
  }

  return drafts;
}

export async function deleteDraft(tableNumber: string | number) {
  const tKey = String(tableNumber);
  await cache.hDel(REDIS_KEYS.DRAFT, tKey);
  await cache.del(`draft:table:${tKey}`);
  return { success: true };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Active Bills (Redis-Only)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function createActiveBill(params: {
  tableNumber?: string | number;
  items: any;
  total: number;
  userId?: number;
  status?: 'pending' | 'processing';
}): Promise<Bill> {
  const nextId = await cache.incr(REDIS_KEYS.SEQ);
  const rawItems = params.items;
  let itemsStr: string;

  if (typeof rawItems === 'string') {
    itemsStr = rawItems;
  } else {
    itemsStr = JSON.stringify(rawItems);
  }

  const tableNum = params.tableNumber ? String(params.tableNumber) : extractTableNumber({ items: rawItems });

  const bill: Bill = {
    id: Number(nextId),
    userId: Number(params.userId) || 1,
    tableNumber: tableNum,
    items: itemsStr,
    total: Number(params.total) || 0,
    status: params.status || 'pending',
    createdAt: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(bill);
  await cache.hSet(REDIS_KEYS.ACTIVE, nextId.toString(), jsonStr);
  // Also update legacy active_orders for safety
  await cache.hSet('active_orders', nextId.toString(), jsonStr);

  if (tableNum) {
    await deleteDraft(tableNum);
  }

  return bill;
}

export async function getActiveBills(): Promise<Bill[]> {
  const activeMap = await cache.hGetAll(REDIS_KEYS.ACTIVE);
  let bills: Bill[] = Object.values(activeMap || {}).map((s: any) => {
    try {
      const b = JSON.parse(s);
      b.tableNumber = extractTableNumber(b);
      return b;
    } catch (_) {
      return null;
    }
  }).filter(Boolean);

  if (bills.length === 0) {
    try {
      const legacyActive = await cache.hGetAll('active_orders');
      if (legacyActive && typeof legacyActive === 'object') {
        bills = Object.values(legacyActive).map((s: any) => {
          try {
            const b = JSON.parse(s);
            b.tableNumber = extractTableNumber(b);
            return b;
          } catch (_) { return null; }
        }).filter(Boolean);
      }
    } catch (_) {}
  }

  bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return bills;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Find Bill Across Redis Hashes
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function findBillInRedis(id: number | string): Promise<{ bill: Bill; statusCategory: 'active' | 'completed' | 'cancelled' | 'draft' } | null> {
  const idStr = String(id);

  // Check active
  const activeStr = await cache.hGet(REDIS_KEYS.ACTIVE, idStr);
  if (activeStr) {
    return { bill: JSON.parse(activeStr), statusCategory: 'active' };
  }

  // Check completed
  const completedStr = await cache.hGet(REDIS_KEYS.COMPLETED, idStr);
  if (completedStr) {
    return { bill: JSON.parse(completedStr), statusCategory: 'completed' };
  }

  // Check cancelled
  const cancelledStr = await cache.hGet(REDIS_KEYS.CANCELLED, idStr);
  if (cancelledStr) {
    return { bill: JSON.parse(cancelledStr), statusCategory: 'cancelled' };
  }

  // Check draft
  const draftStr = await cache.hGet(REDIS_KEYS.DRAFT, idStr);
  if (draftStr) {
    return { bill: JSON.parse(draftStr), statusCategory: 'draft' };
  }

  return null;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Update Bill & Status Transitions (Atomic Redis transitions & DB Write-Through)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function updateBill(
  id: number | string,
  updateData: { status?: string; items?: any; total?: number },
  db: any,
  ordersTable: any
): Promise<Bill> {
  const idNum = Number(id);
  const idStr = idNum.toString();

  // Find the bill
  let found = await findBillInRedis(idStr);
  let bill: Bill;

  if (found) {
    bill = { ...found.bill };
  } else {
    // Check DB as fallback for historical order
    const dbOrder = await db.select().from(ordersTable).where(eq(ordersTable.id, idNum)).limit(1);
    if (dbOrder.length === 0) {
      throw new Error(`Bill #${id} not found`);
    }
    const o = dbOrder[0];
    bill = {
      id: o.id,
      userId: o.userId,
      tableNumber: extractTableNumber(o),
      items: typeof o.items === 'string' ? o.items : JSON.stringify(o.items),
      total: Number(o.total) || 0,
      status: o.status,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString()
    };
  }

  // Apply field updates
  if (updateData.items !== undefined) {
    bill.items = typeof updateData.items === 'string' ? updateData.items : JSON.stringify(updateData.items);
    bill.tableNumber = extractTableNumber(bill);
  }
  if (updateData.total !== undefined) {
    bill.total = Number(updateData.total);
  }
  bill.updatedAt = new Date().toISOString();

  const targetStatus = updateData.status || bill.status;

  // ─── Transition to COMPLETED (Write-Through to DB + Update Redis) ───
  if (targetStatus === 'completed') {
    bill.status = 'completed';
    bill.completedAt = bill.completedAt || new Date().toISOString();

    // 1. Write-through to primary database
    try {
      const existingInDb = await db.select().from(ordersTable).where(eq(ordersTable.id, idNum)).limit(1);
      if (existingInDb.length > 0) {
        await db.update(ordersTable).set({
          status: 'completed',
          items: typeof bill.items === 'string' ? bill.items : JSON.stringify(bill.items),
          total: bill.total
        }).where(eq(ordersTable.id, idNum));
      } else {
        await db.insert(ordersTable).values({
          id: bill.id,
          userId: Number(bill.userId) || 1,
          items: typeof bill.items === 'string' ? bill.items : JSON.stringify(bill.items),
          total: bill.total,
          status: 'completed',
          createdAt: new Date(bill.createdAt || Date.now())
        });
      }
    } catch (dbErr: any) {
      console.error(`[BillingRedis] Failed writing completed bill #${bill.id} to database:`, dbErr);
      throw new Error(`Database write failed for completed bill: ${dbErr.message}`);
    }

    // 2. Atomic state transition in Redis (Remove from active/draft/cancelled, save to completed)
    try {
      await cache.hDel(REDIS_KEYS.ACTIVE, idStr);
      await cache.hDel('active_orders', idStr);
      await cache.hDel(REDIS_KEYS.CANCELLED, idStr);
      await cache.hDel(REDIS_KEYS.DRAFT, idStr);
      await cache.hSet(REDIS_KEYS.COMPLETED, idStr, JSON.stringify(bill));
      await cache.setEx(`completed_order:${idStr}`, 48 * 3600, JSON.stringify(bill));
    } catch (redisErr) {
      console.error(`[BillingRedis] Redis sync error for completed bill #${bill.id}:`, redisErr);
      // DB write succeeded; don't throw to avoid losing completion
    }

    return bill;
  }

  // ─── Transition to CANCELLED (Redis-Only, unless already in DB) ───
  if (targetStatus === 'cancelled') {
    bill.status = 'cancelled';
    bill.cancelledAt = bill.cancelledAt || new Date().toISOString();

    // Check if bill was already persisted in DB
    try {
      const inDb = await db.select().from(ordersTable).where(eq(ordersTable.id, idNum)).limit(1);
      if (inDb.length > 0) {
        await db.update(ordersTable).set({ status: 'cancelled' }).where(eq(ordersTable.id, idNum));
      }
    } catch (_) {}

    // Atomic state transition in Redis (Remove from active/completed/draft, save to cancelled)
    await cache.hDel(REDIS_KEYS.ACTIVE, idStr);
    await cache.hDel('active_orders', idStr);
    await cache.hDel(REDIS_KEYS.COMPLETED, idStr);
    await cache.hDel(REDIS_KEYS.DRAFT, idStr);
    await cache.hSet(REDIS_KEYS.CANCELLED, idStr, JSON.stringify(bill));

    return bill;
  }

  // ─── Remains ACTIVE / DRAFT ───
  bill.status = targetStatus as any;
  await cache.hSet(REDIS_KEYS.ACTIVE, idStr, JSON.stringify(bill));
  await cache.hSet('active_orders', idStr, JSON.stringify(bill));

  return bill;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Delete Bill (Removes from Redis & DB if present)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function deleteBill(id: number | string, db: any, ordersTable: any): Promise<{ success: boolean }> {
  const idNum = Number(id);
  const idStr = idNum.toString();

  await cache.hDel(REDIS_KEYS.ACTIVE, idStr);
  await cache.hDel('active_orders', idStr);
  await cache.hDel(REDIS_KEYS.COMPLETED, idStr);
  await cache.hDel(REDIS_KEYS.CANCELLED, idStr);
  await cache.hDel(REDIS_KEYS.DRAFT, idStr);
  await cache.del(`completed_order:${idStr}`);

  try {
    await db.delete(ordersTable).where(eq(ordersTable.id, idNum));
  } catch (_) {}

  return { success: true };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Get Orders / Billing Records (Served 100% from Redis, ZERO DB Queries)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getBills(query: {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  searchType?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}): Promise<Bill[]> {
  const limitNum = Math.min(Number(query.limit) || 50, 500);
  const offsetNum = Number(query.offset) || 0;
  const statusFilter = query.status?.toLowerCase();

  let targetBills: Bill[] = [];

  if (statusFilter === 'active' || statusFilter === 'pending' || statusFilter === 'processing') {
    const activeMap = await cache.hGetAll(REDIS_KEYS.ACTIVE);
    targetBills = Object.values(activeMap || {}).map((s: any) => {
      try {
        const b = JSON.parse(s);
        b.tableNumber = extractTableNumber(b);
        return b;
      } catch (_) { return null; }
    }).filter(Boolean);
  } else if (statusFilter === 'completed') {
    const completedMap = await cache.hGetAll(REDIS_KEYS.COMPLETED);
    targetBills = Object.values(completedMap || {}).map((s: any) => {
      try {
        const b = JSON.parse(s);
        b.tableNumber = extractTableNumber(b);
        return b;
      } catch (_) { return null; }
    }).filter(Boolean);
  } else if (statusFilter === 'cancelled') {
    const cancelledMap = await cache.hGetAll(REDIS_KEYS.CANCELLED);
    targetBills = Object.values(cancelledMap || {}).map((s: any) => {
      try {
        const b = JSON.parse(s);
        b.tableNumber = extractTableNumber(b);
        return b;
      } catch (_) { return null; }
    }).filter(Boolean);
  } else {
    // All statuses: Merge active, completed, cancelled
    const [activeMap, completedMap, cancelledMap] = await Promise.all([
      cache.hGetAll(REDIS_KEYS.ACTIVE),
      cache.hGetAll(REDIS_KEYS.COMPLETED),
      cache.hGetAll(REDIS_KEYS.CANCELLED)
    ]);

    const activeList = Object.values(activeMap || {}).map((s: any) => {
      try { const b = JSON.parse(s); b.tableNumber = extractTableNumber(b); return b; } catch (_) { return null; }
    }).filter(Boolean);

    const completedList = Object.values(completedMap || {}).map((s: any) => {
      try { const b = JSON.parse(s); b.tableNumber = extractTableNumber(b); return b; } catch (_) { return null; }
    }).filter(Boolean);

    const cancelledList = Object.values(cancelledMap || {}).map((s: any) => {
      try { const b = JSON.parse(s); b.tableNumber = extractTableNumber(b); return b; } catch (_) { return null; }
    }).filter(Boolean);

    targetBills = [...activeList, ...completedList, ...cancelledList];
  }

  // ── Date Filtering ──
  if (query.date) {
    const targetDateStr = query.date.split('T')[0];
    targetBills = targetBills.filter(b => {
      const raw = b.completedAt || b.createdAt;
      if (!raw) return false;
      const d = new Date(raw);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${y}-${m}-${day}`;
      const isoDateStr = raw.split('T')[0];
      return localDateStr === targetDateStr || isoDateStr === targetDateStr;
    });
  } else if (query.startDate && query.endDate) {
    const start = new Date(query.startDate).getTime();
    const end = new Date(query.endDate).getTime();
    targetBills = targetBills.filter(b => {
      const t = new Date(b.completedAt || b.createdAt).getTime();
      return t >= start && t <= end;
    });
  }

  // ── Search Filtering ──
  if (query.search) {
    const sq = query.search.toLowerCase().trim();
    const st = query.searchType || 'all';

    targetBills = targetBills.filter(b => {
      const orderIdStr = String(b.id);
      const amountStr = Math.floor(Number(b.total) || 0).toString();
      const tableStr = (b.tableNumber || extractTableNumber(b) || '').toLowerCase();
      const itemsStr = (typeof b.items === 'string' ? b.items : JSON.stringify(b.items || '')).toLowerCase();

      if (st === 'orderNo') return orderIdStr.includes(sq);
      if (st === 'amount') return amountStr.includes(sq);
      if (st === 'table') return tableStr.includes(sq);

      // 'all'
      return orderIdStr.includes(sq) || amountStr.includes(sq) || tableStr.includes(sq) || itemsStr.includes(sq);
    });
  }

  // Sort descending by creation date
  targetBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Paginate
  return targetBills.slice(offsetNum, offsetNum + limitNum);
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-Time Stats & Revenue Calculation (Strictly Completed Bills for Revenue)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getBillingStats(): Promise<{
  dailyRevenue: number;
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  draftOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  posUsers: number;
}> {
  const [activeMap, completedMap, cancelledMap, draftMap] = await Promise.all([
    cache.hGetAll(REDIS_KEYS.ACTIVE),
    cache.hGetAll(REDIS_KEYS.COMPLETED),
    cache.hGetAll(REDIS_KEYS.CANCELLED),
    cache.hGetAll(REDIS_KEYS.DRAFT)
  ]);

  const activeCount = Object.keys(activeMap || {}).length;
  const cancelledCount = Object.keys(cancelledMap || {}).length;
  const draftCount = Object.keys(draftMap || {}).length;

  const completedBills: Bill[] = Object.values(completedMap || {}).map((s: any) => {
    try { return JSON.parse(s); } catch (_) { return null; }
  }).filter(Boolean);

  const completedCount = completedBills.length;

  // Strict Total Revenue: ONLY completed bills (drafts, active, cancelled 100% excluded)
  let totalRevenue = 0;
  let dailyRevenue = 0;

  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  for (const b of completedBills) {
    const amt = Number(b.total) || 0;
    totalRevenue += amt;

    const bDate = new Date(b.completedAt || b.createdAt);
    if (
      bDate.getFullYear() === todayY &&
      bDate.getMonth() === todayM &&
      bDate.getDate() === todayD
    ) {
      dailyRevenue += amt;
    }
  }

  // Zero double-counting: totalOrders represents all distinct tracked orders
  const totalOrders = completedCount + activeCount + cancelledCount;

  return {
    dailyRevenue: Math.round(dailyRevenue * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    activeOrders: activeCount,
    draftOrders: draftCount,
    cancelledOrders: cancelledCount,
    completedOrders: completedCount,
    posUsers: 1
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Daily Revenue Grouping (Strictly Completed Bills from Redis)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getDailyRevenueSeries(): Promise<Array<{ date_str: string; order_count: number; revenue: number }>> {
  const completedMap = await cache.hGetAll(REDIS_KEYS.COMPLETED);
  const completedBills: Bill[] = Object.values(completedMap || {}).map((s: any) => {
    try { return JSON.parse(s); } catch (_) { return null; }
  }).filter(Boolean);

  const dateMap: Record<string, { date_str: string; order_count: number; revenue: number }> = {};

  for (const b of completedBills) {
    const rawDate = b.completedAt || b.createdAt;
    if (!rawDate) continue;

    const d = new Date(rawDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    if (!dateMap[dateStr]) {
      dateMap[dateStr] = { date_str: dateStr, order_count: 0, revenue: 0 };
    }
    dateMap[dateStr].order_count += 1;
    dateMap[dateStr].revenue += Number(b.total) || 0;
  }

  return Object.values(dateMap).sort((a, b) => a.date_str.localeCompare(b.date_str));
}
