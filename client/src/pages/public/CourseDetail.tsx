// src/pages/public/CourseDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, enrollInCourse} from '../../api/courses';
import { useAuth } from '../../contexts/AuthContext';
import type { Module} from '../../api/modules';
import type { Lesson } from '../../api/lessons';
import type { Course } from '../../api/courses'; // Asegúrate de que esta interfaz Course esté actualizada

// Interfaces para tipos específicos del detalle del curso
interface CourseAuthor {
    _id: string; // El _id del autor (como string)
    nombre: string;
    username: string;
    avatarUrl?: string; // Hacemos avatarUrl opcional
    titulo?: string;
    biografia?: string;
    calificacion?: number; // Calificación del instructor
    cursos?: number; // Cantidad de cursos del instructor
    estudiantes?: number; // Cantidad de estudiantes del instructor
}

interface CourseWithDetails extends Course {
    modulos?: (Module & { lecciones?: Lesson[] })[];
    objetivos?: string[];
    requisitos?: string[];
    descripcionDetallada?: string;
}

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState<CourseWithDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolling, setEnrolling] = useState<boolean>(false);
    const [enrollmentSuccess, setEnrollmentSuccess] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('contenido');

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) {
                setError('ID del curso no proporcionado.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getCourseById(id);
                setCourse(data as CourseWithDetails);
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
            await enrollInCourse(id!);
            setEnrollmentSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al inscribirse en el curso');
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

    const isAuthor = () => {
        return user && course.autor && user.id === course.autor._id;
    };

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const author = course.autor;
    const authorAvatar = author?.avatarUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=U';
    const authorName = author?.nombre || 'Instructor Desconocido';
    const authorTitle = author?.titulo || 'Instructor';

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-2/3 mb-6 lg:mb-0 lg:pr-8">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.titulo}</h1>
                            <p className="text-lg mb-4">{course.descripcion}</p>
                            <div className="flex flex-wrap items-center mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 
                                ${course.nivel === 'principiante' ? 'bg-green-200 text-green-800' :
                                        course.nivel === 'intermedio' ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-red-200 text-red-800'}`}>
                                    {course.nivel.charAt(0).toUpperCase() + course.nivel.slice(1)}
                                </span>
                                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium mr-2 mb-2">
                                    {course.duracionEstimada}
                                </span>
                                {course.valoracion !== undefined && (
                                    <span className="flex items-center px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium mb-2">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {course.valoracion.toFixed(1)} ({course.numValoraciones || 0})
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center mb-6">
                                <img
                                    src={authorAvatar}
                                    alt={authorName}
                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/aabbcc/ffffff?text=U'; }}
                                />
                                <div>
                                    <p className="font-medium">Instructor: {authorName}</p>
                                    <p className="text-sm text-blue-200">
                                        {authorTitle}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {course.etiquetas && course.etiquetas.map((tag: string, index: number) => (
                                    <span key={index} className="bg-blue-700 px-3 py-1 rounded text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm">
                                Publicado el {formatDate(course.fechaCreacion || new Date())}
                                {course.fechaActualizacion && formatDate(course.fechaActualizacion) !== formatDate(course.fechaCreacion) &&
                                    ` • Actualizado el ${formatDate(course.fechaActualizacion)}`}
                            </p>
                        </div>
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <img
                                    src={course.imagenCurso || 'https://via.placeholder.com/500x300?text=CursifyNova'}
                                    alt={course.titulo}
                                    className="w-full h-auto rounded-md mb-4"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/500x300/dddddd/333333?text=Imagen+no+disponible'; }}
                                />
                                <div className="text-gray-800 text-center">
                                    <p className="text-3xl font-bold mb-4 flex items-center justify-center">
                                        {course.premium ? (
                                            course.precio !== undefined && course.precio > 0 ? (
                                                `$${course.precio.toFixed(2)}`
                                            ) : (
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg">
                                                    Gratuito
                                                </span>
                                            )
                                        ) : (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg">
                                                Gratuito
                                            </span>
                                        )}
                                    </p>
                                    {isAuthor() ? (
                                        <div>
                                            <button
                                                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium mb-3"
                                                onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
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
            <div className="container mx-auto px-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('contenido')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contenido'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Contenido del curso
                        </button>
                        <button
                            onClick={() => setActiveTab('descripcion')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'descripcion'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Lo que aprenderás
                        </button>
                        <button
                            onClick={() => setActiveTab('instructor')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'instructor'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Instructor
                        </button>
                    </nav>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                {activeTab === 'contenido' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Contenido del curso</h2>
                        {course.modulos && course.modulos.length > 0 ? (
                            <div className="space-y-4">
                                {course.modulos.map((modulo, moduleIndex: number) => (
                                    <div key={modulo._id || moduleIndex} className="border border-gray-200 rounded-md overflow-hidden">
                                        <div className="bg-gray-100 p-4">
                                            <h3 className="font-medium">Módulo {moduleIndex + 1}: {modulo.titulo}</h3>
                                            {modulo.descripcion && <p className="text-sm text-gray-600 mt-1">{modulo.descripcion}</p>}
                                        </div>
                                        <ul className="divide-y divide-gray-200">
                                            {modulo.lecciones && modulo.lecciones.map((leccion, lessonIndex: number) => (
                                                <li key={leccion._id || lessonIndex} className="p-4 hover:bg-gray-50">
                                                    <div className="flex items-center">
                                                        <span className="mr-3 text-gray-500">{moduleIndex + 1}.{lessonIndex + 1}</span>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{leccion.titulo}</p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {leccion.tipo === 'video' ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                ) : leccion.tipo === 'texto' ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                )}
                                                            </svg>
                                                            <span className="text-sm text-gray-500">
                                                                {leccion.duracion || (leccion.duracionMinutos ? `${leccion.duracionMinutos} min` : '')}
                                                            </span>
                                                            <span className="ml-4 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                                                                {leccion.esGratis ? "Gratuita" : "Premium"}
                                                            </span>
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
                )}
                {activeTab === 'descripcion' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">¿Qué aprenderás en este curso?</h2>
                        {course.objetivos && course.objetivos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.objetivos.map((objetivo: string, index: number) => (
                                    <div key={index} className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span>{objetivo}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
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
                        )}
                        {course.requisitos && course.requisitos.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-medium mb-4">Requisitos previos</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {course.requisitos.map((requisito: string, index: number) => (
                                        <li key={index}>{requisito}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {course.descripcionDetallada && (
                            <div className="mt-8">
                                <h3 className="text-xl font-medium mb-4">Descripción detallada</h3>
                                <div className="prose max-w-none">
                                    <p>{course.descripcionDetallada}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'instructor' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Sobre el instructor</h2>
                        <div className="flex flex-col md:flex-row items-start">
                            <div className="md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
                                <img
                                    src={authorAvatar}
                                    alt={authorName}
                                    className="w-32 h-32 rounded-full object-cover mb-3"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/aabbcc/ffffff?text=U'; }}
                                />
                                <h3 className="text-xl font-medium">{authorName}</h3>
                                <p className="text-gray-600">{authorTitle}</p>
                            </div>
                            <div className="md:w-3/4 md:pl-8">
                                {author?.biografia ? (
                                    <p className="text-gray-700 mb-6">{author.biografia}</p>
                                ) : (
                                    <p className="text-gray-700 mb-6">
                                        Instructor especializado en la materia con amplia experiencia en el área.
                                        Dedicado a crear contenido educativo de alta calidad para ayudar a los estudiantes
                                        a alcanzar sus metas de aprendizaje.
                                    </p>
                                )}
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="ml-1 text-sm">
                                        Valoración promedio de instructor: {author?.calificacion?.toFixed(1) || '4.8'}
                                    </span>
                                </div>
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="ml-1 text-sm">
                                        {author?.cursos || 1} curso{author?.cursos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="ml-1 text-sm">
                                        {author?.estudiantes || 0} estudiante{author?.estudiantes !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;
