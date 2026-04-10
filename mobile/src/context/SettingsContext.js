import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOffline } from './OfflineContext';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  alerts: {
    enabled: true,
    alertBefore: 10,
    minVisibility: 60,
  },
  satellites: ['ISS'],
  units: {
    speed: 'kmh',
    altitude: 'km',
    temperature: 'celsius',
  },
  theme: 'dark',
  location: {
    useGPS: true,
    savedLat: null,
    savedLng: null,
    savedCity: null,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { cacheSettings, getCachedSettings, isOnline } = useOffline();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from local cache first
      const cached = await getCachedSettings();
      if (cached) {
        setSettings(cached);
      }

      // If online, fetch from server
      if (isOnline) {
        try {
          const response = await fetch('http://10.0.2.2:5000/api/settings');
          const data = await response.json();
          if (data.success) {
            setSettings(data.data);
            cacheSettings(data.data);
          }
        } catch {
          // Use cached settings
        }
      }
    } catch (err) {
      console.warn('Settings load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (updates) => {
    const merged = {
      alerts: { ...settings.alerts, ...updates.alerts },
      satellites: updates.satellites || settings.satellites,
      units: { ...settings.units, ...updates.units },
      theme: updates.theme || settings.theme,
      location: { ...settings.location, ...updates.location },
    };

    setSettings(merged);
    cacheSettings(merged);

    // Sync to server if online
    if (isOnline) {
      try {
        await fetch('http://10.0.2.2:5000/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {
        // Cached locally, will sync later
      }
    }

    return merged;
  }, [settings, isOnline, cacheSettings]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    cacheSettings(DEFAULT_SETTINGS);

    if (isOnline) {
      try {
        await fetch('http://10.0.2.2:5000/api/settings/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        // Reset locally
      }
    }

    return DEFAULT_SETTINGS;
  }, [isOnline, cacheSettings]);

  // Helper to format speed based on unit preference
  const formatSpeed = useCallback((kmh) => {
    if (settings.units.speed === 'mph') {
      return `${Math.round(kmh * 0.621371).toLocaleString()} mph`;
    }
    return `${Math.round(kmh).toLocaleString()} km/h`;
  }, [settings.units.speed]);

  // Helper to format altitude based on unit preference
  const formatAltitude = useCallback((km) => {
    if (settings.units.altitude === 'mi') {
      return `${Math.round(km * 0.621371).toLocaleString()} mi`;
    }
    return `${Math.round(km).toLocaleString()} km`;
  }, [settings.units.altitude]);

  const value = {
    settings,
    loading,
    updateSettings,
    resetSettings,
    formatSpeed,
    formatAltitude,
    DEFAULT_SETTINGS,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

export default SettingsContext;
