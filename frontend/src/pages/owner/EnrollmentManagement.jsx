import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerEnrollments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    student: '',
    status: ''
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load enrollments
        const enrollmentsRes = await api.get('/owner/enrollments/');
        setEnrollments(enrollmentsRes.data);

        // Load courses for filter
        const coursesRes = await api.get('/courses/');
        setCourses(coursesRes.data);

        // Load students for filter
        const studentsRes = await api.get('/students/');
        setStudents(studentsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesStudent = enrollment.student.user.first_name.toLowerCase().includes(searchTerm) ||
                           enrollment.student.user.last_name.toLowerCase().includes(searchTerm) ||
                           enrollment.student.student_id.toLowerCase().includes(searchTerm);
      const matchesCourse = enrollment.course.title.toLowerCase().includes(searchTerm);
      if (!matchesStudent && !matchesCourse) return false;
    }

    if (filters.course && enrollment.course.id !== parseInt(filters.course)) {
      return false;
    }

    if (filters.student && enrollment.student.id !== parseInt(filters.student)) {
      return false;
    }

    if (filters.status && enrollment.is_active !== (filters.status === 'active')) {
      return false;
    }

    return true;
  });

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to remove this enrollment? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/owner/enrollments/${enrollmentId}/`);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing enrollment');
    }
  };

  const handleToggleStatus = async (enrollmentId, currentStatus) => {
    try {
      await api.patch(`/owner/enrollments/${enrollmentId}/`, {
        is_active: !currentStatus
      });
      setEnrollments(enrollments.map(e => 
        e.id === enrollmentId ? {...e, is_active: !currentStatus} : e
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating enrollment status');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading enrollments...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enrollment Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/owner/enrollments/add')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
            >
              Add New Enrollment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Enrollments</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by student name, course title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({...filters, course: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student</label>
              <select
                value={filters.student}
                onChange={(e) => setFilters({...filters, student: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.user.full_name || student.user.username} ({student.student_id})
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
              onClick={() => setFilters({search: '', course: '', student: '', status: ''})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Enrollments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No enrollments found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="flex items-center space-x-3">
                      {enrollment.student.profile_image ? (
                        <img 
                          src={enrollment.student.profile_image} 
                          alt={`${enrollment.student.user.first_name} profile`} 
                          className="w-8 h-8 rounded-full border-2 border-primary"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                          {enrollment.student.user.first_name?.charAt(0) || enrollment.student.user.username?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {enrollment.student.user.full_name || enrollment.student.user.username}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {enrollment.student.student_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 space-x-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {enrollment.course.subject?.name || 'N/A'} • 
                        {enrollment.course.class_level?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {enrollment.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(enrollment.id, enrollment.is_active)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title={enrollment.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {enrollment.is_active ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => navigate(`/owner/enrollments/${enrollment.id}/edit`)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
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