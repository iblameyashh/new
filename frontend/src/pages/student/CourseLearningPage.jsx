import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, PlayCircle, FileText, CheckCircle, Upload } from 'lucide-react';
import api from '../../api/axiosConfig';

export default function CourseLearningPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, moduleRes, assignmentRes] = await Promise.all([
          api.get(`/courses/${id}/`), api.get(`/courses/${id}/modules/`), api.get(`/courses/${id}/assignments/`),
        ]);
        setCourse(courseRes.data);
        const mods = Array.isArray(moduleRes.data) ? moduleRes.data : (moduleRes.data?.results || []);
        setModules(mods);
        setAssignments(Array.isArray(assignmentRes.data) ? assignmentRes.data : (assignmentRes.data?.results || []));
        setActiveLesson(mods.flatMap(m => m.lessons || [])[0] || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const markComplete = async () => {
    if (!activeLesson || saving) return;
    try {
      setSaving(true);
      const res = await api.post(`/lessons/${activeLesson.id}/complete/`);
      setCompleted(prev => new Set(prev).add(activeLesson.id));
      alert(`Lesson completed. Course progress: ${res.data.progress}%`);
    } catch (err) { alert(err.response?.data?.error || 'Unable to mark lesson complete.'); }
    finally { setSaving(false); }
  };

  const submitAssignment = async () => {
    if (!activeAssignment || !submission.trim() || saving) return;
    try {
      setSaving(true);
      await api.post(`/assignments/${activeAssignment.id}/submit/`, { content: submission });
      alert('Assignment submitted successfully.');
      setSubmission('');
    } catch (err) { alert(err.response?.data?.error || 'Unable to submit assignment.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading learning environment...</div>;
  if (!course) return <div className="min-h-[85vh] flex items-center justify-center text-red-500">Course not found.</div>;

  return <div className="flex flex-col md:flex-row min-h-[85vh] bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
    <aside className="w-full md:w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col md:h-[85vh]"><div className="p-4 border-b dark:border-gray-700"><Link to="/student/dashboard" className="text-sm text-gray-500 hover:text-primary flex items-center mb-2"><ChevronLeft size={16}/> Back to Dashboard</Link><h2 className="font-bold text-lg dark:text-white truncate">{course.title}</h2></div><div className="flex-1 overflow-y-auto p-4 space-y-6">{modules.map(mod=><div key={mod.id}><h3 className="font-bold text-sm uppercase text-gray-900 dark:text-white mb-2">{mod.title}</h3><div className="space-y-1">{(mod.lessons||[]).map(lesson=><button key={lesson.id} onClick={()=>{setActiveLesson(lesson);setActiveAssignment(null)}} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center ${activeLesson?.id===lesson.id?'bg-primary text-white':'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><PlayCircle size={16} className="mr-2"/>{lesson.title}{completed.has(lesson.id)&&<CheckCircle size={14} className="ml-auto"/>}</button>)}</div></div>)}{assignments.length>0&&<div className="pt-4 border-t dark:border-gray-700"><h3 className="font-bold text-sm uppercase text-gray-900 dark:text-white mb-2">Assignments</h3>{assignments.map(a=><button key={a.id} onClick={()=>{setActiveAssignment(a);setActiveLesson(null)}} className="w-full text-left px-3 py-2 text-sm rounded flex items-center bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 hover:opacity-80"><FileText size={16} className="mr-2"/>{a.title}</button>)}</div>}</div></aside>
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      {activeAssignment ? <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-8"><button onClick={()=>setActiveAssignment(null)} className="text-primary mb-4">← Back to lesson</button><h1 className="text-3xl font-bold dark:text-white">{activeAssignment.title}</h1><p className="mt-4 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{activeAssignment.description}</p><p className="mt-3 text-sm text-gray-500">Due: {activeAssignment.due_date ? new Date(activeAssignment.due_date).toLocaleString() : '—'} • Max marks: {activeAssignment.max_marks}</p><textarea value={submission} onChange={e=>setSubmission(e.target.value)} className="w-full min-h-48 mt-6 border rounded-lg p-3 dark:bg-gray-900 dark:text-white" placeholder="Write your answer here..."/><button onClick={submitAssignment} disabled={saving||!submission.trim()} className="mt-4 px-5 py-3 bg-primary text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Upload size={18}/>{saving?'Submitting...':'Submit Assignment'}</button></div>
      : activeLesson ? <div className="max-w-4xl mx-auto"><h1 className="text-3xl font-bold mb-4 dark:text-white">{activeLesson.title}</h1><div className="w-full aspect-video bg-gray-900 rounded-xl mb-8 overflow-hidden flex items-center justify-center">{activeLesson.video_url?<iframe className="w-full h-full" src={activeLesson.video_url} title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:<div className="text-center text-gray-400"><PlayCircle size={48} className="mx-auto mb-2"/><p>No video attached to this lesson.</p></div>}</div><div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm"><h2>Lesson Notes</h2><div dangerouslySetInnerHTML={{__html:activeLesson.content||'<p>No lesson notes yet.</p>'}}/></div><div className="mt-8 flex justify-end"><button onClick={markComplete} disabled={saving||completed.has(activeLesson.id)} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold flex items-center disabled:opacity-60"><CheckCircle size={20} className="mr-2"/>{completed.has(activeLesson.id)?'Completed':'Mark as Completed'}</button></div></div>
      : <div className="flex items-center justify-center h-full text-gray-500">No lessons available.</div>}
    </main>
  </div>;
}
