import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function MitigationStatusBadge({ status }) {
  const statusConfig = {
    accepted: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Accepted',
    },
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      icon: Clock,
      label: 'Pending Review',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}
