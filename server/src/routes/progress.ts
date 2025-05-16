import { Router } from 'express';
import { 
    getUserProgress,
    getCourseProgress,
    markLessonAsCompleted
} from '../controllers/progressController'; // Asegúrate de crear este controlador
import { authenticate } from '../middlewares/auth';

const router = Router();

// Todas las rutas de progreso requieren autenticación
router.get('/courses', authenticate, getUserProgress);
router.get('/courses/:id', authenticate, getCourseProgress);
router.post('/lessons/:id/complete', authenticate, markLessonAsCompleted);

export default router;