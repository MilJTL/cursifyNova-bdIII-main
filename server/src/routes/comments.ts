// server/src/routes/comments.ts

import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as commentController from '../controllers/commentController';
import { asyncHandler } from '../utils/controllerHandler';

const router = express.Router();

// Obtener comentarios de una lección
router.get('/lessons/:lessonId/comments', asyncHandler(commentController.getCommentsByLesson));

// Añadir un comentario a una lección
router.post('/lessons/:lessonId/comments', authenticate, asyncHandler(commentController.createComment));

// Editar un comentario propio
router.put('/comments/:commentId', authenticate, asyncHandler(commentController.updateComment));

// Eliminar un comentario propio
router.delete('/comments/:commentId', authenticate, asyncHandler(commentController.deleteComment));

// Añadir respuesta a un comentario
router.post('/comments/:commentId/replies', authenticate, asyncHandler(commentController.addReply));

// Editar una respuesta propia
router.put('/comments/:commentId/replies/:replyId', authenticate, asyncHandler(commentController.updateReply));

// Eliminar una respuesta propia
router.delete('/comments/:commentId/replies/:replyId', authenticate, asyncHandler(commentController.deleteReply));

export default router;