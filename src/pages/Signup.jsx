import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../services/auth';
import { Mail, Lock, User, MapPin, ArrowRight, Loader2, Shield, Heart } from 'lucide-react';

const AVAILABLE_SKILLS = [
  'teaching',
  'first-aid',
  'counseling',
  'construction',
  'driving',
  'logistics',
  'medical',
  'nursing',
  'tech',
  'data-entry',
  'communication',
  'cooking',
  'event-planning',
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role');
      return;
    }

    if (role === 'volunteer' && skills.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, role, {
        skills: role === 'volunteer' ? skills : [],
        location,
        availability: true,
      });
      navigate(role === 'ngo_admin' ? '/dashboard' : '/volunteer');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(err.message);
      }
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

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <img src="/logo.png" alt="Impact Logo" className="auth-logo-img" />
            <span className="auth-app-name">Impact</span>
          </div>
          <p>Create your free account to get started</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              id="signup-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              id="signup-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              id="signup-password"
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Role selection */}
          <div className="role-selector">
            <label className="role-label">I am a:</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${role === 'ngo_admin' ? 'role-active' : ''}`}
                onClick={() => setRole('ngo_admin')}
              >
                <Shield size={24} />
                <span>NGO Admin</span>
                <small>Manage tasks & volunteers</small>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'volunteer' ? 'role-active' : ''}`}
                onClick={() => setRole('volunteer')}
              >
                <Heart size={24} />
                <span>Volunteer</span>
                <small>Help with community tasks</small>
              </button>
            </div>
          </div>

          {/* Volunteer-specific fields */}
          {role === 'volunteer' && (
            <div className="volunteer-fields">
              <div className="input-group">
                <MapPin size={18} className="input-icon" />
                <input
                  id="signup-location"
                  type="text"
                  placeholder="Your city (e.g., Mumbai, Delhi)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="skills-selector">
                <label className="skills-label">Select your skills:</label>
                <div className="skills-grid">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-option ${
                        skills.includes(skill) ? 'skill-selected' : ''
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {role === 'ngo_admin' && (
            <div className="input-group">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Organization city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !role}
          >
            {loading ? (
              <Loader2 size={20} className="spin" />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
