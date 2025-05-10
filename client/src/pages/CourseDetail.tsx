import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, enrollCourse } from '../api/courses';
import { type Course } from '../api/courses';
import useAuth from '../hooks/useAuth';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolling, setEnrolling] = useState<boolean>(false);
    const [enrollmentSuccess, setEnrollmentSuccess] = useState<boolean>(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await getCourseById(id);
                setCourse(data);
                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error al obtener el curso');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/courses/${id}` } });
            return;
        }

        try {
            setEnrolling(true);
            await enrollCourse(id!);
            setEnrollmentSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error || "No se pudo cargar el curso"}
                </div>
                <button
                    onClick={() => navigate('/courses')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Volver a cursos
                </button>
            </div>
        );
    }

    // Función auxiliar para determinar si el usuario es autor del curso
    const isAuthor = () => {
        return user && user.id === course.autor._id;
    };

    // Función auxiliar para formatear la fecha
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header del curso */}
            <div className="bg-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-2/3 mb-6 lg:mb-0 lg:pr-8">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.titulo}</h1>

                            <p className="text-lg mb-4">
                                {course.descripcion}
                            </p>

                            <div className="flex items-center mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium mr-2 
                  ${course.nivel === 'principiante' ? 'bg-green-200 text-green-800' :
                                        course.nivel === 'intermedio' ? 'bg-blue-200 text-blue-800' :
                                            'bg-purple-200 text-purple-800'}`}>
                                    {course.nivel.charAt(0).toUpperCase() + course.nivel.slice(1)}
                                </span>
                                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                                    {course.duracionEstimada}
                                </span>
                            </div>

                            <div className="flex items-center mb-6">
                                <img
                                    src={course.autor.avatarUrl || 'https://via.placeholder.com/40'}
                                    alt={course.autor.nombre}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                    <p className="font-medium">Instructor: {course.autor.nombre}</p>
                                    <p className="text-sm text-blue-200">@{course.autor.username}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {course.etiquetas.map((tag, index) => (
                                    <span key={index} className="bg-blue-700 px-3 py-1 rounded text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="text-sm">
                                Publicado el {formatDate(course.fechaCreacion)}
                            </p>
                        </div>

                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <img
                                    src={course.imagenCurso || 'https://via.placeholder.com/500x300?text=CursifyNova'}
                                    alt={course.titulo}
                                    className="w-full h-auto rounded-md mb-4"
                                />

                                <div className="text-gray-800 text-center">
                                    <p className="text-3xl font-bold mb-4">
                                        {course.premium ? `Premium` : 'Gratuito'}
                                    </p>

                                    {isAuthor() ? (
                                        <div>
                                            <button
                                                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium mb-3"
                                                onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                                            >
                                                Editar curso
                                            </button>
                                            <p className="text-blue-600 text-sm">Eres el creador de este curso</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition disabled:bg-blue-400"
                                                onClick={handleEnroll}
                                                disabled={enrolling || enrollmentSuccess}
                                            >
                                                {enrolling ? 'Procesando...' : enrollmentSuccess ? '¡Inscrito!' : 'Inscribirse ahora'}
                                            </button>

                                            {enrollmentSuccess && (
                                                <p className="text-green-600 mt-2">¡Inscripción exitosa!</p>
                                            )}

                                            {course.premium && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Este es un curso premium con contenido exclusivo
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido del curso - Sección que simula los módulos */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">¿Qué aprenderás en este curso?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Dominar los conceptos fundamentales</span>
                        </div>
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Aplicar lo aprendido en proyectos reales</span>
                        </div>
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Desarrollar habilidades prácticas</span>
                        </div>
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Obtener un certificado al finalizar</span>
                        </div>
                    </div>
                </div>

                {/* Contenido real del curso */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Contenido del curso</h2>

                    {course.modulos && course.modulos.length > 0 ? (
                        <div className="space-y-4">
                            {course.modulos.map((modulo, moduleIndex) => (
                                <div key={moduleIndex} className="border border-gray-200 rounded-md overflow-hidden">
                                    <div className="bg-gray-100 p-4">
                                        <h3 className="font-medium">Módulo {moduleIndex + 1}: {modulo.titulo}</h3>
                                        {modulo.descripcion && <p className="text-sm text-gray-600 mt-1">{modulo.descripcion}</p>}
                                    </div>
                                    <ul className="divide-y divide-gray-200">
                                        {modulo.lecciones.map((leccion, lessonIndex) => (
                                            <li key={lessonIndex} className="p-4 hover:bg-gray-50">
                                                <div className="flex items-center">
                                                    <span className="mr-3 text-gray-500">{moduleIndex + 1}.{lessonIndex + 1}</span>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{leccion.titulo}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className={`w-5 h-5 mr-1 text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {leccion.tipo === 'video' ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            ) : leccion.tipo === 'texto' ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            )}
                                                        </svg>
                                                        <span className="text-sm text-gray-500">{leccion.duracion}</span>

                                                        {isAuthenticated ? (
                                                            <button
                                                                onClick={() => navigate(`/courses/${course._id}/lessons/${leccion._id}`)}
                                                                className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                            >
                                                                Ver
                                                            </button>
                                                        ) : (
                                                            <span className="ml-4 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                                                                {leccion.esGratis ? "Gratuita" : "Premium"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Este curso aún no tiene contenido disponible.</p>
                    )}
                </div>

                {/* Sobre el instructor */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">Sobre el instructor</h2>

                    <div className="flex flex-col md:flex-row items-start">
                        <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                            <img
                                src={course.autor.avatarUrl || 'https://via.placeholder.com/150'}
                                alt={course.autor.nombre}
                                className="w-32 h-32 rounded-full object-cover"
                            />
                            <h3 className="text-xl font-medium mt-3">{course.autor.nombre}</h3>
                            <p className="text-gray-600">@{course.autor.username}</p>
                        </div>

                        <div className="md:w-3/4 md:pl-8">
                            <p className="text-gray-700">{course.autor.biografia || 'Este instructor está compartiendo su conocimiento en CursifyNova. No tiene una biografía detallada todavía.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;