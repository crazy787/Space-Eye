import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ISSTracker from '../components/ISSTracker';
import NasaApod from '../components/NasaApod';
import SatelliteInfo from '../components/SatelliteInfo';
import Globe3D from '../components/Globe3D';
import AstronautDirectory from '../components/AstronautDirectory';
import OrbitPrediction from '../components/OrbitPrediction';
import api from '../api/axios';
import { HiOutlineClock, HiOutlineStatusOnline } from 'react-icons/hi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data.success) setHealth(res.data);
      } catch { /* silent */ }
    };
    fetchHealth();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white light-text-primary">
              Mission Control
            </h1>
            <p className="text-gray-500 mt-1 light-text-muted">
              Welcome back, <span className="text-nebula-400 font-medium">{user?.name || 'Commander'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {health && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <HiOutlineStatusOnline className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium">API Online</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-white/5 light-card">
              <HiOutlineClock className="w-4 h-4 text-gray-500 light-text-muted" />
              <span className="text-xs text-gray-400 font-mono light-text-muted">
                {time.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ISS Map Tracker — 2 cols */}
        <div className="lg:col-span-2">
          <ISSTracker />
        </div>

        {/* 3D Globe */}
        <div>
          <Globe3D />
        </div>

        {/* Orbit Prediction — Full Width */}
        <div className="lg:col-span-3">
          <OrbitPrediction />
        </div>

        {/* APOD */}
        <div>
          <NasaApod />
        </div>

        {/* Astronaut Directory — 2 cols */}
        <div className="lg:col-span-2">
          <AstronautDirectory />
        </div>

        {/* Satellite Info — 2 cols */}
        <div className="lg:col-span-2">
          <SatelliteInfo />
        </div>

        {/* Live Streams Card */}
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-solar-500 flex items-center justify-center text-xl">
                📺
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white light-text-primary">Live Streams</h2>
                <p className="text-xs text-gray-500 light-text-muted">NASA & ISS feeds</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <StreamLink
              title="ISS Earth Viewing"
              desc="Live HD camera from the ISS"
              url="https://www.youtube.com/watch?v=P9C25Un7xaM"
              color="nebula"
            />
            <StreamLink
              title="NASA TV"
              desc="Official NASA live broadcasts"
              url="https://www.youtube.com/watch?v=21X5lGlDOfg"
              color="aurora"
            />
            <StreamLink
              title="Space Station Audio"
              desc="Air-to-ground communications"
              url="https://www.nasa.gov/nasalive"
              color="solar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamLink({ title, desc, url, color }) {
  const colorMap = {
    nebula: 'bg-nebula-500/10 border-nebula-500/20 hover:border-nebula-500/40',
    aurora: 'bg-aurora-500/10 border-aurora-500/20 hover:border-aurora-500/40',
    solar: 'bg-solar-500/10 border-solar-500/20 hover:border-solar-500/40',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 rounded-xl border transition-all duration-200 ${colorMap[color]} hover:scale-[1.02]`}
    >
      <p className="text-sm font-semibold text-white light-text-primary">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 light-text-muted">{desc}</p>
    </a>
  );
}
