import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';

export default function OrbitPrediction() {
  const canvasRef = useRef(null);
  const [issData, setIssData] = useState(null);
  const [trail, setTrail] = useState([]);
  const animRef = useRef(null);

  const fetchISS = useCallback(async () => {
    try {
      const res = await api.get('/iss/position');
      if (res.data.success) {
        const d = res.data.data;
        setIssData(d);
        setTrail((prev) => {
          const next = [...prev, { lat: d.latitude, lng: d.longitude, time: Date.now() }];
          return next.length > 100 ? next.slice(-100) : next;
        });
      }
    } catch {
      try {
        const res = await fetch('https://api.open-notify.org/iss-now.json');
        const data = await res.json();
        if (data.message === 'success') {
          const lat = parseFloat(data.iss_position.latitude);
          const lng = parseFloat(data.iss_position.longitude);
          setIssData({ latitude: lat, longitude: lng });
          setTrail((prev) => {
            const next = [...prev, { lat, lng, time: Date.now() }];
            return next.length > 100 ? next.slice(-100) : next;
          });
        }
      } catch { /* silent */ }
    }
  }, []);

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 3000);
    return () => clearInterval(interval);
  }, [fetchISS]);

  const drawOrbit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw map background
    ctx.fillStyle = 'rgba(11, 13, 23, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += w / 18) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += h / 9) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Equator
    ctx.strokeStyle = 'rgba(255, 159, 67, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Predicted orbit path (sinusoidal — ISS inclination ~51.6°)
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    const offset = issData ? issData.longitude : 0;
    for (let orbit = -1; orbit <= 1; orbit++) {
      ctx.beginPath();
      for (let deg = 0; deg <= 360; deg += 2) {
        const x = ((deg + offset + orbit * 360) % 720 - 180) / 360 * w + w / 2;
        const y = h / 2 - Math.sin((deg * Math.PI) / 180) * (h * 0.4) * Math.cos((51.6 * Math.PI) / 180);
        if (deg === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Trail
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];
        const alpha = (i / trail.length) * 0.8;
        const px1 = ((prev.lng + 180) / 360) * w;
        const py1 = ((90 - prev.lat) / 180) * h;
        const px2 = ((curr.lng + 180) / 360) * w;
        const py2 = ((90 - curr.lat) / 180) * h;

        if (Math.abs(px2 - px1) < w / 2) {
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = `rgba(0, 210, 211, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // ISS position
    if (issData) {
      const ix = ((issData.longitude + 180) / 360) * w;
      const iy = ((90 - issData.latitude) / 180) * h;

      // Pulse
      const pulse = 10 + Math.sin(Date.now() / 250) * 4;
      ctx.beginPath();
      ctx.arc(ix, iy, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.arc(ix, iy, 5, 0, Math.PI * 2);
      const dotGrad = ctx.createRadialGradient(ix, iy, 0, ix, iy, 5);
      dotGrad.addColorStop(0, '#7C6AEF');
      dotGrad.addColorStop(1, '#6C5CE7');
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // Label
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#7C6AEF';
      ctx.fillText(`ISS  ${issData.latitude?.toFixed(2)}°, ${issData.longitude?.toFixed(2)}°`, ix + 12, iy - 8);
    }

    // Predicted future positions (extrapolate from current)
    if (issData) {
      const orbitalPeriod = 92; // minutes
      const degreesPerMin = 360 / orbitalPeriod;
      for (let m = 15; m <= 90; m += 15) {
        const futureLng = ((issData.longitude + degreesPerMin * m + 180) % 360) - 180;
        const futureLat = issData.latitude * Math.cos((m / orbitalPeriod) * Math.PI * 2);
        const fx = ((futureLng + 180) / 360) * w;
        const fy = ((90 - futureLat) / 180) * h;

        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 159, 67, ${0.6 - m / 150})`;
        ctx.fill();

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(255, 159, 67, ${0.5 - m / 200})`;
        ctx.fillText(`+${m}m`, fx + 6, fy + 3);
      }
    }

    animRef.current = requestAnimationFrame(drawOrbit);
  }, [issData, trail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const p = canvas.parentElement;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(drawOrbit);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [drawOrbit]);

  return (
    <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.25s' }}>
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-500 to-cosmic-500 flex items-center justify-center text-xl">
            🌐
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white light-text-primary">Orbit Prediction</h2>
            <p className="text-xs text-gray-500 light-text-muted">Real path + future positions</p>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {/* Legend */}
      <div className="px-5 py-3 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-500 light-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-nebula-500" /> Current ISS
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-aurora-500 rounded" /> Trail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-solar-500" /> Predicted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-nebula-500/30 rounded" style={{ borderBottom: '1px dashed' }} /> Orbit Path
        </span>
      </div>
    </div>
  );
}
