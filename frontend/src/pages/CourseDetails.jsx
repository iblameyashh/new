import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('checking'); // checking, enrolled, not_enrolled
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourseAndCheckEnrollment = async () => {
      try {
        // Load course details
        const courseRes = await api.get(`/courses/${id}/`);
        setCourse(courseRes.data);
        
        // Check if user is enrolled in this course
        if (user && user.role === 'STUDENT') {
          const enrollmentsRes = await api.get('/enrollments/');
          const isEnrolled = enrollmentsRes.data.some(
            enrollment => enrollment.course.id === parseInt(id) && enrollment.is_active
          );
          setEnrollmentStatus(isEnrolled ? 'enrolled' : 'not_enrolled');
        }
      } catch (err) {
        console.error('Error loading course details:', err);
      }
    };

    loadCourseAndCheckEnrollment();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/enrollments/', { course_id: id });
      alert("Enrolled successfully!");
      setEnrollmentStatus('enrolled');
      navigate('/student/dashboard');
    } catch (err) {
      alert("Error enrolling: " + (err.response?.data?.error || "Unknown"));
    }
  };

  const handleStartChat = async () => {
    try {
      if(!course.teacher) return;
      
      // Double-check enrollment before allowing chat
      if (user && user.role === 'STUDENT') {
        const enrollmentsRes = await api.get('/enrollments/');
        const isEnrolled = enrollmentsRes.data.some(
          enrollment => enrollment.course.id === parseInt(id) && enrollment.is_active
        );
        
        if (!isEnrolled) {
          alert("You need to be enrolled in this course to chat with the teacher.");
          return;
        }
      }
      
      await api.post('/conversations/', { teacher_id: course.teacher.user.id });
      navigate('/messages');
    } catch(err) {
      alert(err.response?.data?.error || "Error starting conversation.");
    }
  };

  if (!course) return <div className="text-center py-20 dark:text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{course.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
              <div className="font-semibold text-gray-900 dark:text-white">{course.duration}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Schedule</div>
              <div className="font-semibold text-gray-900 dark:text-white">{course.schedule}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
              <div className="font-semibold text-gray-900 dark:text-white">${course.price}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Teacher</div>
              <div className="font-semibold text-gray-900 dark:text-white">{course.teacher ? (course.teacher.user.first_name || course.teacher.user.username) : 'TBA'}</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            {(!user || user.role === 'STUDENT') && (
              <button 
                onClick={handleEnroll} 
                disabled={enrollmentStatus === 'enrolled'}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-4 rounded-lg text-lg font-bold transition"
              >
                {enrollmentStatus === 'enrolled' ? 'Already Enrolled' : 'Enroll Now'}
              </button>
            )}
            {(user && user.role === 'STUDENT') && (
               <button 
                 onClick={handleStartChat} 
                 disabled={enrollmentStatus !== 'enrolled'}
                 className="flex-1 bg-gray-900 border hover:bg-gray-800 text-white py-4 rounded-lg text-lg font-bold transition"
               >
                 Chat with Teacher
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
