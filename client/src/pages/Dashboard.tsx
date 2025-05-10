// src/pages/Dashboard.tsx
import React from 'react';
import useAuth from '../hooks/useAuth';
import StudentDashboard from './StudentDashboard'; // Corregido: importación del archivo correcto
import InstructorDashboard from './admin/InstructorDashboard'; // Corregido: importación del archivo correcto

const Dashboard: React.FC = () => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redirigir según el rol del usuario
    if (user?.rol === 'admin') {
        return <InstructorDashboard />;
    }

    // Por defecto, mostrar el dashboard de estudiante
    return <StudentDashboard />;
};

export default Dashboard;