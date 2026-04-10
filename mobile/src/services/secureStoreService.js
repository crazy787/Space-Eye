const secureMemoryStore = new Map();

let secureStoreAdapter = null;
let secureStoreDiagnostics = null;

const createFallbackAdapter = () => ({
  async getItemAsync(key) {
    return secureMemoryStore.has(key) ? secureMemoryStore.get(key) : null;
  },
  async setItemAsync(key, value) {
    secureMemoryStore.set(key, value);
  },
  async deleteItemAsync(key) {
    secureMemoryStore.delete(key);
  },
});

const initializeSecureStore = () => {
  if (secureStoreAdapter && secureStoreDiagnostics) {
    return { adapter: secureStoreAdapter, diagnostics: secureStoreDiagnostics };
  }

  try {
    const secureStoreModule = require('expo-secure-store');

    secureStoreAdapter = secureStoreModule;
    secureStoreDiagnostics = {
      available: true,
      mode: 'secure-store',
      warning: null,
    };
  } catch (error) {
    console.error(
      'expo-secure-store is unavailable. Falling back to in-memory secure storage. Install expo-secure-store and rebuild the app.',
      error
    );

    secureStoreAdapter = createFallbackAdapter();
    secureStoreDiagnostics = {
      available: false,
      mode: 'memory-fallback',
      warning:
        'Secure device storage is unavailable. Auth session data will reset after the app closes.',
    };
  }

  return { adapter: secureStoreAdapter, diagnostics: secureStoreDiagnostics };
};

export const secureStoreService = {
  async getItemAsync(key) {
    return initializeSecureStore().adapter.getItemAsync(key);
  },

  async setItemAsync(key, value) {
    return initializeSecureStore().adapter.setItemAsync(key, value);
  },

  async deleteItemAsync(key) {
    return initializeSecureStore().adapter.deleteItemAsync(key);
  },

  getDiagnostics() {
    return initializeSecureStore().diagnostics;
  },
};

export default secureStoreService;
