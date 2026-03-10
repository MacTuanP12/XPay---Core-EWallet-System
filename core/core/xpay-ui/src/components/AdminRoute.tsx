import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, role } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role !== 'ROLE_ADMIN') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

