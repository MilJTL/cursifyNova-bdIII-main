// src/pages/InstructorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getInstructorCourses } from '../../api/courses'; // Asegúrate de crear esta función

interface InstructorCourse {
    _id: string;
    titulo: string;
    descripcion: string;
    fechaCreacion: Date;
    estudiantes: number;
    calificacion: number;
    imagenCurso?: string;
}

const InstructorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const data = await getInstructorCourses();
                setCourses(data);
                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error al cargar los cursos');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Panel de Instructor</h1>
                        <p className="text-gray-600">
                            Bienvenido, {user?.nombre}. Administra tus cursos y contenido.
                        </p>
                    </div>
                    <Link
                        to="/instructor/courses/new"
                        className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                    >
                        Crear nuevo curso
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
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No has creado ningún curso aún</h3>
                        <p className="text-gray-600 mb-6">Comienza creando tu primer curso para compartir tu conocimiento</p>
                        <Link
                            to="/instructor/courses/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
                        >
                            Crear mi primer curso
                        </Link>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Mis cursos</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="py-3 px-4 text-left">Curso</th>
                                        <th className="py-3 px-4 text-left">Estudiantes</th>
                                        <th className="py-3 px-4 text-left">Calificación</th>
                                        <th className="py-3 px-4 text-left">Fecha</th>
                                        <th className="py-3 px-4 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {courses.map(course => (
                                        <tr key={course._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={course.imagenCurso || 'https://via.placeholder.com/40'}
                                                        alt={course.titulo}
                                                        className="w-10 h-10 rounded object-cover mr-3"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{course.titulo}</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                            {course.descripcion}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {course.estudiantes}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-500 mr-1">★</span>
                                                    {course.calificacion.toFixed(1)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {new Date(course.fechaCreacion).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/instructor/courses/${course._id}/edit`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <Link
                                                        to={`/instructor/courses/${course._id}/content`}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Contenido
                                                    </Link>
                                                    <Link
                                                        to={`/instructor/courses/${course._id}/analytics`}
                                                        className="text-purple-600 hover:text-purple-800"
                                                    >
                                                        Estadísticas
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Estadísticas rápidas */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-medium text-gray-500 mb-2">Total de estudiantes</h3>
                        <p className="text-3xl font-bold">
                            {courses.reduce((sum, course) => sum + course.estudiantes, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-medium text-gray-500 mb-2">Calificación promedio</h3>
                        <p className="text-3xl font-bold flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {courses.length
                                ? (courses.reduce((sum, course) => sum + course.calificacion, 0) / courses.length).toFixed(1)
                                : '0.0'}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-medium text-gray-500 mb-2">Cursos publicados</h3>
                        <p className="text-3xl font-bold">{courses.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;