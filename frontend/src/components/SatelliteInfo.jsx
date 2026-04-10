import { useEffect, useState } from 'react';
import api from '../api/axios';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

export default function SatelliteInfo() {
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);
  const [satPosition, setSatPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posLoading, setPosLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popRes, catRes] = await Promise.all([
          api.get('/satellites/popular'),
          api.get('/satellites/categories'),
        ]);
        if (popRes.data.success) setPopular(popRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchPosition = async (sat) => {
    setSelectedSat(sat);
    setPosLoading(true);
    try {
      const res = await api.get(`/satellites/position/${sat.noradId}`, {
        params: { lat: 0, lng: 0, alt: 0, seconds: 2 },
      });
      if (res.data.success) {
        setSatPosition(res.data.data);
      }
    } catch {
      setSatPosition(null);
    }
    setPosLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-aurora-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading satellites...</p>
        </div>
      </div>
    );
  }

  const visibleSats = showAll ? popular : popular.slice(0, 8);

  return (
    <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-500 to-solar-500 flex items-center justify-center text-xl">
            📡
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white">N2YO Satellite Tracker</h2>
            <p className="text-xs text-gray-500">Click any satellite to track its position</p>
          </div>
        </div>
      </div>

      {/* Satellite Categories */}
      {categories.length > 0 && (
        <div className="px-5 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 10).map((cat) => (
              <span key={cat.id} className="px-2.5 py-1 rounded-lg bg-space-700/50 border border-white/5 text-xs text-gray-400 capitalize">
                {cat.name.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Satellites Grid */}
      <div className="p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular Satellites</h3>
        <div className="grid grid-cols-2 gap-2">
          {visibleSats.map((sat) => (
            <button
              key={sat.noradId}
              onClick={() => fetchPosition(sat)}
              className={`text-left p-3 rounded-xl border transition-all duration-200
                ${selectedSat?.noradId === sat.noradId
                  ? 'bg-nebula-500/15 border-nebula-500/40 shadow-lg shadow-nebula-500/10'
                  : 'bg-space-700/30 border-white/5 hover:border-white/15 hover:bg-space-700/50'
                }`}
            >
              <p className="text-sm font-medium text-white truncate">{sat.name}</p>
              <p className="text-xs text-gray-500 font-mono">NORAD: {sat.noradId}</p>
            </button>
          ))}
        </div>
        {popular.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 flex items-center gap-1 mx-auto text-xs text-nebula-400 hover:text-nebula-300 transition-colors"
          >
            {showAll ? <HiOutlineChevronUp className="w-3.5 h-3.5" /> : <HiOutlineChevronDown className="w-3.5 h-3.5" />}
            {showAll ? 'Show less' : `Show all ${popular.length}`}
          </button>
        )}
      </div>

      {/* Selected Satellite Position */}
      {selectedSat && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            📍 {selectedSat.name}
          </h3>
          {posLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-nebula-500 border-t-transparent rounded-full animate-spin" />
              Fetching position...
            </div>
          ) : satPosition?.positions?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Latitude', value: satPosition.positions[0].satlatitude?.toFixed(4) + '°' },
                { label: 'Longitude', value: satPosition.positions[0].satlongitude?.toFixed(4) + '°' },
                { label: 'Altitude', value: satPosition.positions[0].sataltitude?.toFixed(1) + ' km' },
                { label: 'Elevation', value: satPosition.positions[0].elevation?.toFixed(1) + '°' },
              ].map((s) => (
                <div key={s.label} className="p-2.5 rounded-lg bg-space-700/40 border border-white/5">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-mono font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No position data available. The N2YO API key may need to be configured.</p>
          )}
        </div>
      )}
    </div>
  );
}
