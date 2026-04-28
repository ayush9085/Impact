import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { hasFirebaseConfig } from './services/firebase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NGODashboard from './pages/NGODashboard';
import TaskManager from './pages/TaskManager';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerProfile from './pages/VolunteerProfile';
import { Loader2, AlertTriangle } from 'lucide-react';

function ConfigBanner() {
  if (hasFirebaseConfig) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.4)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px',
      fontSize: '13px', color: '#fbbf24',
    }}>
      <AlertTriangle size={16} />
      <strong>Firebase not configured.</strong>
      Copy <code>.env.example</code> → <code>.env</code> and add your Firebase credentials to activate the app.
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-loader">
        <Loader2 size={40} className="spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && userProfile && userProfile.role !== allowedRole) {
    return (
      <Navigate
        to={userProfile.role === 'ngo_admin' ? '/dashboard' : '/volunteer'}
        replace
      />
    );
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-loader">
        <Loader2 size={40} className="spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (user && userProfile) {
    return (
      <Navigate
        to={userProfile.role === 'ngo_admin' ? '/dashboard' : '/volunteer'}
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <ConfigBanner />
      <div style={{ paddingTop: hasFirebaseConfig ? 0 : 45 }}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="ngo_admin"><NGODashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute allowedRole="ngo_admin"><TaskManager /></ProtectedRoute>} />
          <Route path="/volunteer" element={<ProtectedRoute allowedRole="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/volunteer/profile" element={<ProtectedRoute allowedRole="volunteer"><VolunteerProfile /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
