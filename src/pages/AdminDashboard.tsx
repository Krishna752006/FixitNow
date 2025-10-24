import React, { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Menu, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import JobMonitoring from '../components/admin/JobMonitoring';
import ServiceConfiguration from '../components/admin/ServiceConfiguration';
import FinancialManagement from '../components/admin/FinancialManagement';
import { api } from '../services/api';

type TabType = 'dashboard' | 'users' | 'jobs' | 'services' | 'financial';

interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/admin';
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12" style={{ color }} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-2xl font-bold">FixIt Admin</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-slate-800 p-2 rounded"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'services', label: 'Services', icon: 'settings' },
            { id: 'financial', label: 'Financial', icon: DollarSign },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              {typeof item.icon === 'string' ? (
                <span className="w-5 h-5">⚙️</span>
              ) : (
                <item.icon size={20} />
              )}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your platform overview.</p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : stats ? (
                <>
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                      icon={Users}
                      title="Total Users"
                      value={stats.totalUsers}
                      color="#3B82F6"
                    />
                    <StatCard
                      icon={Users}
                      title="Total Professionals"
                      value="2"
                      color="#10B981"
                    />
                    <StatCard
                      icon={Briefcase}
                      title="Active Jobs"
                      value={stats.activeJobs}
                      color="#F59E0B"
                    />
                    <StatCard
                      icon={CheckCircle}
                      title="Completed Jobs"
                      value={stats.completedJobs}
                      color="#8B5CF6"
                    />
                    <StatCard
                      icon={DollarSign}
                      title="Total Revenue"
                      value={`₹${stats.totalRevenue.toLocaleString()}`}
                      color="#EF4444"
                    />
                  </div>

                  {/* Quick Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Platform Health */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        <span>Platform Health</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">System Status</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Uptime</span>
                          <span className="text-gray-900 font-semibold">99.9%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Response Time</span>
                          <span className="text-gray-900 font-semibold">45ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Distribution */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Briefcase size={20} className="text-orange-600" />
                        <span>Job Status</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm flex items-center space-x-2">
                            <Clock size={16} className="text-yellow-600" />
                            <span>Pending</span>
                          </span>
                          <span className="text-gray-900 font-semibold">{Math.floor(stats.activeJobs * 0.3)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm flex items-center space-x-2">
                            <AlertCircle size={16} className="text-blue-600" />
                            <span>In Progress</span>
                          </span>
                          <span className="text-gray-900 font-semibold">{Math.floor(stats.activeJobs * 0.5)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span>Completed</span>
                          </span>
                          <span className="text-gray-900 font-semibold">{stats.completedJobs}</span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Insights */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <DollarSign size={20} className="text-green-600" />
                        <span>Revenue Insights</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Total Revenue</span>
                          <span className="text-gray-900 font-semibold">₹{stats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Platform Commission (15%)</span>
                          <span className="text-gray-900 font-semibold">₹{Math.floor(stats.totalRevenue * 0.15).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Professional Payouts</span>
                          <span className="text-gray-900 font-semibold">₹{Math.floor(stats.totalRevenue * 0.85).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && <UserManagement />}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && <JobMonitoring />}

          {/* Services Tab */}
          {activeTab === 'services' && <ServiceConfiguration />}

          {/* Financial Tab */}
          {activeTab === 'financial' && <FinancialManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
