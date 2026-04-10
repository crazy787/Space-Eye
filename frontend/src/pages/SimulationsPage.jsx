import { useState } from 'react';
import { HiOutlinePlay, HiOutlineRefresh } from 'react-icons/hi';

const TABS = [
  { id: 'rocket', label: 'Rocket Launch', icon: '🚀' },
  { id: 'docking', label: 'ISS Docking', icon: '🔗' },
];

export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState('rocket');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white light-text-primary">
          🎮 Space Simulations
        </h1>
        <p className="text-gray-500 mt-1 light-text-muted">Interactive space mission simulations</p>
      </div>

      <div className="flex gap-2 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-nebula-500/20 border border-nebula-500/40 text-nebula-300 shadow-lg shadow-nebula-500/10'
                : 'bg-space-700/30 border border-white/5 text-gray-400 hover:border-white/15'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rocket' && <RocketSimulation />}
      {activeTab === 'docking' && <DockingSimulation />}
    </div>
  );
}

/* ────────────────── Rocket Launch Simulation ────────────────── */

function RocketSimulation() {
  const [phase, setPhase] = useState('idle'); // idle, countdown, launch, orbit
  const [countdown, setCountdown] = useState(10);
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [missionLog, setMissionLog] = useState([]);

  const addLog = (msg) => setMissionLog((prev) => [...prev, { time: new Date().toLocaleTimeString(), msg }]);

  const startLaunch = () => {
    setPhase('countdown');
    setMissionLog([]);
    setAltitude(0);
    setSpeed(0);
    setFuel(100);
    addLog('🔧 Systems check initiated');
    addLog('✅ All systems nominal');
    addLog('🔢 T-10 countdown started');

    let count = 10;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 5) addLog('🔥 Main engines ignition');
      if (count === 3) addLog('⚡ Full thrust confirmed');
      if (count <= 0) {
        clearInterval(countInterval);
        setPhase('launch');
        addLog('🚀 LIFTOFF!');
        startFlight();
      }
    }, 800);
  };

  const startFlight = () => {
    let alt = 0;
    let spd = 0;
    let fl = 100;
    let tick = 0;

    const flightInterval = setInterval(() => {
      tick++;
      alt += spd * 0.3 + Math.random() * 2;
      spd += 120 + Math.random() * 80;
      fl -= 0.8 + Math.random() * 0.4;

      if (fl < 0) fl = 0;
      setAltitude(Math.round(alt));
      setSpeed(Math.round(spd));
      setFuel(Math.max(0, Math.round(fl)));

      if (tick === 5) addLog('🏗️ Max-Q — maximum dynamic pressure');
      if (tick === 12) addLog('🔧 Stage 1 separation complete');
      if (tick === 18) addLog('🛡️ Fairing jettison');
      if (tick === 25) addLog('📡 SECO — second engine cutoff');

      if (alt >= 408) {
        clearInterval(flightInterval);
        setAltitude(408);
        setSpeed(27600);
        setFuel(Math.max(0, Math.round(fl)));
        setPhase('orbit');
        addLog('🌍 Stable orbit achieved at 408 km!');
        addLog('🛰️ ISS approach trajectory calculated');
      }
    }, 300);
  };

  const reset = () => {
    setPhase('idle');
    setCountdown(10);
    setAltitude(0);
    setSpeed(0);
    setFuel(100);
    setMissionLog([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visualization */}
      <div className="lg:col-span-2 glass-card overflow-hidden animate-slide-up">
        <div className="relative h-[450px] bg-gradient-to-b from-space-900 via-space-800 to-indigo-900/30 overflow-hidden">
          {/* Stars */}
          <div className="absolute inset-0 stars-bg opacity-60" />

          {/* Atmosphere layers */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-900/20 to-transparent" />

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-800/50 via-emerald-700/40 to-emerald-800/50" />

          {/* Altitude markers */}
          {[100, 200, 300, 400].map((a) => (
            <div key={a} className="absolute left-4 flex items-center gap-2" style={{ bottom: `${(a / 450) * 90 + 5}%` }}>
              <span className="text-[9px] font-mono text-gray-600">{a}km</span>
              <div className="w-screen h-px bg-white/5" />
            </div>
          ))}

          {/* Rocket */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
            style={{
              bottom: phase === 'idle' || phase === 'countdown'
                ? '12px'
                : phase === 'orbit'
                  ? '85%'
                  : `${Math.min(85, (altitude / 450) * 85 + 3)}%`,
            }}
          >
            {/* Flame */}
            {(phase === 'launch' || phase === 'countdown' && countdown <= 0) && (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-3 h-8 bg-gradient-to-b from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm" />
                <div className="w-5 h-12 bg-gradient-to-b from-orange-600 via-red-500 to-transparent rounded-full blur-md -mt-4 opacity-60" />
              </div>
            )}
            {/* Rocket body */}
            <div className="text-4xl -mt-2 filter drop-shadow-lg" style={{
              transform: phase === 'orbit' ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 2s ease-in-out',
            }}>
              🚀
            </div>
          </div>

          {/* Launch pad */}
          {phase === 'idle' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-gray-600 rounded-full" />
          )}

          {/* Status overlay */}
          {phase === 'countdown' && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-display font-extrabold text-white/80 animate-pulse">{countdown}</span>
            </div>
          )}

          {phase === 'orbit' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 animate-fade-in">
              <span className="text-sm font-bold text-green-400">🌍 ORBIT ACHIEVED</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-3 border-t border-white/5">
          {phase === 'idle' ? (
            <button onClick={startLaunch} className="btn-primary flex items-center gap-2 text-sm">
              <HiOutlinePlay className="w-4 h-4" /> Begin Launch Sequence
            </button>
          ) : (
            <button onClick={reset} className="btn-ghost flex items-center gap-2 text-sm text-gray-400">
              <HiOutlineRefresh className="w-4 h-4" /> Reset Mission
            </button>
          )}
        </div>
      </div>

      {/* Telemetry panel */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Gauges */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 light-text-muted">Telemetry</h3>
          <div className="space-y-4">
            <TelemetryGauge label="Altitude" value={altitude} max={408} unit="km" color="nebula" />
            <TelemetryGauge label="Speed" value={speed} max={27600} unit="km/h" color="aurora" />
            <TelemetryGauge label="Fuel" value={fuel} max={100} unit="%" color={fuel < 20 ? 'cosmic' : 'solar'} />
          </div>
        </div>

        {/* Mission Log */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 light-text-muted">Mission Log</h3>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {missionLog.length === 0 ? (
              <p className="text-xs text-gray-600">Awaiting launch sequence...</p>
            ) : (
              missionLog.map((log, i) => (
                <div key={i} className="flex gap-2 text-xs animate-fade-in">
                  <span className="text-gray-600 font-mono shrink-0">{log.time}</span>
                  <span className="text-gray-300 light-text-secondary">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryGauge({ label, value, max, unit, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap = {
    nebula: 'from-nebula-500 to-nebula-400',
    aurora: 'from-aurora-500 to-aurora-400',
    solar: 'from-solar-500 to-solar-400',
    cosmic: 'from-cosmic-500 to-cosmic-400',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 light-text-muted">{label}</span>
        <span className="text-white font-mono font-semibold light-text-primary">
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-space-700/50 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ────────────────── Docking Simulation ────────────────── */

function DockingSimulation() {
  const [phase, setPhase] = useState('idle'); // idle, approach, align, dock, complete
  const [distance, setDistance] = useState(500);
  const [dockingLog, setDockingLog] = useState([]);
  const [alignment, setAlignment] = useState(0);
  const [speed2, setSpeed2] = useState(0);

  const addLog = (msg) => setDockingLog((prev) => [...prev, { time: new Date().toLocaleTimeString(), msg }]);

  const startDocking = () => {
    setPhase('approach');
    setDockingLog([]);
    setDistance(500);
    setAlignment(0);
    addLog('📡 Docking sequence initiated');
    addLog('🎯 ISS docking port targeted');
    addLog('🔄 Beginning approach phase');

    let dist = 500;
    let alignPct = 0;
    let tick = 0;

    const interval = setInterval(() => {
      tick++;
      dist -= 8 + Math.random() * 5;
      alignPct = Math.min(100, alignPct + 2 + Math.random() * 3);
      const spd = Math.max(0.1, dist / 50);

      setDistance(Math.max(0, Math.round(dist)));
      setAlignment(Math.round(alignPct));
      setSpeed2(parseFloat(spd.toFixed(1)));

      if (tick === 5) addLog('📐 Attitude adjustment — roll correction');
      if (tick === 10) { setPhase('align'); addLog('🔧 Fine alignment phase'); }
      if (tick === 18) addLog('🟢 Alignment lock confirmed');
      if (tick === 25) { setPhase('dock'); addLog('🔗 Soft capture initiated'); }

      if (dist <= 0) {
        clearInterval(interval);
        setDistance(0);
        setAlignment(100);
        setSpeed2(0);
        setPhase('complete');
        addLog('✅ HARD CAPTURE confirmed!');
        addLog('🔒 Docking latches secured');
        addLog('💨 Pressure equalization started');
        addLog('🚪 Hatch opening in T+30 minutes');
      }
    }, 350);
  };

  const resetDocking = () => {
    setPhase('idle');
    setDistance(500);
    setAlignment(0);
    setSpeed2(0);
    setDockingLog([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visualization */}
      <div className="lg:col-span-2 glass-card overflow-hidden animate-slide-up">
        <div className="relative h-[450px] bg-gradient-to-b from-space-900 to-space-800 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 stars-bg opacity-40" />

          {/* ISS (right side, stationary) */}
          <div className="absolute right-[15%] flex items-center">
            {/* Docking port indicator */}
            <div className={`w-3 h-3 rounded-full mr-2 transition-colors duration-500 ${
              phase === 'complete' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
              phase === 'dock' ? 'bg-yellow-400 animate-pulse' :
              alignment > 80 ? 'bg-green-400/60' : 'bg-red-400/60'
            }`} />
            <span className="text-6xl filter drop-shadow-lg">🛰️</span>
          </div>

          {/* Spacecraft (approaching from left) */}
          <div
            className="absolute flex items-center transition-all duration-500 ease-out"
            style={{
              left: phase === 'idle'
                ? '10%'
                : phase === 'complete'
                  ? `calc(${85 - 15}% - 60px)`
                  : `${10 + ((500 - distance) / 500) * 55}%`,
            }}
          >
            <span className="text-4xl filter drop-shadow-lg" style={{
              transform: 'scaleX(-1)',
            }}>🚀</span>
            {/* RCS thrusters */}
            {phase === 'align' && (
              <>
                <div className="absolute -top-3 left-4 w-1 h-2 bg-blue-400/60 rounded-full animate-pulse" />
                <div className="absolute -bottom-3 left-4 w-1 h-2 bg-blue-400/60 rounded-full animate-pulse" />
              </>
            )}
          </div>

          {/* Distance indicator */}
          {phase !== 'idle' && phase !== 'complete' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-3xl font-display font-extrabold text-white light-text-primary">{distance}m</p>
              <p className="text-xs text-gray-500 light-text-muted">to docking port</p>
            </div>
          )}

          {/* Crosshair overlay for alignment */}
          {phase === 'align' && (
            <div className="absolute right-[15%] mr-16 pointer-events-none">
              <div className="w-20 h-20 border border-green-400/30 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border border-green-400/50 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Success overlay */}
          {phase === 'complete' && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/5">
              <div className="glass-card px-8 py-4 text-center animate-slide-up">
                <p className="text-2xl font-display font-extrabold text-green-400 mb-1">🔗 DOCKED</p>
                <p className="text-sm text-gray-400 light-text-muted">Successfully connected to ISS</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-3 border-t border-white/5">
          {phase === 'idle' ? (
            <button onClick={startDocking} className="btn-primary flex items-center gap-2 text-sm">
              <HiOutlinePlay className="w-4 h-4" /> Begin Docking Sequence
            </button>
          ) : (
            <button onClick={resetDocking} className="btn-ghost flex items-center gap-2 text-sm text-gray-400">
              <HiOutlineRefresh className="w-4 h-4" /> Reset Simulation
            </button>
          )}
        </div>
      </div>

      {/* Telemetry */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 light-text-muted">Docking Telemetry</h3>
          <div className="space-y-4">
            <TelemetryGauge label="Distance" value={distance} max={500} unit="m" color="nebula" />
            <TelemetryGauge label="Alignment" value={alignment} max={100} unit="%" color={alignment > 90 ? 'aurora' : 'solar'} />
            <TelemetryGauge label="Approach Speed" value={speed2} max={10} unit="m/s" color="cosmic" />
          </div>

          {/* Phase indicator */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-2 light-text-muted">Current Phase</p>
            <div className="flex gap-1">
              {['approach', 'align', 'dock', 'complete'].map((p) => (
                <div
                  key={p}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                    p === phase || (phase === 'complete' && true)
                      ? 'bg-gradient-to-r from-nebula-500 to-aurora-500'
                      : ['approach', 'align', 'dock', 'complete'].indexOf(p) <
                        ['approach', 'align', 'dock', 'complete'].indexOf(phase)
                        ? 'bg-nebula-500/60'
                        : 'bg-space-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-nebula-400 mt-2 capitalize">{phase === 'idle' ? 'Standing By' : phase}</p>
          </div>
        </div>

        {/* Log */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 light-text-muted">Docking Log</h3>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {dockingLog.length === 0 ? (
              <p className="text-xs text-gray-600">Awaiting docking sequence...</p>
            ) : (
              dockingLog.map((log, i) => (
                <div key={i} className="flex gap-2 text-xs animate-fade-in">
                  <span className="text-gray-600 font-mono shrink-0">{log.time}</span>
                  <span className="text-gray-300 light-text-secondary">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
