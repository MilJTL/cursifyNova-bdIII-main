// Ejemplo para courses.ts
import { Router } from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse } from '../controllers/courseController';
import { authenticate } from '../middlewares/auth';  // Asegúrate de usar el nombre correcto

const router = Router();

// Rutas públicas
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Rutas protegidas
router.post('/', authenticate, createCourse);
router.put('/:id', authenticate, updateCourse);
router.delete('/:id', authenticate, deleteCourse);
router.post('/:id/enroll', authenticate, enrollCourse);

export default router;