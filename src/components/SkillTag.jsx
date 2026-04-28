const SKILL_COLORS = {
  teaching: 'skill-purple',
  'first-aid': 'skill-red',
  counseling: 'skill-pink',
  construction: 'skill-orange',
  driving: 'skill-yellow',
  logistics: 'skill-amber',
  medical: 'skill-rose',
  nursing: 'skill-rose',
  tech: 'skill-blue',
  'data-entry': 'skill-indigo',
  communication: 'skill-cyan',
  cooking: 'skill-green',
  'event-planning': 'skill-teal',
};

export default function SkillTag({ skill, removable = false, onRemove }) {
  const colorClass = SKILL_COLORS[skill?.toLowerCase?.()] || 'skill-default';

  return (
    <span className={`skill-tag ${colorClass}`}>
      {skill}
      {removable && (
        <button
          className="skill-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(skill);
          }}
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
