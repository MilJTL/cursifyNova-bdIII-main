import { Router } from 'express';
import { 
    getUserProgress,
    getCourseProgress,
    markLessonAsCompleted
} from '../controllers/progressController';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Todas las rutas de progreso requieren autenticación
router.get('/courses', authenticate, asyncHandler(getUserProgress));
router.get('/courses/:id', authenticate, asyncHandler(getCourseProgress));
router.post('/lessons/:id/complete', authenticate, asyncHandler(markLessonAsCompleted));

export default router;