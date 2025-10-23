import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, Wrench, CheckCheck } from 'lucide-react';

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  accepted: <CheckCircle className="w-5 h-5 text-blue-500" />,
  in_progress: <Wrench className="w-5 h-5 text-indigo-500" />,
  completed: <CheckCheck className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StatusTimeline({ statusHistory }) {
  if (!statusHistory?.length) return null;

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {[...statusHistory].reverse().map((statusUpdate, index) => (
          <li key={index} className="relative pb-8">
            {index !== statusHistory.length - 1 && (
              <span 
                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" 
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-start space-x-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                  {statusIcons[statusUpdate.status] || statusIcons.pending}
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 font-medium">
                    {statusLabels[statusUpdate.status] || statusUpdate.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(statusUpdate.changedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {statusUpdate.notes && (
                  <p className="text-sm text-gray-500 mt-1">{statusUpdate.notes}</p>
                )}
                {statusUpdate.changedBy && (
                  <p className="text-xs text-gray-400 mt-1">
                    Updated by: {statusUpdate.changedByModel} 
                    {statusUpdate.changedBy.name ? `(${statusUpdate.changedBy.name})` : ''}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
