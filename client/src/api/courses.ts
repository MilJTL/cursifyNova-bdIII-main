// client/src/api/courses.ts
import apiClient from './client';
import type { Module } from './modules';

export interface Course {
    id: string; // <--- ¡DEBE SER 'id' y NO '_id' aquí!
    titulo: string;
    descripcion: string;
    imagenCurso?: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    premium: boolean;
    precio?: number;
    modulos?: Module[];
    valoracion: number;
    numValoraciones: number; // Asegúrate de que esta propiedad exista
    etiquetas: string[];
    estudiantes?: number;
    autor: {
        _id: string; // El _id del autor (si el backend lo envía así en el populate)
        nombre: string;
        username: string;
        avatarUrl?: string;
        titulo?: string;
        biografia?: string;
        calificacion?: number;
        cursos?: number;
        estudiantes?: number;
    };
    duracionEstimada?: string;
    fechaCreacion: string; // Como string ISO Date
    fechaActualizacion: string; // Como string ISO Date
    publicado?: boolean;
    estaDestacado?: boolean;
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
    sort?: string;
    featured?: boolean;
    enrolled?: boolean;
    recommended?: boolean;
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

// ... (el resto de tus funciones de API)
export const getCourses = async (filters: CoursesFilter = {}): Promise<Course[]> => {
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

export const getCourseById = async (id: string): Promise<Course> => {
    try {
        const response = await apiClient.get<CourseResponse>(`/courses/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error al obtener el curso ${id}:`, error);
        throw error;
    }
};

export const enrollInCourse = async (courseId: string) => {
    try {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/courses/${courseId}/enroll`);
        return response.data;
    } catch (error) {
        console.error('Error al inscribirse en el curso:', error);
        throw error;
    }
};

export const unenrollFromCourse = async (courseId: string) => {
    try {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/courses/${courseId}/unenroll`);
        return response.data;
    } catch (error) {
        console.error('Error al cancelar la inscripción del curso:', error);
        throw error;
    }
};

export const getCourseProgress = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/progress/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener progreso del curso:', error);
        throw error;
    }
};

export const getFeaturedCourses = async (limit: number = 4): Promise<Course[]> => {
    return getCourses({ featured: true, limit });
};

export const searchCourses = async (query: string): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>(`/search/courses?q=${encodeURIComponent(query)}`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error al buscar cursos:', error);
        throw error;
    }
};

export const getInstructorCourses = async (): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>('/courses/instructor');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener cursos del instructor:', error);
        throw error;
    }
};

export const createCourse = async (courseData: CourseFormData): Promise<Course> => {
    try {
        const response = await apiClient.post<CourseResponse>('/courses', courseData);
        return response.data.data;
    } catch (error) {
        console.error('Error al crear curso:', error);
        throw error;
    }
};

export const updateCourse = async (id: string, courseData: Partial<CourseFormData>): Promise<Course> => {
    try {
        const response = await apiClient.put<CourseResponse>(`/courses/${id}`, courseData);
        return response.data.data;
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        throw error;
    }
};

export const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        throw error;
    }
};

export const toggleCoursePublishStatus = async (id: string, publish: boolean): Promise<Course> => {
    try {
        const response = await apiClient.put<CourseResponse>(`/courses/${id}/publish`, { publicado: publish });
        return response.data.data;
    } catch (error) {
        console.error('Error al cambiar estado de publicación del curso:', error);
        throw error;
    }
};

export const getCourseStudents = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/instructor/courses/${courseId}/students`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiantes del curso:', error);
        throw error;
    }
};

export const getCourseAnalytics = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/instructor/courses/${courseId}/analytics`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estadísticas del curso:', error);
        throw error;
    }
};

export const addCourseReview = async (courseId: string, data: { calificacion: number; comentario: string }) => {
    try {
        const response = await apiClient.post(`/courses/${courseId}/reviews`, data);
        return response.data;
    } catch (error) {
        console.error('Error al añadir reseña:', error);
        throw error;
    }
};

export const getCourseReviews = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/courses/${courseId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw error;
    }
};

export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
    try {
        const response = await apiClient.get<CoursesResponse>(`/courses/category/${category}`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener cursos por categoría:', error);
        throw error;
    }
};
