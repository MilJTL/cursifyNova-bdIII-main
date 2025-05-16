"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courses.ts
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middlewares/auth"); // Eliminado "authorize" ya que no existe
const controllerHandler_1 = require("../utils/controllerHandler");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', (0, controllerHandler_1.asyncHandler)(courseController_1.getCourses));
// Rutas protegidas - Específicas primero
router.get('/instructor', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.getInstructorCourses)); // Esta debe ir ANTES de /:id
router.get('/:id/full', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.getFullCourse));
router.post('/', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.createCourse));
router.post('/:id/enroll', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.enrollCourse));
//router.post('/:id/modules', authenticate, authorize(['instructor', 'admin']), asyncHandler(addModuleToCourse));
router.put('/:id', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.updateCourse));
router.delete('/:id', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(courseController_1.deleteCourse));
// Ruta dinámica con parámetro - SIEMPRE debe ir AL FINAL
router.get('/:id', (0, controllerHandler_1.asyncHandler)(courseController_1.getCourseById)); // Mueve esta al final
exports.default = router;
