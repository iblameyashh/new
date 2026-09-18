import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PageLoader() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Route guard: waits for the auth check to finish, then:
 *  - not logged in  -> /login (remembering where the user wanted to go)
 *  - wrong role     -> home page
 *  - ok             -> render the page
 *
 * Admin recognition is centralised here: a user counts as admin when the
 * backend says so (role ADMIN / is_staff / is_superuser via the `is_admin`
 * flag on /auth/me/), never because of anything the browser decided.
 */
export default function RequireRole({ role, children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role === 'ADMIN') {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  }

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
