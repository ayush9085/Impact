import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logIn } from '../services/auth';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

function ImpactLogo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" opacity="0.4"/>
      <circle cx="100" cy="100" r="65" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="100" cy="100" r="40" fill="#2563EB" opacity="0.1"/>
      <rect x="74" y="134" width="52" height="10" rx="5" fill="#2563EB"/>
      <rect x="74" y="56" width="52" height="10" rx="5" fill="#2563EB"/>
      <rect x="93" y="66" width="14" height="68" rx="4" fill="#2563EB"/>
      <polyline points="118,96 128,82 138,96" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="128" y1="82" x2="128" y2="112" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await logIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password. Please try again.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-circle auth-bg-circle-1" />
        <div className="auth-bg-circle auth-bg-circle-2" />
        <div className="auth-bg-circle auth-bg-circle-3" />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <ImpactLogo size={72} />
            <span className="auth-app-name">Impact</span>
          </div>
          <p>Sign in to your account to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={17} className="input-icon" />
            <input id="login-email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <Lock size={17} className="input-icon" />
            <input id="login-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
}
