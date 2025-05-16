// components/layout/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


interface PrivateRouteProps {
    redirectPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectPath = '/login' }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Si está cargando, mostrar spinner o mensaje
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // Si está autenticado, mostrar el componente hijo
    return <Outlet />;
};

export default PrivateRoute;