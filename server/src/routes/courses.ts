// src/routes/courses.ts
import { Router } from 'express';
import { 
    getCourses,
    getCourseById,
    createCourse,
    updateCourse, 
    deleteCourse,
    enrollCourse,
    //addModuleToCourse,
    getInstructorCourses,
    getFullCourse
} from '../controllers/courseController';
import { authenticate } from '../middlewares/auth'; // Eliminado "authorize" ya que no existe
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Rutas públicas
router.get('/', asyncHandler(getCourses));

// Rutas protegidas - Específicas primero
router.get('/instructor', authenticate, asyncHandler(getInstructorCourses));  // Esta debe ir ANTES de /:id
router.get('/:id/full', authenticate, asyncHandler(getFullCourse));
router.post('/', authenticate, asyncHandler(createCourse));
router.post('/:id/enroll', authenticate, asyncHandler(enrollCourse));
//router.post('/:id/modules', authenticate, authorize(['instructor', 'admin']), asyncHandler(addModuleToCourse));
router.put('/:id', authenticate, asyncHandler(updateCourse));
router.delete('/:id', authenticate, asyncHandler(deleteCourse));

// Ruta dinámica con parámetro - SIEMPRE debe ir AL FINAL
router.get('/:id', asyncHandler(getCourseById));  // Mueve esta al final

export default router;