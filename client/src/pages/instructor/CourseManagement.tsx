import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, deleteCourse, toggleCoursePublishStatus, type Course } from '../../api/courses';
import { getModulesByCourse,type Module, createModule, updateModule, deleteModule } from '../../api/modules';
import { getLessonsByModule, type Lesson, createLesson, updateLesson, deleteLesson } from '../../api/lessons';
import ModuleForm from '../../components/instructor/ModuleForm';
import LessonForm from '../../components/instructor/LessonForm';

const CourseManagement: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estados para formularios
    //const [showCourseForm, setShowCourseForm] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

    // Estado para confirmar eliminaciones
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        type: 'course' | 'module' | 'lesson';
        id: string;
        name: string;
    } | null>(null);

    useEffect(() => {
        const loadCourseData = async () => {
            if (!courseId) return;

            try {
                setIsLoading(true);

                // Cargar datos del curso
                const courseData = await getCourseById(courseId);
                setCourse(courseData);

                // Cargar módulos del curso
                const modulesData = await getModulesByCourse(courseId);
                setModules(modulesData);

                setError(null);
            } catch (err) {
                console.error('Error cargando datos del curso:', err);
                setError('No se pudieron cargar los datos del curso');
            } finally {
                setIsLoading(false);
            }
        };

        loadCourseData();
    }, [courseId]);

    const handleModuleExpand = async (moduleId: string) => {
        // Si el módulo ya está expandido, contraerlo
        if (expandedModuleId === moduleId) {
            setExpandedModuleId(null);
            return;
        }

        // Expandir el módulo
        setExpandedModuleId(moduleId);

        // Cargar lecciones si aún no se han cargado
        const module = modules.find(m => m._id === moduleId);
        if (module && !module.lecciones) {
            try {
                const lessonsData = await getLessonsByModule(moduleId);

                // Actualizar el módulo con las lecciones cargadas
                setModules(prev =>
                    prev.map(m =>
                        m._id === moduleId
                            ? { ...m, lecciones: lessonsData }
                            : m
                    )
                );
            } catch (err) {
                console.error(`Error cargando lecciones para el módulo ${moduleId}:`, err);
            }
        }
    };

    const handlePublishToggle = async () => {
        if (!course) return;

        try {
            const updatedCourse = await toggleCoursePublishStatus(course._id, !course.publicado);
            setCourse(updatedCourse);
            setSuccess(`Curso ${updatedCourse.publicado ? 'publicado' : 'despublicado'} exitosamente`);

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al cambiar estado de publicación:', err);
            setError('No se pudo cambiar el estado de publicación');

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleAddModule = async (moduleData: Partial<Module>) => {
        if (!courseId) return;

        try {
            // Determinar el nuevo índice para el módulo
            const ordenIndice = modules.length > 0
                ? Math.max(...modules.map(m => m.ordenIndice)) + 1
                : 0;

            // Crear nuevo módulo
            const newModule = await createModule({
                ...moduleData,
                cursoId: courseId,
                ordenIndice
            });

            // Actualizar lista de módulos
            setModules(prev => [...prev, newModule]);
            setShowModuleForm(false);
            setSuccess('Módulo creado exitosamente');

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al crear módulo:', err);
            setError('No se pudo crear el módulo');

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleEditModule = async (moduleData: Partial<Module>) => {
        if (!editingModule) return;

        try {
            // Actualizar módulo
            const updatedModule = await updateModule(editingModule._id, moduleData);

            // Actualizar lista de módulos
            setModules(prev =>
                prev.map(m => m._id === updatedModule._id ? updatedModule : m)
            );

            setEditingModule(null);
            setShowModuleForm(false);
            setSuccess('Módulo actualizado exitosamente');

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al actualizar módulo:', err);
            setError('No se pudo actualizar el módulo');

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleAddLesson = async (lessonData: Partial<Lesson>) => {
        if (!currentModuleId) return;

        try {
            // Determinar el nuevo índice para la lección
            const currentModule = modules.find(m => m._id === currentModuleId);
            const lecciones = currentModule?.lecciones || [];
            const ordenIndice = lecciones.length > 0
                ? Math.max(...lecciones.map(l => l.ordenIndice)) + 1
                : 0;

            // Crear nueva lección
            const newLesson = await createLesson({
                ...lessonData,
                moduloId: currentModuleId,
                ordenIndice
            });

            // Actualizar lista de módulos con la nueva lección
            setModules(prev =>
                prev.map(m =>
                    m._id === currentModuleId
                        ? {
                            ...m,
                            lecciones: [...(m.lecciones || []), newLesson]
                        }
                        : m
                )
            );

            setShowLessonForm(false);
            setSuccess('Lección creada exitosamente');

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al crear lección:', err);
            setError('No se pudo crear la lección');

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleEditLesson = async (lessonData: Partial<Lesson>) => {
        if (!editingLesson || !currentModuleId) return;

        try {
            // Actualizar lección
            const updatedLesson = await updateLesson(editingLesson._id, lessonData);

            // Actualizar lista de módulos y lecciones
            setModules(prev =>
                prev.map(m =>
                    m._id === currentModuleId
                        ? {
                            ...m,
                            lecciones: (m.lecciones || []).map(l =>
                                l._id === updatedLesson._id ? updatedLesson : l
                            )
                        }
                        : m
                )
            );

            setEditingLesson(null);
            setShowLessonForm(false);
            setSuccess('Lección actualizada exitosamente');

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al actualizar lección:', err);
            setError('No se pudo actualizar la lección');

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        }
    };

    const confirmDelete = (type: 'course' | 'module' | 'lesson', id: string, name: string) => {
        setDeleteConfirmation({ type, id, name });
    };

    const handleDelete = async () => {
        if (!deleteConfirmation) return;

        const { type, id } = deleteConfirmation;

        try {
            if (type === 'course' && courseId) {
                await deleteCourse(courseId);
                navigate('/admin/dashboard');
                return;
            }

            if (type === 'module') {
                await deleteModule(id);

                // Actualizar lista de módulos
                setModules(prev => prev.filter(m => m._id !== id));
                setSuccess('Módulo eliminado exitosamente');
            }

            if (type === 'lesson' && currentModuleId) {
                await deleteLesson(id);

                // Actualizar lista de módulos y lecciones
                setModules(prev =>
                    prev.map(m =>
                        m._id === currentModuleId
                            ? {
                                ...m,
                                lecciones: (m.lecciones || []).filter(l => l._id !== id)
                            }
                            : m
                    )
                );

                setSuccess('Lección eliminada exitosamente');
            }

            // Limpiar mensaje después de unos segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(`Error al eliminar ${type}:`, err);
            setError(`No se pudo eliminar ${type === 'course' ? 'el curso' : type === 'module' ? 'el módulo' : 'la lección'}`);

            // Limpiar mensaje de error
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeleteConfirmation(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p>No se encontró el curso o no tienes permisos para gestionarlo.</p>
                </div>
                <div className="mt-4">
                    <Link
                        to="/admin/dashboard"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to="/admin/dashboard"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al dashboard
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                    <p>{success}</p>
                </div>
            )}

            {/* Header del curso con acciones */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{course.titulo}</h1>
                        <div className="flex items-center mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${course.publicado
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {course.publicado ? 'Publicado' : 'Borrador'}
                            </span>

                            <span className="mx-2 text-gray-300">|</span>

                            <span className="text-sm text-gray-500">
                                {course.estudiantes || 0} estudiantes inscritos
                            </span>

                            {course.valoracion && (
                                <>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm text-gray-500">{course.valoracion.toFixed(1)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <Link
                            to={`/admin/courses/${course._id}/edit`}
                            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Editar información
                        </Link>

                        <button
                            onClick={handlePublishToggle}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${course.publicado
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {course.publicado ? 'Despublicar' : 'Publicar curso'}
                        </button>

                        <button
                            onClick={() => confirmDelete('course', course._id, course.titulo)}
                            className="bg-white border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Eliminar curso
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido del curso (Módulos y lecciones) */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Contenido del curso</h2>
                    <button
                        onClick={() => {
                            setEditingModule(null);
                            setShowModuleForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo módulo
                    </button>
                </div>

                {modules.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay módulos en este curso</h3>
                        <p className="text-gray-500 mb-6">Comienza agregando módulos para organizar el contenido de tu curso.</p>
                        <button
                            onClick={() => {
                                setEditingModule(null);
                                setShowModuleForm(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Crear el primer módulo
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {modules.map((module, index) => (
                            <div
                                key={module._id}
                                className={`border-b border-gray-200 ${index === modules.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <div
                                    className={`px-4 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${expandedModuleId === module._id ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleModuleExpand(module._id)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-3 font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{module.titulo}</h3>
                                            {module.lecciones && (
                                                <p className="text-xs text-gray-500">
                                                    {module.lecciones.length} {module.lecciones.length === 1 ? 'lección' : 'lecciones'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingModule(module);
                                                setShowModuleForm(true);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 mr-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete('module', module._id, module.titulo);
                                            }}
                                            className="text-gray-500 hover:text-red-600 mr-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>

                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedModuleId === module._id ? 'transform rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Lecciones del módulo expandido */}
                                {expandedModuleId === module._id && (
                                    <div className="bg-gray-50 p-4">
                                        {module.lecciones && module.lecciones.length > 0 ? (
                                            <div className="mb-4 space-y-2">
                                                {module.lecciones.map((lesson, lessonIndex) => (
                                                    <div
                                                        key={lesson._id}
                                                        className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-3 text-xs font-medium">
                                                                {lessonIndex + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">{lesson.titulo}</h4>
                                                                <div className="flex items-center text-xs text-gray-500">
                                                                    <span className={`mr-2 px-1.5 py-0.5 rounded ${lesson.tipo === 'video' ? 'bg-blue-100 text-blue-800' :
                                                                            lesson.tipo === 'quiz' ? 'bg-purple-100 text-purple-800' :
                                                                                'bg-green-100 text-green-800'
                                                                        }`}>
                                                                        {lesson.tipo === 'video' ? 'Video' :
                                                                            lesson.tipo === 'quiz' ? 'Quiz' : 'Texto'}
                                                                    </span>
                                                                    {lesson.duracionMinutos && (
                                                                        <span>{lesson.duracionMinutos} min</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingLesson(lesson);
                                                                    setCurrentModuleId(module._id);
                                                                    setShowLessonForm(true);
                                                                }}
                                                                className="text-gray-500 hover:text-blue-600 mr-3"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                onClick={() => confirmDelete('lesson', lesson._id, lesson.titulo)}
                                                                className="text-gray-500 hover:text-red-600"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500 mb-2">Este módulo no tiene lecciones aún</p>
                                            </div>
                                        )}

                                        {/* Botón para añadir lección */}
                                        <button
                                            onClick={() => {
                                                setEditingLesson(null);
                                                setCurrentModuleId(module._id);
                                                setShowLessonForm(true);
                                            }}
                                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Añadir lección
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para confirmar eliminación */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Confirmar eliminación
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                ¿Estás seguro de que deseas eliminar
                                                {deleteConfirmation.type === 'course' ? ' este curso?' :
                                                    deleteConfirmation.type === 'module' ? ' este módulo?' :
                                                        ' esta lección?'}
                                                <br /><strong>"{deleteConfirmation.name}"</strong>
                                                <br />
                                                Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario de módulo (Modal) */}
            {showModuleForm && (
                <ModuleForm
                    module={editingModule}
                    onSubmit={editingModule ? handleEditModule : handleAddModule}
                    onCancel={() => {
                        setShowModuleForm(false);
                        setEditingModule(null);
                    }}
                />
            )}

            {/* Formulario de lección (Modal) */}
            {showLessonForm && (
                <LessonForm
                    lesson={editingLesson}
                    onSubmit={editingLesson ? handleEditLesson : handleAddLesson}
                    onCancel={() => {
                        setShowLessonForm(false);
                        setEditingLesson(null);
                        setCurrentModuleId(null);
                    }}
                />
            )}
        </div>
    );
};

export default CourseManagement;