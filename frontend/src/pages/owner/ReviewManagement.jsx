import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    rating: ''
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load reviews
        const reviewsRes = await api.get('/owner/reviews/');
        setReviews(reviewsRes.data);

        // Load courses for filter
        const coursesRes = await api.get('/courses/');
        setCourses(coursesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const filteredReviews = reviews.filter(review => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesStudent = review.student.user.first_name.toLowerCase().includes(searchTerm) ||
                           review.student.user.last_name.toLowerCase().includes(searchTerm) ||
                           review.student.student_id.toLowerCase().includes(searchTerm);
      const matchesCourse = review.course.title.toLowerCase().includes(searchTerm);
      const matchesReviewText = review.review_text.toLowerCase().includes(searchTerm);
      if (!matchesStudent && !matchesCourse && !matchesReviewText) return false;
    }

    if (filters.course && review.course.id !== parseInt(filters.course)) {
      return false;
    }

    if (filters.rating && review.rating !== parseInt(filters.rating)) {
      return false;
    }

    return true;
  });

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/owner/reviews/${reviewId}/`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting review');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading reviews...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/owner/reviews/add')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
            >
              Add New Review
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Reviews</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by student name, course title, or review text..."
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Ratings</option>
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{'s' === rating ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setFilters({search: '', course: '', rating: ''})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No reviews found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReviews.map((review) => (
                <div key={review.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="flex items-center space-x-3">
                      {review.student.profile_image ? (
                        <img 
                          src={review.student.profile_image} 
                          alt={`${review.student.user.first_name} profile`} 
                          className="w-8 h-8 rounded-full border-2 border-primary"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                          {review.student.user.first_name?.charAt(0) || review.student.user.username?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.student.user.full_name || review.student.user.username}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {review.student.student_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 space-x-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {review.course.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {review.student.user.full_name || review.student.user.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Rating:
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`text-yellow-400 ${star <= review.rating ? 'opacity-100' : 'opacity-200'}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/owner/reviews/${review.id}/edit`)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
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