// src/pages/student/StudentCourseView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseProgress, type Course } from '../../api/courses';
import { getModulesByCourse, type Module } from '../../api/modules';
import { getLessonsByModule, markLessonCompleted, type Lesson } from '../../api/lessons';
//import { updateLessonProgress } from '../../api/progress';
import {
    getCommentsByLesson,
    createComment,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply,
    type Comment,
    type Reply,
    type NewComment
} from '../../api/comments';
import {
    checkCertificateEligibility,
    generateCertificate
} from '../../api/certificates';

const StudentCourseView: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Estado para seguir el progreso
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [activeModuleId, setActiveModuleId] = useState<string>('');
    const [activeLessonId, setActiveLessonId] = useState<string>('');
    const [setCertificateEligible] = useState<boolean>(false);

    // Estados para comentarios
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editingReply, setEditingReply] = useState<{ commentId: string, replyId: string } | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);

    // Ref para el formulario de comentarios
    const commentFormRef = useRef<HTMLDivElement>(null);

    // Agrega este estado junto con los demás estados del componente
    const [certificateProgress, setCertificateProgress] = useState<{
        progress: number;
        completedLessons: number;
        totalLessons: number;
    } | null>(null);

    // Función para calcular el progreso para el certificado
    const calculateCertificateProgress = (completedLessonIds: string[], allLessons: Lesson[]) => {
        const totalLessons = allLessons.length;
        const completedLessons = completedLessonIds.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        setCertificateProgress({
            progress,
            completedLessons,
            totalLessons
        });

        // También actualizamos la elegibilidad para el certificado (normalmente 80% o más)
        if (progress >= 80) {
            setCertificateEligible(true);
        }
    };

    useEffect(() => {
        const fetchCourseData = async () => {
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

                // Obtener el progreso del estudiante (esto faltaba)
                // Usar la función getCourseProgress
                const progressData = await getCourseProgress(courseId);
                setCompletedLessons(progressData?.completedLessons || []);

                // Obtener módulos del curso
                const modulesData = await getModulesByCourse(courseId);
                setModules(modulesData);

                // Establecer módulo activo inicial (primer módulo)
                if (modulesData.length > 0) {
                    const firstModuleId = modulesData[0]._id;
                    setActiveModuleId(firstModuleId);

                    // Obtener lecciones del primer módulo
                    const lessonsData = await getLessonsByModule(firstModuleId);

                    // Guardar lecciones por módulo
                    setLessons(prev => ({
                        ...prev,
                        [firstModuleId]: lessonsData
                    }));

                    if (lessonsData.length > 0) {
                        // Establecer primera lección como activa
                        setActiveLessonId(lessonsData[0]._id);
                        setCurrentLesson(lessonsData[0]);

                        // Cargar comentarios de la primera lección
                        fetchComments(lessonsData[0]._id);
                    }
                }

                // Verificar si el estudiante es elegible para un certificado
                checkCertificateStatus(courseId);

                // Para calcular el progreso, primero reunimos todas las lecciones
                // Aquí estabas usando lessonsByModule que no existía
                const allLessons: Lesson[] = [];

                // Primero cargar todas las lecciones de todos los módulos
                for (const module of modulesData) {
                    const moduleLessons = await getLessonsByModule(module._id);
                    allLessons.push(...moduleLessons);
                }

                // Calcular el progreso para el certificado con las lecciones recopiladas
                calculateCertificateProgress(progressData?.completedLessons || [], allLessons);

                setError(null);
            } catch (err) {
                console.error('Error cargando datos del curso:', err);
                setError('No se pudieron cargar los datos del curso. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);



    // Sección para mostrar junto al botón de certificado

    // Modificar checkCertificateStatus para guardar la información de progreso
    const checkCertificateStatus = async (courseId: string) => {
        try {
            console.log("Verificando elegibilidad para certificado del curso:", courseId);
            const result = await checkCertificateEligibility(courseId);
            console.log("Respuesta completa de elegibilidad:", result);

            // Guardar el estado de elegibilidad
            setCertificateEligible(result.isEligible);

            // Si la respuesta incluye datos de progreso, podrías usarlos aquí si es necesario
            // Actualmente no se usan en la UI, por lo que no se almacenan
        } catch (err) {
            console.error('Error verificando elegibilidad para certificado:', err);
        }
    };

    const fetchComments = async (lessonId: string) => {
        if (!lessonId) return;

        try {
            setIsLoadingComments(true);
            const commentsData = await getCommentsByLesson(lessonId);
            setComments(commentsData);
        } catch (err) {
            console.error('Error cargando comentarios:', err);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const formatYoutubeUrl = (url: string | undefined): string => {
        if (!url) return '';

        // Si la URL ya está en formato de embed, usarla directamente
        if (url.includes('youtube.com/embed/')) {
            return url;
        }

        try {
            // Extraer el ID del video
            let videoId = '';

            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                videoId = urlObj.searchParams.get('v') || '';
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
            } else {
                // Si parece ser solo un ID de video, usarlo directamente
                const possibleId = url.trim();
                if (/^[a-zA-Z0-9_-]{11}$/.test(possibleId)) {
                    videoId = possibleId;
                }
            }

            if (videoId) {
                // Asegurar que se use https y que se añada cualquier parámetro adicional
                return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
            }
        } catch (error) {
            console.error('Error al procesar URL de YouTube:', error, url);
        }

        // En caso de error, intentar usar la URL directa como embed
        return `https://www.youtube.com/embed/${url.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    };

    const handleLessonSelect = async (moduleId: string, lessonId: string) => {
        try {
            // Verificar si ya tenemos las lecciones de este módulo
            if (!lessons[moduleId]) {
                // Si no, obtenerlas
                const lessonsData = await getLessonsByModule(moduleId);
                setLessons(prev => ({
                    ...prev,
                    [moduleId]: lessonsData
                }));
            }

            // Encontrar la lección seleccionada
            const selectedLesson = lessons[moduleId]?.find(lesson => lesson._id === lessonId) ||
                (await getLessonsByModule(moduleId)).find((lesson: Lesson) => lesson._id === lessonId);

            if (selectedLesson) {
                setCurrentLesson(selectedLesson);
                setActiveModuleId(moduleId);
                setActiveLessonId(lessonId);

                // Cargar comentarios de la lección seleccionada
                fetchComments(lessonId);

                // En móvil, cerrar sidebar después de seleccionar
                if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                }
            }
        } catch (err) {
            console.error('Error cargando lección:', err);
        }
    };

    const markLessonComplete = async () => {
        if (!currentLesson) return;

        try {
            // Usar solo markLessonCompleted de lessons.ts
            await markLessonCompleted(currentLesson._id);

            // Actualizar estado local
            setCompletedLessons(prev =>
                prev.includes(currentLesson._id) ? prev : [...prev, currentLesson._id]
            );

            // Verificar si el estudiante es elegible para un certificado
            if (courseId) {
                checkCertificateStatus(courseId);
            }

            // Mostrar mensaje de éxito
            alert('¡Lección marcada como completada!');
        } catch (err) {
            console.error('Error actualizando progreso:', err);
            alert('No se pudo marcar la lección como completada. Intenta de nuevo.');
        }
    };

    const handleGenerateCertificate = async () => {
        if (!courseId) return;

        try {
            const certificateUrl = await generateCertificate(courseId);
            if (certificateUrl && certificateUrl.downloadUrl) {
                window.open(certificateUrl.downloadUrl, '_blank');
            }
        } catch (err) {
            console.error('Error generando certificado:', err);
            alert('No se pudo generar el certificado. Intenta de nuevo más tarde.');
        }
    };

    // Función para encontrar la lección anterior y siguiente
    const findAdjacentLessons = () => {
        if (!currentLesson || !modules.length) return { prevLesson: null, nextLesson: null };

        let prevLesson = null;
        let nextLesson = null;

        // Encontrar el índice del módulo actual
        const currentModuleIndex = modules.findIndex(m => m._id === activeModuleId);
        if (currentModuleIndex === -1) return { prevLesson: null, nextLesson: null };

        // Obtener lecciones del módulo actual
        const currentModuleLessons = lessons[activeModuleId] || [];
        if (!currentModuleLessons.length) return { prevLesson: null, nextLesson: null };

        // Encontrar el índice de la lección actual
        const currentLessonIndex = currentModuleLessons.findIndex(l => l._id === activeLessonId);
        if (currentLessonIndex === -1) return { prevLesson: null, nextLesson: null };

        // Verificar si hay una lección anterior en el mismo módulo
        if (currentLessonIndex > 0) {
            prevLesson = {
                moduleId: activeModuleId,
                lessonId: currentModuleLessons[currentLessonIndex - 1]._id
            };
        }
        // Si no hay lección anterior en este módulo, buscar en el módulo anterior
        else if (currentModuleIndex > 0) {
            const prevModuleId = modules[currentModuleIndex - 1]._id;
            const prevModuleLessons = lessons[prevModuleId] || [];

            if (prevModuleLessons.length) {
                prevLesson = {
                    moduleId: prevModuleId,
                    lessonId: prevModuleLessons[prevModuleLessons.length - 1]._id
                };
            }
        }

        // Verificar si hay una lección siguiente en el mismo módulo
        if (currentLessonIndex < currentModuleLessons.length - 1) {
            nextLesson = {
                moduleId: activeModuleId,
                lessonId: currentModuleLessons[currentLessonIndex + 1]._id
            };
        }
        // Si no hay lección siguiente en este módulo, buscar en el módulo siguiente
        else if (currentModuleIndex < modules.length - 1) {
            const nextModuleId = modules[currentModuleIndex + 1]._id;
            const nextModuleLessons = lessons[nextModuleId] || [];

            if (nextModuleLessons.length) {
                nextLesson = {
                    moduleId: nextModuleId,
                    lessonId: nextModuleLessons[0]._id
                };
            }
        }

        return { prevLesson, nextLesson };
    };

    const { prevLesson, nextLesson } = findAdjacentLessons();

    const navigateToPrevLesson = () => {
        if (prevLesson) {
            handleLessonSelect(prevLesson.moduleId, prevLesson.lessonId);
        }
    };

    const navigateToNextLesson = () => {
        if (nextLesson) {
            handleLessonSelect(nextLesson.moduleId, nextLesson.lessonId);
        }
    };

    // Funciones para el manejo de comentarios
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentLesson || !newComment.trim()) return;

        try {
            const commentData: NewComment = { contenido: newComment.trim() };
            const createdComment = await createComment(currentLesson._id, commentData);

            if (createdComment) {
                setComments([createdComment, ...comments]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error al crear comentario:', error);
            alert('No se pudo publicar el comentario. Intenta de nuevo.');
        }
    };

    const handleSubmitReply = async (commentId: string) => {
        if (!replyContent.trim()) return;

        try {
            const replyData: Pick<Reply, 'contenido'> = { contenido: replyContent.trim() };
            const updatedComment = await addReply(commentId, replyData);

            if (updatedComment) {
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setReplyingTo(null);
                setReplyContent('');
            }
        } catch (error) {
            console.error('Error al añadir respuesta:', error);
            alert('No se pudo publicar la respuesta. Intenta de nuevo.');
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const commentData = { contenido: editContent.trim() };
            const updatedComment = await updateComment(commentId, commentData);

            if (updatedComment) {
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setEditingComment(null);
                setEditContent('');
            }
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            alert('No se pudo actualizar el comentario. Intenta de nuevo.');
        }
    };

    const handleUpdateReply = async (commentId: string, replyId: string) => {
        if (!editContent.trim()) return;

        try {
            const replyData = { contenido: editContent.trim() };
            const updatedComment = await updateReply(commentId, replyId, replyData);

            if (updatedComment) {
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setEditingReply(null);
                setEditContent('');
            }
        } catch (error) {
            console.error('Error al actualizar respuesta:', error);
            alert('No se pudo actualizar la respuesta. Intenta de nuevo.');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

        try {
            const success = await deleteComment(commentId);
            if (success) {
                setComments(comments.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            alert('No se pudo eliminar el comentario. Intenta de nuevo.');
        }
    };

    const handleDeleteReply = async (commentId: string, replyId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta respuesta?')) return;

        try {
            const updatedComment = await deleteReply(commentId, replyId);

            if (updatedComment) {
                // Usar type guard mejorado
                setComments(comments.map(c =>
                    c._id === commentId ? updatedComment as Comment : c
                ));
            }
        } catch (error) {
            console.error('Error al eliminar respuesta:', error);
            alert('No se pudo eliminar la respuesta. Intenta de nuevo.');
        }
    };

    const scrollToComments = () => {
        commentFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    {error || 'Curso no encontrado'}
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
        <div className="flex flex-col h-screen">
            {/* Cabecera con título del curso */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="mr-4 text-gray-500 hover:text-gray-700"
                            aria-label="Volver al dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">{course.titulo}</h1>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar/Contenido del curso */}
                <aside
                    className={`bg-gray-50 border-r border-gray-200 w-80 flex-shrink-0 overflow-y-auto transition-transform duration-300 transform 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
            fixed md:static inset-y-0 left-0 z-30 md:z-0 pt-16 md:pt-0`}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">Contenido del curso</h2>

                        {/* Botón de certificado o indicador de progreso - Siempre visible */}
                        <div className="mb-4">
                            <div className="p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-700 mb-2 font-medium">
                                    Progreso del certificado
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${certificateProgress ? certificateProgress.progress : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {certificateProgress ?
                                        `${certificateProgress.completedLessons} de ${certificateProgress.totalLessons} lecciones (${certificateProgress.progress}%)` :
                                        'Calculando progreso...'}
                                </p>
                            </div>

                            <button
                                onClick={handleGenerateCertificate}
                                className={`w-full mt-2 px-4 py-2 rounded-md flex items-center justify-center
                  ${certificateProgress && certificateProgress.progress >= 80
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-700 cursor-not-allowed'}`}
                                disabled={!certificateProgress || certificateProgress.progress < 80}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {certificateProgress && certificateProgress.progress >= 80
                                    ? 'Obtener Certificado'
                                    : 'Completa el 80% para obtener certificado'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modules.map((module) => (
                                <div key={module._id} className="border border-gray-200 rounded-md overflow-hidden">
                                    <div
                                        className={`px-4 py-3 font-medium flex justify-between items-center cursor-pointer
                      ${activeModuleId === module._id ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800'}`}
                                        onClick={() => setActiveModuleId(prev => prev === module._id ? '' : module._id)}
                                    >
                                        <span>{module.titulo}</span>
                                        <svg
                                            className={`w-5 h-5 transition-transform ${activeModuleId === module._id ? 'transform rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {activeModuleId === module._id && (
                                        <div className="bg-gray-50 py-1">
                                            {lessons[module._id]?.map((lesson) => (
                                                <div
                                                    key={lesson._id}
                                                    className={`px-4 py-2 flex items-center cursor-pointer 
                            ${activeLessonId === lesson._id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                                    onClick={() => handleLessonSelect(module._id, lesson._id)}
                                                >
                                                    {/* Indicador de completado */}
                                                    <div className="mr-2 flex-shrink-0">
                                                        {completedLessons.includes(lesson._id) ? (
                                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm truncate">{lesson.titulo}</span>

                                                    {/* Mostrar duración si está disponible */}
                                                    {lesson.duracionMinutos && (
                                                        <span className="ml-auto text-xs text-gray-500">
                                                            {lesson.duracionMinutos} min
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Contenido principal */}
                <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
                    {currentLesson ? (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">{currentLesson.titulo}</h2>
                                <div className="flex items-center text-sm text-gray-500">
                                    {currentLesson.duracionMinutos && (
                                        <span className="flex items-center mr-4">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {currentLesson.duracionMinutos} minutos
                                        </span>
                                    )}
                                    <span className="capitalize">
                                        Tipo: {currentLesson.tipo}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-8">
                                {currentLesson.tipo === 'video' ? (
                                    <div className="mb-4" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                        <iframe
                                            src={formatYoutubeUrl(currentLesson.contenido)}
                                            title={currentLesson.titulo}
                                            allowFullScreen
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            frameBorder="0"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: currentLesson.contenido || '' }}
                                    />
                                )}
                                {/* Recursos adicionales */}
                                {currentLesson.recursosAdicionales && currentLesson.recursosAdicionales.length > 0 && (
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <h3 className="font-bold text-lg mb-4">Recursos adicionales</h3>
                                        <ul className="space-y-2">
                                            {currentLesson.recursosAdicionales.map((recurso, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={recurso.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        {/* Icono según el tipo de recurso */}
                                                        {recurso.tipo === 'pdf' && (
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                        {recurso.tipo === 'link' && (
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                        )}
                                                        {recurso.titulo}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>


                            {/* Sección de comentarios */}
                            <div className="mt-10 border-t border-gray-200 pt-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Comentarios ({comments.length})
                                </h3>

                                {/* Formulario para añadir comentarios */}
                                <div ref={commentFormRef} className="mb-8">
                                    <form onSubmit={handleSubmitComment} className="bg-gray-50 rounded-lg p-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Escribe un comentario o pregunta sobre esta lección..."
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                className={`px-4 py-2 rounded-md ${!newComment.trim()
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                Publicar comentario
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Lista de comentarios */}
                                {isLoadingComments ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="space-y-6">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                {/* Cabecera del comentario */}
                                                <div className="flex items-start p-4 border-b border-gray-100">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0 mr-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                                            {comment.userId.nombre?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    </div>

                                                    {/* Contenido del comentario */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="font-medium">{comment.userId.nombre || 'Usuario'}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(comment.fecha).toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        {editingComment === comment._id ? (
                                                            <div className="mt-2">
                                                                <textarea
                                                                    value={editContent}
                                                                    onChange={(e) => setEditContent(e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    rows={2}
                                                                />
                                                                <div className="flex justify-end mt-2 space-x-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingComment(null);
                                                                            setEditContent('');
                                                                        }}
                                                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateComment(comment._id)}
                                                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-800">{comment.contenido}</p>
                                                        )}
                                                    </div>

                                                    {/* Acciones del comentario */}
                                                    {!editingComment && (
                                                        <div className="flex-shrink-0 ml-2">
                                                            <div className="relative">
                                                                <button
                                                                    className="text-gray-500 hover:text-gray-700"
                                                                    onClick={() => {
                                                                        setEditingComment(comment._id);
                                                                        setEditContent(comment.contenido);
                                                                    }}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    className="text-gray-500 hover:text-red-600 ml-2"
                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Respuestas */}
                                                <div className="bg-gray-50">
                                                    {comment.respuestas && comment.respuestas.length > 0 && (
                                                        <div className="p-4 pl-14 space-y-4 border-b border-gray-100">
                                                            {comment.respuestas.map((reply) => (
                                                                <div key={reply.id} className="flex items-start">
                                                                    {/* Avatar de la respuesta */}
                                                                    <div className="flex-shrink-0 mr-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                                                                            {reply.userId.nombre?.charAt(0).toUpperCase() || 'U'}
                                                                        </div>
                                                                    </div>

                                                                    {/* Contenido de la respuesta */}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <div className="font-medium text-sm">{reply.userId.nombre || 'Usuario'}</div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {new Date(reply.fecha).toLocaleDateString()}
                                                                            </div>
                                                                        </div>

                                                                        {editingReply && editingReply.commentId === comment._id && editingReply.replyId === reply.id ? (
                                                                            <div className="mt-1">
                                                                                <textarea
                                                                                    value={editContent}
                                                                                    onChange={(e) => setEditContent(e.target.value)}
                                                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                                                    rows={2}
                                                                                />
                                                                                <div className="flex justify-end mt-2 space-x-2">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingReply(null);
                                                                                            setEditContent('');
                                                                                        }}
                                                                                        className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                                                                                    >
                                                                                        Cancelar
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleUpdateReply(comment._id, reply.id)}
                                                                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                                                    >
                                                                                        Guardar
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-gray-800 text-sm">{reply.contenido}</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Acciones de la respuesta */}
                                                                    {!editingReply && (
                                                                        <div className="flex-shrink-0 ml-2">
                                                                            <button
                                                                                className="text-gray-500 hover:text-gray-700"
                                                                                onClick={() => {
                                                                                    setEditingReply({ commentId: comment._id, replyId: reply.id });
                                                                                    setEditContent(reply.contenido);
                                                                                }}
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                className="text-gray-500 hover:text-red-600 ml-2"
                                                                                onClick={() => handleDeleteReply(comment._id, reply.id)}
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Formulario para responder */}
                                                    {replyingTo === comment._id ? (
                                                        <div className="px-4 py-3 pl-14">
                                                            <textarea
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                placeholder="Escribe una respuesta..."
                                                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                                rows={2}
                                                            />
                                                            <div className="mt-2 flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReplyContent('');
                                                                    }}
                                                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSubmitReply(comment._id)}
                                                                    disabled={!replyContent.trim()}
                                                                    className={`px-3 py-1 text-sm rounded-md ${!replyContent.trim()
                                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                        }`}
                                                                >
                                                                    Responder
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReplyingTo(comment._id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                                        >
                                                            <span className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                                Responder
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        <p className="mt-2 text-gray-600">
                                            No hay comentarios en esta lección. ¡Sé el primero en comentar!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Navegación y botón de completar */}
                            <div className="border-t border-gray-200 pt-6 flex justify-between">
                                <button
                                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${!prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={navigateToPrevLesson}
                                    disabled={!prevLesson}
                                >
                                    Anterior
                                </button>

                                <div className="flex items-center">
                                    <button
                                        onClick={scrollToComments}
                                        className="mr-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            Comentarios
                                        </span>
                                    </button>

                                    <button
                                        className={`px-4 py-2 rounded-md ${completedLessons.includes(currentLesson._id)
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        onClick={markLessonComplete}
                                    >
                                        {completedLessons.includes(currentLesson._id) ? 'Completado' : 'Marcar como completado'}
                                    </button>
                                </div>

                                <button
                                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${!nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={navigateToNextLesson}
                                    disabled={!nextLesson}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-900">Selecciona una lección</h3>
                            <p className="text-gray-600 max-w-sm mt-2">
                                Elige una lección del menú lateral para comenzar tu aprendizaje.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudentCourseView;