// ruta: src/api/comments.ts
import apiClient from './client';

export interface Comment {
    _id?: string; // Hacer opcional, ya que el backend devuelve 'id'
    id: string; // <--- ¡IMPORTANTE! Añadido el campo 'id'
    userId: {
        _id?: string; // Hacer opcional, ya que el backend devuelve 'id'
        id: string; // Asumiendo que userId también tiene 'id'
        nombre: string;
        avatarUrl?: string;
    };
    leccionId: string;
    contenido: string;
    fecha: string;
    respuestas: Reply[];
}

export interface Reply {
    _id?: string; // Hacer opcional, ya que el backend devuelve 'id'
    id: string; // <--- ¡IMPORTANTE! Añadido el campo 'id'
    userId: {
        _id?: string; // Hacer opcional, ya que el backend devuelve 'id'
        id: string; // Asumiendo que userId también tiene 'id'
        nombre: string;
        avatarUrl?: string;
    };
    contenido: string;
    fecha: string;
}

export interface NewComment {
    contenido: string;
}

export interface NewReply {
    contenido: string;
}

// Obtener comentarios de una lección
export const getCommentsByLesson = async (lessonId: string): Promise<Comment[]> => {
    try {
        const response = await apiClient.get(`/comments/lessons/${lessonId}/comments`);
        // Asegurarse de que los datos devueltos coincidan con la interfaz Comment[]
        return response.data; 
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        return [];
    }
};

// Crear un nuevo comentario
export const createComment = async (lessonId: string, comment: NewComment): Promise<Comment | null> => {
    try {
        const response = await apiClient.post(`/comments/lessons/${lessonId}/comments`, comment);
        return response.data;
    } catch (error) {
        console.error('Error al crear comentario:', error);
        return null;
    }
};

// Actualizar un comentario
export const updateComment = async (commentId: string, content: NewComment): Promise<Comment | null> => {
    try {
        const response = await apiClient.put(`/comments/comments/${commentId}`, content);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar comentario:', error);
        return null;
    }
};

// Eliminar un comentario
export const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
        await apiClient.delete(`/comments/comments/${commentId}`);
        return true;
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        return false;
    }
};

// Añadir una respuesta a un comentario
export const addReply = async (commentId: string, reply: NewReply): Promise<Comment | null> => {
    try {
        const response = await apiClient.post(`/comments/comments/${commentId}/replies`, reply);
        return response.data;
    } catch (error) {
        console.error('Error al añadir respuesta:', error);
        return null;
    }
};

// Actualizar una respuesta
export const updateReply = async (commentId: string, replyId: string, content: NewReply): Promise<Comment | null> => {
    try {
        const response = await apiClient.put(`/comments/comments/${commentId}/replies/${replyId}`, content);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar respuesta:', error);
        return null;
    }
};

// Eliminar una respuesta
export const deleteReply = async (commentId: string, replyId: string): Promise<Comment | null> => {
    try {
        const response = await apiClient.delete(`/comments/comments/${commentId}/replies/${replyId}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar respuesta:', error);
        return null;
    }
};
