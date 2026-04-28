import { MapPin, Clock } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';
import SkillTag from './SkillTag';

export default function TaskCard({ task, onClick, actions }) {
  const statusColors = {
    open: 'status-open',
    'in-progress': 'status-progress',
    matched: 'status-matched',
    completed: 'status-completed',
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <div className="task-title-row">
          <h3 className="task-title">{task.title}</h3>
          <UrgencyBadge urgency={task.urgency} />
        </div>
        <span className={`status-badge ${statusColors[task.status] || 'status-open'}`}>
          {task.status}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <div className="meta-item">
          <MapPin size={14} />
          <span>{task.location}</span>
        </div>
        <div className="meta-item">
          <Clock size={14} />
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {task.requiredSkills && task.requiredSkills.length > 0 && (
        <div className="task-skills">
          {task.requiredSkills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      )}

      {actions && <div className="task-actions">{actions}</div>}
    </div>
  );
}
