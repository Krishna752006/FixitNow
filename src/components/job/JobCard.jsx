import { format } from 'date-fns';
import { Clock, MapPin, DollarSign } from 'lucide-react';
import JobStatusBadge from './JobStatusBadge';

export default function JobCard({ job, onClick }) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">
            {job.title || `${job.category} Service`}
          </h3>
          <JobStatusBadge status={job.status} />
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span>
            {format(new Date(job.scheduledDate), 'MMM d, yyyy')} at {job.scheduledTime}
          </span>
        </div>
        
        {job.location?.address && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span className="truncate">{job.location.address}</span>
          </div>
        )}
        
        {job.price && (
          <div className="mt-2 flex items-center text-sm font-medium text-gray-900">
            <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>₹{job.price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
