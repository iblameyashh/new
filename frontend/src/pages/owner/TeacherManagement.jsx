import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerTeachers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    subject: ''
  });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load teachers
        const teachersRes = await api.get('/owner/teachers/');
        setTeachers(teachersRes.data);

        // Load subjects for filter
        const subjectsRes = await api.get('/subjects/');
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const filteredTeachers = teachers.filter(teacher => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesName = teacher.user.first_name.toLowerCase().includes(searchTerm) ||
                         teacher.user.last_name.toLowerCase().includes(searchTerm) ||
                         teacher.user.email.toLowerCase().includes(searchTerm);
      if (!matchesName) return false;
    }

    if (filters.status && teacher.user.is_active !== (filters.status === 'active')) {
      return false;
    }

    // Note: Subject filtering would require expanding the teacher data with subject info
    // For now, we'll skip this as it would require backend changes
    return true;
  });

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to remove this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/owner/teachers/${teacherId}/`);
      setTeachers(teachers.filter(t => t.id !== teacherId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing teacher');
    }
  };

  const handleToggleStatus = async (teacherId, currentStatus) => {
    try {
      await api.patch(`/owner/teachers/${teacherId}/`, {
        is_active: !currentStatus
      });
      setTeachers(teachers.map(t => 
        t.id === teacherId ? {...t, user: {...t.user, is_active: !currentStatus}} : t
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating teacher status');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading teachers...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/owner/teachers/add')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
            >
              Add New Teacher
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Teachers</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by name, email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setFilters({search: '', status: '', subject: ''})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No teachers found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 w-full">
                    {teacher.profile_image ? (
                      <img 
                        src={teacher.profile_image} 
                        alt={`${teacher.user.first_name} profile`} 
                        className="w-10 h-10 rounded-full border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                        {teacher.user.first_name?.charAt(0) || teacher.user.username?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {teacher.user.full_name || teacher.user.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.qualification || 'Qualification not specified'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {teacher.experience} years experience • {teacher.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      teacher.user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {teacher.user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(teacher.id, teacher.user.is_active)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title={teacher.user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {teacher.user.is_active ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => navigate(`/owner/teachers/${teacher.id}/edit`)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        🗑
                      </button>
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