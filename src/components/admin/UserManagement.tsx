import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [search, userType, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (userType) params.append('userType', userType);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      console.log('📥 Fetching users with params:', params.toString());
      const response = await api.get(`/admin/users?${params}`);
      console.log('✅ Users response:', response);
      
      if (response.success) {
        console.log('📊 Users fetched:', response.data.length, 'Total:', response.pagination.total);
        console.log('👥 User types:', response.data.map((u: User) => u.userType));
        setUsers(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        console.error('❌ API returned success: false');
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (userId: string, isVerified: boolean) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/verify`, {
        isVerified: !isVerified,
      });
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/suspend`);
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/reactivate`);
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">User Management</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="user">Customer</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No users found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.userType === 'professional'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.userType === 'professional' ? 'Professional' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleVerifyToggle(user._id, user.isVerified)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-3">
                          {user.isActive ? (
                            <button
                              onClick={() => handleSuspend(user._id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(user._id)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
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

export default UserManagement;
