import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  HiOutlinePhotograph, HiOutlineSearch, HiOutlineExternalLink,
  HiOutlineCalendar, HiOutlineGlobeAlt, HiOutlineX
} from 'react-icons/hi';

const TABS = [
  { id: 'apod', label: 'Picture of the Day', icon: '🌌' },
  { id: 'mars', label: 'Mars Rover', icon: '🔴' },
  { id: 'epic', label: 'Earth Imagery', icon: '🌍' },
  { id: 'search', label: 'Search NASA', icon: '🔎' },
];

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('apod');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [roverSettings, setRoverSettings] = useState({ rover: 'curiosity', sol: 1000 });

  useEffect(() => {
    if (activeTab !== 'search') {
      fetchTabData(activeTab);
    }
  }, [activeTab, roverSettings]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setData(null);
    try {
      let res;
      switch (tab) {
        case 'apod':
          res = await api.get('/media/apod', { params: { count: 12 } });
          break;
        case 'mars':
          res = await api.get('/media/mars', { params: roverSettings });
          break;
        case 'epic':
          res = await api.get('/media/epic');
          break;
        default:
          return;
      }
      if (res.data.success) setData(res.data.data);
    } catch {
      // Try direct NASA API for APOD
      if (tab === 'apod') {
        try {
          const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=12');
          const json = await res.json();
          setData(json);
        } catch { /* silent */ }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);
    try {
      const res = await api.get('/media/search', { params: { q: searchQuery, type: 'image' } });
      if (res.data.success) setSearchResults(res.data.data);
    } catch {
      // Fallback to NASA Images API
      try {
        const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image`);
        const json = await res.json();
        setSearchResults(json.collection?.items || []);
      } catch { /* silent */ }
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Media Hub
        </h1>
        <p className="text-gray-500 mt-1">Explore the universe through NASA's lens</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-nebula-500/20 border border-nebula-500/40 text-nebula-300 shadow-lg shadow-nebula-500/10'
                : 'bg-space-700/30 border border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'apod' && <ApodGrid data={data} loading={loading} onImageClick={setLightbox} />}
      {activeTab === 'mars' && (
        <MarsRover
          data={data}
          loading={loading}
          settings={roverSettings}
          onSettingsChange={setRoverSettings}
          onImageClick={setLightbox}
        />
      )}
      {activeTab === 'epic' && <EpicGallery data={data} loading={loading} onImageClick={setLightbox} />}
      {activeTab === 'search' && (
        <SearchPanel
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          results={searchResults}
          loading={searchLoading}
          onImageClick={setLightbox}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            {lightbox.title && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-display font-bold text-white">{lightbox.title}</h3>
                {lightbox.desc && <p className="text-sm text-gray-400 mt-1 max-w-2xl mx-auto">{lightbox.desc}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────── Sub-Components ────────────────── */

function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden animate-pulse">
          <div className="h-48 bg-space-700/50" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-space-700/50 rounded w-3/4" />
            <div className="h-3 bg-space-700/30 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ApodGrid({ data, loading, onImageClick }) {
  if (loading) return <LoadingGrid count={6} />;
  if (!data) return <EmptyState text="Could not load the Astronomy Pictures." />;

  const items = Array.isArray(data) ? data : [data];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.filter(item => item.media_type === 'image').map((item, i) => (
        <div
          key={i}
          className="glass-card-hover overflow-hidden cursor-pointer group animate-slide-up"
          style={{ animationDelay: `${i * 0.05}s` }}
          onClick={() => onImageClick({ url: item.hdurl || item.url, title: item.title, desc: item.explanation })}
        >
          <div className="relative overflow-hidden">
            <img src={item.url} alt={item.title} className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-space-900/80 backdrop-blur-sm text-xs text-gray-300 border border-white/10">
              <HiOutlineCalendar className="w-3 h-3" />
              {item.date}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-nebula-300 transition-colors">{item.title}</h3>
            {item.copyright && <p className="text-xs text-gray-500 mt-1">© {item.copyright}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MarsRover({ data, loading, settings, onSettingsChange, onImageClick }) {
  const rovers = ['curiosity', 'opportunity', 'spirit'];

  return (
    <div>
      {/* Controls */}
      <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Rover:</span>
          <div className="flex gap-1.5">
            {rovers.map((r) => (
              <button
                key={r}
                onClick={() => onSettingsChange({ ...settings, rover: r })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  settings.rover === r
                    ? 'bg-cosmic-500/20 border border-cosmic-500/40 text-cosmic-300'
                    : 'bg-space-700/30 border border-white/5 text-gray-400 hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sol:</span>
          <input
            type="number"
            value={settings.sol}
            onChange={(e) => onSettingsChange({ ...settings, sol: parseInt(e.target.value) || 1 })}
            className="input-field w-24 py-1.5 text-sm text-center"
            min={1}
          />
        </div>
      </div>

      {loading ? (
        <LoadingGrid count={6} />
      ) : !data?.photos?.length ? (
        <EmptyState text="No photos found for this Sol. Try a different Sol number." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.photos.slice(0, 18).map((photo, i) => (
            <div
              key={photo.id}
              className="glass-card-hover overflow-hidden cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${i * 0.03}s` }}
              onClick={() => onImageClick({ url: photo.img_src, title: `${photo.camera.full_name}`, desc: `Sol ${photo.sol} — ${photo.earth_date}` })}
            >
              <div className="relative overflow-hidden">
                <img src={photo.img_src} alt={photo.camera.full_name} className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white line-clamp-1">{photo.camera.full_name}</h3>
                <p className="text-xs text-gray-500 mt-1">Sol {photo.sol} • {photo.earth_date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EpicGallery({ data, loading, onImageClick }) {
  if (loading) return <LoadingGrid count={4} />;
  if (!data || data.length === 0) return <EmptyState text="No EPIC Earth imagery available." />;

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">
        <HiOutlineGlobeAlt className="w-4 h-4 inline mr-1" />
        Earth Polychromatic Imaging Camera — Images from DSCOVR satellite at the L1 Lagrange point
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.slice(0, 8).map((img, i) => {
          const dateParts = img.date?.split(' ')[0]?.replace(/-/g, '/');
          const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${dateParts}/png/${img.image}.png`;
          return (
            <div
              key={i}
              className="glass-card-hover overflow-hidden cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onImageClick({ url: imageUrl, title: 'Earth from DSCOVR', desc: img.caption })}
            >
              <div className="relative overflow-hidden">
                <img src={imageUrl} alt={img.caption} className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white">{img.caption || 'Earth from DSCOVR'}</h3>
                <p className="text-xs text-gray-500 mt-1">{img.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchPanel({ query, onQueryChange, onSearch, results, loading, onImageClick }) {
  return (
    <div>
      <form onSubmit={onSearch} className="mb-6">
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search NASA images... (e.g. nebula, Saturn, Apollo)"
            className="input-field pl-12 pr-28"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-5 text-sm disabled:opacity-40"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && <LoadingGrid count={6} />}

      {results && results.length === 0 && (
        <EmptyState text="No images found. Try a different search term." />
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.slice(0, 18).map((item, i) => {
            const imgData = item.data?.[0] || {};
            const thumb = item.links?.[0]?.href;
            if (!thumb) return null;
            return (
              <div
                key={i}
                className="glass-card-hover overflow-hidden cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => onImageClick({ url: thumb, title: imgData.title, desc: imgData.description })}
              >
                <div className="relative overflow-hidden">
                  <img src={thumb} alt={imgData.title} className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white line-clamp-1">{imgData.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{imgData.description?.substring(0, 100)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!results && !loading && (
        <div className="glass-card p-12 text-center">
          <HiOutlinePhotograph className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-display font-bold text-gray-400">Search the Universe</h3>
          <p className="text-sm text-gray-500 mt-2">Type a query above to explore millions of NASA images</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="glass-card p-12 text-center">
      <HiOutlinePhotograph className="w-12 h-12 mx-auto text-gray-600 mb-3" />
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
