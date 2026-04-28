import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle, Clock, XCircle, UserCircle, Loader2, MapPin, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import MatchCard from '../components/MatchCard';
import SkillTag from '../components/SkillTag';
import {
  getMatchesForVolunteer,
  updateMatchStatus,
  getTask,
} from '../services/firestore';

export default function VolunteerDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);



  const loadMatches = useCallback(async () => {
    if (!user) return;
    try {
      const matchData = await getMatchesForVolunteer(user.uid);
      setMatches(matchData);

      // Load associated tasks
      const taskMap = {};
      for (const match of matchData) {
        if (!taskMap[match.taskId]) {
          const task = await getTask(match.taskId);
          if (task) taskMap[match.taskId] = task;
        }
      }
      setTasks(taskMap);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line
    loadMatches();
  }, [loadMatches]);

  async function handleMatchAction(match, status) {
    try {
      await updateMatchStatus(match.id, status);
      await loadMatches();
    } catch (err) {
      console.error('Failed to update match:', err);
    }
  }

  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const acceptedMatches = matches.filter((m) => m.status === 'accepted');
  const rejectedMatches = matches.filter((m) => m.status === 'rejected');

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Welcome, {userProfile?.name?.split(' ')?.[0] || 'Volunteer'} 👋
            </h1>
            <p className="page-subtitle">
              Your volunteer dashboard — view and manage your task assignments
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/volunteer/profile')}
          >
            <UserCircle size={16} />
            Edit Profile
          </button>
        </div>

        {/* Profile Summary Card */}
        <div className="profile-summary-card">
          <div className="profile-summary-left">
            <div className="profile-avatar-large">
              {userProfile?.name?.charAt(0) || '?'}
            </div>
            <div className="profile-details">
              <h2>{userProfile?.name}</h2>
              <div className="profile-meta">
                <span className="profile-meta-item">
                  <MapPin size={14} />
                  {userProfile?.location || 'Not set'}
                </span>
                <span
                  className={`availability-badge ${
                    userProfile?.availability ? 'available' : 'unavailable'
                  }`}
                >
                  {userProfile?.availability ? (
                    <><CheckCircle size={14} /> Available</>
                  ) : (
                    <><XCircle size={14} /> Unavailable</>
                  )}
                </span>
              </div>
              {userProfile?.skills && (
                <div className="profile-skills">
                  {userProfile.skills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatsCard
            icon={ClipboardList}
            label="Total Assignments"
            value={matches.length}
            color="blue"
            delay={0}
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={pendingMatches.length}
            color="amber"
            delay={100}
          />
          <StatsCard
            icon={CheckCircle}
            label="Accepted"
            value={acceptedMatches.length}
            color="green"
            delay={200}
          />
          <StatsCard
            icon={XCircle}
            label="Declined"
            value={rejectedMatches.length}
            color="red"
            delay={300}
          />
        </div>

        {/* Pending Assignments */}
        {pendingMatches.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                <Zap size={20} />
                Recommended for You
              </h2>
            </div>
            <div className="match-grid">
              {pendingMatches.map((match) => (
                <div key={match.id} className="volunteer-match-item">
                  {tasks[match.taskId] && (
                    <TaskCard task={tasks[match.taskId]} />
                  )}
                  <MatchCard
                    match={match}
                    onAccept={(m) => handleMatchAction(m, 'accepted')}
                    onReject={(m) => handleMatchAction(m, 'rejected')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Tasks */}
        {acceptedMatches.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Your Active Tasks</h2>
            </div>
            <div className="tasks-grid">
              {acceptedMatches.map((match) =>
                tasks[match.taskId] ? (
                  <TaskCard key={match.id} task={tasks[match.taskId]} />
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && matches.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h3>No assignments yet</h3>
            <p>
              You'll see recommended tasks here once an NGO matches you to a
              community need. Make sure your profile and skills are up to date!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/volunteer/profile')}
            >
              <UserCircle size={16} />
              Complete Profile
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <Loader2 size={32} className="spin" />
            <p>Loading your assignments...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
