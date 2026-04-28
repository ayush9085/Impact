import { useEffect, useRef, useState } from 'react';

export default function StatsCard({ icon: Icon, label, value, color = 'blue', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;

    const timer = setTimeout(() => {
      animated.current = true;
      let start = 0;
      const end = parseInt(value) || 0;
      if (end === 0) {
        setDisplayValue(0);
        return;
      }

      const duration = 1000;
      const increment = end / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`stats-card stats-card-${color}`} ref={cardRef}>
      <div className="stats-icon-wrapper">
        <Icon size={24} />
      </div>
      <div className="stats-info">
        <span className="stats-value">{displayValue}</span>
        <span className="stats-label">{label}</span>
      </div>
    </div>
  );
}
