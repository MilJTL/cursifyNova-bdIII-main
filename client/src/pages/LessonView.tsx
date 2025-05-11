import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById, markLessonComplete, getCourseById, type Lesson, type Module, type Course } from '../api/courses';
import useAuth from '../hooks/useAuth';

// Interfaz para los comentarios
interface Comment {
    _id: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    createdAt: string;
    likes: number;
    replies?: Comment[];
    isInstructor?: boolean;
}
// Componente para mostrar el contenido según su tipo
const LessonContent = ({ lesson }: { lesson: Lesson }) => {
    if (lesson.tipo === 'video') {
        return (
            <div className="aspect-video bg-black rounded-lg mb-6">
                {lesson.videoUrl ? (
                    <iframe
                        className="w-full h-full rounded-lg"
                        src={lesson.videoUrl}
                        title={lesson.titulo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        Video no disponible
                    </div>
                )}
            </div>
        );
    } else if (lesson.tipo === 'texto') {
        return (
            <div className="prose max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: lesson.contenido }} />
            </div>
        );
    } else if (lesson.tipo === 'quiz') {
        return (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2">Quiz: {lesson.titulo}</h3>
                <p>Este contenido es un quiz interactivo.</p>
                {/* Implementar el componente de quiz aquí */}
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p>Contenido no disponible</p>
        </div>
    );
};

const LessonViewer: React.FC = () => {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false);
    const [isMarkingComplete, setIsMarkingComplete] = useState<boolean>(false);

    // Nuevos estados para los comentarios
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
    // Removed unused state 'commentError' and its setter 'setCommentError'
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');

    // Cargar el curso y la lección actual
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/courses/${courseId}/lessons/${lessonId}` } });
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);

                // Obtener datos del curso
                const courseData = await getCourseById(courseId!);
                setCourse(courseData);
                setModules(courseData.modulos || []);

                // Obtener datos de la lección actual
                const lessonData = await getLessonById(lessonId!);
                setCurrentLesson(lessonData);
                // Cargar los comentarios de la lección (simulado)
                loadComments();
                // Verificar si la lección está completada (implementar en API)
                // setIsLessonCompleted(lessonData.completada || false);

                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message || 'Error al cargar la lección');
                } else {
                    setError('Error desconocido al cargar la lección');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, lessonId, isAuthenticated, navigate]);

    // Función para marcar la lección como completada
    const handleMarkComplete = async () => {
        if (isLessonCompleted || !currentLesson) return;

        try {
            setIsMarkingComplete(true);
            await markLessonComplete(courseId!, lessonId!);
            setIsLessonCompleted(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Error al marcar la lección como completada');
            } else {
                setError('Error desconocido al marcar la lección como completada');
            }
        } finally {
            setIsMarkingComplete(false);
        }
    };
    // Función simulada para cargar comentarios
    const loadComments = () => {
        // En un caso real, harías una llamada a la API
        // Por ahora usamos datos simulados
        const mockComments: Comment[] = [
            {
                _id: 'c1',
                userId: 'u1',
                username: 'Ana García',
                avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
                content: '¡Excelente lección! Me ayudó a entender mejor el concepto.',
                createdAt: '2023-05-15T10:30:00Z',
                likes: 5,
                replies: [
                    {
                        _id: 'r1',
                        userId: 'u2',
                        username: 'Pedro Instructor',
                        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
                        content: 'Gracias Ana, me alegra que te haya sido útil.',
                        createdAt: '2023-05-15T11:45:00Z',
                        likes: 2,
                        isInstructor: true
                    }
                ]
            },
            {
                _id: 'c2',
                userId: 'u3',
                username: 'Carlos Mendoza',
                avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
                content: '¿Alguien podría explicarme mejor la parte sobre los algoritmos de ordenamiento?',
                createdAt: '2023-05-16T14:20:00Z',
                likes: 0,
                replies: []
            }
        ];

        setComments(mockComments);
    };
    // Función para manejar la publicación de un comentario
    const handlePostComment = () => {
        if (!newComment.trim() || !isAuthenticated) return;

        setIsPostingComment(true);

        // En un caso real, harías una llamada a la API
        // Simulamos un pequeño retraso para mostrar el estado de carga
        setTimeout(() => {
            const newCommentObj: Comment = {
                _id: `c${Date.now()}`,
                userId: user?.id || 'temp-id',
                username: user?.username || user?.email || 'Usuario',
                avatarUrl: user?.avatarUrl || '',
                content: newComment,
                createdAt: new Date().toISOString(),
                likes: 0,
                replies: []
            };

            setComments([newCommentObj, ...comments]);
            setNewComment('');
            setIsPostingComment(false);
        }, 500);
    };

    // Función para manejar respuestas a comentarios
    const handleReply = (commentId: string) => {
        if (!replyContent.trim() || !isAuthenticated) return;

        setIsPostingComment(true);

        // En un caso real, harías una llamada a la API
        setTimeout(() => {
            const reply: Comment = {
                _id: `r${Date.now()}`,
                userId: user?.id || 'temp-id',
                username: user?.username || user?.email || 'Usuario',
                avatarUrl: user?.avatarUrl || '',
                content: replyContent,
                createdAt: new Date().toISOString(),
                likes: 0,
                isInstructor: user?.rol === 'admin' || false // Ajusta según cómo determines si es instructor
            };

            // Actualizar el comentario con la respuesta
            const updatedComments = comments.map(comment => {
                if (comment._id === commentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), reply]
                    };
                }
                return comment;
            });
            setComments(updatedComments);
            setReplyContent('');
            setReplyTo(null);
            setIsPostingComment(false);
        }, 500);
    };
    // Función para dar like a un comentario
    const handleLike = (commentId: string, isReply = false, parentId?: string) => {
        if (!isAuthenticated) return;

        // En un caso real, harías una llamada a la API
        if (isReply && parentId) {
            // Like a una respuesta
            const updatedComments = comments.map(comment => {
                if (comment._id === parentId && comment.replies) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply =>
                            reply._id === commentId ? { ...reply, likes: reply.likes + 1 } : reply
                        )
                    };
                }
                return comment;
            });
            setComments(updatedComments);
        } else {
            // Like a un comentario principal
            const updatedComments = comments.map(comment =>
                comment._id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
            );
            setComments(updatedComments);
        }
    };


    // Navegar a la siguiente lección
    const navigateToNextLesson = () => {
        if (!course || !modules.length || !currentLesson) return;

        // Encontrar el módulo actual
        const currentModuleIndex = modules.findIndex(m =>
            m.lecciones.some(l => l._id === lessonId)
        );

        if (currentModuleIndex === -1) return;

        const currentModule = modules[currentModuleIndex];

        // Encontrar la lección actual en el módulo
        const currentLessonIndex = currentModule.lecciones.findIndex(l => l._id === lessonId);

        if (currentLessonIndex === -1) return;

        // Si hay una siguiente lección en el mismo módulo
        if (currentLessonIndex < currentModule.lecciones.length - 1) {
            const nextLesson = currentModule.lecciones[currentLessonIndex + 1];
            navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
            return;
        }

        // Si hay un siguiente módulo con lecciones
        if (currentModuleIndex < modules.length - 1) {
            const nextModule = modules[currentModuleIndex + 1];
            if (nextModule.lecciones.length) {
                const nextLesson = nextModule.lecciones[0];
                navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
                return;
            }
        }

        // Si no hay más lecciones, volver a la página del curso
        navigate(`/courses/${courseId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !currentLesson || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error || "No se pudo cargar la lección"}
                </div>
                <button
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Volver al curso
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="mr-4 text-gray-600 hover:text-blue-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">{course.titulo}</h2>
                        <h1 className="text-2xl font-bold">{currentLesson.titulo}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenido de la lección */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                            <LessonContent lesson={currentLesson} />

                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-2">Recursos adicionales</h3>
                                {currentLesson.recursosAdicionales && currentLesson.recursosAdicionales.length > 0 ? (
                                    <ul className="space-y-2">
                                        {currentLesson.recursosAdicionales.map((recurso, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <a
                                                    href={recurso.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {recurso.titulo}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No hay recursos adicionales disponibles</p>
                                )}
                            </div>
                        </div>
                        {/* Sección de comentarios */}
                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-6">Comentarios y preguntas</h2>

                            {/* Formulario para añadir un comentario */}
                            {isAuthenticated ? (
                                <div className="mb-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username || ''}`}
                                                alt={user?.username || 'Usuario'}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                                                <textarea
                                                    rows={3}
                                                    name="comment"
                                                    id="comment"
                                                    className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 sm:text-sm"
                                                    placeholder="Añadir un comentario o pregunta..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                ></textarea>
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handlePostComment}
                                                    disabled={isPostingComment || newComment.trim() === ''}
                                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isPostingComment || newComment.trim() === ''
                                                        ? 'bg-blue-300 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                                        }`}
                                                >
                                                    {isPostingComment ? 'Publicando...' : 'Publicar comentario'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <p className="text-blue-700">
                                        <a href="/login" className="font-medium underline">Inicia sesión</a> para dejar un comentario o hacer una pregunta.
                                    </p>
                                </div>
                            )}

                            {/* Lista de comentarios */}
                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <div className="text-center py-6">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay comentarios</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Sé el primero en dejar un comentario o hacer una pregunta.
                                        </p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex space-x-3">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={comment.avatarUrl || `https://ui-avatars.com/api/?name=${comment.username}`}
                                                        alt={comment.username}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {comment.username}
                                                            {comment.isInstructor && (
                                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Instructor
                                                                </span>
                                                            )}
                                                        </p>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-sm text-gray-700">{comment.content}</div>
                                                    <div className="mt-2 flex items-center space-x-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLike(comment._id)}
                                                            className="text-sm flex items-center text-gray-500 hover:text-blue-600"
                                                        >
                                                            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                            </svg>
                                                            {comment.likes} Me gusta
                                                        </button>

                                                        {isAuthenticated && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                                                                className="text-sm flex items-center text-gray-500 hover:text-blue-600"
                                                            >
                                                                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                                Responder
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Formulario de respuesta */}
                                                    {replyTo === comment._id && (
                                                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                                            <div className="flex space-x-3">
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        className="h-8 w-8 rounded-full"
                                                                        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username || ''}`}
                                                                        alt={user?.username || 'Usuario'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <textarea
                                                                        rows={2}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="Escribe tu respuesta..."
                                                                        value={replyContent}
                                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                                    ></textarea>
                                                                    <div className="mt-2 flex justify-end space-x-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setReplyTo(null)}
                                                                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleReply(comment._id)}
                                                                            disabled={isPostingComment || replyContent.trim() === ''}
                                                                            className={`px-3 py-1 text-sm text-white rounded-md ${isPostingComment || replyContent.trim() === ''
                                                                                ? 'bg-blue-300 cursor-not-allowed'
                                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                                                }`}
                                                                        >
                                                                            {isPostingComment ? 'Enviando...' : 'Responder'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Respuestas */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                                                            {comment.replies.map(reply => (
                                                                <div key={reply._id} className="flex space-x-3">
                                                                    <div className="flex-shrink-0">
                                                                        <img
                                                                            className="h-8 w-8 rounded-full"
                                                                            src={reply.avatarUrl || `https://ui-avatars.com/api/?name=${reply.username}`}
                                                                            alt={reply.username}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center">
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {reply.username}
                                                                                {reply.isInstructor && (
                                                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                        Instructor
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                            <span className="ml-2 text-sm text-gray-500">
                                                                                {new Date(reply.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-1 text-sm text-gray-700">{reply.content}</div>
                                                                        <div className="mt-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleLike(reply._id, true, comment._id)}
                                                                                className="text-sm flex items-center text-gray-500 hover:text-blue-600"
                                                                            >
                                                                                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                                                </svg>
                                                                                {reply.likes} Me gusta
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={handleMarkComplete}
                                className={`px-6 py-3 rounded-lg font-medium transition ${isLessonCompleted
                                    ? 'bg-green-100 text-green-800 cursor-default'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                disabled={isLessonCompleted || isMarkingComplete}
                            >
                                {isMarkingComplete ? 'Guardando...' : isLessonCompleted ? '✓ Completada' : 'Marcar como completada'}
                            </button>

                            <button
                                onClick={navigateToNextLesson}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition flex items-center"
                            >
                                Siguiente lección
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navegación del curso */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-md rounded-lg p-4 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Contenido del curso</h2>

                            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                                {modules.map((module, moduleIndex) => (
                                    <div key={moduleIndex} className="mb-4">
                                        <h3 className="font-medium text-gray-800 mb-2">
                                            {moduleIndex + 1}. {module.titulo}
                                        </h3>
                                        <ul className="pl-4 space-y-1">
                                            {module.lecciones.map((lesson, lessonIndex) => {
                                                const isCurrentLesson = lesson._id === lessonId;
                                                return (
                                                    <li key={lessonIndex} className="py-1">
                                                        <button
                                                            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson._id}`)}
                                                            className={`text-left w-full flex items-center text-sm rounded-md px-2 py-1 ${isCurrentLesson
                                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="mr-2">{moduleIndex + 1}.{lessonIndex + 1}</span>
                                                            <span className="truncate">{lesson.titulo}</span>
                                                            {/* Aquí podrías añadir un ícono de completado si la lección está completada */}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonViewer;