import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCourses, type Course } from '../../api/courses';
import { getStudentProgress } from '../../api/progress';
import CourseCard from '../../components/courses/CourseCard';

interface CourseWithProgress extends Course {
    progress?: number;
    lastAccessed?: Date; // Si viene como Date, si no, string
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);

                // Obtener cursos en los que está inscrito el estudiante
                // Asumiendo que getCourses({ enrolled: true }) devuelve cursos con 'id'
                const enrolledCoursesData = await getCourses({ enrolled: true });

                // Obtener progreso para cada curso
                const coursesWithProgress: CourseWithProgress[] = [];

                for (const course of enrolledCoursesData) {
                    try {
                        // <--- ¡AQUÍ LA CORRECCIÓN! Usar course.id
                        const progressData = await getStudentProgress(course.id); 
                        coursesWithProgress.push({
                            ...course,
                            progress: progressData.progressPercentage,
                            lastAccessed: progressData.lastAccessed ? new Date(progressData.lastAccessed) : undefined
                        });
                    } catch (err) {
                        // Log más detallado del error
                        console.error(`Error obteniendo progreso para el curso ${course.id}:`, err);
                        coursesWithProgress.push(course); // Añadir el curso incluso si el progreso falla
                    }
                }

                // Ordenar por último acceso (más reciente primero)
                coursesWithProgress.sort((a, b) => {
                    // Asegurarse de que lastAccessed sea un objeto Date antes de llamar a getTime()
                    const aTime = a.lastAccessed instanceof Date ? a.lastAccessed.getTime() : 0;
                    const bTime = b.lastAccessed instanceof Date ? b.lastAccessed.getTime() : 0;
                    return bTime - aTime;
                });

                setEnrolledCourses(coursesWithProgress);

                // Obtener cursos recomendados basados en intereses o cursos populares
                const recommendedCoursesData = await getCourses({
                    limit: 4,
                    recommended: true
                });
                setRecommendedCourses(recommendedCoursesData);

                setError(null);
            } catch (err) {
                console.error('Error cargando datos del estudiante:', err);
                setError('No se pudieron cargar tus cursos. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Aprendizaje</h1>
                    <p className="text-gray-600 mt-2">
                        Bienvenido de nuevo, {user?.nombre}. Continúa desde donde lo dejaste.
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link
                        to="/courses"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Explorar más cursos
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    {error}
                </div>
            ) : (
                <>
                    {/* Cursos inscritos */}
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-6">Mis cursos</h2>

                        {enrolledCourses.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <img
                                    src="/src/assets/images/empty-courses.svg"
                                    alt="No hay cursos"
                                    className="w-40 h-40 mx-auto mb-4"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/160?text=No+Courses';
                                    }}
                                />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No estás inscrito en ningún curso</h3>
                                <p className="text-gray-600 mb-4">
                                    Explora nuestro catálogo y encuentra cursos que te interesen.
                                </p>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Ver cursos disponibles
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrolledCourses.map(course => (
                                    // <--- ¡AQUÍ LA CORRECCIÓN! Usar course.id
                                    <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                                        {/* <--- ¡AQUÍ LA CORRECCIÓN! Usar course.id */}
                                        <Link to={`/student/courses/${course.id}`}>
                                            <div className="h-40 bg-gray-300 relative">
                                                {course.imagenCurso ? (
                                                    <img
                                                        src={course.imagenCurso}
                                                        alt={course.titulo}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/400x240?text=Curso';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                        <span className="text-xl font-medium">{course.titulo.substring(0, 2)}</span>
                                                    </div>
                                                )}

                                                {/* Badge para cursos premium */}
                                                {course.premium && (
                                                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded">
                                                        PREMIUM
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-1">{course.titulo}</h3>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {course.autor?.nombre || 'Instructor'}
                                                </p>

                                                {/* Barra de progreso */}
                                                <div className="mb-2">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Progreso</span>
                                                        <span className="font-medium">{course.progress || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${course.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <span className="inline-flex items-center text-xs text-blue-600 font-medium">
                                                        {course.progress === 0 ? 'Comenzar curso' : 'Continuar aprendiendo'}
                                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cursos recomendados */}
                    {recommendedCourses.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Recomendado para ti</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {recommendedCourses.map(course => (
                                    // <--- ¡AQUÍ LA CORRECCIÓN! Usar course.id
                                    <CourseCard key={course.id} course={{ ...course, duracionEstimada: course.duracionEstimada || 'No especificado' }} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
