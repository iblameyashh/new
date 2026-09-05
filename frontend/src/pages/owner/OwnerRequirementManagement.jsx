import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { Search, Filter, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OwnerRequirementManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classLevelFilter, setClassLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      if (classLevelFilter) params.append('class_level', classLevelFilter);
      
      const res = await api.get(`/owner/requirements/?${params.toString()}`);
      setRequirements(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, subjectFilter, classLevelFilter]);

  const loadFilters = useCallback(async () => {
    try {
      const [subjectsRes, classLevelsRes] = await Promise.all([
        api.get('/subjects/'),
        api.get('/class_levels/'),
      ]);
      setSubjects(subjectsRes.data);
      setClassLevels(classLevelsRes.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadRequirements();
    loadFilters();
  }, [user, navigate, loadRequirements, loadFilters]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const applyFilters = () => {
    loadRequirements();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSubjectFilter('');
    setClassLevelFilter('');
    loadRequirements();
  };

  const getFullName = (userObj) => {
    if (!userObj) return 'N/A';
    const parts = [userObj.first_name, userObj.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : userObj.username || 'N/A';
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <div className="min-h-[85vh] flex items-center justify-center">Access denied</div>;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Requirement Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage student learning requirements</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, email, requirement..."
                value={search}
                onChange={handleSearch}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {(statusFilter || subjectFilter || classLevelFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Level</label>
                <select
                  value={classLevelFilter}
                  onChange={(e) => setClassLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {classLevels.map((cl) => (
                    <option key={cl.id} value={cl.id}>{cl.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Requirements Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {requirements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No requirements found</h3>
              <p className="text-gray-600 dark:text-gray-400">No requirements match your current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject / Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requirement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <Link
                          to={`/owner/students/${req.student.id}`}
                          className="text-primary hover:underline font-medium text-gray-900 dark:text-white"
                        >
                          {getFullName(req.student.user)}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {req.student.student_id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.student.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{req.subject?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.class_level?.name}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-700 dark:text-gray-300 truncate" title={req.requirement_text}>
                          {req.requirement_text}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[req.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusIcons[req.status]}
                          <span className="ml-1">{req.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.assigned_teacher ? (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getFullName(req.assigned_teacher.user)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {req.assigned_teacher.qualification} • {req.assigned_teacher.experience} yrs
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/owner/requirements/${req.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          View & Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}