import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', classLevel: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register/', { 
        email: formData.email, username: formData.email, password: formData.password, 
        first_name: formData.firstName, last_name: formData.lastName, role: formData.role, class_level: formData.classLevel 
      });
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Sign Up</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" onChange={(e) => setFormData({...formData, firstName: e.target.value})} required className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" onChange={(e) => setFormData({...formData, lastName: e.target.value})} required className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} required className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Register as</label>
            <select onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white">
               <option value="STUDENT">Student</option>
               <option value="TEACHER">Teacher</option>
            </select>
          </div>
          {formData.role === 'STUDENT' && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Class Target (e.g. Class 10)</label>
              <input type="text" onChange={(e) => setFormData({...formData, classLevel: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
          )}
          <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
