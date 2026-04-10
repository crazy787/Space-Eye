import { useEffect, useState } from 'react';
import api from '../api/axios';
import { HiOutlineUserGroup } from 'react-icons/hi';

const CREW_PHOTOS = [
  'https://i.pravatar.cc/80?img=1', 'https://i.pravatar.cc/80?img=2',
  'https://i.pravatar.cc/80?img=3', 'https://i.pravatar.cc/80?img=4',
  'https://i.pravatar.cc/80?img=5', 'https://i.pravatar.cc/80?img=6',
  'https://i.pravatar.cc/80?img=7', 'https://i.pravatar.cc/80?img=8',
  'https://i.pravatar.cc/80?img=9', 'https://i.pravatar.cc/80?img=10',
  'https://i.pravatar.cc/80?img=11', 'https://i.pravatar.cc/80?img=12',
];

const NATIONALITIES = {
  'ISS': ['🇺🇸', '🇷🇺', '🇯🇵', '🇪🇺', '🇨🇦', '🇮🇹', '🇩🇪', '🇫🇷'],
  'Tiangong': ['🇨🇳'],
};

const ROLES = ['Commander', 'Flight Engineer', 'Mission Specialist', 'Pilot', 'Science Officer', 'Research Astronaut'];

export default function AstronautDirectory() {
  const [astronauts, setAstronauts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState(null);

  useEffect(() => {
    const fetchAstronauts = async () => {
      try {
        const res = await api.get('/iss/astronauts');
        if (res.data.success) setAstronauts(res.data.data);
      } catch {
        try {
          const res = await fetch('https://api.open-notify.org/astros.json');
          const data = await res.json();
          if (data.message === 'success') {
            setAstronauts({ total: data.number, people: data.people });
          }
        } catch { /* silent */ }
      }
      setLoading(false);
    };
    fetchAstronauts();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-aurora-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading crew manifest...</p>
        </div>
      </div>
    );
  }

  if (!astronauts) {
    return (
      <div className="glass-card p-8 text-center text-gray-400">
        <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Could not load astronaut data.</p>
      </div>
    );
  }

  const people = astronauts.people || [];

  return (
    <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-solar-500 to-cosmic-500 flex items-center justify-center text-xl">
              👨‍🚀
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white light-text-primary">Astronaut Directory</h2>
              <p className="text-xs text-gray-500 light-text-muted">Currently in space</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-500/10 border border-aurora-500/20">
            <span className="w-2 h-2 rounded-full bg-aurora-400 animate-pulse" />
            <span className="text-xs font-bold text-aurora-400">{astronauts.total} humans</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person, i) => {
            const flags = NATIONALITIES[person.craft] || ['🌍'];
            const flag = flags[i % flags.length];
            const role = ROLES[i % ROLES.length];
            const isSelected = selectedCrew === i;

            return (
              <button
                key={i}
                onClick={() => setSelectedCrew(isSelected ? null : i)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-nebula-500/15 border-nebula-500/40 shadow-lg shadow-nebula-500/10'
                    : 'bg-space-700/20 border-white/5 hover:border-white/15 hover:bg-space-700/40'
                }`}
              >
                <img
                  src={CREW_PHOTOS[i % CREW_PHOTOS.length]}
                  alt={person.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{flag}</span>
                    <p className="text-sm font-semibold text-white light-text-primary truncate">{person.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-600/50 text-gray-400 light-text-muted">{person.craft}</span>
                    {isSelected && (
                      <span className="text-[10px] text-nebula-400 animate-fade-in">{role}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
