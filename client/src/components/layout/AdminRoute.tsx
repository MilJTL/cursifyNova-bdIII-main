// components/layout/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const AdminRoute: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Si está cargando, mostrar spinner
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Si no está autenticado o no es admin, redirigir
    if (!isAuthenticated || user?.rol !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado y es admin, mostrar el contenido
    return <Outlet />;
};

export default AdminRoute;