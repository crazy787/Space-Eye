import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';

export default function Globe3D() {
  const canvasRef = useRef(null);
  const [issData, setIssData] = useState(null);
  const animFrameRef = useRef(null);
  const rotationRef = useRef(0);
  const [hovering, setHovering] = useState(false);

  const fetchISS = useCallback(async () => {
    try {
      const res = await api.get('/iss/position');
      if (res.data.success) setIssData(res.data.data);
    } catch {
      try {
        const res = await fetch('https://api.open-notify.org/iss-now.json');
        const data = await res.json();
        if (data.message === 'success') {
          setIssData({
            latitude: parseFloat(data.iss_position.latitude),
            longitude: parseFloat(data.iss_position.longitude),
          });
        }
      } catch { /* silent */ }
    }
  }, []);

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, [fetchISS]);

  const drawGlobe = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.38;

    ctx.clearRect(0, 0, w, h);

    // Glow behind earth
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.6);
    glowGrad.addColorStop(0, 'rgba(108, 92, 231, 0.15)');
    glowGrad.addColorStop(0.5, 'rgba(0, 210, 211, 0.05)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Earth sphere
    const earthGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
    earthGrad.addColorStop(0, '#1e6b8f');
    earthGrad.addColorStop(0.3, '#0e4a6e');
    earthGrad.addColorStop(0.7, '#0a2d4a');
    earthGrad.addColorStop(1, '#061826');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();

    // Continent-like patterns (procedural)
    const rot = rotationRef.current;
    const continents = [
      { lon: -100, lat: 40, size: 30 },  // North America
      { lon: -60, lat: -15, size: 25 },   // South America
      { lon: 10, lat: 50, size: 20 },     // Europe
      { lon: 25, lat: 5, size: 35 },      // Africa
      { lon: 80, lat: 25, size: 28 },     // Asia
      { lon: 135, lat: -25, size: 22 },   // Australia
    ];

    continents.forEach((cont) => {
      const lonRad = ((cont.lon + rot) * Math.PI) / 180;
      const latRad = (cont.lat * Math.PI) / 180;
      const x3d = Math.cos(latRad) * Math.sin(lonRad);
      const z3d = Math.cos(latRad) * Math.cos(lonRad);
      const y3d = Math.sin(latRad);

      if (z3d > -0.1) {
        const px = cx + x3d * r * 0.85;
        const py = cy - y3d * r * 0.85;
        const scale = (z3d + 1) / 2;
        const size = cont.size * scale * (r / 120);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 139, 90, ${0.3 + scale * 0.5})`;
        ctx.fill();

        // Add texture noise dots
        for (let d = 0; d < 5; d++) {
          const dx = (Math.random() - 0.5) * size * 1.5;
          const dy = (Math.random() - 0.5) * size * 1.5;
          ctx.beginPath();
          ctx.arc(px + dx, py + dy, size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(46, 160, 110, ${0.2 + scale * 0.3})`;
          ctx.fill();
        }
      }
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.1)';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      const latRad = (lat * Math.PI) / 180;
      for (let lon = 0; lon <= 360; lon += 5) {
        const lonRad = ((lon + rot) * Math.PI) / 180;
        const x3d = Math.cos(latRad) * Math.sin(lonRad);
        const z3d = Math.cos(latRad) * Math.cos(lonRad);
        const y3d = Math.sin(latRad);
        if (z3d > 0) {
          const px = cx + x3d * r * 0.9;
          const py = cy - y3d * r * 0.9;
          if (lon === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // ISS marker
    if (issData) {
      const issLonRad = ((issData.longitude + rot) * Math.PI) / 180;
      const issLatRad = (issData.latitude * Math.PI) / 180;
      const ix = Math.cos(issLatRad) * Math.sin(issLonRad);
      const iz = Math.cos(issLatRad) * Math.cos(issLonRad);
      const iy = Math.sin(issLatRad);

      if (iz > -0.05) {
        const ipx = cx + ix * r * 0.92;
        const ipy = cy - iy * r * 0.92;
        const scale = (iz + 1) / 2;

        // Pulse ring
        const pulseSize = 8 + Math.sin(Date.now() / 300) * 3;
        ctx.beginPath();
        ctx.arc(ipx, ipy, pulseSize * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(108, 92, 231, ${0.4 * scale})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // ISS dot
        ctx.beginPath();
        ctx.arc(ipx, ipy, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 92, 231, ${0.8 + scale * 0.2})`;
        ctx.fill();

        // Label
        ctx.font = `${10 * scale}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(124, 106, 239, ${scale})`;
        ctx.fillText('ISS', ipx + 10, ipy - 5);
      }
    }

    // Atmosphere edge
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Atmosphere glow
    const atmosGrad = ctx.createRadialGradient(cx, cy, r - 3, cx, cy, r + 8);
    atmosGrad.addColorStop(0, 'rgba(0, 210, 211, 0.08)');
    atmosGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = atmosGrad;
    ctx.fill();

    // Auto-rotate
    if (!hovering) {
      rotationRef.current += 0.3;
    }

    animFrameRef.current = requestAnimationFrame(drawGlobe);
  }, [issData, hovering]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animFrameRef.current = requestAnimationFrame(drawGlobe);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawGlobe]);

  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-white/5 dark:border-white/5 light-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-500 to-nebula-500 flex items-center justify-center text-xl">
              🌍
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white light-text-primary">3D Globe</h2>
              <p className="text-xs text-gray-500 light-text-muted">Real-time ISS position</p>
            </div>
          </div>
          {issData && (
            <div className="text-right">
              <p className="text-xs text-gray-500 font-mono light-text-muted">
                {issData.latitude?.toFixed(2)}°, {issData.longitude?.toFixed(2)}°
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        className="h-[350px] relative cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
