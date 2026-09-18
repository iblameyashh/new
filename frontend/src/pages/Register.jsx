import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth, dashboardPathFor, getApiErrorMessage } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    classLevel: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/register/', {
        email: formData.email,
        username: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        class_level: formData.classLevel,
        phone_number: formData.phone,
      });
      const me = await login(formData.email, formData.password);
      navigate(dashboardPathFor(me), { replace: true });
    } catch (err) {
      setError(err?.handledMessage || getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Sign Up</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                autoComplete="given-name"
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                autoComplete="family-name"
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Phone (optional)</label>
            <input
              type="tel"
              autoComplete="tel"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className={inputClass}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 8 characters.</p>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Register as</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={inputClass}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          {formData.role === 'STUDENT' && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Class Target (e.g. Class 10)</label>
              <input
                type="text"
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                className={inputClass}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
