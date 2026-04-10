import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineGlobeAlt } from 'react-icons/hi';

// Custom ISS icon
const issIcon = new L.DivIcon({
  className: 'iss-marker',
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:linear-gradient(135deg,#6C5CE7,#00D2D3);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 20px rgba(108,92,231,0.6);
    font-size:20px;
  ">🛰️</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to auto-pan map to ISS position
function MapFollower({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function ISSTracker() {
  const [issData, setIssData] = useState(null);
  const [trail, setTrail] = useState([]);
  const [astronauts, setAstronauts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchISS = async () => {
    try {
      const res = await api.get('/iss/position');
      if (res.data.success) {
        const d = res.data.data;
        setIssData(d);
        setTrail((prev) => {
          const next = [...prev, [d.latitude, d.longitude]];
          return next.length > 60 ? next.slice(-60) : next;
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch ISS position');
    } finally {
      setLoading(false);
    }
  };

  const fetchAstronauts = async () => {
    try {
      const res = await api.get('/iss/astronauts');
      if (res.data.success) setAstronauts(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchISS();
    fetchAstronauts();
    intervalRef.current = setInterval(fetchISS, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-nebula-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Locating ISS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-xl">
              🛰️
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">ISS Live Tracker</h2>
              <p className="text-xs text-gray-500">Updated every 5 seconds</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            issData?.isNighttime ? 'bg-indigo-500/20 text-indigo-300' : 'bg-solar-400/20 text-solar-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {issData?.visibility || 'Live'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[350px] relative">
        {error ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>{error}</p>
          </div>
        ) : issData ? (
          <MapContainer
            center={[issData.latitude, issData.longitude]}
            zoom={3}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
            <Marker position={[issData.latitude, issData.longitude]} icon={issIcon}>
              <Popup className="dark-popup">
                <div className="text-sm">
                  <strong>ISS</strong><br/>
                  Lat: {issData.latitude.toFixed(4)}°<br/>
                  Lng: {issData.longitude.toFixed(4)}°
                </div>
              </Popup>
            </Marker>
            {trail.length > 1 && (
              <Polyline positions={trail} pathOptions={{ color: '#6C5CE7', weight: 2, opacity: 0.6, dashArray: '8, 8' }} />
            )}
            <MapFollower position={[issData.latitude, issData.longitude]} />
          </MapContainer>
        ) : null}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
        <Stat icon={<HiOutlineLocationMarker />} label="Latitude" value={issData?.latitude?.toFixed(4) + '°'} />
        <Stat icon={<HiOutlineLocationMarker />} label="Longitude" value={issData?.longitude?.toFixed(4) + '°'} />
        <Stat icon={<HiOutlineGlobeAlt />} label="Region" value={issData?.region || 'Over Ocean'} />
        <Stat icon={<HiOutlineClock />} label="Speed" value={`${issData?.speed?.toLocaleString()} km/h`} />
      </div>

      {/* Astronauts */}
      {astronauts && (
        <div className="p-5 border-t border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            👨‍🚀 People in Space — <span className="text-nebula-400">{astronauts.total}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {astronauts.people?.map((p, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-space-700/60 border border-white/5 text-xs text-gray-300">
                {p.name} <span className="text-gray-500">({p.craft})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="p-4 bg-space-800/30">
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-white truncate">{value || '—'}</p>
    </div>
  );
}
