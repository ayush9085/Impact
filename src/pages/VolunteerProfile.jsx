import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/firestore';
import {
  User,
  MapPin,
  Save,
  Loader2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Layout from '../components/Layout';

const AVAILABLE_SKILLS = [
  'teaching', 'first-aid', 'counseling', 'construction', 'driving',
  'logistics', 'medical', 'nursing', 'tech', 'data-entry',
  'communication', 'cooking', 'event-planning',
];

export default function VolunteerProfile() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [skills, setSkills] = useState(userProfile?.skills || []);
  const [availability, setAvailability] = useState(
    userProfile?.availability ?? true
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await updateUser(user.uid, {
        name,
        location,
        skills,
        availability,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">
              Keep your profile updated for better task matching
            </p>
          </div>
        </div>

        <div className="profile-form-card">
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
              />
            </div>

            <div className="form-group">
              <label>Availability</label>
              <button
                type="button"
                className={`toggle-btn ${availability ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setAvailability(!availability)}
              >
                {availability ? (
                  <>
                    <ToggleRight size={24} />
                    <span>Available for tasks</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} />
                    <span>Not available right now</span>
                  </>
                )}
              </button>
            </div>

            <div className="form-group">
              <label>Skills</label>
              <p className="form-help">
                Select the skills you can contribute to community tasks
              </p>
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

            <div className="form-actions">
              {saved && (
                <div className="save-success">
                  <CheckCircle size={16} />
                  Profile updated successfully!
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
