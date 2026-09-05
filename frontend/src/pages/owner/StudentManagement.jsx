import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    classLevel: '',
    status: ''
  });
  const [classLevels, setClassLevels] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load students
        const studentsRes = await api.get('/owner/students/');
        setStudents(studentsRes.data);

        // Load class levels for filter
        const classLevelsRes = await api.get('/class_levels/');
        setClassLevels(classLevelsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const filteredStudents = students.filter(student => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesName = student.user.first_name.toLowerCase().includes(searchTerm) ||
                         student.user.last_name.toLowerCase().includes(searchTerm) ||
                         student.user.email.toLowerCase().includes(searchTerm) ||
                         student.student_id.toLowerCase().includes(searchTerm);
      if (!matchesName) return false;
    }

    if (filters.classLevel && student.class_level !== filters.classLevel) {
      return false;
    }

    if (filters.status && student.user.is_active !== (filters.status === 'active')) {
      return false;
    }

    return true;
  });

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/owner/students/${studentId}/`);
      setStudents(students.filter(s => s.id !== studentId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing student');
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      await api.patch(`/owner/students/${studentId}/`, {
        is_active: !currentStatus
      });
      setStudents(students.map(s => 
        s.id === studentId ? {...s, user: {...s.user, is_active: !currentStatus}} : s
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating student status');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading students...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/owner/students/add')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
            >
              Add New Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Students</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by name, email, student ID..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class Level</label>
              <select
                value={filters.classLevel}
                onChange={(e) => setFilters({...filters, classLevel: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Class Levels</option>
                {classLevels.map(cl => (
                  <option key={cl.id} value={cl.name}>
                    {cl.name}
                  </option>
                ))}
              </select>
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
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setFilters({search: '', classLevel: '', status: ''})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No students found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <div key={student.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 w-full">
                    {student.profile_image ? (
                      <img 
                        src={student.profile_image} 
                        alt={`${student.user.first_name} profile`} 
                        className="w-10 h-10 rounded-full border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                        {student.user.first_name?.charAt(0) || student.user.username?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {student.user.full_name || student.user.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {student.student_id}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {student.class_level || 'Class level not specified'} • {student.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {student.user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(student.id, student.user.is_active)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title={student.user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {student.user.is_active ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => navigate(`/owner/students/${student.id}/edit`)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
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