import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../api/axiosConfig';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hi! I am the Learnique AI Assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post('/ai/chat/', { question });
      setMessages(prev => [...prev, { role: 'ai', text: res.data?.reply || 'No response received.' }]);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || (err.response?.status === 401 ? 'Please log in to use Learnique AI.' : 'Unable to connect to Learnique AI.');
      setMessages(prev => [...prev, { role: 'ai', text: message }]);
    } finally { setLoading(false); }
  };

  return <div className="fixed bottom-6 right-6 z-50">{isOpen?<div className="w-80 sm:w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"><div className="bg-primary text-white p-4 flex justify-between items-center"><h3 className="font-bold flex items-center"><MessageSquare size={18} className="mr-2"/>Learnique AI</h3><button onClick={()=>setIsOpen(false)}><X size={20}/></button></div><div className="flex-1 p-4 overflow-y-auto space-y-4">{messages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role==='user'?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}>{m.text}</div></div>)}{loading&&<div className="text-sm text-gray-500 italic">AI is typing...</div>}</div><div className="p-4 border-t dark:border-gray-700 flex bg-gray-50 dark:bg-gray-900"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendMessage()}} placeholder="Ask a question..." className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-l-md px-3 py-2 text-sm dark:text-white"/><button onClick={sendMessage} disabled={loading||!input.trim()} className="bg-primary text-white px-4 rounded-r-md disabled:opacity-50"><Send size={16}/></button></div></div>:<button onClick={()=>setIsOpen(true)} className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg flex items-center justify-center"><MessageSquare size={24}/></button>}</div>;
}
