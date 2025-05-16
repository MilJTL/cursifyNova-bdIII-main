// components/layout/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
    // Definimos la propiedad allowedRoles que acepta un array de strings
    allowedRoles: string[];
}

const AdminRoute: React.FC<AdminRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    // Mientras verificamos la autenticación, mostramos un loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const hasRequiredRole = allowedRoles.includes(user.rol);

    // Si no tiene el rol requerido, redirigir a la página principal
    if (!hasRequiredRole) {
        return <Navigate to="/" replace />;
    }

    // Si todo está bien, mostrar las rutas hijas
    return <Outlet />;
};

export default AdminRoute;