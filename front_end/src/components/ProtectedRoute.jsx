import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// <ProtectedRoute /> yêu cầu đăng nhập; <ProtectedRoute role="admin" /> yêu cầu đúng role
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
