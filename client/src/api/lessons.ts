// src/api/lessons.ts
import apiClient from './client';

export interface Lesson {
    videoUrl: boolean;
    _id: string;
    titulo: string;
    contenido: string;
    tipo: 'texto' | 'video' | 'quiz';
    duracion?: string;
    moduloId: string;
    ordenIndice: number;
    duracionMinutos: number;
    esGratis: boolean;
    recursosAdicionales?: {
        titulo: string;
        url: string;
        tipo: string;
    }[];
    createdAt: string;
    updatedAt: string;
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