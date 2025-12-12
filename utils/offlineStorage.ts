// Utility for offline storage management
const STORAGE_KEY_PREFIX = 'leirad_offline_';

export const offlineStorage = {
  // Store data locally with timestamp
  store: (key: string, data: any) => {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
    const payload = {
      data,
      timestamp: Date.now(),
      version: 1
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  },

  // Retrieve data from local storage
  retrieve: (key: string): any => {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
    const item = localStorage.getItem(storageKey);
    if (!item) return null;
    
    try {
      const payload = JSON.parse(item);
      return payload.data;
    } catch (e) {
      console.error('Error parsing offline storage data:', e);
      return null;
    }
  },

  // Remove data from local storage
  remove: (key: string) => {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
  },

  // Check if data exists
  exists: (key: string): boolean => {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
    return localStorage.getItem(storageKey) !== null;
  },

  // Generate unique ID for offline items
  generateId: (): string => {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Store pending operations
  storePendingOperation: (username: string, operation: any) => {
    const key = `pending_ops_${username}`;
    const pendingOps = offlineStorage.retrieve(key) || [];
    pendingOps.push({
      ...operation,
      id: offlineStorage.generateId(),
      timestamp: Date.now()
    });
    offlineStorage.store(key, pendingOps);
  },

  // Get pending operations
  getPendingOperations: (username: string): any[] => {
    const key = `pending_ops_${username}`;
    return offlineStorage.retrieve(key) || [];
  },

  // Remove pending operations
  clearPendingOperations: (username: string) => {
    const key = `pending_ops_${username}`;
    offlineStorage.remove(key);
  }
};