import { useEffect, useState } from 'react';
import api from '../api/axios';
import { HiOutlinePhotograph, HiOutlineCalendar, HiOutlineExternalLink } from 'react-icons/hi';

export default function NasaApod() {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const res = await api.get('/media/apod');
        if (res.data.success) setApod(res.data.data);
      } catch {
        // Fallback if backend fails — hit NASA directly
        try {
          const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
          const data = await res.json();
          setApod(data);
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    };
    fetchApod();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-8 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-solar-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading APOD...</p>
        </div>
      </div>
    );
  }

  if (!apod) {
    return (
      <div className="glass-card p-8 text-center text-gray-400">
        <HiOutlinePhotograph className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Could not load the Astronomy Picture of the Day.</p>
      </div>
    );
  }

  return (
    <div className="glass-card-hover overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Image */}
      <div className="relative group">
        {apod.media_type === 'video' ? (
          <div className="aspect-video">
            <iframe
              src={apod.url}
              title={apod.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <img
              src={apod.hdurl || apod.url}
              alt={apod.title}
              className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-space-900/80 backdrop-blur-sm border border-white/10 text-xs text-gray-300">
          <HiOutlineCalendar className="w-3.5 h-3.5" />
          {apod.date}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-display font-bold text-white leading-tight">{apod.title}</h2>
          {apod.hdurl && (
            <a href={apod.hdurl} target="_blank" rel="noopener noreferrer"
               className="shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-nebula-400">
              <HiOutlineExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {apod.copyright && (
          <p className="text-xs text-gray-500 mb-3">© {apod.copyright}</p>
        )}

        <p className={`text-sm text-gray-400 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {apod.explanation}
        </p>

        {apod.explanation?.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-nebula-400 hover:text-nebula-300 font-medium transition-colors"
          >
            {expanded ? 'Show less' : 'Read more →'}
          </button>
        )}
      </div>
    </div>
  );
}
