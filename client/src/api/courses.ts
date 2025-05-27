// src/api/courses.ts
import apiClient from './client';
import type { Module } from './modules';

export interface Course {
    _id: string;
    titulo: string;
    descripcion: string;
    imagenCurso?: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    premium: boolean;
    precio?: number;
    modulos?: Module[];
    valoracion?: number;
    calificacion?: number; // Para compatibilidad con otras partes del código
    etiquetas: string[];
    estudiantes?: number; // Número de estudiantes inscritos
    autor: {
        _id: string;
        nombre: string;
        username: string;
        avatarUrl?: string;
    };
    duracionEstimada?: string;
    fechaCreacion: Date;
    publicado?: boolean;
    estaDestacado?: boolean; // Para cursos destacados
}

export interface CourseFormData {
    titulo: string;
    descripcion: string;
    imagenCurso?: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    premium: boolean;
    precio?: number;
    etiquetas: string[];
    duracionEstimada?: string;
}

export interface CoursesFilter {
    busqueda?: string;
    nivel?: 'principiante' | 'intermedio' | 'avanzado';
    etiquetas?: string[];
    premium?: boolean;
    page?: number;
    limit?: number;
    sort?: string; // Para ordenamiento adicional
    featured?: boolean; // Para cursos destacados
    enrolled?: boolean; // Para cursos en los que el usuario está inscrito
    recommended?: boolean; // Para cursos recomendados
}

export interface CourseResponse {
    data: Course;
    success: boolean;
    message?: string;
}

export interface CoursesResponse {
    data: Course[];
    success: boolean;
    message?: string;
    pagination?: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

/**
 * Obtiene la lista de cursos con opciones de filtrado
 */
export const getCourses = async (filters: CoursesFilter = {}): Promise<Course[]> => {
    // Construir los query params
    const params = new URLSearchParams();
    if (filters.busqueda) params.append('q', filters.busqueda);
    if (filters.nivel) params.append('nivel', filters.nivel);
    if (filters.premium !== undefined) params.append('premium', filters.premium.toString());
    if (filters.etiquetas?.length) {
        filters.etiquetas.forEach(tag => params.append('etiquetas', tag));
    }
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
        const response = await apiClient.get<CoursesResponse>(`/courses?${params.toString()}`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        throw error;
    }
};

/**
 * Obtiene los detalles de un curso por su ID
 */
export const getCourseById = async (id: string): Promise<Course> => {
    try {
        const response = await apiClient.get<CourseResponse>(`/courses/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error al obtener el curso ${id}:`, error);
        throw error;
    }
};

/**
 * Inscribe al usuario actual en un curso
 */
export const enrollInCourse = async (courseId: string) => {
    try {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/courses/${courseId}/enroll`);
        return response.data;
    } catch (error) {
        console.error('Error al inscribirse en el curso:', error);
        throw error;
    }
};

/**
 * Cancela la inscripción del usuario actual en un curso
 */
export const unenrollFromCourse = async (courseId: string) => {
    try {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/courses/${courseId}/unenroll`);
        return response.data;
    } catch (error) {
        console.error('Error al cancelar la inscripción del curso:', error);
        throw error;
    }
};

/**
 * Obtiene el progreso del usuario en un curso específico
 */
export const getCourseProgress = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/progress/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener progreso del curso:', error);
        throw error;
    }
};

/**
 * Obtiene los cursos destacados/recomendados
 */
// Función para obtener cursos destacados
export const getFeaturedCourses = async (limit: number = 4): Promise<Course[]> => {
    return getCourses({ featured: true, limit });
};

/**
 * Busca cursos por término de búsqueda
 */
export const searchCourses = async (query: string): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>(`/search/courses?q=${encodeURIComponent(query)}`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error al buscar cursos:', error);
        throw error;
    }
};

// FUNCIONES PARA INSTRUCTORES

/**
 * Obtiene los cursos creados por el instructor autenticado
 */
export const getInstructorCourses = async (): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>('/courses/instructor');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener cursos del instructor:', error);
        throw error;
    }
};

/**
 * Crea un nuevo curso (solo para instructores)
 */
export const createCourse = async (courseData: CourseFormData): Promise<Course> => {
    try {
        const response = await apiClient.post<CourseResponse>('/courses', courseData);
        return response.data.data;
    } catch (error) {
        console.error('Error al crear curso:', error);
        throw error;
    }
};

/**
 * Actualiza un curso existente (solo para instructores)
 */
export const updateCourse = async (id: string, courseData: Partial<CourseFormData>): Promise<Course> => {
    try {
        const response = await apiClient.put<CourseResponse>(`/courses/${id}`, courseData);
        return response.data.data;
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        throw error;
    }
};

/**
 * Elimina un curso (solo para instructores)
 */
export const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        throw error;
    }
};

/**
 * Cambia el estado de publicación de un curso (publicar/despublicar)
 */
export const toggleCoursePublishStatus = async (id: string, publish: boolean): Promise<Course> => {
    try {
        const response = await apiClient.put<CourseResponse>(`/courses/${id}/publish`, { publicado: publish });
        return response.data.data;
    } catch (error) {
        console.error('Error al cambiar estado de publicación del curso:', error);
        throw error;
    }
};

/**
 * Obtiene los estudiantes inscritos en un curso específico (solo para instructores)
 */
export const getCourseStudents = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/instructor/courses/${courseId}/students`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiantes del curso:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de un curso específico (solo para instructores)
 */
export const getCourseAnalytics = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/instructor/courses/${courseId}/analytics`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estadísticas del curso:', error);
        throw error;
    }
};

/**
 * Agrega una valoración/reseña a un curso
 */
export const addCourseReview = async (courseId: string, data: { calificacion: number; comentario: string }) => {
    try {
        const response = await apiClient.post(`/courses/${courseId}/reviews`, data);
        return response.data;
    } catch (error) {
        console.error('Error al añadir reseña:', error);
        throw error;
    }
};

/*
 * Obtiene las valoraciones/reseñas de un curso
 */
export const getCourseReviews = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/courses/${courseId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw error;
    }
};

/**
 * Obtiene cursos filtrados por categoría
 */
export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>(`/courses/category/${category}`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener cursos por categoría:', error);
        throw error;
    }
};

