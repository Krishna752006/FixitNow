import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { api } from '../../services/api';

interface Transaction {
  _id: string;
  finalPrice: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  professional: { firstName: string; lastName: string; email: string };
}

interface FinancialReport {
  totalRevenue: number;
  platformCommission: number;
  professionalPayouts: number;
  totalJobs: number;
}

const FinancialManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchReport();
  }, [page, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/admin/financial/transactions?${params}`);
      if (response.success) {
        setTransactions(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/admin/financial/report?${params}`);
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Financial Management</h2>

      {/* Financial Report */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(report.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-medium">Platform Commission</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(report.platformCommission || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm font-medium">Professional Payouts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(report.professionalPayouts || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
            <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{report.totalJobs || 0}</p>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Transaction Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono font-bold">
                        PAY-{transaction._id.substring(0, 12).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Online Payment
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.user.firstName} {transaction.user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.professional.firstName}{' '}
                        {transaction.professional.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{(transaction.finalPrice || 0).toLocaleString()}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No transactions found</p>
            <p className="text-gray-500 text-sm mt-2">Create jobs and complete them to see transactions here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
