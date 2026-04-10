import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineGlobeAlt, HiOutlineLogout, HiOutlineUser,
  HiOutlinePhotograph, HiOutlineChatAlt2, HiOutlineBell,
  HiOutlineCog, HiOutlineMenu, HiOutlineX, HiOutlineHome,
  HiOutlineSun, HiOutlineMoon, HiOutlinePlay
} from 'react-icons/hi';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineHome className="w-4 h-4" /> },
  { to: '/media', label: 'Media', icon: <HiOutlinePhotograph className="w-4 h-4" /> },
  { to: '/simulations', label: 'Sims', icon: <HiOutlinePlay className="w-4 h-4" /> },
  { to: '/ai', label: 'AI', icon: <HiOutlineChatAlt2 className="w-4 h-4" /> },
  { to: '/alerts', label: 'Alerts', icon: <HiOutlineBell className="w-4 h-4" /> },
  { to: '/settings', label: 'Settings', icon: <HiOutlineCog className="w-4 h-4" /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-nebula-500/15 border border-nebula-500/30 text-nebula-300 shadow-sm shadow-nebula-500/10'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 light-text-muted light-hover-bg'
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b border-white/5 light-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center
                            shadow-lg shadow-nebula-500/25 group-hover:shadow-nebula-500/50 transition-shadow duration-300">
              <HiOutlineGlobeAlt className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-display font-bold gradient-text leading-tight">Space-Eye</h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClasses}>
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-solar-400 hover:border-solar-500/30
                         hover:bg-solar-500/5 transition-all duration-300 light-border"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
            </button>

            {/* User badge */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-space-700/50 border border-white/5 light-card">
              <HiOutlineUser className="w-3.5 h-3.5 text-nebula-400" />
              <span className="text-sm text-gray-300 max-w-[100px] truncate light-text-secondary">{user?.name || user?.email}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-400
                         hover:text-cosmic-400 hover:border-cosmic-400/30 hover:bg-cosmic-400/5 transition-all duration-300 light-border"
              title="Logout"
            >
              <HiOutlineLogout className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">Logout</span>
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors light-border"
            >
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 px-4 py-3 space-y-1 animate-slide-up">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={linkClasses}>
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
