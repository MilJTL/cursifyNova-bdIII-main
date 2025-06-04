// src/api/lessons.ts
import apiClient from './client';

export interface Lesson {
    _id?: string; // Hacer opcional si el backend siempre devuelve 'id'
    id: string; // <--- ¡IMPORTANTE! Añadido el campo 'id'
    titulo: string;
    contenido: string;
    tipo: 'texto' | 'video' | 'quiz';
    duracion?: string; // Esto parece ser un string, pero el backend usa duracionMinutos: number
    moduloId: string; // Este debe ser string ya que los IDs de módulo son strings personalizados
    ordenIndice: number;
    duracionMinutos: number; // Asegurarse de que este campo exista en el backend y sea un número
    esGratis: boolean;
    recursosAdicionales?: {
        titulo: string;
        url: string;
        tipo: string;
    }[];
    createdAt: string;
    updatedAt: string;
    // Si tienes videoUrl: boolean en tu Course, es un error de tipado. Debería ser la URL del video.
    // Si es una URL, debería ser `videoUrl?: string;`
    // Si es un booleano, significa que el nombre del campo está mal.
    // Basado en StudentCourseView.tsx, `currentLesson.contenido` es la URL del video.
    // Por lo tanto, `videoUrl: boolean;` aquí parece incorrecto. Lo eliminaré si no se usa.
    // Si `contenido` es la URL del video, entonces `videoUrl` no es necesario.
    // Si `videoUrl` es un flag, entonces el campo de la URL debería tener otro nombre.
    // Por ahora, asumo que `contenido` es la URL del video o el texto de la lección.
    // Si `videoUrl` realmente es un flag, por favor aclara su propósito.
}

export const getLessonsByModule = async (moduleId: string) => {
    const response = await apiClient.get(`/lessons/module/${moduleId}`);
    return response.data.data;
};

export const getLessonById = async (id: string) => {
    const response = await apiClient.get(`/lessons/${id}`);
    return response.data.data;
};

export const markLessonCompleted = async (lessonId: string) => {
    const response = await apiClient.post(`/progress/lessons/${lessonId}/complete`);
    return response.data;
};

export const createLesson = async (lessonData: Partial<Lesson>) => {
    const response = await apiClient.post('/lessons', lessonData);
    return response.data.data;
};

export const updateLesson = async (id: string, lessonData: Partial<Lesson>) => {
    const response = await apiClient.put(`/lessons/${id}`, lessonData);
    return response.data.data;
};

export const deleteLesson = async (id: string) => {
    const response = await apiClient.delete(`/lessons/${id}`);
    return response.data;
};
