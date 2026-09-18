import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth, getApiErrorMessage } from '../context/AuthContext';

/**
 * Hidden owner/admin bootstrap page (not linked anywhere in the UI).
 *
 * How it works:
 *  1. The owner pastes their secret setup code (from backend/.env ->
 *     ADMIN_SETUP_CODE) together with an email + password.
 *  2. If that account exists it is promoted to ADMIN; otherwise a new admin
 *     account is created with that email/password.
 *  3. The user is logged in and redirected to the Owner Portal.
 *
 * The secret code never leaves the server except through the owner typing it
 * here, so regular visitors see nothing and cannot reach admin.
 */
export default function AdminSetup() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/admin-setup/', { code: code.trim(), email: email.trim(), password });
      // Tokens may already exist from a previous session; re-login cleanly.
      const me = await login(email.trim(), password);
      setSuccess('Admin access granted! Opening the Owner Portal…');
      setTimeout(() => navigate('/owner', { replace: true }), 800);
      if (!me) navigate('/owner', { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Invalid setup code, email or password.');
      if (err?.response?.status === 429) {
        setError('Too many attempts. Please wait an hour and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-3">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Owner Setup</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            One-time setup to claim admin of this site.
          </p>
        </div>

        {success ? (
          <div className="mb-4 text-green-600 text-sm text-center font-semibold">{success}</div>
        ) : (
          <>
            {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300">Setup Code</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="Your ADMIN_SETUP_CODE from backend/.env"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The secret code from <code>ADMIN_SETUP_CODE</code> in the backend{' '}
                  <code>.env</code> file.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  8+ characters. If the account already exists, this must be its current
                  password; otherwise a new admin account is created.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Verifying…' : 'Claim Admin Access'}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          <Link to="/login" className="hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
