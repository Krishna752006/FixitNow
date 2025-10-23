import React, { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { api } from '../../services/api';

interface AuditEntry {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  changes: Record<string, any>;
  timestamp: string;
}

const AuditLog: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchAuditLog();
  }, [page, actionFilter]);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (actionFilter) params.append('action', actionFilter);

      const response = await api.get(`/admin/audit-log?${params}`);
      if (response.success) {
        setAuditLog(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'verify':
        return 'bg-purple-100 text-purple-800';
      case 'suspend':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Audit Log</h2>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Download size={20} />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="verify">Verify</option>
            <option value="suspend">Suspend</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : auditLog.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No audit log entries found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Target Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Target ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLog.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {entry.adminName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(
                            entry.action
                          )}`}
                        >
                          {entry.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {entry.targetType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {entry.targetId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
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

export default AuditLog;
