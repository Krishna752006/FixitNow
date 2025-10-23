import { CheckCircle2, Clock, Wrench, Package, Home } from 'lucide-react';
import { format } from 'date-fns';

const trackingSteps = [
  {
    id: 1,
    status: 'pending',
    label: 'Order Placed',
    description: 'Job request created',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-300',
    arrowColor: 'text-green-400'
  },
  {
    id: 2,
    status: 'accepted',
    label: 'Accepted',
    description: 'Professional accepted',
    icon: Clock,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-300',
    arrowColor: 'text-blue-400'
  },
  {
    id: 3,
    status: 'in_progress',
    label: 'In Progress',
    description: 'Work in progress',
    icon: Wrench,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-300',
    arrowColor: 'text-purple-400'
  },
  {
    id: 4,
    status: 'completed',
    label: 'Completed',
    description: 'Job completed',
    icon: Home,
    color: 'bg-indigo-100 text-indigo-600',
    borderColor: 'border-indigo-300',
    arrowColor: 'text-indigo-400'
  }
];

export default function JobTrackingTimeline({ currentStatus, statusHistory = [] }) {
  // Determine the current step index
  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'accepted', 'in_progress', 'completed'];
    return statusOrder.indexOf(currentStatus) + 1;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Get the timestamp for a specific status
  const getStatusTimestamp = (status) => {
    const statusEntry = statusHistory.find(entry => entry.status === status);
    return statusEntry?.changedAt;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-bold text-gray-900 mb-8">Job Tracking</h3>
      
      <div className="flex items-center justify-between relative">
        {/* Connection lines */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-500"
            style={{ width: `${((currentStepIndex - 1) / 3) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between w-full relative z-10">
          {trackingSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex - 1;
            const Icon = step.icon;
            const timestamp = getStatusTimestamp(step.status);

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center mb-4">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      isCompleted || isCurrent
                        ? `${step.color} ${step.borderColor} shadow-lg`
                        : 'bg-gray-100 text-gray-400 border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold">
                        {String(step.id).padStart(2, '0')}
                      </span>
                      <Icon className="w-6 h-6 mt-1" />
                    </div>
                  </div>

                  {/* Arrow between steps */}
                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`absolute top-12 -right-12 text-4xl transition-colors duration-300 ${
                        isCompleted ? step.arrowColor : 'text-gray-300'
                      }`}
                      style={{ transform: 'translateX(50%)' }}
                    >
                      ➜
                    </div>
                  )}
                </div>

                {/* Step Label and Description */}
                <div className="text-center mt-4">
                  <h4
                    className={`font-bold text-sm transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p
                    className={`text-xs transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Timestamp */}
                  {timestamp && (
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(timestamp), 'MMM d, yyyy')}
                    </p>
                  )}

                  {/* Status indicator */}
                  {isCurrent && (
                    <div className="mt-2 flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-blue-600">In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Details */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trackingSteps.map((step) => {
            const timestamp = getStatusTimestamp(step.status);
            const isCompleted = trackingSteps.indexOf(step) < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg text-center transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-gray-50 border border-gray-200 opacity-50'
                }`}
              >
                <p className="text-xs font-medium text-gray-600">{step.label}</p>
                {timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(timestamp), 'MMM d, HH:mm')}
                  </p>
                )}
                {!timestamp && !isCompleted && (
                  <p className="text-xs text-gray-400 mt-1">Pending</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
