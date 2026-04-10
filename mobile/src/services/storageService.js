const memoryStore = new Map();

let storageAdapter = null;
let storageDiagnostics = null;

const createMemoryAdapter = () => ({
  async getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
  async multiGet(keys) {
    return keys.map((key) => [key, memoryStore.has(key) ? memoryStore.get(key) : null]);
  },
});

const initializeStorage = () => {
  if (storageAdapter && storageDiagnostics) {
    return { adapter: storageAdapter, diagnostics: storageDiagnostics };
  }

  try {
    const asyncStorageModule = require('@react-native-async-storage/async-storage');
    const asyncStorage = asyncStorageModule.default || asyncStorageModule;

    storageAdapter = asyncStorage;
    storageDiagnostics = {
      available: true,
      persistent: true,
      mode: 'async-storage',
      warning: null,
    };
  } catch (error) {
    console.error(
      'AsyncStorage dependency unavailable. Falling back to in-memory storage. Install @react-native-async-storage/async-storage and rebuild the app.',
      error
    );

    storageAdapter = createMemoryAdapter();
    storageDiagnostics = {
      available: false,
      persistent: false,
      mode: 'memory-fallback',
      warning:
        'AsyncStorage is unavailable. Cached data will only persist until the app is closed.',
    };
  }

  return { adapter: storageAdapter, diagnostics: storageDiagnostics };
};

export const storageService = {
  async getItem(key) {
    return initializeStorage().adapter.getItem(key);
  },

  async setItem(key, value) {
    return initializeStorage().adapter.setItem(key, value);
  },

  async removeItem(key) {
    return initializeStorage().adapter.removeItem(key);
  },

  async multiGet(keys) {
    const { adapter } = initializeStorage();
    if (typeof adapter.multiGet === 'function') {
      return adapter.multiGet(keys);
    }
    return Promise.all(keys.map(async (key) => [key, await adapter.getItem(key)]));
  },

  getDiagnostics() {
    return initializeStorage().diagnostics;
  },
};

export default storageService;
