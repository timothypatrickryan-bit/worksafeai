import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

export default function HazardSeverityBadge({ severity }) {
  const severityConfig = {
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: AlertTriangle,
      label: 'Low Risk',
    },
    medium: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: AlertCircle,
      label: 'Medium Risk',
    },
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: AlertOctagon,
      label: 'High Risk',
    },
    critical: {
      bg: 'bg-red-200',
      text: 'text-red-900',
      border: 'border-red-400',
      icon: AlertOctagon,
      label: 'Critical',
    },
  };

  const config = severityConfig[severity?.toLowerCase()] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} text-sm font-medium`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}
