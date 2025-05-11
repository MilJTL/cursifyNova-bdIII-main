// src/routes/courses.ts
import { Router } from 'express';
import { 
    getCourses,
    getCourseById,
    createCourse,
    updateCourse, 
    deleteCourse,
    enrollCourse,
    addModuleToCourse,
    getInstructorCourses
} from '../controllers/courseController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rutas públicas
router.get('/', getCourses);

// Rutas protegidas - Específicas primero
router.get('/instructor', authenticate, getInstructorCourses);  // Esta debe ir ANTES de /:id
router.post('/', authenticate, createCourse);
router.post('/:id/enroll', authenticate, enrollCourse);
router.post('/:id/modules', authenticate, addModuleToCourse);
router.put('/:id', authenticate, updateCourse);
router.delete('/:id', authenticate, deleteCourse);

// Ruta dinámica con parámetro - SIEMPRE debe ir AL FINAL
router.get('/:id', getCourseById);  // Mueve esta al final

export default router;