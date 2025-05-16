import { Router } from 'express';
import { 
    getLessonsByModule,
    getLessonById,
    createLesson,
    updateLesson, 
    deleteLesson,
    reorderLessons
} from '../controllers/lessonController';
import { authenticate} from '../middlewares/auth';

const router = Router();

// Rutas públicas o con autenticación básica
router.get('/module/:moduloId', getLessonsByModule);
router.get('/:id', getLessonById);

// Rutas que requieren autenticación y roles específicos
router.post('/', authenticate, createLesson);
router.put('/:id', authenticate,  updateLesson);
router.delete('/:id', authenticate,  deleteLesson);
router.post('/reorder', authenticate,  reorderLessons);

export default router;