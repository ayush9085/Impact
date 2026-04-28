import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function UrgencyBadge({ urgency }) {
  const config = {
    high: { icon: AlertTriangle, label: 'High', className: 'urgency-high' },
    medium: { icon: AlertCircle, label: 'Medium', className: 'urgency-medium' },
    low: { icon: Info, label: 'Low', className: 'urgency-low' },
  };

  const { icon: Icon, label, className } = config[urgency] || config.low;

  return (
    <span className={`urgency-badge ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}
