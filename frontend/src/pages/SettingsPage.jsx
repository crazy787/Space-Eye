import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  HiOutlineCog, HiOutlineBell, HiOutlineGlobeAlt, HiOutlineCube,
  HiOutlineUser, HiOutlineCheck, HiOutlineRefresh
} from 'react-icons/hi';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success) setSettings(res.data.data);
    } catch {
      // Use defaults
      setSettings({
        alerts: { enabled: true, alertBefore: 10, minVisibility: 60 },
        units: { speed: 'kmh', altitude: 'km', temperature: 'celsius' },
        theme: 'dark',
        location: { useGPS: true, savedLat: null, savedLng: null, savedCity: null },
        satellites: ['ISS'],
      });
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setSettings(res.data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const resetSettings = async () => {
    setSaving(true);
    try {
      const res = await api.post('/settings/reset');
      if (res.data.success) {
        setSettings(res.data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const updateNested = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  if (loading || !settings) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-space-700/50 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-space-700/30 rounded w-1/2" />
                <div className="h-10 bg-space-700/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <HiOutlineCog className="w-7 h-7 text-gray-400" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure your Space-Eye experience</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-400 animate-fade-in">
              <HiOutlineCheck className="w-4 h-4" />
              Saved
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        {user && (
          <div className="glass-card p-6 animate-slide-up">
            <SectionTitle icon={<HiOutlineUser />} title="Profile" />
            <div className="flex items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-2xl
                              shadow-lg shadow-nebula-500/20">
                {user.name?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <SectionTitle icon={<HiOutlineBell />} title="Alert Preferences" />
          <div className="space-y-5 mt-4">
            <ToggleRow
              label="Enable Pass Alerts"
              desc="Get notified when the ISS is visible from your location"
              checked={settings.alerts.enabled}
              onChange={(v) => updateNested('alerts', 'enabled', v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alert Before (minutes)</label>
                <input
                  type="number"
                  value={settings.alerts.alertBefore}
                  onChange={(e) => updateNested('alerts', 'alertBefore', parseInt(e.target.value) || 10)}
                  className="input-field py-2 text-sm"
                  min={1} max={60}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Visibility (seconds)</label>
                <input
                  type="number"
                  value={settings.alerts.minVisibility}
                  onChange={(e) => updateNested('alerts', 'minVisibility', parseInt(e.target.value) || 30)}
                  className="input-field py-2 text-sm"
                  min={10} max={600}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <SectionTitle icon={<HiOutlineCube />} title="Units & Display" />
          <div className="space-y-4 mt-4">
            <SelectRow
              label="Speed"
              value={settings.units.speed}
              options={[{ value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }]}
              onChange={(v) => updateNested('units', 'speed', v)}
            />
            <SelectRow
              label="Altitude"
              value={settings.units.altitude}
              options={[{ value: 'km', label: 'Kilometers' }, { value: 'mi', label: 'Miles' }]}
              onChange={(v) => updateNested('units', 'altitude', v)}
            />
            <SelectRow
              label="Temperature"
              value={settings.units.temperature}
              options={[{ value: 'celsius', label: 'Celsius' }, { value: 'fahrenheit', label: 'Fahrenheit' }]}
              onChange={(v) => updateNested('units', 'temperature', v)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <SectionTitle icon={<HiOutlineGlobeAlt />} title="Location" />
          <div className="space-y-4 mt-4">
            <ToggleRow
              label="Use GPS"
              desc="Automatically detect your location"
              checked={settings.location.useGPS}
              onChange={(v) => updateNested('location', 'useGPS', v)}
            />
            {!settings.location.useGPS && (
              <div className="grid grid-cols-2 gap-4 animate-slide-up">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Saved Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.location.savedLat || ''}
                    onChange={(e) => updateNested('location', 'savedLat', parseFloat(e.target.value))}
                    className="input-field py-2 text-sm"
                    placeholder="28.6139"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Saved Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.location.savedLng || ''}
                    onChange={(e) => updateNested('location', 'savedLng', parseFloat(e.target.value))}
                    className="input-field py-2 text-sm"
                    placeholder="77.2090"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Reset to Defaults</p>
              <p className="text-xs text-gray-500 mt-0.5">This will reset all settings to their default values</p>
            </div>
            <button
              onClick={resetSettings}
              className="btn-ghost text-sm py-2 px-4 text-cosmic-400 border-cosmic-500/20 hover:border-cosmic-500/40 hover:bg-cosmic-500/5 flex items-center gap-2"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Reusable Form Components ────────────────── */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider">
      <span className="w-5 h-5">{icon}</span>
      {title}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${
          checked ? 'bg-nebula-500' : 'bg-space-600'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-white">{label}</p>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              value === opt.value
                ? 'bg-nebula-500/20 border border-nebula-500/40 text-nebula-300'
                : 'bg-space-700/30 border border-white/5 text-gray-400 hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
