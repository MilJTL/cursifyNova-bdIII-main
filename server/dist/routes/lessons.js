"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lessonController_1 = require("../controllers/lessonController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Rutas públicas o con autenticación básica
router.get('/module/:moduloId', lessonController_1.getLessonsByModule);
router.get('/:id', lessonController_1.getLessonById);
// Rutas que requieren autenticación y roles específicos
router.post('/', auth_1.authenticate, lessonController_1.createLesson);
router.put('/:id', auth_1.authenticate, lessonController_1.updateLesson);
router.delete('/:id', auth_1.authenticate, lessonController_1.deleteLesson);
router.post('/reorder', auth_1.authenticate, lessonController_1.reorderLessons);
exports.default = router;
