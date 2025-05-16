import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, type Course } from '../../api/courses';
import { getModulesByCourse, type Module } from '../../api/modules';
import { getStudentProgress } from '../../api/progress';

interface ModuleProgress {
    moduleId: string;
    completed: number;
    total: number;
}

interface CourseProgress {
    courseId: string;
    overallProgress: number;
    moduleProgress: ModuleProgress[];
    timeSpent: number; // en segundos
    lastAccessed?: Date;
}

const StudentProgress: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [progress, setProgress] = useState<CourseProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProgressData = async () => {
            if (!courseId) return;

            try {
                setIsLoading(true);

                // Obtener datos del curso
                const courseData = await getCourseById(courseId);
                if (!courseData) {
                    setError('Curso no encontrado');
                    return;
                }
                setCourse(courseData);

                // Obtener módulos del curso - Usando getModulesByCourse en lugar de getModules
                const modulesData = await getModulesByCourse(courseId);
                setModules(modulesData);

                // Obtener datos de progreso del estudiante
                const progressData = await getStudentProgress(courseId);

                // Si la API devuelve un formato diferente, adaptamos los datos aquí
                // En caso que getStudentProgress no devuelva exactamente el formato CourseProgress
                const adaptedProgress: CourseProgress = {
                    courseId,
                    overallProgress: progressData.overallProgress || 0,
                    moduleProgress: progressData.moduleProgress || [],
                    timeSpent: progressData.timeSpent || 0,
                    lastAccessed: progressData.lastAccessed ? new Date(progressData.lastAccessed) : undefined
                };

                setProgress(adaptedProgress);
                setError(null);
            } catch (err) {
                console.error('Error cargando datos de progreso:', err);
                setError('No se pudieron cargar los datos de progreso. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgressData();
    }, [courseId]);

    // Función para formatear tiempo (segundos a formato hh:mm:ss)
    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        let result = '';
        if (hrs > 0) result += `${hrs}h `;
        result += `${mins}m`;
        return result;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !course || !progress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    {error || 'No se encontraron datos de progreso'}
                </div>
                <div className="mt-4">
                    <Link
                        to="/student/dashboard"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to={`/student/courses/${courseId}`}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al curso
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">{course.titulo}</h1>
            <p className="text-gray-600 mb-6">Tu progreso en este curso</p>

            {/* Resumen de progreso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Progreso general</h3>
                    <div className="flex items-end">
                        <span className="text-3xl font-bold text-blue-600">{progress.overallProgress}%</span>
                        <span className="ml-2 text-gray-600">completado</span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress.overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tiempo dedicado</h3>
                    <div className="flex items-end">
                        <span className="text-3xl font-bold text-green-600">{formatTime(progress.timeSpent)}</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                        Sigue adelante, cada minuto cuenta para tu aprendizaje
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Último acceso</h3>
                    <div className="flex items-end">
                        <span className="text-2xl font-bold text-indigo-600">
                            {progress.lastAccessed ? new Date(progress.lastAccessed).toLocaleDateString() : 'Nunca'}
                        </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                        {progress.lastAccessed
                            ? `Hace ${Math.floor((new Date().getTime() - progress.lastAccessed.getTime()) / 86400000)} días`
                            : 'No has accedido al curso aún'
                        }
                    </p>
                </div>
            </div>

            {/* Progreso por módulo */}
            <h2 className="text-2xl font-bold mb-6">Progreso por módulo</h2>

            {modules.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {modules.map((module, index) => {
                        // Buscar progreso para este módulo
                        const moduleProgressData = progress.moduleProgress.find(p => p.moduleId === module._id);
                        const progressPercentage = moduleProgressData
                            ? Math.round((moduleProgressData.completed / moduleProgressData.total) * 100)
                            : 0;

                        return (
                            <div key={module._id} className={`${index > 0 ? 'border-t border-gray-200' : ''}`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">{module.titulo}</h3>
                                        <span className="text-sm font-medium">
                                            {moduleProgressData ? `${moduleProgressData.completed}/${moduleProgressData.total}` : '0/0'} lecciones
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${progressPercentage === 100 ? 'bg-green-600' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {progressPercentage === 100
                                            ? 'Completado'
                                            : progressPercentage > 0
                                                ? 'En progreso'
                                                : 'No iniciado'
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay módulos disponibles</h3>
                    <p className="text-gray-500">Este curso no tiene módulos configurados aún</p>
                </div>
            )}
        </div>
    );
};

export default StudentProgress;