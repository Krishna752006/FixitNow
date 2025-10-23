import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

interface AnalyticsData {
  avgCompletionTime: number;
  acceptanceRate: number;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/data');
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Business Intelligence</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Average Job Completion Time
                </h3>
                <BarChart3 className="text-blue-600" size={28} />
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {formatTime(analytics.avgCompletionTime)}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Average time from job creation to completion
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Professional Acceptance Rate
                </h3>
                <TrendingUp className="text-green-600" size={28} />
              </div>
              <p className="text-4xl font-bold text-green-600">
                {analytics.acceptanceRate.toFixed(2)}%
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Percentage of jobs accepted by professionals
              </p>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Job Completion Rate</span>
                  <span className="text-gray-900 font-bold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Customer Satisfaction</span>
                  <span className="text-gray-900 font-bold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '92%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Professional Retention</span>
                  <span className="text-gray-900 font-bold">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: '78%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Geospatial Analytics Placeholder */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Geospatial Analytics - Job Heatmap
            </h3>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-2">🗺️ Interactive Heatmap</p>
                <p className="text-gray-500 text-sm">
                  Heatmap visualization showing job request frequency by location
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Analytics;
