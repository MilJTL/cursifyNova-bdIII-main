// src/pages/Register.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import useAuth from '../hooks/useAuth';

const Register: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Si está cargando, mostrar spinner
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-extrabold text-gray-900">
                        CursifyNova
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Únete a nuestra comunidad de aprendizaje
                    </p>
                </div>

                <RegisterForm />
            </div>
        </div>
    );
};

export default Register;