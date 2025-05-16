"use strict";
// server/src/controllers/commentController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = exports.updateReply = exports.addReply = exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentsByLesson = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const mongoose_1 = __importDefault(require("mongoose"));
// Obtener comentarios de una lección
const getCommentsByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        // Validar que el ID sea válido
        if (!mongoose_1.default.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ message: 'ID de lección inválido' });
        }
        // Buscar comentarios y poblar datos de usuario
        const comments = await Comment_1.default.find({ leccionId: lessonId })
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl')
            .sort({ fecha: -1 }); // Más recientes primero
        return res.status(200).json(comments);
    }
    catch (error) {
        console.error('Error al obtener comentarios:', error);
        return res.status(500).json({ message: 'Error al obtener comentarios' });
    }
};
exports.getCommentsByLesson = getCommentsByLesson;
// Crear un nuevo comentario
const createComment = async (req, res) => {
    var _a;
    try {
        const { lessonId } = req.params;
        const { contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!(contenido === null || contenido === void 0 ? void 0 : contenido.trim())) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }
        const newComment = new Comment_1.default({
            userId,
            leccionId: lessonId,
            contenido,
            fecha: new Date(),
            respuestas: []
        });
        await newComment.save();
        // Obtener el comentario con datos de usuario
        const savedComment = await Comment_1.default.findById(newComment._id)
            .populate('userId', 'nombre avatarUrl');
        return res.status(201).json(savedComment);
    }
    catch (error) {
        console.error('Error al crear comentario:', error);
        return res.status(500).json({ message: 'Error al crear comentario' });
    }
};
exports.createComment = createComment;
// Actualizar un comentario
const updateComment = async (req, res) => {
    var _a;
    try {
        const { commentId } = req.params;
        const { contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!(contenido === null || contenido === void 0 ? void 0 : contenido.trim())) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }
        // Buscar y verificar propiedad
        const comment = await Comment_1.default.findById(commentId);
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
    }
    catch (error) {
        console.error('Error al actualizar comentario:', error);
        return res.status(500).json({ message: 'Error al actualizar comentario' });
    }
};
exports.updateComment = updateComment;
// Eliminar un comentario
const deleteComment = async (req, res) => {
    var _a;
    try {
        const { commentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Buscar y verificar propiedad
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
        }
        await Comment_1.default.findByIdAndDelete(commentId);
        return res.status(200).json({ message: 'Comentario eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar comentario:', error);
        return res.status(500).json({ message: 'Error al eliminar comentario' });
    }
};
exports.deleteComment = deleteComment;
// Añadir respuesta a un comentario
const addReply = async (req, res) => {
    var _a;
    try {
        const { commentId } = req.params;
        const { contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!(contenido === null || contenido === void 0 ? void 0 : contenido.trim())) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }
        const replyId = new mongoose_1.default.Types.ObjectId().toString();
        comment.respuestas.push({
            id: replyId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
            contenido,
            fecha: new Date()
        });
        await comment.save();
        // Obtener el comentario actualizado con datos de usuarios
        const updatedComment = await Comment_1.default.findById(commentId)
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl');
        return res.status(201).json(updatedComment);
    }
    catch (error) {
        console.error('Error al añadir respuesta:', error);
        return res.status(500).json({ message: 'Error al añadir respuesta' });
    }
};
exports.addReply = addReply;
// Actualizar una respuesta
const updateReply = async (req, res) => {
    var _a;
    try {
        const { commentId, replyId } = req.params;
        const { contenido } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!(contenido === null || contenido === void 0 ? void 0 : contenido.trim())) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }
        const comment = await Comment_1.default.findById(commentId);
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
        const updatedComment = await Comment_1.default.findById(commentId)
            .populate('userId', 'nombre avatarUrl')
            .populate('respuestas.userId', 'nombre avatarUrl');
        return res.status(200).json(updatedComment);
    }
    catch (error) {
        console.error('Error al actualizar respuesta:', error);
        return res.status(500).json({ message: 'Error al actualizar respuesta' });
    }
};
exports.updateReply = updateReply;
// Eliminar una respuesta
const deleteReply = async (req, res) => {
    var _a;
    try {
        const { commentId, replyId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const comment = await Comment_1.default.findById(commentId);
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
    }
    catch (error) {
        console.error('Error al eliminar respuesta:', error);
        return res.status(500).json({ message: 'Error al eliminar respuesta' });
    }
};
exports.deleteReply = deleteReply;
