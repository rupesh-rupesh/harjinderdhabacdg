import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface RestaurantOfflineDB extends DBSchema {
  menuItems: {
    key: number;
    value: any; // Full menu item object
    indexes: { 'by-category': string };
  };
  bills: {
    key: string;
    value: {
      localBillId: string;
      serverBillId?: number;
      tableNumber: string;
      items: any[];
      total: number;
      syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
      createdAt: string;
      status: string; // 'pending' | 'completed' | 'cancelled'
    };
    indexes: { 'by-syncStatus': string, 'by-createdAt': string };
  };
  settings: {
    key: string;
    value: any;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      operation: 'CREATE_BILL' | 'UPDATE_BILL' | 'DELETE_BILL';
      payload: any;
      createdAt: string;
      status: 'pending' | 'failed';
      retryCount: number;
    };
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'restaurant_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RestaurantOfflineDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null; // SSR safety
  
  if (!dbPromise) {
    dbPromise = openDB<RestaurantOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('menuItems')) {
          const menuStore = db.createObjectStore('menuItems', { keyPath: 'id' });
          menuStore.createIndex('by-category', 'category');
        }
        
        if (!db.objectStoreNames.contains('bills')) {
          const billStore = db.createObjectStore('bills', { keyPath: 'localBillId' });
          billStore.createIndex('by-syncStatus', 'syncStatus');
          billStore.createIndex('by-createdAt', 'createdAt');
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
        }
      },
    });
  }
  return dbPromise;
};

export const offlineDbService = {
  // --- MENU ITEMS ---
  async cacheMenu(items: any[]) {
    const db = await getDB();
    if (!db) return;
    const tx = db.transaction('menuItems', 'readwrite');
    // Clear old menu to remove deleted items
    await tx.objectStore('menuItems').clear();
    for (const item of items) {
      tx.store.put(item);
    }
    await tx.done;
  },

  async getMenu() {
    const db = await getDB();
    if (!db) return [];
    return db.getAll('menuItems');
  },

  // --- BILLS ---
  async saveBill(bill: any) {
    const db = await getDB();
    if (!db) return;
    await db.put('bills', bill);
  },

  async getBills() {
    const db = await getDB();
    if (!db) return [];
    return db.getAllFromIndex('bills', 'by-createdAt');
  },

  async updateBillStatus(localBillId: string, status: string) {
    const db = await getDB();
    if (!db) return;
    const bill = await db.get('bills', localBillId);
    if (bill) {
      bill.status = status;
      await db.put('bills', bill);
    }
  },

  async deleteLocalBill(localBillId: string) {
    const db = await getDB();
    if (!db) return;
    await db.delete('bills', localBillId);
  },

  // --- SYNC QUEUE ---
  async enqueueSync(operation: 'CREATE_BILL' | 'UPDATE_BILL' | 'DELETE_BILL', payload: any) {
    const db = await getDB();
    if (!db) return;
    
    // For UPDATE_BILL and DELETE_BILL, use a unique ID so it doesn't overwrite the CREATE_BILL in the queue
    const id = operation === 'CREATE_BILL' ? payload.localBillId : `${payload.id}_${operation}_${Date.now()}`;
    
    await db.put('syncQueue', {
      id,
      operation,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    });
  },

  async getPendingSyncs() {
    const db = await getDB();
    if (!db) return [];
    return db.getAllFromIndex('syncQueue', 'by-status', 'pending');
  },

  async getFailedSyncs() {
    const db = await getDB();
    if (!db) return [];
    return db.getAllFromIndex('syncQueue', 'by-status', 'failed');
  },

  async markSyncFailed(id: string, currentRetryCount: number) {
    const db = await getDB();
    if (!db) return;
    const item = await db.get('syncQueue', id);
    if (item) {
      item.retryCount = currentRetryCount + 1;
      item.status = 'failed';
      await db.put('syncQueue', item);
    }
  },

  async removeSyncItem(id: string) {
    const db = await getDB();
    if (!db) return;
    await db.delete('syncQueue', id);
  }
};
