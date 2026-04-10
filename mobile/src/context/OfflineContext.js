import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { issAPI } from '../services/api';
import { storageService } from '../services/storageService';
import { networkService } from '../services/networkService';
import { secureStoreService } from '../services/secureStoreService';

const OfflineContext = createContext();

export const CACHE_KEYS = {
  ISS_POSITION: '@spaceeye_iss_position',
  ASTRONAUTS: '@spaceeye_astronauts',
  LAST_UPDATED: '@spaceeye_last_updated',
  SETTINGS: '@spaceeye_settings',
};

const parseCachedJson = (value, label) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to parse cached ${label}:`, error.message);
    return null;
  }
};

const getDependencyWarnings = () => {
  const storageDiagnostics = storageService.getDiagnostics();
  const networkDiagnostics = networkService.getDiagnostics();
  const secureStoreDiagnostics = secureStoreService.getDiagnostics();
  const warnings = [];

  if (storageDiagnostics.warning) {
    warnings.push({
      id: 'async-storage',
      title: 'Limited local storage',
      message: storageDiagnostics.warning,
    });
  }

  if (networkDiagnostics.warning) {
    warnings.push({
      id: 'netinfo',
      title: 'Limited network detection',
      message: networkDiagnostics.warning,
    });
  }

  if (secureStoreDiagnostics.warning) {
    warnings.push({
      id: 'secure-store',
      title: 'Limited secure storage',
      message: secureStoreDiagnostics.warning,
    });
  }

  return warnings;
};

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedISSPosition, setCachedISSPosition] = useState(null);
  const [cachedAstronauts, setCachedAstronauts] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dependencyWarnings] = useState(() => getDependencyWarnings());
  const [storageDiagnostics] = useState(() => storageService.getDiagnostics());
  const [networkDiagnostics] = useState(() => networkService.getDiagnostics());
  const [secureStoreDiagnostics] = useState(() => secureStoreService.getDiagnostics());
  const wasOnlineRef = useRef(true);

  const loadCachedData = useCallback(async () => {
    try {
      const [position, astronauts, updated] = await storageService.multiGet([
        CACHE_KEYS.ISS_POSITION,
        CACHE_KEYS.ASTRONAUTS,
        CACHE_KEYS.LAST_UPDATED,
      ]);

      const cachedPosition = parseCachedJson(position?.[1], 'ISS position');
      const cachedAstronautList = parseCachedJson(astronauts?.[1], 'astronauts');
      const cachedUpdated = parseCachedJson(updated?.[1], 'last updated timestamp');

      if (cachedPosition) {
        setCachedISSPosition(cachedPosition);
      }

      if (cachedAstronautList) {
        setCachedAstronauts(cachedAstronautList);
      }

      if (cachedUpdated) {
        setLastUpdated(new Date(cachedUpdated));
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error.message);
    }
  }, []);

  const cacheISSPosition = useCallback(async (position) => {
    try {
      setCachedISSPosition(position);
      const now = new Date();
      setLastUpdated(now);

      await storageService.setItem(CACHE_KEYS.ISS_POSITION, JSON.stringify(position));
      await storageService.setItem(
        CACHE_KEYS.LAST_UPDATED,
        JSON.stringify(now.toISOString())
      );
    } catch (error) {
      console.warn('Failed to cache ISS position:', error.message);
    }
  }, []);

  const cacheAstronauts = useCallback(async (astronauts) => {
    try {
      setCachedAstronauts(astronauts);
      await storageService.setItem(CACHE_KEYS.ASTRONAUTS, JSON.stringify(astronauts));
    } catch (error) {
      console.warn('Failed to cache astronauts:', error.message);
    }
  }, []);

  const refreshCache = useCallback(async () => {
    try {
      const [positionResult, astronautResult] = await Promise.allSettled([
        issAPI.getPosition(),
        issAPI.getAstronauts(),
      ]);

      if (positionResult.status === 'fulfilled' && positionResult.value.success) {
        await cacheISSPosition(positionResult.value.data);
      }

      if (astronautResult.status === 'fulfilled' && astronautResult.value.success) {
        await cacheAstronauts(astronautResult.value.data);
      }
    } catch (error) {
      console.warn('Cache refresh failed:', error.message);
    }
  }, [cacheAstronauts, cacheISSPosition]);

  const cacheSettings = useCallback(async (settings) => {
    try {
      await storageService.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to cache settings:', error.message);
    }
  }, []);

  const getCachedSettings = useCallback(async () => {
    try {
      const data = await storageService.getItem(CACHE_KEYS.SETTINGS);
      return parseCachedJson(data, 'settings');
    } catch (error) {
      console.warn('Failed to read cached settings:', error.message);
      return null;
    }
  }, []);

  const refreshNetworkStatus = useCallback(async () => {
    try {
      const nextStatus = await networkService.getCurrentStatus();
      if (!wasOnlineRef.current && nextStatus) {
        refreshCache();
      }
      wasOnlineRef.current = nextStatus;
      setIsOnline(nextStatus);
      return nextStatus;
    } catch {
      wasOnlineRef.current = false;
      setIsOnline(false);
      return false;
    }
  }, [refreshCache]);

  useEffect(() => {
    loadCachedData();
    refreshNetworkStatus();

    const unsubscribe = networkService.subscribe((nextStatus) => {
      if (!wasOnlineRef.current && nextStatus) {
        refreshCache();
      }

      wasOnlineRef.current = nextStatus;
      setIsOnline(nextStatus);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadCachedData, refreshCache, refreshNetworkStatus]);

  const getTimeSinceUpdate = useCallback(() => {
    if (!lastUpdated) return 'Never';

    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }, [lastUpdated]);

  const value = useMemo(
    () => ({
      isOnline,
      cachedISSPosition,
      cachedAstronauts,
      lastUpdated,
      dependencyWarnings,
      storageDiagnostics,
      networkDiagnostics,
      secureStoreDiagnostics,
      cacheISSPosition,
      cacheAstronauts,
      getTimeSinceUpdate,
      cacheSettings,
      getCachedSettings,
      refreshCache,
      refreshNetworkStatus,
    }),
    [
      isOnline,
      cachedISSPosition,
      cachedAstronauts,
      lastUpdated,
      dependencyWarnings,
      storageDiagnostics,
      networkDiagnostics,
      secureStoreDiagnostics,
      cacheISSPosition,
      cacheAstronauts,
      getTimeSinceUpdate,
      cacheSettings,
      getCachedSettings,
      refreshCache,
      refreshNetworkStatus,
    ]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }

  return context;
}

export default OfflineContext;
