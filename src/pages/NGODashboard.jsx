import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Users, CheckCircle, AlertTriangle, Plus, Database, Zap, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import { getTasks, getVolunteers } from '../services/firestore';
import { seedDemoData } from '../services/seedData';
import { isGeminiAvailable } from '../services/gemini';

export default function NGODashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const loadData = async () => {
    try {
      const [fetchedTasks, volunteers] = await Promise.all([
        getTasks(),
        getVolunteers(),
      ]);
      setTasks(fetchedTasks);
      setVolunteerCount(volunteers.length);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  }, []);

  async function handleSeedData() {
    setSeeding(true);
    try {
      const result = await seedDemoData();
      setSeedResult(result);
      await loadData();
    } catch (err) {
      console.error('Failed to seed data:', err);
    } finally {
      setSeeding(false);
    }
  }

  const openTasks = tasks.filter((t) => t.status === 'open').length;
  const matchedTasks = tasks.filter((t) => t.status === 'matched').length;

  return (
    <Layout>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Welcome back, {userProfile?.name?.split(' ')?.[0] || 'Admin'} 👋
            </h1>
            <p className="page-subtitle">
              Here's an overview of your volunteer coordination
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleSeedData}
              disabled={seeding}
            >
              {seeding ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Database size={16} />
              )}
              Seed Demo Data
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/tasks')}
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Seed result notification */}
        {seedResult && (
          <div className="notification notification-success">
            <CheckCircle size={16} />
            Seeded {seedResult.volunteers} volunteers and {seedResult.tasks} tasks
            {seedResult.volunteers === 0 && seedResult.tasks === 0 && <span> (data already exists)</span>}
          </div>
        )}

        <div className={`ai-banner ${isGeminiAvailable() ? 'ai-active' : 'ai-inactive'}`}>
          <Zap size={16} />
          <span>
            {isGeminiAvailable()
              ? 'Gemini AI is active — intelligent matching explanations and task insights enabled'
              : 'Gemini AI inactive — add VITE_GEMINI_API_KEY to .env to enable AI features'}
          </span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatsCard
            icon={ClipboardList}
            label="Total Tasks"
            value={tasks.length}
            color="blue"
            delay={0}
          />
          <StatsCard
            icon={AlertTriangle}
            label="Open Tasks"
            value={openTasks}
            color="amber"
            delay={100}
          />
          <StatsCard
            icon={Users}
            label="Volunteers"
            value={volunteerCount}
            color="purple"
            delay={200}
          />
          <StatsCard
            icon={CheckCircle}
            label="Matched"
            value={matchedTasks}
            color="green"
            delay={300}
          />
        </div>

        {/* Recent Tasks */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/tasks')}
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spin" />
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>No tasks yet</h3>
              <p>Create your first task or seed demo data to get started.</p>
              <div className="empty-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus size={16} />
                  Create Task
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSeedData}
                >
                  <Database size={16} />
                  Load Demo Data
                </button>
              </div>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.slice(0, 6).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => navigate('/tasks')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
