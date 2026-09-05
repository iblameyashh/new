import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    teacher: '',
    subject: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load courses
        const coursesRes = await api.get('/owner/courses/');
        setCourses(coursesRes.data);

        // Load teachers for filter
        const teachersRes = await api.get('/teachers/');
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

  const filteredCourses = courses.filter(course => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = course.title.toLowerCase().includes(searchTerm);
      const matchesDescription = course.description.toLowerCase().includes(searchTerm);
      if (!matchesTitle && !matchesDescription) return false;
    }

    if (filters.status && course.is_active !== (filters.status === 'active')) {
      return false;
    }

    if (filters.teacher && course.teacher.id !== parseInt(filters.teacher)) {
      return false;
    }

    if (filters.subject && course.subject.id !== parseInt(filters.subject)) {
      return false;
    }

    return true;
  });

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/owner/courses/${courseId}/`);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing course');
    }
  };

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      await api.patch(`/owner/courses/${courseId}/`, {
        is_active: !currentStatus
      });
      setCourses(courses.map(c => 
        c.id === courseId ? {...c, is_active: !currentStatus} : c
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating course status');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading courses...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/owner/courses/add')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
            >
              Add New Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Courses</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by title, description..."
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teacher</label>
              <select
                value={filters.teacher}
                onChange={(e) => setFilters({...filters, teacher: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.full_name || teacher.user.username}
                  </option>
                ))}
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
              onClick={() => setFilters({search: '', status: '', teacher: '', subject: ''})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No courses found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <div key={course.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 w-full">
                    {course.image ? (
                      <img 
                        src={course.image} 
                        alt={`${course.title} image`} 
                        className="w-10 h-10 rounded object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white text-lg font-bold">
                        {course.title?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {course.teacher.user.full_name || course.teacher.user.username}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {course.subject?.name || 'N/A'} • {course.class_level?.name || 'N/A'} • 
                        ${course.price} • {course.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(course.id, course.is_active)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title={course.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {course.is_active ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => navigate(`/owner/courses/${course.id}/edit`)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
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