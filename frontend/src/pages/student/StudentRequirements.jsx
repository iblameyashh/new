import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const statusIcons = {
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <CheckCircle className="w-4 h-4" />,
  ACTIVE: <CheckCircle2 className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
  CANCELLED: <AlertCircle className="w-4 h-4" />,
};

export default function StudentRequirements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequirements = async () => {
      if (!user || user.role !== 'STUDENT') {
        navigate('/');
        return;
      }
      try {
        const res = await api.get('/requirements/');
        setRequirements(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load requirements');
      } finally {
        setLoading(false);
      }
    };
    loadRequirements();
  }, [user, navigate]);

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user || user.role !== 'STUDENT') {
    return <div className="min-h-[85vh] flex items-center justify-center">Please log in as a student</div>;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Learning Requirements</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your subject learning requests</p>
          </div>
          <Link
            to="/student/requirements/new"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Requirement</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {requirements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No requirements yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Submit your first learning requirement to get matched with a teacher</p>
            <Link
              to="/student/requirements/new"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Requirement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {req.subject?.name || 'Unknown Subject'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[req.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusIcons[req.status]} {req.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{req.requirement_text}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Class: {req.class_level?.name || 'N/A'}</span>
                        {req.assigned_teacher && (
                          <span>Teacher: {req.assigned_teacher.user?.first_name} {req.assigned_teacher.user?.last_name}</span>
                        )}
                        <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {req.status === 'ACTIVE' || req.status === 'APPROVED' ? (
                        <button
                          onClick={() => navigate(`/messages?requirementId=${req.id}`)}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Open Chat</span>
                        </button>
                      ) : req.status === 'PENDING' ? (
                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium flex items-center">
                          Waiting for admin approval
                        </span>
                      ) : req.status === 'REJECTED' ? (
                        <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md font-medium">
                          Request rejected
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium">
                          {req.status}
                        </span>
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
  );
}