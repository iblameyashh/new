import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const fullName = (u, fallback = 'Teacher') => {
  const name = [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim();
  return name || u?.full_name || u?.username || fallback;
};

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role !== 'STUDENT') { navigate('/', { replace: true }); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/enrollments/');
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (!cancelled) setEnrollments(data);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
        if (!cancelled) setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load your enrollments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const teachers = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      const teacher = e?.course?.teacher;
      if (!teacher?.id || map.has(teacher.id)) return;
      map.set(teacher.id, {
        ...teacher,
        courseTitle: e?.course?.title || 'Course',
        subjectName: e?.course?.subject?.name || 'N/A',
        className: e?.course?.class_level?.name || 'N/A',
      });
    });
    return [...map.values()];
  }, [enrollments]);

  if (authLoading || loading) return <div className="min-h-[85vh] flex items-center justify-center text-gray-600 dark:text-gray-300">Loading student dashboard...</div>;

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your learning and stay connected with your teachers.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/student/requirements" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold">My Requirements</Link>
            <Link to="/student/dashboard/courses" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold">My Courses</Link>
            <Link to="/student/dashboard/teachers" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold">My Teachers</Link>
            <Link to="/messages" className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-semibold">Messages</Link>
          </div>
        </div>

        {error && <div className="mb-8 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Welcome, {fullName(user, 'Student')}!</h2>
          <p className="text-gray-600 dark:text-gray-400">Class: {user?.student_profile?.class_level || 'N/A'}</p>
          <p className="text-gray-600 dark:text-gray-400">Student ID: {user?.student_profile?.student_id || 'N/A'}</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Teachers ({teachers.length})</h2>
          {teachers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">You are not enrolled in any courses yet.</p>
              <Link to="/courses" className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">Browse Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {teacher.profile_image ? <img src={teacher.profile_image} alt={fullName(teacher.user)} className="w-12 h-12 rounded-full border-2 border-primary object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">{fullName(teacher.user).charAt(0).toUpperCase()}</div>}
                      <div className="min-w-0"><h3 className="font-semibold text-gray-900 dark:text-white truncate">{fullName(teacher.user)}</h3><p className="text-sm text-gray-500 dark:text-gray-400 truncate">{teacher.qualification || 'Qualification not specified'}</p></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teaching You</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{teacher.courseTitle}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5"><span>Subject: {teacher.subjectName}</span><span>Class: {teacher.className}</span></div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"><Link to={`/teacher/${teacher.id}`} className="flex-1 text-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">View Profile</Link><button type="button" onClick={() => navigate('/messages')} className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">Chat</button></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Enrolled Courses ({enrollments.length})</h2>
          {enrollments.length === 0 ? <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-600 dark:text-gray-300">You are not enrolled in any courses yet.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{enrollments.map((e) => { const p=Math.max(0,Math.min(100,Number(e?.progress||0))); return <div key={e.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"><div className="flex justify-between gap-3 mb-2"><h3 className="text-lg font-bold text-primary">{e?.course?.title || 'Untitled Course'}</h3><span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{p}%</span></div><p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Teacher: {fullName(e?.course?.teacher?.user)}</p><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2"><div className="bg-primary h-2.5 rounded-full" style={{width:`${p}%`}}/></div><p className="text-xs text-gray-500 mb-4">{p}% Completed</p><Link to={`/student/course/${e?.course?.id}/learn`} className="block text-center w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-sm font-semibold">Continue Learning</Link></div>; })}</div>}
        </section>
      </div>
    </div>
  );
}
