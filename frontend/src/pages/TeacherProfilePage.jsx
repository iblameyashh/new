import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, c] = await Promise.all([api.get(`/teachers/${id}/`), api.get(`/courses/?teacher=${id}`)]);
        setTeacher(t.data);
        setCourses(Array.isArray(c.data) ? c.data : (c.data?.results || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center">Loading teacher...</div>;
  if (!teacher) return <div className="min-h-[85vh] flex items-center justify-center">Teacher not found.</div>;

  const name = teacher.name || teacher.user?.full_name || [teacher.user?.first_name, teacher.user?.last_name].filter(Boolean).join(' ') || teacher.user?.username || 'Teacher';
  const startChat = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'STUDENT') return navigate('/messages');
    try { await api.post('/conversations/', { teacher_id: teacher.user.id }); navigate('/messages'); }
    catch (err) { alert(err.response?.data?.error || 'Enroll in one of this teacher\'s courses before starting a chat.'); }
  };

  return <div className="max-w-5xl mx-auto px-4 py-10"><Link to="/teachers" className="text-primary">← Back to teachers</Link><div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow p-8"><div className="flex flex-col md:flex-row gap-6 items-start"><div>{teacher.profile_image ? <img src={teacher.profile_image} alt={name} className="w-28 h-28 rounded-full object-cover border-4 border-primary" /> : <div className="w-28 h-28 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold">{name.charAt(0).toUpperCase()}</div>}</div><div className="flex-1"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1><p className="text-gray-500 mt-2">{teacher.qualification || 'Teacher'}</p><p className="text-gray-600 dark:text-gray-300 mt-4">{teacher.bio || 'No biography available.'}</p><p className="text-gray-500 mt-3">Experience: {teacher.experience || 0} years</p><button onClick={startChat} className="mt-5 px-5 py-2 bg-primary text-white rounded-lg">Chat with Teacher</button></div></div><div className="mt-10"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Courses</h2><div className="grid md:grid-cols-2 gap-4">{courses.map(c => <Link key={c.id} to={`/courses/${c.id}`} className="border rounded-lg p-4 hover:border-primary"><div className="font-semibold text-gray-900 dark:text-white">{c.title}</div><div className="text-sm text-gray-500 mt-1">{c.subject?.name || 'Subject'} • {c.class_level?.name || 'Class'}</div></Link>)}</div></div></div></div>;
}
