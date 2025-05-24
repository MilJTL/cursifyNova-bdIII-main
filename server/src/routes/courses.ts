// src/routes/courses.ts
import { Router } from 'express';
import { 
    getCourses,
    getCourseById,
    createCourse,
    updateCourse, 
    deleteCourse,
    enrollCourse,
    getInstructorCourses,
    getFullCourse
} from '../controllers/courseController';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/controllerHandler';
import { cacheResponse, clearCache } from '../middlewares/cacheMiddleware';

const router = Router();

// Rutas públicas con caché
router.get('/', cacheResponse(300), asyncHandler(getCourses)); // Caché por 5 minutos
/*añadiendo nueva ruta
router.get('/', (req, res) => {
    res.status(200).json({ message: '¡Ruta de cursos funciona!' });
});*/
// Rutas protegidas - Específicas primero
router.get('/instructor', authenticate, cacheResponse(120), asyncHandler(getInstructorCourses)); // Caché por 2 minutos
router.get('/:id/full', authenticate, cacheResponse(300), asyncHandler(getFullCourse)); // Caché por 5 minutos

// Rutas que modifican datos - limpian caché relacionada con cursos
router.post('/', authenticate, clearCache('api:/api/courses*'), asyncHandler(createCourse));
router.post('/:id/enroll', authenticate, clearCache(`api:/api/courses*`), asyncHandler(enrollCourse));

//agregando ruta de prueba
router.get('/', (req, res) => {
  res.status(200).json({ message: '¡Prueba de ruta de cursos en Railway!' });
});


router.put('/:id', authenticate, clearCache(`api:/api/courses*`), asyncHandler(updateCourse));
router.delete('/:id', authenticate, clearCache(`api:/api/courses*`), asyncHandler(deleteCourse));

// Ruta dinámica con parámetro - SIEMPRE debe ir AL FINAL
router.get('/:id', cacheResponse(600), asyncHandler(getCourseById)); // Caché por 10 minutos

export default router;
