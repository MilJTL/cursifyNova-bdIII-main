import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Lesson from '../models/Lesson';
import mongoose from 'mongoose';

// Obtener todos los comentarios de una lección
export const getCommentsByLesson = async (req: Request, res: Response) => {
    try {
        const leccionId = req.params.leccionId;

        const comments = await Comment.find({ leccionId })
            .sort({ fecha: -1 })
            .populate('userId', 'nombre username avatarUrl')
            .populate('respuestas.userId', 'nombre username avatarUrl');

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los comentarios'
        });
    }
};

// Crear un nuevo comentario
export const createComment = async (req: Request, res: Response) => {
    try {
        const { leccionId, contenido } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Verificar si la lección existe
        const lessonExists = await Lesson.exists({ _id: leccionId });
        if (!lessonExists) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        const comment = await Comment.create({
            userId,
            leccionId,
            contenido,
            fecha: new Date(),
            respuestas: []
        });

        // Popularly user data for the response
        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'nombre username avatarUrl');

        res.status(201).json({
            success: true,
            data: populatedComment
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el comentario'
        });
    }
};

// Añadir una respuesta a un comentario
export const addReply = async (req: Request, res: Response) => {
    try {
        const { comentarioId, contenido } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Verificar si el comentario existe
        const comment = await Comment.findById(comentarioId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Crear la respuesta
        const replyId = new mongoose.Types.ObjectId().toString();
        const reply = {
            id: replyId,
            userId: new mongoose.Types.ObjectId(userId),
            contenido,
            fecha: new Date()
        };

        // Añadir la respuesta al comentario
        comment.respuestas.push(reply);
        await comment.save();

        // Obtener el comentario actualizado con los datos de usuario populados
        const updatedComment = await Comment.findById(comentarioId)
            .populate('userId', 'nombre username avatarUrl')
            .populate('respuestas.userId', 'nombre username avatarUrl');

        res.status(200).json({
            success: true,
            data: updatedComment
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al añadir la respuesta'
        });
    }
};

// Eliminar un comentario
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id;
        const userId = req.user?.userId;

        // Verificar si el comentario existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Verificar si el usuario es el autor del comentario
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este comentario'
            });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: 'Comentario eliminado correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el comentario'
        });
    }
};

// Eliminar una respuesta
export const deleteReply = async (req: Request, res: Response) => {
    try {
        const { commentId, replyId } = req.params;
        const userId = req.user?.userId;

        // Verificar si el comentario existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Encontrar la respuesta
        const replyIndex = comment.respuestas.findIndex(reply => reply.id === replyId);
        if (replyIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Respuesta no encontrada'
            });
        }

        // Verificar si el usuario es el autor de la respuesta
        if (comment.respuestas[replyIndex].userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta respuesta'
            });
        }

        // Eliminar la respuesta
        comment.respuestas.splice(replyIndex, 1);
        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Respuesta eliminada correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar la respuesta'
        });
    }
};