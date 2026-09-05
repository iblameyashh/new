import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const fullName = (u) => [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.full_name || u?.username || 'Teacher';

export default function StudentCourses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'STUDENT') { navigate('/login'); return; }
    (async () => {
      try {
        const res = await api.get('/enrollments/');
        setEnrollments(Array.isArray(res.data) ? res.data : (res.data?.results || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) return <div className="min-h-[85vh] flex items-center justify-center">Loading courses...</div>;

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link to="/student/dashboard" className="text-primary text-sm">← Dashboard</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-8">My Courses</h1>
        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-600 dark:text-gray-300">
            You have no enrolled courses yet.
            <div><Link to="/courses" className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-md">Browse Courses</Link></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((e) => {
              const progress = Math.max(0, Math.min(100, Number(e.progress || 0)));
              return (
                <div key={e.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{e.course?.title || 'Untitled Course'}</h3>
                  <p className="text-sm text-gray-500 mt-2">Teacher: {fullName(e.course?.teacher?.user)}</p>
                  <p className="text-sm text-gray-500 mt-1">{e.course?.subject?.name || 'Subject'} • {e.course?.class_level?.name || 'Class'}</p>
                  <div className="mt-5 h-2 bg-gray-200 dark:bg-gray-700 rounded"><div className="h-2 bg-primary rounded" style={{ width: `${progress}%` }} /></div>
                  <p className="text-xs text-gray-500 mt-2">{progress}% complete</p>
                  <Link to={`/student/course/${e.course?.id}/learn`} className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded">Continue Learning</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
