import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { ArrowLeft, CheckCircle, XCircle, PauseCircle, User, Calendar, Clock, AlertCircle, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

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

const ACTION_OPTIONS = [
  { value: 'approve', label: 'Approve & Assign', color: 'bg-green-600 hover:bg-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'reject', label: 'Reject', color: 'bg-red-600 hover:bg-red-700', icon: <XCircle className="w-4 h-4" /> },
  { value: 'reassign', label: 'Reassign Teacher', color: 'bg-blue-600 hover:bg-blue-700', icon: <RefreshCw className="w-4 h-4" /> },
  { value: 'suspend', label: 'Suspend Relationship', color: 'bg-orange-600 hover:bg-orange-700', icon: <PauseCircle className="w-4 h-4" /> },
  { value: 'close', label: 'Close Requirement', color: 'bg-gray-600 hover:bg-gray-700', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export default function OwnerRequirementDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadRequirement = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/owner/requirements/${id}/`);
      setRequirement(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load requirement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTeachers = useCallback(async () => {
    try {
      const res = await api.get(`/owner/requirements/${id}/matching_teachers/`);
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadRequirement();
    loadTeachers();
  }, [user, navigate, loadRequirement, loadTeachers]);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!selectedAction) {
      setError('Please select an action');
      return;
    }

    if (['approve', 'reassign'].includes(selectedAction) && !selectedTeacherId) {
      setError('Please select a teacher');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/owner/requirements/${id}/approve/`, {
        teacher_id: parseInt(selectedTeacherId) || undefined,
        action: selectedAction,
      });
      setSuccess(`Requirement ${selectedAction}d successfully!`);
      loadRequirement();
      loadTeachers();
      setSelectedAction('');
      setSelectedTeacherId('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || `Failed to ${selectedAction} requirement`);
    } finally {
      setActionLoading(false);
    }
  };

  const getFullName = (userObj) => {
    if (!userObj) return 'N/A';
    const parts = [userObj.first_name, userObj.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : userObj.username || 'N/A';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!requirement) {
    return <div className="min-h-[85vh] flex items-center justify-center">Requirement not found</div>;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/owner/requirements')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Requirement Details</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage this student's learning requirement</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student & Requirement Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Student Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getFullName(requirement.student.user)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{requirement.student.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{requirement.student.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{requirement.student.user?.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class Level</p>
                  <p className="font-medium text-gray-900 dark:text-white">{requirement.class_level?.name}</p>
                </div>
                <div className="col-span-2">
                  <Link
                    to={`/owner/students/${requirement.student.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Requirement Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Requirement Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                  <p className="font-medium text-gray-900 dark:text-white text-lg">{requirement.subject?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Requirement</p>
                  <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{requirement.requirement_text}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[requirement.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusIcons[requirement.status]}
                      <span className="ml-1">{requirement.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(requirement.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(requirement.updated_at)}</p>
                  </div>
                </div>
                {requirement.approved_by && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Approved By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{getFullName(requirement.approved_by)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(requirement.approved_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Assignment */}
            {requirement.assigned_teacher && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-primary">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Currently Assigned Teacher
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {requirement.assigned_teacher.user?.first_name?.charAt(0) || 'T'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {getFullName(requirement.assigned_teacher.user)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {requirement.assigned_teacher.qualification} • {requirement.assigned_teacher.experience} years experience
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Assigned on {formatDate(requirement.approved_at)}
                    </p>
                  </div>
                  {requirement.status === 'ACTIVE' && (
                    <Link
                      to={`/messages?requirementId=${requirement.id}`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
                    >
                      View Conversation
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Actions</h2>

              <div className="space-y-3">
                {ACTION_OPTIONS.map((action) => {
                  const isDisabled = 
                    (action.value === 'approve' && requirement.status !== 'PENDING') ||
                    (action.value === 'reject' && requirement.status !== 'PENDING') ||
                    (action.value === 'reassign' && requirement.status !== 'ACTIVE' && requirement.status !== 'APPROVED') ||
                    (action.value === 'suspend' && requirement.status !== 'ACTIVE' && requirement.status !== 'APPROVED') ||
                    (action.value === 'close' && requirement.status !== 'ACTIVE');

                  return (
                    <button
                      key={action.value}
                      onClick={() => {
                        setSelectedAction(action.value);
                        if (!['approve', 'reassign'].includes(action.value)) {
                          setSelectedTeacherId('');
                        }
                      }}
                      disabled={isDisabled || actionLoading}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                        isDisabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : selectedAction === action.value 
                            ? `${action.color} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`
                            : action.color
                      }`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {['approve', 'reassign'].includes(selectedAction) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Select Teacher</h3>
                  {teachers.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No active teachers found</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {teachers.map((teacher) => (
                        <label
                          key={teacher.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedTeacherId === String(teacher.id)
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="teacher"
                            value={teacher.id}
                            checked={selectedTeacherId === String(teacher.id)}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {teacher.user?.first_name?.charAt(0) || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {getFullName(teacher.user)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {teacher.qualification} • {teacher.experience} yrs
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleAction}
                    disabled={actionLoading || (['approve', 'reassign'].includes(selectedAction) && !selectedTeacherId)}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}</span>
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelectedAction('');
                    setSelectedTeacherId('');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}