import { CheckCircle, XCircle, Brain } from 'lucide-react';

export default function MatchCard({ match, volunteer, onAccept, onReject, showActions = true }) {
  const scoreColor =
    match.score >= 70
      ? 'score-high'
      : match.score >= 40
        ? 'score-medium'
        : 'score-low';

  return (
    <div className="match-card">
      <div className="match-card-top">
        <div className="match-volunteer-info">
          <div className="match-avatar">
            {(volunteer?.name || match.volunteerName || '?').charAt(0)}
          </div>
          <div>
            <h4 className="match-name">
              {volunteer?.name || match.volunteerName}
            </h4>
            <p className="match-location">
              {volunteer?.location || 'Unknown location'}
            </p>
          </div>
        </div>

        <div className={`match-score-circle ${scoreColor}`}>
          <span className="score-value">{match.score}</span>
          <span className="score-label">%</span>
        </div>
      </div>

      {/* Score Breakdown */}
      {match.breakdown && (
        <div className="score-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Skill</span>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill breakdown-skill"
                style={{ width: `${match.breakdown.skill}%` }}
              />
            </div>
            <span className="breakdown-value">{match.breakdown.skill}%</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Location</span>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill breakdown-location"
                style={{ width: `${match.breakdown.location}%` }}
              />
            </div>
            <span className="breakdown-value">{match.breakdown.location}%</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Availability</span>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill breakdown-availability"
                style={{ width: `${match.breakdown.availability}%` }}
              />
            </div>
            <span className="breakdown-value">{match.breakdown.availability}%</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Urgency</span>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill breakdown-urgency"
                style={{ width: `${match.breakdown.urgency}%` }}
              />
            </div>
            <span className="breakdown-value">{match.breakdown.urgency}%</span>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {match.explanation && (
        <div className="match-explanation">
          <div className="explanation-header">
            <Brain size={16} />
            <span>AI Analysis</span>
          </div>
          <p>{match.explanation}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && match.status === 'pending' && (
        <div className="match-actions">
          {onAccept && (
            <button className="btn btn-accept" onClick={() => onAccept(match)}>
              <CheckCircle size={16} />
              Accept
            </button>
          )}
          {onReject && (
            <button className="btn btn-reject" onClick={() => onReject(match)}>
              <XCircle size={16} />
              Decline
            </button>
          )}
        </div>
      )}

      {match.status && match.status !== 'pending' && (
        <div className={`match-status-tag match-status-${match.status}`}>
          {match.status === 'accepted' ? (
            <><CheckCircle size={14} /> Accepted</>
          ) : (
            <><XCircle size={14} /> Declined</>
          )}
        </div>
      )}
    </div>
  );
}
