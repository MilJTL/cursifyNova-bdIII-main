// Crear un nuevo archivo para los servicios de progreso
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = true;

const progressApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token de autenticación automáticamente
progressApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interfaces para el progreso
export interface Progress {
    _id: string;
    userId: string;
    cursoId: string;
    leccionesCompletadas: string[];
    ultimaLeccion: {
        _id: string;
        titulo: string;
    };
    porcentajeCompletado: number;
    fechaInicio: Date;
    fechaUltimaActividad: Date;
}

// Obtener el progreso de un usuario en un curso
export const getCourseProgress = async (courseId: string): Promise<Progress> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));

            // Datos simulados de progreso
            return {
                _id: `progress-${courseId}`,
                userId: 'current-user',
                cursoId: courseId,
                leccionesCompletadas: [],
                ultimaLeccion: {
                    _id: '',
                    titulo: ''
                },
                porcentajeCompletado: 0,
                fechaInicio: new Date(),
                fechaUltimaActividad: new Date()
            };
        } else {
            const response = await progressApi.get(`/progress/course/${courseId}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching course progress:", error);
        throw new Error("Error al obtener el progreso del curso");
    }
};

// Marcar una lección como completada
export const markLessonComplete = async (courseId: string, lessonId: string): Promise<void> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log(`Lección ${lessonId} del curso ${courseId} marcada como completada`);
            return;
        } else {
            await progressApi.post('/progress/lesson/complete', {
                cursoId: courseId,
                leccionId: lessonId
            });
        }
    } catch (error) {
        console.error("Error marking lesson as complete:", error);
        throw new Error("Error al marcar la lección como completada");
    }
};

// Inicializar el progreso de un curso
export const initializeCourseProgress = async (courseId: string): Promise<Progress> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            return {
                _id: `progress-${courseId}`,
                userId: 'current-user',
                cursoId: courseId,
                leccionesCompletadas: [],
                ultimaLeccion: {
                    _id: '',
                    titulo: ''
                },
                porcentajeCompletado: 0,
                fechaInicio: new Date(),
                fechaUltimaActividad: new Date()
            };
        } else {
            const response = await progressApi.post(`/progress/course/${courseId}/initialize`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error initializing course progress:", error);
        throw new Error("Error al inicializar el progreso del curso");
    }
};

// Obtener el progreso de todos los cursos del usuario
export const getUserCoursesProgress = async (): Promise<{ course: { _id: string, titulo: string, imagenCurso?: string }, progress: Progress }[]> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Datos simulados
            return [
                {
                    course: {
                        _id: "c101",
                        titulo: "Fundamentos de HTML y CSS",
                        imagenCurso: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=1632&auto=format&fit=crop"
                    },
                    progress: {
                        _id: "progress-c101",
                        userId: "current-user",
                        cursoId: "c101",
                        leccionesCompletadas: ["l101-1-1"],
                        ultimaLeccion: {
                            _id: "l101-1-2",
                            titulo: "Configuración del entorno de trabajo"
                        },
                        porcentajeCompletado: 25,
                        fechaInicio: new Date("2023-04-15"),
                        fechaUltimaActividad: new Date("2023-04-18")
                    }
                },
                {
                    course: {
                        _id: "c102",
                        titulo: "JavaScript Avanzado",
                        imagenCurso: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop"
                    },
                    progress: {
                        _id: "progress-c102",
                        userId: "current-user",
                        cursoId: "c102",
                        leccionesCompletadas: [],
                        ultimaLeccion: {
                            _id: "l102-1-1",
                            titulo: "Arrow Functions y Templates Literals"
                        },
                        porcentajeCompletado: 0,
                        fechaInicio: new Date("2023-05-10"),
                        fechaUltimaActividad: new Date("2023-05-10")
                    }
                }
            ];
        } else {
            const response = await progressApi.get('/progress/user/courses');
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching user courses progress:", error);
        throw new Error("Error al obtener el progreso de los cursos");
    }
};

// Actualizar la última lección vista
export const updateLastLesson = async (courseId: string, lessonId: string): Promise<void> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 400));
            console.log(`Última lección actualizada a ${lessonId} para el curso ${courseId}`);
            return;
        } else {
            await progressApi.put('/progress/lesson/last', {
                cursoId: courseId,
                leccionId: lessonId
            });
        }
    } catch (error) {
        console.error("Error updating last lesson:", error);
        throw new Error("Error al actualizar la última lección vista");
    }
};

// Obtener estadísticas detalladas del progreso
export const getProgressStats = async (courseId: string): Promise<{
    diasConsecutivos: number;
    tiempoTotal: number;
    ultimaActividad: Date;
    leccionesRestantes: number;
}> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            
            return {
                diasConsecutivos: Math.floor(Math.random() * 10) + 1,
                tiempoTotal: Math.floor(Math.random() * 120) + 30, // minutos
                ultimaActividad: new Date(),
                leccionesRestantes: Math.floor(Math.random() * 8) + 2
            };
        } else {
            const response = await progressApi.get(`/progress/stats/${courseId}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching progress stats:", error);
        throw new Error("Error al obtener las estadísticas de progreso");
    }
};

// Verificar si el usuario completó todos los requisitos para obtener un certificado
export const checkCertificateEligibility = async (courseId: string): Promise<{eligible: boolean, reason?: string}> => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Simulación - 80% de probabilidad de ser elegible
            const isEligible = Math.random() > 0.2;
            
            return {
                eligible: isEligible,
                reason: isEligible ? undefined : "Necesitas completar al menos el 80% del curso para ser elegible para un certificado."
            };
        } else {
            const response = await progressApi.get(`/progress/certificate-check/${courseId}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error checking certificate eligibility:", error);
        throw new Error("Error al verificar la elegibilidad para el certificado");
    }
};

export default {
    getCourseProgress,
    markLessonComplete,
    initializeCourseProgress,
    getUserCoursesProgress,
    updateLastLesson,
    getProgressStats,
    checkCertificateEligibility
};