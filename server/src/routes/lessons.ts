import { Router } from 'express';
import { 
    getLessonsByModule,
    getLessonById,
    createLesson,
    updateLesson, 
    deleteLesson,
    reorderLessons
} from '../controllers/lessonController';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Rutas públicas o con autenticación básica
router.get('/module/:moduloId', asyncHandler(getLessonsByModule));
router.get('/:id', asyncHandler(getLessonById));

// Rutas que requieren autenticación y roles específicos
router.post('/', authenticate, asyncHandler(createLesson));
router.put('/:id', authenticate, asyncHandler(updateLesson));
router.delete('/:id', authenticate, asyncHandler(deleteLesson));
router.post('/reorder', authenticate, asyncHandler(reorderLessons));

export default router;