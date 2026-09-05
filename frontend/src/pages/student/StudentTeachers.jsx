import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const fullName = (u) => [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.full_name || u?.username || 'Teacher';

export default function StudentTeachers() {
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

  const teachers = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      const t = e?.course?.teacher;
      if (t?.id && !map.has(t.id)) map.set(t.id, { ...t, subjectName: e?.course?.subject?.name || 'N/A' });
    });
    return [...map.values()];
  }, [enrollments]);

  if (authLoading || loading) return <div className="min-h-[85vh] flex items-center justify-center">Loading teachers...</div>;

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link to="/student/dashboard" className="text-primary text-sm">← Dashboard</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-8">My Teachers</h1>
        {teachers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-600 dark:text-gray-300">No teachers found from your active enrollments.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => {
              const name = fullName(t.user);
              return (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center gap-4">
                    {t.profile_image ? <img src={t.profile_image} alt={name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">{name.charAt(0).toUpperCase()}</div>}
                    <div><h3 className="font-bold text-gray-900 dark:text-white">{name}</h3><p className="text-sm text-gray-500">{t.qualification || 'Teacher'}</p></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Subject: {t.subjectName}</p>
                  <div className="mt-4 flex gap-2"><Link to={`/teacher/${t.id}`} className="flex-1 text-center px-3 py-2 bg-primary text-white rounded">Profile</Link><Link to="/messages" className="flex-1 text-center px-3 py-2 bg-gray-900 text-white rounded">Chat</Link></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
