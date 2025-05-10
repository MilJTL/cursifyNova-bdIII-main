// src/pages/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getUserCoursesProgress } from '../api/progress';
import type { Progress } from '../api/progress';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [coursesProgress, setCoursesProgress] = useState<{
        course: { _id: string; titulo: string; imagenCurso?: string };
        progress: Progress;
    }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoursesProgress = async () => {
            try {
                setLoading(true);
                const progress = await getUserCoursesProgress();
                setCoursesProgress(progress);
                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error al cargar el progreso de los cursos');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCoursesProgress();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Mi Panel de Aprendizaje</h1>
                        <p className="text-gray-600">
                            Bienvenido, {user?.nombre || 'Estudiante'}. Continúa tu aprendizaje donde lo dejaste.
                        </p>
                    </div>
                    <Link
                        to="/courses"
                        className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                    >
                        Explorar cursos
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                ) : coursesProgress.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No estás inscrito en ningún curso</h3>
                        <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra cursos que te interesen</p>
                        <Link
                            to="/courses"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
                        >
                            Ver cursos disponibles
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Sección de cursos en progreso */}
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold mb-4">Mis cursos en progreso</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coursesProgress.map((item) => (
                                    <CourseProgressCard
                                        key={item.progress._id}
                                        course={item.course}
                                        progress={item.progress}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Resto del código... */}
                    </>
                )}
            </div>
        </div>
    );
};

// Componente auxiliar para mostrar la tarjeta de progreso
const CourseProgressCard: React.FC<{
    course: { _id: string; titulo: string; imagenCurso?: string };
    progress: Progress;
}> = ({ course, progress }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    };

    // Example usage of formatDate
    const formattedDate = formatDate(new Date());
    console.log('Formatted Date:', formattedDate);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-40 overflow-hidden relative">
                <img
                    src={course.imagenCurso || 'https://via.placeholder.com/640x360?text=CursifyNova'}
                    alt={course.titulo}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                    {Math.round(progress.porcentajeCompletado)}% completado
                </div>
            </div>
            {/* Resto del código... */}
        </div>
    );
};

export default StudentDashboard;