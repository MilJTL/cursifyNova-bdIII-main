import { Router } from 'express';
import { 
    searchGlobal,
    searchCourses,
    searchModules,
    searchLessons
} from '../controllers/searchController'; // Asegúrate de crear este controlador

const router = Router();

// Rutas de búsqueda (públicas)
router.get('/', searchGlobal);
router.get('/courses', searchCourses);
router.get('/modules', searchModules);
router.get('/lessons', searchLessons);

export default router;