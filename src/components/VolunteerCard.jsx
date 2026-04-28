import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import SkillTag from './SkillTag';

export default function VolunteerCard({ volunteer, compact = false }) {
  return (
    <div className={`volunteer-card ${compact ? 'volunteer-card-compact' : ''}`}>
      <div className="volunteer-header">
        <div className="volunteer-avatar">
          {volunteer.name?.charAt(0) || '?'}
        </div>
        <div className="volunteer-info">
          <h4 className="volunteer-name">{volunteer.name}</h4>
          <div className="volunteer-location">
            <MapPin size={14} />
            <span>{volunteer.location || 'Unknown'}</span>
          </div>
        </div>
        <div
          className={`availability-badge ${
            volunteer.availability ? 'available' : 'unavailable'
          }`}
        >
          {volunteer.availability ? (
            <>
              <CheckCircle size={14} /> Available
            </>
          ) : (
            <>
              <XCircle size={14} /> Unavailable
            </>
          )}
        </div>
      </div>

      {!compact && volunteer.skills && volunteer.skills.length > 0 && (
        <div className="volunteer-skills">
          {volunteer.skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
