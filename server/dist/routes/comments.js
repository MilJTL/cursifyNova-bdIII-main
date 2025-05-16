"use strict";
// server/src/routes/comments.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const commentController = __importStar(require("../controllers/commentController"));
const controllerHandler_1 = require("../utils/controllerHandler");
const router = express_1.default.Router();
// Obtener comentarios de una lección
router.get('/lessons/:lessonId/comments', (0, controllerHandler_1.asyncHandler)(commentController.getCommentsByLesson));
// Añadir un comentario a una lección
router.post('/lessons/:lessonId/comments', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.createComment));
// Editar un comentario propio
router.put('/comments/:commentId', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.updateComment));
// Eliminar un comentario propio
router.delete('/comments/:commentId', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.deleteComment));
// Añadir respuesta a un comentario
router.post('/comments/:commentId/replies', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.addReply));
// Editar una respuesta propia
router.put('/comments/:commentId/replies/:replyId', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.updateReply));
// Eliminar una respuesta propia
router.delete('/comments/:commentId/replies/:replyId', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(commentController.deleteReply));
exports.default = router;
