import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Users, X, Loader2, MapPin, Brain, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import MatchCard from '../components/MatchCard';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getVolunteers,
  saveMatches,
  getMatchesForTask,
  updateMatchStatus,
} from '../services/firestore';
import { findTopMatches } from '../services/matching';
import { explainMatch, summarizeTask, suggestPriority, isGeminiAvailable } from '../services/gemini';

const AVAILABLE_SKILLS = [
  'teaching', 'first-aid', 'counseling', 'construction', 'driving',
  'logistics', 'medical', 'nursing', 'tech', 'data-entry',
  'communication', 'cooking', 'event-planning',
];

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formUrgency, setFormUrgency] = useState('medium');
  const [formSkills, setFormSkills] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Matching state
  const [matchingTaskId, setMatchingTaskId] = useState(null);
  const [matchResults, setMatchResults] = useState({});
  const [matchLoading, setMatchLoading] = useState(null);

  // AI state
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormLocation('');
    setFormUrgency('medium');
    setFormSkills([]);
    setEditingTask(null);
    setAiSummary('');
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(task) {
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormLocation(task.location);
    setFormUrgency(task.urgency);
    setFormSkills(task.requiredSkills || []);
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);

    const taskData = {
      title: formTitle,
      description: formDescription,
      location: formLocation,
      urgency: formUrgency,
      requiredSkills: formSkills,
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowForm(false);
      resetForm();
      await loadTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  async function handleFindVolunteers(task) {
    setMatchLoading(task.id);
    setMatchingTaskId(task.id);

    try {
      const volunteers = await getVolunteers();
      let matches = findTopMatches(volunteers, task, 3);

      // Enhance with Gemini AI explanations
      if (isGeminiAvailable()) {
        const enhancedMatches = await Promise.all(
          matches.map(async (m) => {
            const aiExplanation = await explainMatch(task, m.volunteer, m.score);
            return {
              ...m,
              explanation: aiExplanation || m.explanation,
            };
          })
        );
        matches = enhancedMatches;
      }

      // Save matches to Firestore
      await saveMatches(task.id, matches);

      // Update task status
      await updateTask(task.id, { status: 'matched' });

      setMatchResults((prev) => ({ ...prev, [task.id]: matches }));
      await loadTasks();
    } catch (err) {
      console.error('Failed to find volunteers:', err);
    } finally {
      setMatchLoading(null);
    }
  }

  async function handleViewMatches(task) {
    setMatchingTaskId(task.id);
    if (!matchResults[task.id]) {
      setMatchLoading(task.id);
      try {
        const matches = await getMatchesForTask(task.id);
        setMatchResults((prev) => ({ ...prev, [task.id]: matches }));
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setMatchLoading(null);
      }
    }
  }

  async function handleMatchAction(match, status) {
    try {
      await updateMatchStatus(match.id, status);
      // Refresh matches
      const matches = await getMatchesForTask(matchingTaskId);
      setMatchResults((prev) => ({ ...prev, [matchingTaskId]: matches }));
    } catch (err) {
      console.error('Failed to update match:', err);
    }
  }

  async function handleAISummarize() {
    if (!formDescription) return;
    setAiLoading(true);
    try {
      const summary = await summarizeTask(formDescription);
      if (summary) setAiSummary(summary);

      const priority = await suggestPriority(formTitle, formDescription);
      if (priority) setFormUrgency(priority);
    } catch (err) {
      console.error('AI summarize failed:', err);
    } finally {
      setAiLoading(false);
    }
  }

  const toggleSkill = (skill) => {
    setFormSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterUrgency === 'all' || task.urgency === filterUrgency;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Task Manager</h1>
            <p className="page-subtitle">
              Create, manage, and match volunteers to community tasks
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="toolbar">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-bar">
            <Filter size={16} />
            {['all', 'high', 'medium', 'low'].map((u) => (
              <button
                key={u}
                className={`filter-chip ${filterUrgency === u ? 'filter-active' : ''}`}
                onClick={() => setFilterUrgency(u)}
              >
                {u === 'all' ? 'All' : u.charAt(0).toUpperCase() + u.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spin" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No tasks found</h3>
            <p>Create a new task or adjust your filters.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                actions={
                  <div className="card-actions">
                    {task.status === 'open' && (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFindVolunteers(task);
                        }}
                        disabled={matchLoading === task.id}
                      >
                        {matchLoading === task.id ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <Users size={14} />
                        )}
                        Find Volunteers
                      </button>
                    )}
                    {task.status === 'matched' && (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMatches(task);
                        }}
                      >
                        <Users size={14} />
                        View Matches
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(task);
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {/* Match Results Modal */}
        {matchingTaskId && matchResults[matchingTaskId] && (
          <div className="modal-overlay" onClick={() => setMatchingTaskId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <Users size={20} />
                  Matched Volunteers
                </h2>
                <button
                  className="btn btn-ghost"
                  onClick={() => setMatchingTaskId(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {matchResults[matchingTaskId].length === 0 ? (
                  <div className="empty-state">
                    <Users size={40} />
                    <p>No volunteers available for matching.</p>
                  </div>
                ) : (
                  <div className="match-list">
                    {matchResults[matchingTaskId].map((match, idx) => (
                      <MatchCard
                        key={match.id || idx}
                        match={match}
                        volunteer={match.volunteer}
                        onAccept={(m) => handleMatchAction(m, 'accepted')}
                        onReject={(m) => handleMatchAction(m, 'rejected')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Task Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div
              className="modal modal-form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Flood Relief Coordination"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the community need..."
                    rows={4}
                    required
                  />
                  {isGeminiAvailable() && formDescription.length > 20 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm ai-btn"
                      onClick={handleAISummarize}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <Loader2 size={14} className="spin" />
                      ) : (
                        <Zap size={14} />
                      )}
                      AI Summarize & Prioritize
                    </button>
                  )}
                  {aiSummary && (
                    <div className="ai-summary">
                      <Brain size={14} />
                      <p>{aiSummary}</p>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-with-icon">
                      <MapPin size={16} />
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g., Mumbai"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Urgency</label>
                    <select
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Skills</label>
                  <div className="skills-grid">
                    {AVAILABLE_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        className={`skill-option ${
                          formSkills.includes(skill) ? 'skill-selected' : ''
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <Loader2 size={16} className="spin" />
                    ) : editingTask ? (
                      'Update Task'
                    ) : (
                      'Create Task'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
