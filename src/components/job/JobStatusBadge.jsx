import { Clock, CheckCircle, XCircle, Wrench, CheckCheck } from 'lucide-react';

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  accepted: <CheckCircle className="w-4 h-4" />,
  in_progress: <Wrench className="w-4 h-4" />,
  completed: <CheckCheck className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function JobStatusBadge({ status, className = '' }) {
  const statusText = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800'} ${className}`}
    >
      {statusIcons[status] || statusIcons.pending}
      <span className="ml-1">{statusText}</span>
    </span>
  );
}
