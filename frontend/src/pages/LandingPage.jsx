import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineGlobeAlt, HiOutlinePhotograph, HiOutlineChatAlt2, HiOutlineBell, HiOutlineChevronDown } from 'react-icons/hi';

export default function LandingPage() {
  const [issPos, setIssPos] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch('https://api.open-notify.org/iss-now.json');
        const data = await res.json();
        if (data.message === 'success') {
          setIssPos({
            lat: parseFloat(data.iss_position.latitude).toFixed(4),
            lng: parseFloat(data.iss_position.longitude).toFixed(4),
          });
        }
      } catch { /* silent */ }
    };
    fetchISS();
    const interval = setInterval(fetchISS, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <HiOutlineGlobeAlt className="w-7 h-7" />,
      title: 'ISS Live Tracker',
      desc: 'Track the International Space Station in real-time on an interactive map with 5-second updates.',
      gradient: 'from-nebula-500 to-aurora-500',
    },
    {
      icon: <HiOutlinePhotograph className="w-7 h-7" />,
      title: 'NASA Media Hub',
      desc: 'Explore the Astronomy Picture of the Day, Mars Rover photos, and the entire NASA media library.',
      gradient: 'from-solar-500 to-cosmic-500',
    },
    {
      icon: <HiOutlineChatAlt2 className="w-7 h-7" />,
      title: 'Space AI Assistant',
      desc: 'Ask questions about space, the ISS, astronauts, and orbital mechanics powered by AI.',
      gradient: 'from-aurora-500 to-nebula-500',
    },
    {
      icon: <HiOutlineBell className="w-7 h-7" />,
      title: 'Pass Alerts',
      desc: 'Get notified when the ISS is visible from your location with pass predictions.',
      gradient: 'from-cosmic-500 to-solar-500',
    },
  ];

  return (
    <div className="min-h-screen bg-space-900 stars-bg overflow-hidden">
      {/* Floating Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-space-900/90 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center
                            shadow-lg shadow-nebula-500/25">
              <HiOutlineGlobeAlt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold gradient-text">Space-Eye</h1>
              <p className="text-[10px] text-gray-500 -mt-1 tracking-widest uppercase">Real-time Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm px-5 py-2 text-gray-300">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-nebula-500/15 rounded-full blur-[150px] animate-pulse-slow" />
          <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-aurora-500/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nebula-600/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Live ISS badge */}
          {issPos && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nebula-500/10 border border-nebula-500/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-300 font-mono">
                ISS Live: {issPos.lat}°, {issPos.lng}°
              </span>
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold leading-tight mb-6 animate-slide-up">
            <span className="text-white">Track the</span>
            <br />
            <span className="gradient-text">Cosmos</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Real-time ISS tracking, NASA imagery, satellite data, and an AI-powered
            space companion — all in one stunning dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 flex items-center gap-2">
              🚀 Launch Mission Control
            </Link>
            <Link to="/login" className="btn-ghost text-lg px-8 py-4 text-gray-300">
              Sign In →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <HiOutlineChevronDown className="w-6 h-6 text-gray-600" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
              Your Space Command Center
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Everything you need to explore the final frontier, in one beautiful interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="glass-card-hover p-8 group animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white
                                shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '27,600', label: 'km/h ISS Speed' },
            { value: '408', label: 'km Altitude' },
            { value: '15.5', label: 'Orbits per Day' },
            { value: '∞', label: 'Things to Explore' },
          ].map((stat) => (
            <div key={stat.label} className="p-6">
              <p className="text-3xl sm:text-4xl font-display font-extrabold gradient-text mb-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-nebula-500/10 via-transparent to-aurora-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
                Ready for Liftoff?
              </h2>
              <p className="text-gray-400 mb-8">
                Create a free account and start tracking the universe in real-time.
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-block">
                🛰️ Begin Exploration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Space-Eye. Built with 🚀 and React.</p>
          <div className="flex gap-6">
            <span>Powered by NASA APIs</span>
            <span>•</span>
            <span>N2YO Satellite Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
