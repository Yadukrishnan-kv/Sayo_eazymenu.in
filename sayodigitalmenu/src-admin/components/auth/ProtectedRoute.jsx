import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../../api/api';

/**
 * Wraps admin routes that require login. Redirects to /admin/login if no token.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
