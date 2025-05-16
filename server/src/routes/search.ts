import { Router } from 'express';
import { 
    searchGlobal,
    searchCourses,
    searchModules,
    searchLessons
} from '../controllers/searchController';
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Rutas de búsqueda (públicas)
router.get('/', asyncHandler(searchGlobal));
router.get('/courses', asyncHandler(searchCourses));
router.get('/modules', asyncHandler(searchModules));
router.get('/lessons', asyncHandler(searchLessons));

export default router;