// src/api/modules.ts
import apiClient from './client';
import type { Lesson } from './lessons';

export interface Module {
    _id: string;
    titulo: string;
    descripcion?: string;
    cursoId: string;
    ordenIndice: number;
    lecciones?: Lesson[];
    createdAt: string;
    updatedAt: string;
}

export const getModulesByCourse = async (courseId: string) => {
    const response = await apiClient.get(`/modules?cursoId=${courseId}`);
    return response.data.data;
};

export const getModuleById = async (id: string) => {
    const response = await apiClient.get(`/modules/${id}`);
    return response.data.data;
};

export const createModule = async (moduleData: Partial<Module>) => {
    const response = await apiClient.post('/modules', moduleData);
    return response.data.data;
};

export const updateModule = async (id: string, moduleData: Partial<Module>) => {
    const response = await apiClient.put(`/modules/${id}`, moduleData);
    return response.data.data;
};

export const deleteModule = async (id: string) => {
    const response = await apiClient.delete(`/modules/${id}`);
    return response.data;
};