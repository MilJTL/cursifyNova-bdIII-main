// server/src/controllers/commentController.ts

import { Request, Response } from 'express';
import Comment, { IComment } from '../models/Comment';
import mongoose from 'mongoose';

// Obtener comentarios de una lección
export const getCommentsByLesson = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;

        // Validar que el ID sea válido
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ message: 'ID de lección inválido' });
        }

        // Buscar comentarios y poblar datos de usuario
        const comments = await Comment.find({ leccionId: lessonId })
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl')
            .sort({ fecha: -1 }); // Más recientes primero

        return res.status(200).json(comments);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        return res.status(500).json({ message: 'Error al obtener comentarios' });
    }
};

// Crear un nuevo comentario
export const createComment = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { contenido } = req.body;
        const userId = req.user?.userId;

        if (!contenido?.trim()) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }

        const newComment = new Comment({
            userId,
            leccionId: lessonId,
            contenido,
            fecha: new Date(),
            respuestas: []
        });

        await newComment.save();

        // Obtener el comentario con datos de usuario
        const savedComment = await Comment.findById(newComment._id)
            .populate('userId', 'nombre avatarUrl');

        return res.status(201).json(savedComment);
    } catch (error) {
        console.error('Error al crear comentario:', error);
        return res.status(500).json({ message: 'Error al crear comentario' });
    }
};

// Actualizar un comentario
export const updateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { contenido } = req.body;
        const userId = req.user?.userId;

        if (!contenido?.trim()) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }

        // Buscar y verificar propiedad
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
        }

        // Actualizar
        comment.contenido = contenido;
        await comment.save();

        return res.status(200).json(comment);
    } catch (error) {
        console.error('Error al actualizar comentario:', error);
        return res.status(500).json({ message: 'Error al actualizar comentario' });
    }
};

// Eliminar un comentario
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.userId;

        // Buscar y verificar propiedad
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
        }

        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        return res.status(500).json({ message: 'Error al eliminar comentario' });
    }
};

// Añadir respuesta a un comentario
export const addReply = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { contenido } = req.body;
        const userId = req.user?.userId;

        if (!contenido?.trim()) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        const replyId = new mongoose.Types.ObjectId().toString();

        comment.respuestas.push({
            id: replyId,
            userId: new mongoose.Types.ObjectId(userId),
            contenido,
            fecha: new Date()
        });

        await comment.save();

        // Obtener el comentario actualizado con datos de usuarios
        const updatedComment = await Comment.findById(commentId)
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl');

        return res.status(201).json(updatedComment);
    } catch (error) {
        console.error('Error al añadir respuesta:', error);
        return res.status(500).json({ message: 'Error al añadir respuesta' });
    }
};

// Actualizar una respuesta
export const updateReply = async (req: Request, res: Response) => {
    try {
        const { commentId, replyId } = req.params;
        const { contenido } = req.body;
        const userId = req.user?.userId;

        if (!contenido?.trim()) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        const replyIndex = comment.respuestas.findIndex(r => r.id === replyId);

        if (replyIndex === -1) {
            return res.status(404).json({ message: 'Respuesta no encontrada' });
        }

        if (comment.respuestas[replyIndex].userId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta respuesta' });
        }

        comment.respuestas[replyIndex].contenido = contenido;
        await comment.save();

        // Obtener el comentario actualizado con datos de usuarios
        const updatedComment = await Comment.findById(commentId)
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl');

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error al actualizar respuesta:', error);
        return res.status(500).json({ message: 'Error al actualizar respuesta' });
    }
};

// Eliminar una respuesta
export const deleteReply = async (req: Request, res: Response) => {
    try {
        const { commentId, replyId } = req.params;
        const userId = req.user?.userId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        const replyIndex = comment.respuestas.findIndex(r => r.id === replyId);

        if (replyIndex === -1) {
            return res.status(404).json({ message: 'Respuesta no encontrada' });
        }

        if (comment.respuestas[replyIndex].userId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta respuesta' });
        }

        comment.respuestas.splice(replyIndex, 1);
        await comment.save();

        return res.status(200).json({ message: 'Respuesta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar respuesta:', error);
        return res.status(500).json({ message: 'Error al eliminar respuesta' });
    }
};