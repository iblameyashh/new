import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const displayName = (u, fallback = 'User') => {
  if (!u) return fallback;
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return full || u.full_name || u.username || fallback;
};

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const requirementId = useMemo(() => {
    const value = new URLSearchParams(location.search).get('requirementId');
    return value ? Number(value) : null;
  }, [location.search]);

  const studentId = useMemo(() => {
    const value = new URLSearchParams(location.search).get('studentId');
    return value ? Number(value) : null;
  }, [location.search]);

  const teacherId = useMemo(() => {
    const value = location.state?.teacherId;
    return value ? Number(value) : null;
  }, [location.state]);

  const openConversation = useCallback(async (conversation) => {
    if (!conversation) return;
    setActiveConv(conversation);
    setError('');
    try {
      const res = await api.get(`/messages/?conversation_id=${conversation.id}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setMessages(list);
      requestAnimationFrame(() => {
        const el = document.getElementById('messages-container');
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Unable to load messages.');
      setMessages([]);
    }
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError('');
        let url = '/conversations/';
        if (requirementId) {
          url += `?requirement_id=${requirementId}`;
        }
        const res = await api.get(url);
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (!cancelled) setConversations(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load conversations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchConversations();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate, requirementId]);

  // Auto-select conversation based on URL params
  useEffect(() => {
    if (!conversations.length) return;
    
    if (requirementId) {
      const match = conversations.find((c) => c.requirement?.id === requirementId);
      if (match) { openConversation(match); return; }
    }
    
    if (studentId && user?.role === 'TEACHER') {
      const match = conversations.find((c) => c.student?.id === studentId);
      if (match) { openConversation(match); return; }
    }
    
    if (teacherId && user?.role === 'STUDENT') {
      const match = conversations.find((c) => c.teacher?.id === teacherId);
      if (match) { openConversation(match); return; }
    }
    
    if (!activeConv || !conversations.some((c) => c.id === activeConv.id)) {
      openConversation(conversations[0]);
    }
  }, [conversations, requirementId, studentId, teacherId, user, activeConv, openConversation]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeConv || sending) return;
    try {
      setSending(true);
      const res = await api.post('/messages/', { conversation: activeConv.id, content });
      setMessages((prev) => [...prev, res.data]);
      setDraft('');
      requestAnimationFrame(() => {
        const el = document.getElementById('messages-container');
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Error sending message.');
    } finally {
      setSending(false);
    }
  };

  const other = activeConv ? (user?.role === 'STUDENT' ? activeConv.teacher : activeConv.student) : null;

  if (authLoading || loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading conversations...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[85vh] bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <aside className="w-full md:w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Conversations</span>
          </h2>
        </div>
        
        {error && <div className="m-3 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
        
        {!conversations.length ? (
          <div className="flex-1 p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No conversations yet.</p>
            {user?.role === 'STUDENT' && (
              <p className="text-sm mt-2">Submit a learning requirement and wait for admin approval to start chatting with a teacher.</p>
            )}
            {user?.role === 'TEACHER' && (
              <p className="text-sm mt-2">Students will appear here when assigned to you by an admin.</p>
            )}
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const n = user?.role === 'STUDENT' ? c.teacher : c.student;
              const subjectName = c.subject?.name || 'Unknown Subject';
              const reqText = c.requirement?.requirement_text ? c.requirement.requirement_text.substring(0, 50) + '...' : '';
              return (
                <li
                  key={c.id}
                  onClick={() => openConversation(c)}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${activeConv?.id === c.id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {n?.first_name?.charAt(0) || n?.username?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {displayName(n)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {subjectName}
                      </p>
                      {reqText && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {reqText}
                        </p>
                      )}
                    </div>
                  </div>
                  {c.status !== 'ACTIVE' && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {c.status}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <header className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {other?.first_name?.charAt(0) || other?.username?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {displayName(other)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeConv.subject?.name || 'Unknown Subject'}
                    {activeConv.requirement && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded">
                          {activeConv.requirement.status}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Call">
                    <UserIcon size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Video Call">
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            </header>
            
            <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {!messages.length && (
                <div className="text-center text-gray-500 py-10">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.sender?.id === user?.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                    {m.sender?.id !== user?.id && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                        {displayName(m.sender)}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${m.sender?.id === user?.id ? 'text-primary-200 opacity-75' : 'text-gray-500 dark:text-gray-400'}`}>
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      {m.is_read && m.sender?.id === user?.id && <span className="ml-2">✓</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                placeholder="Write a message..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !draft.trim()}
                className="p-3 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}