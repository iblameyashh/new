import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { MessageSquare, BookOpen, Users } from 'lucide-react';

const statusStyles = {
  ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const getFullName = (user) => {
  if (!user) return 'N/A';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.username || 'N/A';
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssignedStudents = async () => {
      if (!user || user.role !== 'TEACHER') {
        navigate('/');
        return;
      }
      try {
        const res = await api.get('/requirements/');
        setRequirements(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load assigned students');
      } finally {
        setLoading(false);
      }
    };
    loadAssignedStudents();
  }, [user, navigate]);

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user || user.role !== 'TEACHER') {
    navigate('/');
    return null;
  }

  const activeRequirements = requirements.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED');

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your assigned students and subjects</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Welcome, {getFullName(user)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Experience: {user.teacher_profile?.experience} Years</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeRequirements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {[...new Set(activeRequirements.map(r => r.subject?.name).filter(Boolean))].length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeRequirements.filter(r => r.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Assigned Students ({activeRequirements.length})
            </h2>
          </div>

          {activeRequirements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No assigned students yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Students will appear here when an admin assigns them to you for a subject requirement.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeRequirements.map((req) => (
                <div key={req.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                        {req.student.user?.first_name?.charAt(0) || req.student.user?.username?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getFullName(req.student.user)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {req.student.student_id} • Class: {req.class_level?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:ml-auto">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary dark:text-blue-400 text-sm">
                          {req.subject?.name}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[req.status] || 'bg-gray-100 text-gray-800'}`}>
                        {req.status}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Goal: {req.requirement_text.substring(0, 50)}{req.requirement_text.length > 50 ? '...' : ''}
                      </p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/teacher/student/${req.student.id}?requirementId=${req.id}`)}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors text-sm"
                        >
                          View Student
                        </button>
                        {req.status === 'ACTIVE' && (
                          <button
                            onClick={() => navigate(`/messages?requirementId=${req.id}`)}
                            className="px-4 py-2 bg-gray-900 border hover:bg-gray-800 text-white rounded-md font-semibold transition-colors text-sm flex items-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Chat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}