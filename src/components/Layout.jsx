import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/auth';
import {
  LayoutDashboard,
  ClipboardList,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

function ImpactLogo({ size = 32 }) {
  return (
    <img 
      src="/logo.png" 
      alt="Impact Logo" 
      style={{ width: size, height: size, borderRadius: '8px', objectFit: 'cover' }} 
    />
  );
}

export default function Layout({ children }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isNGO = userProfile?.role === 'ngo_admin';

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const ngoLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Task Manager', icon: ClipboardList },
  ];

  const volunteerLinks = [
    { to: '/volunteer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/volunteer/profile', label: 'My Profile', icon: UserCircle },
  ];

  const links = isNGO ? ngoLinks : volunteerLinks;

  return (
    <div className="layout-container">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="mobile-logo">
          <ImpactLogo size={28} />
          <span>Impact</span>
        </div>
        <div className="mobile-avatar">
          {userProfile?.name?.charAt(0) || '?'}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-group">
            <ImpactLogo size={36} />
            <div>
              <h1 className="logo-text">Impact</h1>
              <p className="logo-subtitle">Volunteer Coordination</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {isNGO ? 'NGO Management' : 'Volunteer Hub'}
          </div>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={15} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{userProfile?.name?.charAt(0) || '?'}</div>
            <div className="user-info">
              <p className="user-name">{userProfile?.name || 'User'}</p>
              <p className="user-role">{isNGO ? 'NGO Admin' : 'Volunteer'}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">{children}</main>
    </div>
  );
}
