import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const AIPage = lazy(() => import('./pages/AIPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SimulationsPage = lazy(() => import('./pages/SimulationsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center
                        shadow-2xl shadow-nebula-500/30 animate-float">
          <span className="text-2xl">🚀</span>
        </div>
        <div className="w-10 h-10 border-2 border-nebula-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium light-text-muted">Loading module...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen stars-bg transition-colors duration-500 ${
      theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-space-900 text-white'
    }`}>
      {user && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/simulations" element={<ProtectedRoute><SimulationsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
        </Routes>
      </Suspense>
    </div>
  );
}
