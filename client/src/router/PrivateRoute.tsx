import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
    redirectPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectPath = '/login' }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Si está cargando, mostrar spinner o mensaje
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login guardando la ruta actual
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Verificación de permisos por ruta para mayor seguridad
    const path = location.pathname;
  
    // Verificar acceso a rutas de instructor
    if (path.startsWith('/instructor') && user?.rol !== 'instructor' && user?.rol !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
  
    // Verificar acceso a rutas de administrador
    if (path.startsWith('/admin') && user?.rol !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Si está autenticado y tiene permisos, mostrar el componente hijo
    return <Outlet />;
};

export default PrivateRoute;