"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = exports.deleteComment = exports.addReply = exports.createComment = exports.getCommentsByLesson = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const mongoose_1 = __importDefault(require("mongoose"));
// Obtener todos los comentarios de una lección
const getCommentsByLesson = async (req, res) => {
    try {
        const leccionId = req.params.leccionId;
        const comments = await Comment_1.default.find({ leccionId })
            .sort({ fecha: -1 })
            .populate('userId', 'nombre username avatarUrl')
            .populate('respuestas.userId', 'nombre username avatarUrl');
        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los comentarios'
        });
    }
};
exports.getCommentsByLesson = getCommentsByLesson;
// Crear un nuevo comentario
const createComment = async (req, res) => {
    var _a;
    try {
        const { leccionId, contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Verificar si la lección existe
        const lessonExists = await Lesson_1.default.exists({ _id: leccionId });
        if (!lessonExists) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        const comment = await Comment_1.default.create({
            userId,
            leccionId,
            contenido,
            fecha: new Date(),
            respuestas: []
        });
        // Popularly user data for the response
        const populatedComment = await Comment_1.default.findById(comment._id)
            .populate('userId', 'nombre username avatarUrl');
        res.status(201).json({
            success: true,
            data: populatedComment
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el comentario'
        });
    }
};
exports.createComment = createComment;
// Añadir una respuesta a un comentario
const addReply = async (req, res) => {
    var _a;
    try {
        const { comentarioId, contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Verificar si el comentario existe
        const comment = await Comment_1.default.findById(comentarioId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }
        // Crear la respuesta
        const replyId = new mongoose_1.default.Types.ObjectId().toString();
        const reply = {
            id: replyId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
            contenido,
            fecha: new Date()
        };
        // Añadir la respuesta al comentario
        comment.respuestas.push(reply);
        await comment.save();
        // Obtener el comentario actualizado con los datos de usuario populados
        const updatedComment = await Comment_1.default.findById(comentarioId)
            .populate('userId', 'nombre username avatarUrl')
            .populate('respuestas.userId', 'nombre username avatarUrl');
        res.status(200).json({
            success: true,
            data: updatedComment
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al añadir la respuesta'
        });
    }
};
exports.addReply = addReply;
// Eliminar un comentario
const deleteComment = async (req, res) => {
    var _a;
    try {
        const commentId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el comentario existe
        const comment = await Comment_1.default.findById(commentId);
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
        await Comment_1.default.findByIdAndDelete(commentId);
        res.status(200).json({
            success: true,
            message: 'Comentario eliminado correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el comentario'
        });
    }
};
exports.deleteComment = deleteComment;
// Eliminar una respuesta
const deleteReply = async (req, res) => {
    var _a;
    try {
        const { commentId, replyId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el comentario existe
        const comment = await Comment_1.default.findById(commentId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar la respuesta'
        });
    }
};
exports.deleteReply = deleteReply;
