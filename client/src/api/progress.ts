import apiClient from './client';

// Interfaces para manejo de progreso
export interface LessonProgress {
    _id: string;
    userId: string;
    courseId: string;
    moduleId: string;
    lessonId: string;
    completed: boolean;
    timeSpent: number; // tiempo en segundos
    lastAccessed?: Date;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ModuleProgressSummary {
    moduleId: string;
    completed: number;
    total: number;
}

export interface CourseProgressSummary {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    overallProgress: number; // porcentaje 0-100
    moduleProgress: ModuleProgressSummary[];
    timeSpent: number; // tiempo total en segundos
    progressPercentage: number; // porcentaje de progreso del curso
    lastAccessed?: Date;
    completedAt?: Date;
    certificate?: {
        id: string;
        url: string;
        issueDate: string;
    };

}

export interface ProgressUpdateData {
    completed?: boolean;
    timeSpent?: number; // tiempo en segundos para esta sesión
    notes?: string;
}

// Obtener progreso de un estudiante en un curso
export const getStudentProgress = async (courseId: string): Promise<CourseProgressSummary> => {
    try {
        const response = await apiClient.get(`/progress/courses/${courseId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching student progress:', error);
        // Devolver un objeto vacío con estructura válida en caso de error
        return {
            studentId: '',
            studentName: '',
            courseId,
            courseTitle: '',
            overallProgress: 0,
            moduleProgress: [],
            timeSpent: 0,
            progressPercentage: 0,
        };
    }
};

// Obtener progreso de un estudiante en todos sus cursos
export const getAllStudentProgress = async (): Promise<CourseProgressSummary[]> => {
    try {
        const response = await apiClient.get('/progress/courses');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all student progress:', error);
        return [];
    }
};

// Obtener progreso detallado para una lección específica
export const getLessonProgress = async (lessonId: string): Promise<LessonProgress | null> => {
    try {
        const response = await apiClient.get(`/progress/lessons/${lessonId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        return null;
    }
};

// Actualizar el progreso de una lección
export const updateLessonProgress = async (lessonId: string, data: ProgressUpdateData): Promise<LessonProgress> => {
    try {
        const response = await apiClient.post(`/progress/lessons/${lessonId}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
    }
};

// Marcar una lección como completada
export const markLessonAsCompleted = async (lessonId: string): Promise<LessonProgress> => {
    return updateLessonProgress(lessonId, { completed: true });
};

// Marcar una lección como no completada
export const markLessonAsIncomplete = async (lessonId: string): Promise<LessonProgress> => {
    return updateLessonProgress(lessonId, { completed: false });
};

// Obtener certificado de un curso completado
export const getCertificate = async (courseId: string): Promise<{ id: string; url: string; issueDate: string } | null> => {
    try {
        const response = await apiClient.get(`/progress/courses/${courseId}/certificate`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return null;
    }
};

// Generar nuevo certificado (si el estudiante completó el curso pero no tiene certificado)
export const generateCertificate = async (courseId: string): Promise<{ id: string; url: string; issueDate: string } | null> => {
    try {
        const response = await apiClient.post(`/progress/courses/${courseId}/certificate`);
        return response.data.data;
    } catch (error) {
        console.error('Error generating certificate:', error);
        return null;
    }
};

// Registrar tiempo de visualización para una lección
export const recordWatchTime = async (lessonId: string, timeInSeconds: number): Promise<void> => {
    try {
        await apiClient.post(`/progress/lessons/${lessonId}/watch-time`, { timeSpent: timeInSeconds });
    } catch (error) {
        console.error('Error recording watch time:', error);
    }
};

// Guardar notas para una lección
export const saveNotes = async (lessonId: string, notes: string): Promise<void> => {
    try {
        await apiClient.post(`/progress/lessons/${lessonId}/notes`, { notes });
    } catch (error) {
        console.error('Error saving notes:', error);
    }
};

// Obtener estadísticas de aprendizaje del estudiante (para dashboard)
export const getStudentStats = async (): Promise<{
    totalTimeSpent: number;
    completedCourses: number;
    completedLessons: number;
    averageProgress: number;
    learningStreak: number;
    lastActivity?: Date;
}> => {
    try {
        const response = await apiClient.get('/progress/stats');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching student stats:', error);
        return {
            totalTimeSpent: 0,
            completedCourses: 0,
            completedLessons: 0,
            averageProgress: 0,
            learningStreak: 0
        };
    }
};