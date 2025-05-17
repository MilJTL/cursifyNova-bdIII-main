"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courses.ts
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middlewares/auth");
const controllerHandler_1 = require("../utils/controllerHandler");
const cacheMiddleware_1 = require("../middlewares/cacheMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas con caché
router.get('/', (0, cacheMiddleware_1.cacheResponse)(300), (0, controllerHandler_1.asyncHandler)(courseController_1.getCourses)); // Caché por 5 minutos
// Rutas protegidas - Específicas primero
router.get('/instructor', auth_1.authenticate, (0, cacheMiddleware_1.cacheResponse)(120), (0, controllerHandler_1.asyncHandler)(courseController_1.getInstructorCourses)); // Caché por 2 minutos
router.get('/:id/full', auth_1.authenticate, (0, cacheMiddleware_1.cacheResponse)(300), (0, controllerHandler_1.asyncHandler)(courseController_1.getFullCourse)); // Caché por 5 minutos
// Rutas que modifican datos - limpian caché relacionada con cursos
router.post('/', auth_1.authenticate, (0, cacheMiddleware_1.clearCache)('api:/api/courses*'), (0, controllerHandler_1.asyncHandler)(courseController_1.createCourse));
router.post('/:id/enroll', auth_1.authenticate, (0, cacheMiddleware_1.clearCache)(`api:/api/courses*`), (0, controllerHandler_1.asyncHandler)(courseController_1.enrollCourse));
router.put('/:id', auth_1.authenticate, (0, cacheMiddleware_1.clearCache)(`api:/api/courses*`), (0, controllerHandler_1.asyncHandler)(courseController_1.updateCourse));
router.delete('/:id', auth_1.authenticate, (0, cacheMiddleware_1.clearCache)(`api:/api/courses*`), (0, controllerHandler_1.asyncHandler)(courseController_1.deleteCourse));
// Ruta dinámica con parámetro - SIEMPRE debe ir AL FINAL
router.get('/:id', (0, cacheMiddleware_1.cacheResponse)(600), (0, controllerHandler_1.asyncHandler)(courseController_1.getCourseById)); // Caché por 10 minutos
exports.default = router;
