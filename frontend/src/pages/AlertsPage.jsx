import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  HiOutlineBell, HiOutlineLocationMarker, HiOutlineClock,
  HiOutlineTrash, HiOutlineRefresh, HiOutlineEye, HiOutlineArrowNarrowUp
} from 'react-icons/hi';

export default function AlertsPage() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [myAlerts, setMyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(false);
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [geoLoading, setGeoLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('passes');

  useEffect(() => {
    detectLocation();
    if (user) fetchMyAlerts();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) };
        setLocation(loc);
        setGeoLoading(false);
        fetchPasses(loc.lat, loc.lng);
      },
      () => {
        setGeoLoading(false);
        setLoading(false);
      }
    );
  };

  const fetchPasses = async (lat, lng) => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const res = await api.get('/alerts/passes', { params: { lat, lng, days: 10, minVis: 60 } });
      if (res.data.success) setPasses(res.data.data.passes || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const fetchMyAlerts = async () => {
    try {
      const res = await api.get('/alerts/my');
      if (res.data.success) setMyAlerts(res.data.data || []);
    } catch { /* silent */ }
  };

  const handleSubscribe = async () => {
    if (!location.lat || !location.lng) return;
    setAlertLoading(true);
    setSubscribeStatus(null);
    try {
      const res = await api.post('/alerts/subscribe', {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
      });
      if (res.data.success) {
        setSubscribeStatus({ type: 'success', msg: res.data.message });
        fetchMyAlerts();
      }
    } catch (err) {
      setSubscribeStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to subscribe' });
    }
    setAlertLoading(false);
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setMyAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch { /* silent */ }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    fetchPasses(location.lat, location.lng);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-3">
          <HiOutlineBell className="w-7 h-7 text-solar-400" />
          ISS Pass Alerts
        </h1>
        <p className="text-gray-500 mt-1">Predict when the ISS will be visible from your location</p>
      </div>

      {/* Location Input */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Location</h2>
        <form onSubmit={handleManualSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-500 mb-1">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={location.lat}
              onChange={(e) => setLocation({ ...location, lat: e.target.value })}
              placeholder="e.g. 28.6139"
              className="input-field py-2.5 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-500 mb-1">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={location.lng}
              onChange={(e) => setLocation({ ...location, lng: e.target.value })}
              placeholder="e.g. 77.2090"
              className="input-field py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={detectLocation}
            disabled={geoLoading}
            className="btn-ghost py-2.5 px-4 text-sm flex items-center gap-2"
          >
            <HiOutlineLocationMarker className="w-4 h-4" />
            {geoLoading ? 'Detecting...' : 'Detect'}
          </button>
          <button
            type="submit"
            disabled={!location.lat || !location.lng || loading}
            className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Find Passes
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('passes')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'passes'
              ? 'bg-solar-500/20 border border-solar-500/40 text-solar-300'
              : 'bg-space-700/30 border border-white/5 text-gray-400 hover:text-gray-300'
          }`}
        >
          🛰️ Upcoming Passes ({passes.length})
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('myalerts')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'myalerts'
                ? 'bg-nebula-500/20 border border-nebula-500/40 text-nebula-300'
                : 'bg-space-700/30 border border-white/5 text-gray-400 hover:text-gray-300'
            }`}
          >
            🔔 My Alerts ({myAlerts.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'passes' && (
        <div>
          {/* Subscribe Button */}
          {user && passes.length > 0 && (
            <div className="mb-6">
              <button
                onClick={handleSubscribe}
                disabled={alertLoading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <HiOutlineBell className="w-4 h-4" />
                {alertLoading ? 'Subscribing...' : `Subscribe to ${passes.length} Pass Alerts`}
              </button>
              {subscribeStatus && (
                <p className={`text-sm mt-2 ${subscribeStatus.type === 'success' ? 'text-green-400' : 'text-cosmic-400'}`}>
                  {subscribeStatus.msg}
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-space-700/50 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-space-700/50 rounded w-1/2" />
                      <div className="h-3 bg-space-700/30 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : passes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiOutlineEye className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg font-display font-bold text-gray-400">No Visible Passes</h3>
              <p className="text-sm text-gray-500 mt-2">
                {location.lat ? 'No ISS passes found for your location in the next 10 days.' : 'Enter your location to find ISS passes.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passes.map((pass, i) => (
                <PassCard key={i} pass={pass} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myalerts' && (
        <div>
          {myAlerts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiOutlineBell className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg font-display font-bold text-gray-400">No Active Alerts</h3>
              <p className="text-sm text-gray-500 mt-2">Subscribe to ISS pass alerts from the Upcoming Passes tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAlerts.map((alert) => (
                <div key={alert._id} className="glass-card p-5 flex items-center justify-between group animate-slide-up">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-lg">
                      🔔
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.satelliteName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.passData.startTime).toLocaleString()} •
                        Duration: {alert.passData.duration}s •
                        Elevation: {alert.passData.maxElevation}°
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-cosmic-400 hover:bg-cosmic-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Alert"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PassCard({ pass, index }) {
  const startDate = new Date(pass.startTime);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card-hover overflow-hidden animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-solar-500 to-cosmic-500 flex items-center justify-center shrink-0">
          <span className="text-xl">🛰️</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">
              {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <span className="text-xs font-mono text-nebula-400">
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {pass.timeUntil && (
              <span className="px-2 py-0.5 rounded-full bg-aurora-500/10 text-aurora-400 text-[10px] font-medium">
                in {pass.timeUntil.totalMinutes < 60
                  ? `${pass.timeUntil.totalMinutes}m`
                  : `${Math.floor(pass.timeUntil.totalMinutes / 60)}h ${pass.timeUntil.totalMinutes % 60}m`
                }
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Duration: {pass.durationFormatted} • Max Elevation: {pass.maxElevation}°
          </p>
        </div>
        <HiOutlineArrowNarrowUp className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${expanded ? '' : 'rotate-180'}`} />
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/5 animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            {[
              { label: 'Start Direction', value: pass.startDirection },
              { label: 'End Direction', value: pass.endDirection },
              { label: 'Max Elevation', value: `${pass.maxElevation}°` },
              { label: 'Magnitude', value: pass.magnitude ?? 'N/A' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-space-700/40 border border-white/5">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-sm font-semibold font-mono text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
