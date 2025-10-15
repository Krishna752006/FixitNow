import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle, Play } from 'lucide-react';

interface JobStatusBadgeProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  className?: string;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
        };
      case 'accepted':
        return {
          label: 'Accepted',
          icon: CheckCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: Play,
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1 transition-colors`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default JobStatusBadge;
