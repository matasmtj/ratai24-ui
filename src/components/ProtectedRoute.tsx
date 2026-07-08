import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './ui/Loading';
import type { UserRole } from '../types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  /** When true (default), USER accounts without a phone number are redirected to /complete-profile. */
  requirePhone?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requirePhone = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, role, needsPhone, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (
    requirePhone &&
    needsPhone &&
    role === 'USER' &&
    location.pathname !== '/complete-profile'
  ) {
    return <Navigate to="/complete-profile" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
