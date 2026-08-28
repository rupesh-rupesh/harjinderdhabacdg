import { offlineDbService } from './offlineDb';

class SyncManager extends EventTarget {
  private isSyncing = false;
  private online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Initialize state properly on startup
      this.online = navigator.onLine;
    }
  }

  private handleOnline() {
    this.online = true;
    console.log('[SyncManager] Network is online. Triggering sync...');
    this.dispatchEvent(new CustomEvent('networkStatus', { detail: { isOnline: true } }));
    this.processQueue();
  }

  private handleOffline() {
    this.online = false;
    console.log('[SyncManager] Network is offline.');
    this.dispatchEvent(new CustomEvent('networkStatus', { detail: { isOnline: false } }));
  }

  isOnline() {
    return this.online;
  }

  async processQueue() {
    if (this.isSyncing || !this.online) return;
    this.isSyncing = true;

    try {
      const pending = await offlineDbService.getPendingSyncs();
      const failed = await offlineDbService.getFailedSyncs();
      
      const allToSync = [...pending, ...failed].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (allToSync.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[SyncManager] Processing ${allToSync.length} items in sync queue...`);

      for (const item of allToSync) {
        if (!this.online) break; // stop if we go offline during sync

        try {
          if (item.operation === 'CREATE_BILL') {
            const res = await fetch('/api/admin/pos/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload)
            });

            if (res.ok) {
              const serverBill = await res.json();
              
              // Update local bill status
              const bills = await offlineDbService.getBills();
              const localBill = bills.find(b => b.localBillId === item.payload.localBillId);
              
              if (localBill) {
                localBill.syncStatus = 'synced';
                localBill.serverBillId = serverBill.id;
                await offlineDbService.saveBill(localBill);
              }

              await offlineDbService.removeSyncItem(item.id);
            } else {
              throw new Error(`Server returned ${res.status}`);
            }
          } else if (item.operation === 'UPDATE_BILL') {
            const res = await fetch(`/api/admin/orders/${item.payload.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: item.payload.status })
            });
            
            if (res.ok) {
              await offlineDbService.removeSyncItem(item.id);
            } else {
              throw new Error(`Server returned ${res.status}`);
            }
          } else if (item.operation === 'DELETE_BILL') {
            const res = await fetch(`/api/admin/orders/${item.payload.id}`, {
              method: 'DELETE'
            });
            
            if (res.ok) {
              await offlineDbService.removeSyncItem(item.id);
            } else {
              throw new Error(`Server returned ${res.status}`);
            }
          }
        } catch (error) {
          console.error(`[SyncManager] Failed to sync item ${item.id}`, error);
          await offlineDbService.markSyncFailed(item.id, item.retryCount);
        }
      }
    } catch (e) {
      console.error('[SyncManager] Error in sync process', e);
    } finally {
      this.isSyncing = false;
    }
  }

  triggerSync() {
    this.processQueue();
  }
}

export const syncManager = new SyncManager();
