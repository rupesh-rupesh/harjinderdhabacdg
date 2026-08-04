// Vercel Serverless Function entrypoint
// This file is bundled by @vercel/node which handles TypeScript natively
import express from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { integer, real, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { eq, desc, lt, inArray, sql } from 'drizzle-orm';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Schema ────────────────────────────────────────────────────────────────
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('customer'),
  permissions: jsonb('permissions'),
  createdAt: timestamp('created_at').defaultNow(),
});

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  items: text('items').notNull(),
  total: real('total').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  image: text('image'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  fullPortionPieces: integer('full_portion_pieces'),
  hasHalfPortion: boolean('has_half_portion').default(false),
  halfPrice: integer('half_price'),
  halfPortionPieces: integer('half_portion_pieces'),
  hasButterOption: boolean('has_butter_option').default(false),
  butterPrice: integer('butter_price'),
  image: text('image').notNull(),
  category: text('category').notNull(),
  dietaryPreference: text('dietary_preference').notNull(),
  spiceLevel: text('spice_level').notNull(),
  isPopular: boolean('is_popular').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isDhabaSpecial: boolean('is_dhaba_special').default(false),
  outOfStock: boolean('out_of_stock').default(false),
  hasTiming: boolean('has_timing').default(false),
  startTime: text('start_time'),
  endTime: text('end_time'),
  variants: jsonb('variants'),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name').notNull().default('Sparkles'),
  videoUrl: text('video_url'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const journeyMedia = pgTable('journey_media', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const journeySettings = pgTable('journey_settings', {
  id: serial('id').primaryKey(),
  header: text('header').notNull().default('Our Journey'),
  description: text('description').notNull().default(''),
  signature: text('signature').notNull().default('Harjinder Tourist Dhaba'),
  subSignature: text('sub_signature').notNull().default('Serving Memories Since 1991.'),
});

const analyticsSettings = pgTable('analytics_settings', {
  id: serial('id').primaryKey(),
  trackingEnabled: boolean('tracking_enabled').default(true),
  locationTrackingEnabled: boolean('location_tracking_enabled').default(true),
  deviceTrackingEnabled: boolean('device_tracking_enabled').default(true),
  browserTrackingEnabled: boolean('browser_tracking_enabled').default(true),
  liveMonitoringEnabled: boolean('live_monitoring_enabled').default(true),
  exportEnabled: boolean('export_enabled').default(true),
  sessionTimeoutMinutes: integer('session_timeout_minutes').default(30),
  dataRetentionDays: integer('data_retention_days').default(90),
  demoNoticeEnabled: boolean('demo_notice_enabled').default(true),
});

const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  visitorToken: text('visitor_token').notNull().unique(),
  firstVisitAt: timestamp('first_visit_at').defaultNow(),
  lastVisitAt: timestamp('last_visit_at').defaultNow(),
  totalVisits: integer('total_visits').default(1),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  deviceType: text('device_type'),
  os: text('os'),
  browser: text('browser'),
  referrer: text('referrer'),
});

const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  visitorId: integer('visitor_id').references(() => visitors.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  visitTime: timestamp('visit_time').defaultNow(),
  durationSeconds: integer('duration_seconds').default(0),
  landingPage: text('landing_page'),
  exitPage: text('exit_page'),
  isActive: boolean('is_active').default(true),
  lastPingAt: timestamp('last_ping_at').defaultNow(),
});

const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  adminReply: text('admin_reply'),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const dashboardAuth = pgTable('dashboard_auth', {
  id: serial('id').primaryKey(),
  adminPassword: text('admin_password').notNull().default('ADMIN2043W'),
  managerPassword: text('manager_password').notNull().default('MANAGER2043W'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Database ───────────────────────────────────────────────────────────────
const schema = { users, orders, categories, menuItems, features, journeyMedia, journeySettings, analyticsSettings, visitors, visits, reviews, dashboardAuth };

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ CRITICAL: No DATABASE_URL or POSTGRES_URL env var found. Set it in Vercel project settings → Environment Variables.');
} else {
  // Just ensure pgbouncer is enabled if it's a pooler URL
  if (dbUrl.includes('pooler.supabase.com') && !dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
}

// Serverless best practice: max 1 connection per cold start
const queryClient = postgres(dbUrl || '', { max: 1, idle_timeout: 10 });
const db = drizzle(queryClient, { schema });

// ─── Firebase Admin ─────────────────────────────────────────────────────────
let adminAuth: any = {
  verifyIdToken: async () => ({ uid: 'dummy' }),
  createUser: async () => ({ uid: 'dummy-' + Date.now() }),
  updateUser: async () => ({}),
  deleteUser: async () => ({}),
};

try {
  // if (!getApps().length) {
  //   initializeApp({ projectId: 'smart-thunder-8tgzl' });
  // }
  // adminAuth = getAuth();
} catch (e: any) {
  console.warn('Firebase Admin init failed (using stub):', e?.message || e);
}

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Dashboard Auth ──────────────────────────────────────────────────────────
let memoryAuth = { id: 1, adminPassword: 'ADMIN2043W', managerPassword: 'MANAGER2043W' };
let isTableCreated = false;

async function ensureDashboardAuthTable() {
  if (isTableCreated) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "dashboard_auth" (
        "id" SERIAL PRIMARY KEY,
        "admin_password" TEXT NOT NULL DEFAULT 'ADMIN2043W',
        "manager_password" TEXT NOT NULL DEFAULT 'MANAGER2043W',
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    isTableCreated = true;
  } catch (e) {}
}

async function getDashboardAuth() {
  await ensureDashboardAuthTable();
  try {
    const records = await db.select().from(dashboardAuth).limit(1);
    if (records && records.length > 0) { memoryAuth = records[0]; return records[0]; }
    const newAuth = await db.insert(dashboardAuth).values({ adminPassword: memoryAuth.adminPassword, managerPassword: memoryAuth.managerPassword }).returning();
    if (newAuth && newAuth.length > 0) { memoryAuth = newAuth[0]; return newAuth[0]; }
  } catch (e) {}
  return memoryAuth;
}

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// DB connection test — use this to verify DB works on Vercel
app.get('/api/db-test', async (req, res) => {
  const hasUrl = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  try {
    const result = await queryClient`SELECT NOW() as time, current_database() as db`;
    res.json({ ok: true, hasUrl, time: result[0].time, db: result[0].db, dbUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'NOT SET' });
  } catch (e: any) {
    res.status(500).json({ ok: false, hasUrl, error: e.message, dbUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'NOT SET' });
  }
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/verify-dashboard-password', async (req, res) => {
  try {
    const { role, password } = req.body;
    if (!role || !password) return res.status(400).json({ success: false, error: 'Missing role or password' });
    const auth = await getDashboardAuth();
    const expected = role === 'admin' ? auth.adminPassword : auth.managerPassword;
    return res.json({ success: password === expected });
  } catch (e: any) { res.status(500).json({ success: false, error: 'Server error' }); }
});

app.get('/api/auth/dashboard-passwords', async (req, res) => {
  try {
    const auth = await getDashboardAuth();
    res.json({ adminPassword: auth.adminPassword, managerPassword: auth.managerPassword });
  } catch (e: any) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.post('/api/auth/update-dashboard-passwords', async (req, res) => {
  try {
    const { adminPassword, managerPassword } = req.body;
    let auth = await getDashboardAuth();
    const newAdmin = adminPassword?.trim() || auth.adminPassword;
    const newManager = managerPassword?.trim() || auth.managerPassword;
    memoryAuth.adminPassword = newAdmin; memoryAuth.managerPassword = newManager;
    try {
      if (auth.id) await db.update(dashboardAuth).set({ adminPassword: newAdmin, managerPassword: newManager, updatedAt: new Date() }).where(eq(dashboardAuth.id, auth.id));
      else await db.insert(dashboardAuth).values({ adminPassword: newAdmin, managerPassword: newManager });
    } catch (dbErr) {}
    res.json({ success: true, adminPassword: newAdmin, managerPassword: newManager });
  } catch (e: any) { res.status(500).json({ success: false, error: 'Failed to update' }); }
});

// ─── POS / Storefront / Admin Data ──────────────────────────────────────────
app.get('/api/pos-data', async (req, res) => {
  try {
    const menu = await db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id);
    const cats = await db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id);
    res.json({ menuItems: menu, categories: cats });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/storefront-data', async (req, res) => {
  try {
    const menu = await db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id);
    const cats = await db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id);
    const feats = await db.select().from(features).orderBy(features.displayOrder, features.id);
    const settings = await db.select().from(journeySettings).limit(1);
    res.json({ menuItems: menu, categories: cats, features: feats, journeySettings: settings[0] || { header: 'Our Journey', description: '' } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin-data', async (req, res) => {
  try {
    const menu = await db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id);
    const cats = await db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id);
    const feats = await db.select().from(features).orderBy(features.displayOrder, features.id);
    const deletedCats = await db.select().from(categories).where(eq(categories.isDeleted, true));
    const deletedItems = await db.select().from(menuItems).where(eq(menuItems.isDeleted, true));
    const settings = await db.select().from(journeySettings).limit(1);
    res.json({ menuItems: menu, categories: cats, features: feats, deletedData: { categories: deletedCats, menuItems: deletedItems }, journeySettings: settings[0] || { header: 'Our Journey', description: '' } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try { res.json(await db.select().from(categories).where(eq(categories.isDeleted, false))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, image, startTime, endTime } = req.body;
    const r = await db.insert(categories).values({ name, image, startTime: startTime || null, endTime: endTime || null }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, image, startTime, endTime } = req.body;
    const r = await db.update(categories).set({ name, image, startTime: startTime || null, endTime: endTime || null }).where(eq(categories.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const cat = await db.select().from(categories).where(eq(categories.id, Number(req.params.id))).limit(1);
    if (cat.length > 0) await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.category, cat[0].name));
    await db.update(categories).set({ isDeleted: true }).where(eq(categories.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories/:id/recover', async (req, res) => {
  try {
    const cat = await db.select().from(categories).where(eq(categories.id, Number(req.params.id))).limit(1);
    if (cat.length > 0) await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.category, cat[0].name));
    await db.update(categories).set({ isDeleted: false }).where(eq(categories.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id/permanent', async (req, res) => {
  try { await db.delete(categories).where(eq(categories.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Menu Items ───────────────────────────────────────────────────────────────
app.get('/api/menu-items', async (req, res) => {
  try { res.json(await db.select().from(menuItems).where(eq(menuItems.isDeleted, false))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const item = req.body;
    const r = await db.insert(menuItems).values({
      name: item.name, description: item.description, price: Number(item.price),
      fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
      hasHalfPortion: Boolean(item.hasHalfPortion),
      halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
      halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
      hasButterOption: Boolean(item.hasButterOption),
      butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
      image: item.image, category: item.category, dietaryPreference: item.dietaryPreference,
      spiceLevel: item.spiceLevel, isPopular: Boolean(item.isPopular), isBestSeller: Boolean(item.isBestSeller),
      isDhabaSpecial: Boolean(item.isDhabaSpecial), outOfStock: Boolean(item.outOfStock),
      hasTiming: Boolean(item.hasTiming),
      startTime: item.hasTiming && item.startTime ? item.startTime : null,
      endTime: item.hasTiming && item.endTime ? item.endTime : null,
      variants: item.variants ? item.variants : []
    }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const item = req.body;
    const r = await db.update(menuItems).set({
      name: item.name, description: item.description, price: Number(item.price),
      fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
      hasHalfPortion: Boolean(item.hasHalfPortion),
      halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
      halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
      hasButterOption: Boolean(item.hasButterOption),
      butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
      image: item.image, category: item.category, dietaryPreference: item.dietaryPreference,
      spiceLevel: item.spiceLevel, isPopular: Boolean(item.isPopular), isBestSeller: Boolean(item.isBestSeller),
      isDhabaSpecial: Boolean(item.isDhabaSpecial), outOfStock: Boolean(item.outOfStock),
      hasTiming: Boolean(item.hasTiming),
      startTime: item.hasTiming && item.startTime ? item.startTime : null,
      endTime: item.hasTiming && item.endTime ? item.endTime : null,
      variants: item.variants ? item.variants : []
    }).where(eq(menuItems.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try { await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/menu-items/:id/recover', async (req, res) => {
  try { await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/menu-items/:id/permanent', async (req, res) => {
  try { await db.delete(menuItems).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/deleted-items', async (req, res) => {
  try {
    const deletedCats = await db.select().from(categories).where(eq(categories.isDeleted, true));
    const deletedMenuItems = await db.select().from(menuItems).where(eq(menuItems.isDeleted, true));
    res.json({ categories: deletedCats, menuItems: deletedMenuItems });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Journey Settings ─────────────────────────────────────────────────────────
app.get('/api/journey-settings', async (req, res) => {
  try {
    const items = await db.select().from(journeySettings);
    res.json(items.length === 0 ? {
      header: 'Our Journey',
      description: 'Since 1991, Harjinder Tourist Dhaba has been serving authentic Punjabi hospitality on the Kharar–Kurali Highway.',
      signature: 'Harjinder Tourist Dhaba', subSignature: 'Serving Memories Since 1991.'
    } : items[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/journey-settings', async (req, res) => {
  try {
    const { header, description, signature, subSignature } = req.body;
    const items = await db.select().from(journeySettings);
    if (items.length === 0) {
      const r = await db.insert(journeySettings).values({ header, description, signature, subSignature }).returning();
      res.json(r[0]);
    } else {
      const r = await db.update(journeySettings).set({ header, description, signature, subSignature }).where(eq(journeySettings.id, items[0].id)).returning();
      res.json(r[0]);
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Journey Media ────────────────────────────────────────────────────────────
app.get('/api/journey-media', async (req, res) => {
  try { res.json(await db.select().from(journeyMedia).where(eq(journeyMedia.isActive, true)).orderBy(journeyMedia.displayOrder)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/journey-media', async (req, res) => {
  try {
    const { url, type, displayOrder, isActive } = req.body;
    const r = await db.insert(journeyMedia).values({ url, type, displayOrder, isActive }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/journey-media/:id', async (req, res) => {
  try {
    const { url, type, displayOrder, isActive } = req.body;
    const r = await db.update(journeyMedia).set({ url, type, displayOrder, isActive }).where(eq(journeyMedia.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/journey-media/:id', async (req, res) => {
  try { await db.delete(journeyMedia).where(eq(journeyMedia.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Features ─────────────────────────────────────────────────────────────────
app.get('/api/features', async (req, res) => {
  try { res.json(await db.select().from(features).orderBy(features.displayOrder)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/features', async (req, res) => {
  try {
    const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
    const r = await db.insert(features).values({ title, description, iconName: iconName || 'Sparkles', videoUrl: videoUrl || null, displayOrder: displayOrder ?? 0, isActive: isActive ?? true }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/features/:id', async (req, res) => {
  try {
    const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
    const r = await db.update(features).set({ title, description, iconName, videoUrl: videoUrl || null, displayOrder, isActive }).where(eq(features.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/features/:id', async (req, res) => {
  try { await db.delete(features).where(eq(features.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
app.get('/api/reviews', async (req, res) => {
  try { res.json(await db.select().from(reviews).where(eq(reviews.isHidden, false)).orderBy(desc(reviews.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const r = await db.insert(reviews).values({ name, rating, comment }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews/:id/vote', async (req, res) => {
  try {
    const { type } = req.body;
    const existing = await db.select().from(reviews).where(eq(reviews.id, Number(req.params.id)));
    if (!existing.length) return res.status(404).json({ error: 'Review not found' });
    const r = await db.update(reviews).set(type === 'like' ? { likes: existing[0].likes + 1 } : { dislikes: existing[0].dislikes + 1 }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/reviews', async (req, res) => {
  try { res.json(await db.select().from(reviews).orderBy(desc(reviews.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/reviews/:id/visibility', async (req, res) => {
  try {
    const r = await db.update(reviews).set({ isHidden: req.body.isHidden }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/reviews/:id/reply', async (req, res) => {
  try {
    const r = await db.update(reviews).set({ adminReply: req.body.adminReply }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  try { await db.delete(reviews).where(eq(reviews.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
app.get('/api/analytics/settings', async (req, res) => {
  try {
    let s = await db.select().from(analyticsSettings);
    if (s.length === 0) { const ns = await db.insert(analyticsSettings).values({}).returning(); res.json(ns[0]); }
    else res.json(s[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/analytics/settings', async (req, res) => {
  try {
    const s = await db.select().from(analyticsSettings);
    if (s.length > 0) {
      const r = await db.update(analyticsSettings).set(req.body).where(eq(analyticsSettings.id, s[0].id)).returning();
      res.json(r[0]);
    } else res.status(404).json({ error: 'Not found' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { visitorToken, sessionToken, deviceType, os, browser, referrer, landingPage, path } = req.body;
    if (!visitorToken || !sessionToken) return res.json({ success: false, message: 'Missing tokens' });
    let s = await db.select().from(analyticsSettings);
    if (s.length === 0) { const ns = await db.insert(analyticsSettings).values({}).returning(); s = ns; }
    if (!s[0].trackingEnabled) return res.json({ success: false, message: 'Tracking disabled' });
    let vRecs = await db.select().from(visitors).where(eq(visitors.visitorToken, visitorToken));
    let visitorId: number;
    if (vRecs.length === 0) {
      const nv = await db.insert(visitors).values({ visitorToken, deviceType: s[0].deviceTrackingEnabled ? deviceType : null, os: s[0].deviceTrackingEnabled ? os : null, browser: s[0].browserTrackingEnabled ? browser : null, referrer, firstVisitAt: new Date(), lastVisitAt: new Date(), totalVisits: 1 }).returning();
      visitorId = nv[0].id;
    } else {
      visitorId = vRecs[0].id;
      await db.update(visitors).set({ lastVisitAt: new Date(), totalVisits: vRecs[0].totalVisits! + 1 }).where(eq(visitors.id, visitorId));
    }
    let sess = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
    if (sess.length === 0) {
      await db.insert(visits).values({ visitorId, sessionToken, landingPage, exitPage: path, visitTime: new Date(), lastPingAt: new Date(), isActive: true }).onConflictDoUpdate({ target: visits.sessionToken, set: { exitPage: path, lastPingAt: new Date(), isActive: true } });
    } else {
      const lastPing = new Date();
      const duration = Math.floor((lastPing.getTime() - new Date(sess[0].visitTime!).getTime()) / 1000);
      await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, sess[0].id));
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/ping', async (req, res) => {
  try {
    const { sessionToken, path } = req.body;
    if (!sessionToken) return res.json({ success: false });
    const sess = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
    if (sess.length > 0) {
      const lastPing = new Date();
      const duration = Math.floor((lastPing.getTime() - new Date(sess[0].visitTime!).getTime()) / 1000);
      await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, sess[0].id));
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const allVisits = await db.select().from(visits);
    const allVisitors = await db.select().from(visitors);
    const activeThreshold = new Date(Date.now() - 5 * 60000);
    await db.update(visits).set({ isActive: false }).where(lt(visits.lastPingAt, activeThreshold));
    const activeVisits = await db.select().from(visits).where(eq(visits.isActive, true));
    res.json({ visits: allVisits, visitors: allVisitors, activeVisitors: activeVisits.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/analytics/clear', async (req, res) => {
  try { await db.delete(visits); await db.delete(visitors); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/analytics/visitors/:id', async (req, res) => {
  try { await db.delete(visitors).where(eq(visitors.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/visitors/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) await db.delete(visitors).where(inArray(visitors.id, ids));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Managers ─────────────────────────────────────────────────────────────────
app.get('/api/admin/managers', async (req, res) => {
  try { res.json(await db.select().from(users).where(eq(users.role, 'manager'))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/managers', async (req, res) => {
  try {
    const { email, password, name, permissions } = req.body;
    const firebaseUser = await adminAuth.createUser({ email, password, displayName: name });
    const r = await db.insert(users).values({ uid: firebaseUser.uid, email, name, role: 'manager', permissions: permissions || {} }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/managers/:id', async (req, res) => {
  try {
    const { permissions, password, name } = req.body;
    const user = await db.select().from(users).where(eq(users.id, Number(req.params.id))).limit(1);
    if (!user.length) return res.status(404).json({ error: 'Manager not found' });
    if (password) await adminAuth.updateUser(user[0].uid, { password });
    const updateData: any = { permissions };
    if (name) { updateData.name = name; await adminAuth.updateUser(user[0].uid, { displayName: name }); }
    const r = await db.update(users).set(updateData).where(eq(users.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/managers/:id', async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, Number(req.params.id))).limit(1);
    if (user.length) { await adminAuth.deleteUser(user[0].uid); await db.delete(users).where(eq(users.id, Number(req.params.id))); }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Admin Stats / Orders ─────────────────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const r: any = await db.execute(sql`
      SELECT
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= ${today.toISOString()}) as daily_revenue,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')) as active_orders,
        (SELECT COUNT(*) FROM users WHERE uid = 'pos_system') as pos_users
    `);
    res.json({ dailyRevenue: Number(r[0].daily_revenue || 0), totalOrders: Number(r[0].total_orders || 0), activeOrders: Number(r[0].active_orders || 0), posUsers: Number(r[0].pos_users || 0) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/daily-revenue', async (req, res) => {
  try {
    const r: any = await db.execute(sql`SELECT DATE(created_at) as date_str, COUNT(id) as order_count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'completed' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`);
    res.json(r);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
  try { res.json(await db.select().from(orders).orderBy(desc(orders.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/pos/orders', async (req, res) => {
  try {
    const { tableNumber, items, total } = req.body;
    let posUser = await db.select().from(users).where(eq(users.uid, 'pos_system')).limit(1);
    if (posUser.length === 0) {
      const nu = await db.insert(users).values({ uid: 'pos_system', email: 'pos@local', name: 'POS System' }).returning();
      posUser = nu;
    }
    const posItems = [{ name: `Table ${tableNumber}`, price: 0, quantity: 1, isTableMarker: true }, ...items];
    const r = await db.insert(orders).values({ userId: posUser[0].id, items: JSON.stringify(posItems), total, status: 'pending' }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: 'POS order failed: ' + e.message }); }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, items, total } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (items !== undefined) updateData.items = items;
    if (total !== undefined) updateData.total = total;
    if (Object.keys(updateData).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const r = await db.update(orders).set(updateData).where(eq(orders.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  try { await db.delete(orders).where(eq(orders.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Orders (customer) ────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, userId } = req.body;
    const r = await db.insert(orders).values({ userId: userId || 1, items: JSON.stringify(items), total, status: 'pending' }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Vercel Handler ───────────────────────────────────────────────────────────
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  return app(req as any, res as any);
}
