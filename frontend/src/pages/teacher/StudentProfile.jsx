import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { MessageSquare, BookOpen, Clock, CheckCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const statusIcons = {
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <CheckCircle className="w-4 h-4" />,
  ACTIVE: <CheckCircle2 className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
  CANCELLED: <AlertCircle className="w-4 h-4" />,
};

const getFullName = (user) => {
  if (!user) return 'N/A';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.username || 'N/A';
};

export default function TeacherStudentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeConv, setActiveConv] = useState(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user || user.role !== 'TEACHER') {
        navigate('/');
        return;
      }

      try {
        // Load student profile
        const studentRes = await api.get(`/students/${studentId}/`);
        setStudent(studentRes.data);

        // Load requirements assigned to this teacher for this student
        const requirementsRes = await api.get('/requirements/');
        const teacherRequirements = requirementsRes.data.filter(
          req => req.assigned_teacher && req.assigned_teacher.user.id === user.id && req.student.id === studentRes.data.id
        );
        setRequirements(teacherRequirements);

        // Check URL params for requirementId or auto-select first active requirement
        const requirementId = new URLSearchParams(location.search).get('requirementId');
        if (requirementId) {
          const req = teacherRequirements.find(r => r.id === parseInt(requirementId));
          if (req) {
            setSelectedRequirementId(req.id);
            loadConversation(req);
          }
        } else if (teacherRequirements.length > 0) {
          // Auto-select first active/approved requirement
          const activeReq = teacherRequirements.find(r => r.status === 'ACTIVE' || r.status === 'APPROVED');
          if (activeReq) {
            setSelectedRequirementId(activeReq.id);
            loadConversation(activeReq);
          }
        }
      } catch (err) {
        console.error(err);
        navigate('/teacher');
      } finally {
        setLoading(false);
      }
    };

    const loadConversation = async (req) => {
      try {
        const conversationsRes = await api.get(`/conversations/?requirement_id=${req.id}`);
        if (conversationsRes.data.length > 0) {
          const conv = conversationsRes.data[0];
          setActiveConv(conv);
          const messagesRes = await api.get(`/messages/?conversation_id=${conv.id}`);
          setMessages(messagesRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadStudentData();
  }, [user, studentId, navigate, location]);

  const handleRequirementSelect = async (req) => {
    setSelectedRequirementId(req.id);
    setActiveConv(null);
    setMessages([]);
    setNewMessage('');
    try {
      const conversationsRes = await api.get(`/conversations/?requirement_id=${req.id}`);
      if (conversationsRes.data.length > 0) {
        const conv = conversationsRes.data[0];
        setActiveConv(conv);
        const messagesRes = await api.get(`/messages/?conversation_id=${conv.id}`);
        setMessages(messagesRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;

    try {
      const res = await api.post(`/messages/`, {
        conversation: activeConv.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error sending message');
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!student) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Student not found or access denied.</div>;
  }

  // Verify teacher has access to this student via requirements
  const hasAccess = requirements.length > 0;

  if (!hasAccess) {
    navigate('/teacher');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Profile
          </h1>
          <button
            onClick={() => navigate('/teacher')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
          >
            Back to Students
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Student Info Column */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="text-center">
                {student.profile_image ? (
                  <img
                    src={student.profile_image}
                    alt={`${student.user.first_name} profile`}
                    className="w-24 h-24 rounded-full border-4 border-primary mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {student.user.first_name?.charAt(0) || student.user.username?.charAt(0) || '?'}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getFullName(student.user)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Student ID: {student.student_id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Class: {student.class_level}
                </p>
              </div>

              {/* Requirements Assigned to This Teacher */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Your Assigned Requirements ({requirements.length})
                </h3>
                {requirements.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No requirements assigned to you for this student.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requirements.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => handleRequirementSelect(req)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedRequirementId === req.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {req.subject?.name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[req.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusIcons[req.status]} {req.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {req.requirement_text}
                            </p>
                          </div>
                          {selectedRequirementId === req.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedRequirementId ? (
                  <>
                    <MessageSquare className="w-5 h-5 mr-2 inline" />
                    Chat - {requirements.find(r => r.id === selectedRequirementId)?.subject?.name}
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 mr-2 inline" />
                    Select a requirement to start chatting
                  </>
                )}
              </h3>

              {selectedRequirementId ? (
                <>
                  {activeConv ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden h-[500px] flex flex-col">
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                              {student.user.first_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {getFullName(student.user)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {requirements.find(r => r.id === selectedRequirementId)?.subject?.name} • {activeConv.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="messages-container">
                        {messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-center text-gray-400">No messages yet. Say hello!</p>
                          </div>
                        ) : (
                          messages.map((msg) => {
                            const isMine = msg.sender.id === user.id;
                            return (
                              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-200 opacity-75' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 transition"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No conversation yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Click "Start Chat" to begin a conversation for this requirement.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const req = requirements.find(r => r.id === selectedRequirementId);
                            if (!req) return;
                            const res = await api.post(`/conversations/`, {
                              requirement_id: req.id,
                            });
                            setActiveConv(res.data);
                          } catch (err) {
                            alert(err.response?.data?.error || 'Could not start conversation');
                          }
                        }}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold transition-colors"
                      >
                        Start Chat
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a requirement
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose one of your assigned requirements from the left to start chatting with this student.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}