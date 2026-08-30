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
            let targetId = item.payload.id;
            
            // Resolve local ID to server ID if needed
            const bills = await offlineDbService.getBills();
            const localBill = bills.find(b => b.localBillId === targetId || String((b as any).id) === String(targetId) || String(b.serverBillId) === String(targetId));
            
            if (localBill && localBill.serverBillId) {
              targetId = localBill.serverBillId;
            } else if (String(targetId).length > 15 && (!localBill || !localBill.serverBillId)) {
               // If it's a UUID and we don't have a serverBillId, wait for CREATE_BILL
               throw new Error('Waiting for CREATE_BILL to sync first');
            }

            const { id, ...updatePayload } = item.payload;
            
            const res = await fetch(`/api/admin/orders/${targetId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload)
            });
            
            if (res.ok) {
              await offlineDbService.removeSyncItem(item.id);
            } else {
              throw new Error(`Server returned ${res.status}`);
            }
          } else if (item.operation === 'DELETE_BILL') {
            let targetId = item.payload.id;
            
            const bills = await offlineDbService.getBills();
            const localBill = bills.find(b => b.localBillId === targetId || String((b as any).id) === String(targetId) || String(b.serverBillId) === String(targetId));
            
            if (localBill && localBill.serverBillId) {
              targetId = localBill.serverBillId;
            } else if (String(targetId).length > 15 && (!localBill || !localBill.serverBillId)) {
               throw new Error('Waiting for CREATE_BILL to sync first');
            }

            const res = await fetch(`/api/admin/orders/${targetId}`, {
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

  async triggerSync() {
    await this.processQueue();
  }
}

export const syncManager = new SyncManager();
