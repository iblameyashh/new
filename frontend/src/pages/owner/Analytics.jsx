import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export default function OwnerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      // Redirect handled by parent route
      return;
    }

    const loadAnalytics = async () => {
      try {
        const res = await api.get(`/owner/analytics/?range=${timeRange}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, timeRange]);

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading analytics...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null; // Redirect handled by parent route
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {!analytics ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No analytics data available.</p>
          </div>
        ) : (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary dark:text-blue-400 mt-2">
                  ${analytics?.total_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {analytics?.revenue_change?.toFixed(1) || 0}% vs previous period
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Active Students</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {analytics?.active_students || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {analytics?.student_change?.toFixed(1) || 0}% vs previous period
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Course Completion Rate</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {analytics?.completion_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {analytics?.completion_change?.toFixed(1) || 0}% vs previous period
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Teacher Satisfaction</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {analytics?.teacher_satisfaction?.toFixed(1) || 0}/5
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {analytics?.satisfaction_change?.toFixed(1) || 0} vs previous period
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Student Growth Trend</h3>
                <div className="h-48">
                  {/* Chart would go here - placeholder */}
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Student growth chart
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Popularity</h3>
                <div className="h-48">
                  {/* Chart would go here - placeholder */}
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Course popularity chart
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-4">
                {analytics?.recent_activities?.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 py-3 border-b dark:border-gray-700 last:border-b-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {activity.icon || '•'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
                  )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}