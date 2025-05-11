import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courses';
import type { Course, Module, Lesson } from '../../api/courses';

const ManageCourseContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModuleForm, setShowModuleForm] = useState<boolean>(false);
    const [showLessonForm, setShowLessonForm] = useState<string | null>(null);

    // Estados para formularios
    const [moduleForm, setModuleForm] = useState({
        titulo: '',
        descripcion: ''
    });

    const [lessonForm, setLessonForm] = useState({
        titulo: '',
        contenido: '',
        tipo: 'texto' as 'video' | 'texto' | 'quiz',
        duracion: '',
        videoUrl: '',
        esGratis: true
    });

    useEffect(() => {
        if (!id) return;

        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const courseData = await getCourseById(id);
                setCourse(courseData);
            } catch (err) {
                console.error('Error fetching course:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar el curso');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    const handleModuleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setModuleForm({
            ...moduleForm,
            [name]: value
        });
    };

    const handleLessonFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        setLessonForm({
            ...lessonForm,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleAddModule = () => {
        // Aquí implementarías la lógica para añadir un módulo
        // En modo de simulación, simplemente actualizaríamos el estado local
        if (!course) return;

        const newModule: Module = {
            _id: `m${Date.now()}`,
            titulo: moduleForm.titulo,
            descripcion: moduleForm.descripcion,
            ordenIndice: course.modulos ? course.modulos.length : 0,
            lecciones: []
        };

        const updatedCourse = {
            ...course,
            modulos: course.modulos ? [...course.modulos, newModule] : [newModule]
        };

        setCourse(updatedCourse);
        setModuleForm({ titulo: '', descripcion: '' });
        setShowModuleForm(false);
    };

    const handleAddLesson = (moduleId: string) => {
        if (!course) return;

        const newLesson: Lesson = {
            _id: `l${Date.now()}`,
            titulo: lessonForm.titulo,
            contenido: lessonForm.contenido,
            tipo: lessonForm.tipo,
            duracion: lessonForm.duracion,
            ordenIndice: 0,
            videoUrl: lessonForm.tipo === 'video' ? lessonForm.videoUrl : undefined,
            esGratis: lessonForm.esGratis
        };

        const updatedModules = course.modulos?.map(module => {
            if (module._id === moduleId) {
                const lecciones = [...module.lecciones, newLesson];
                // Actualizar ordenIndice para la nueva lección
                newLesson.ordenIndice = lecciones.length - 1;
                return {
                    ...module,
                    lecciones
                };
            }
            return module;
        });

        setCourse({
            ...course,
            modulos: updatedModules || []
        });

        setLessonForm({
            titulo: '',
            contenido: '',
            tipo: 'texto',
            duracion: '',
            videoUrl: '',
            esGratis: true
        });

        setShowLessonForm(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Error</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">No se pudo cargar el curso.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Volver a mis cursos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{course.titulo}</h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Administra el contenido de tu curso
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button
                                onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar curso
                            </button>
                            <button
                                onClick={() => navigate('/instructor/courses')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver a mis cursos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenido del curso */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Estructura del curso</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Organiza tus módulos y lecciones. Arrastra y suelta para reordenarlos.
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Botón para agregar módulos siempre visible */}
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={() => setShowModuleForm(true)}
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Añadir nuevo módulo
                            </button>
                        </div>

                        {/* Formulario para añadir módulo */}
                        {showModuleForm && (
                            <div className="bg-gray-50 p-4 mb-6 rounded-md border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Añadir nuevo módulo</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="module-title" className="block text-sm font-medium text-gray-700">
                                            Título del módulo
                                        </label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            id="module-title"
                                            value={moduleForm.titulo}
                                            onChange={handleModuleFormChange}
                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="module-description" className="block text-sm font-medium text-gray-700">
                                            Descripción (opcional)
                                        </label>
                                        <textarea
                                            id="module-description"
                                            name="descripcion"
                                            rows={3}
                                            value={moduleForm.descripcion}
                                            onChange={handleModuleFormChange}
                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModuleForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddModule}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            disabled={!moduleForm.titulo}
                                        >
                                            Guardar módulo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Si no hay módulos, mostrar mensaje */}
                        {(!course.modulos || course.modulos.length === 0) && !showModuleForm && (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No hay módulos</h3>
                                <p className="mt-1 text-sm text-gray-500">Comienza creando el primer módulo para tu curso</p>
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModuleForm(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Crear primer módulo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Listado de módulos */}
                        {course.modulos && course.modulos.length > 0 && (
                            <div className="space-y-8">
                                {course.modulos.map((module) => (
                                    <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{module.titulo}</h3>
                                                {module.descripcion && (
                                                    <p className="text-sm text-gray-500">{module.descripcion}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLessonForm(module._id)}
                                                    className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                                                    title="Añadir lección"
                                                >
                                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                                                    title="Editar módulo"
                                                >
                                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                                                    title="Eliminar módulo"
                                                >
                                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Formulario para añadir lección */}
                                        {showLessonForm === module._id && (
                                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-3">Añadir nueva lección</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700">
                                                            Título de la lección
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="titulo"
                                                            id="lesson-title"
                                                            value={lessonForm.titulo}
                                                            onChange={handleLessonFormChange}
                                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="lesson-type" className="block text-sm font-medium text-gray-700">
                                                            Tipo de lección
                                                        </label>
                                                        <select
                                                            id="lesson-type"
                                                            name="tipo"
                                                            value={lessonForm.tipo}
                                                            onChange={handleLessonFormChange}
                                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        >
                                                            <option value="texto">Texto</option>
                                                            <option value="video">Video</option>
                                                            <option value="quiz">Quiz</option>
                                                        </select>
                                                    </div>

                                                    {lessonForm.tipo === 'video' && (
                                                        <div>
                                                            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700">
                                                                URL del video
                                                            </label>
                                                            <input
                                                                type="url"
                                                                name="videoUrl"
                                                                id="video-url"
                                                                value={lessonForm.videoUrl}
                                                                onChange={handleLessonFormChange}
                                                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                                placeholder="https://www.youtube.com/embed/..."
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label htmlFor="lesson-content" className="block text-sm font-medium text-gray-700">
                                                            Contenido
                                                        </label>
                                                        <textarea
                                                            id="lesson-content"
                                                            name="contenido"
                                                            rows={4}
                                                            value={lessonForm.contenido}
                                                            onChange={handleLessonFormChange}
                                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700">
                                                            Duración estimada
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="duracion"
                                                            id="lesson-duration"
                                                            value={lessonForm.duracion}
                                                            onChange={handleLessonFormChange}
                                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                            placeholder="Ej: 15min"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex items-start">
                                                        <div className="flex items-center h-5">
                                                            <input
                                                                id="lesson-free"
                                                                name="esGratis"
                                                                type="checkbox"
                                                                checked={lessonForm.esGratis}
                                                                onChange={handleLessonFormChange}
                                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                        <div className="ml-3 text-sm">
                                                            <label htmlFor="lesson-free" className="font-medium text-gray-700">
                                                                Lección gratuita
                                                            </label>
                                                            <p className="text-gray-500">Las lecciones gratuitas serán accesibles sin inscripción previa.</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowLessonForm(null)}
                                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddLesson(module._id)}
                                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            disabled={!lessonForm.titulo || !lessonForm.contenido || !lessonForm.duracion}
                                                        >
                                                            Guardar lección
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Listado de lecciones */}
                                        <div className="divide-y divide-gray-200">
                                            {module.lecciones.map((lesson, index) => (
                                                <div key={lesson._id} className="px-4 py-4 hover:bg-gray-50 flex items-center justify-between">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                                            {index + 1}
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{lesson.titulo}</p>
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-xs font-medium mr-2 px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                                                    {lesson.tipo === 'video' ? 'Video' : lesson.tipo === 'quiz' ? 'Quiz' : 'Texto'}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{lesson.duracion}</span>
                                                                {lesson.esGratis && (
                                                                    <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">
                                                                        Gratis
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 flex space-x-2">
                                                        <button
                                                            type="button"
                                                            className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                                                            title="Editar lección"
                                                        >
                                                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                                                            title="Eliminar lección"
                                                        >
                                                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {module.lecciones.length === 0 && !showLessonForm && (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                    Este módulo no tiene lecciones.
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowLessonForm(module._id)}
                                                        className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                                                    >
                                                        Añade tu primera lección
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCourseContent;