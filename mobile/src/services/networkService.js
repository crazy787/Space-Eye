const DEFAULT_HEALTH_URL = 'http://10.0.2.2:5000/api/health';

let networkDiagnostics = null;

const initializeNetInfo = () => {
  if (networkDiagnostics) {
    return networkDiagnostics;
  }

  try {
    const netInfoModule = require('@react-native-community/netinfo');
    const netInfo = netInfoModule.default || netInfoModule;

    networkDiagnostics = {
      available: true,
      mode: 'netinfo',
      warning: null,
      client: netInfo,
    };
  } catch (error) {
    console.error(
      'NetInfo dependency unavailable. Falling back to API health polling. Install @react-native-community/netinfo and rebuild the app.',
      error
    );

    networkDiagnostics = {
      available: false,
      mode: 'polling-fallback',
      warning:
        'NetInfo is unavailable. Network status will use periodic backend health checks.',
      client: null,
    };
  }

  return networkDiagnostics;
};

const pingHealth = async (url = DEFAULT_HEALTH_URL) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

export const networkService = {
  async getCurrentStatus(url = DEFAULT_HEALTH_URL) {
    const diagnostics = initializeNetInfo();

    if (diagnostics.available && diagnostics.client?.fetch) {
      const state = await diagnostics.client.fetch();
      return Boolean(state?.isConnected && state?.isInternetReachable !== false);
    }

    return pingHealth(url);
  },

  subscribe(listener, options = {}) {
    const diagnostics = initializeNetInfo();
    const healthUrl = options.healthUrl || DEFAULT_HEALTH_URL;
    const pollIntervalMs = options.pollIntervalMs || 15000;

    if (diagnostics.available && diagnostics.client?.addEventListener) {
      return diagnostics.client.addEventListener((state) => {
        listener(Boolean(state?.isConnected && state?.isInternetReachable !== false));
      });
    }

    let disposed = false;

    const emitStatus = async () => {
      const isOnline = await pingHealth(healthUrl);
      if (!disposed) {
        listener(isOnline);
      }
    };

    emitStatus();
    const intervalId = setInterval(emitStatus, pollIntervalMs);

    return () => {
      disposed = true;
      clearInterval(intervalId);
    };
  },

  getDiagnostics() {
    const { available, mode, warning } = initializeNetInfo();
    return { available, mode, warning };
  },
};

export default networkService;
