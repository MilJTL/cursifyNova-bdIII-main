"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progressController_1 = require("../controllers/progressController");
const auth_1 = require("../middlewares/auth");
const controllerHandler_1 = require("../utils/controllerHandler");
const router = (0, express_1.Router)();
// Todas las rutas de progreso requieren autenticación
router.get('/courses', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(progressController_1.getUserProgress));
router.get('/courses/:id', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(progressController_1.getCourseProgress));
router.post('/lessons/:id/complete', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(progressController_1.markLessonAsCompleted));
exports.default = router;
