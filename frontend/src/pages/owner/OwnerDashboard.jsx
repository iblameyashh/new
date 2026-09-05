import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Frontend-only redirect check as UX fallback (Security bounds are on API)
    if (!user || user.role !== 'ADMIN') navigate('/');
    else {
      api.get('/owner/stats/')
         .then(res => setStats(res.data))
         .catch(console.error)
         .finally(() => setLoading(false));
    }
  }, [user, navigate]);

  if (loading) return <div className="text-center py-20 dark:text-white">Loading Owner Console...</div>;

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin / Owner Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Platform overview and management console</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/owner/requirements" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors">
              Manage Requirements
            </Link>
            <Link to="/owner/teachers" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors">
              Manage Teachers
            </Link>
            <Link to="/owner/courses" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors">
              Manage Courses
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Total Students</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total_students ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Total Teachers</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total_teachers ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Active Courses</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total_courses ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Enrollments</h3>
            <p className="text-3xl font-bold text-primary dark:text-blue-400 mt-2">{stats?.total_enrollments ?? 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white p-6 pb-0">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <Link to="/owner/requirements" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Requirements
            </Link>
            <Link to="/owner/teachers/add" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Add Teacher
            </Link>
            <Link to="/owner/courses/add" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Add Course
            </Link>
            <Link to="/owner/students" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Manage Students
            </Link>
            <Link to="/owner/enrollments" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Manage Enrollments
            </Link>
            <Link to="/owner/reviews" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Manage Reviews
            </Link>
            <Link to="/owner/analytics" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Analytics
            </Link>
            <Link to="/owner/settings" className="bg-primary text-white px-6 py-4 rounded-xl text-center font-semibold hover:bg-primary-hover transition-colors block">
              Settings
            </Link>
          </div>
        </div>

        {/* Recent Activity - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 dark:text-white p-6">Recent Activity</h2>
          <div className="p-6">
            <div className="text-gray-500 dark:text-gray-400 text-center py-12">
              Recent activity feed would be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}