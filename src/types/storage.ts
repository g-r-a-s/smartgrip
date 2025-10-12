/**
 * Storage and caching domain types
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  version: string;
}

export interface StorageKeys {
  USER_ACTIVITIES: string;
  USER_SESSIONS: string;
  USER_STATS: string;
  OFFLINE_QUEUE: string;
  LAST_SYNC: string;
}

export interface OfflineAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  collection: string;
  documentId: string;
  data?: any;
  timestamp: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingActions: number;
  isSyncing: boolean;
}
