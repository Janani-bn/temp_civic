import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, loading, user } = useAuth();

  if (loading) {
    return <div style={{ padding: '6rem 1.5rem' }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Check both auth context role (admin from backend) and localStorage role (volunteer, client-side)
    const localRole = localStorage.getItem('userRole');
    const effectiveRole = user?.role === requiredRole ? user.role : localRole;
    if (effectiveRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

