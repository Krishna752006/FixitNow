import React, { useState, useEffect } from 'react';
import { Filter, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  finalPrice: number;
  userId: { firstName: string; lastName: string; email: string; phone: string };
  professionalId: { firstName: string; lastName: string; email: string; phone: string };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  createdAt: string;
  completedAt?: string;
}

const JobMonitoring: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [status, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/admin/jobs?${params}`);
      if (response.success) {
        setJobs(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-gray-600';
      case 'medium':
        return 'text-blue-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Job Monitoring</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No jobs found</p>
          </div>
        ) : (
          <>
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Job Summary Row */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title || job.category}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs font-medium">CUSTOMER</p>
                          <p className="text-gray-900 font-medium">
                            {job.userId.firstName} {job.userId.lastName}
                          </p>
                          <p className="text-gray-600 text-xs">{job.userId.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">PROFESSIONAL</p>
                          <p className="text-gray-900 font-medium">
                            {job.professionalId
                              ? `${job.professionalId.firstName} ${job.professionalId.lastName}`
                              : 'Unassigned'}
                          </p>
                          {job.professionalId && (
                            <p className="text-gray-600 text-xs">{job.professionalId.email}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">LOCATION</p>
                          <p className="text-gray-900 font-medium">{job.location.city}</p>
                          <p className="text-gray-600 text-xs">{job.location.state}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">PRICE</p>
                          <p className="text-gray-900 font-bold text-lg">₹{(job.finalPrice || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedJobId === job._id ? (
                        <ChevronUp className="text-gray-400" />
                      ) : (
                        <ChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedJobId === job._id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Job Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Job Details</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium">Job ID</p>
                            <p className="text-gray-900 font-mono">{job._id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Category</p>
                            <p className="text-gray-900">{job.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Scheduled Date & Time</p>
                            <p className="text-gray-900">
                              {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Estimated Duration</p>
                            <p className="text-gray-900">{job.estimatedDuration} hours</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Created</p>
                            <p className="text-gray-900">{new Date(job.createdAt).toLocaleString()}</p>
                          </div>
                          {job.completedAt && (
                            <div>
                              <p className="text-gray-500 font-medium">Completed</p>
                              <p className="text-gray-900">{new Date(job.completedAt).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location & Contact */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Location & Contact</h4>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium mb-2">Job Location</p>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-900 font-medium">{job.location.address}</p>
                              <p className="text-gray-600">
                                {job.location.city}, {job.location.state} {job.location.zipCode}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium mb-2">Customer Contact</p>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-900 font-medium">
                                {job.userId.firstName} {job.userId.lastName}
                              </p>
                              <p className="text-gray-600">{job.userId.email}</p>
                              <p className="text-gray-600">{job.userId.phone}</p>
                            </div>
                          </div>
                          {job.professionalId && (
                            <div>
                              <p className="text-gray-500 font-medium mb-2">Professional Contact</p>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-gray-900 font-medium">
                                  {job.professionalId.firstName} {job.professionalId.lastName}
                                </p>
                                <p className="text-gray-600">{job.professionalId.email}</p>
                                <p className="text-gray-600">{job.professionalId.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} jobs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobMonitoring;
