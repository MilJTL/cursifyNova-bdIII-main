import { Router } from 'express';
import { 
    getModulesByCourse,
    getModuleById,
    createModule,
    updateModule, 
    deleteModule,
    reorderModules
} from '../controllers/moduleController';
import { authenticate} from '../middlewares/auth';

const router = Router();

// Rutas públicas o con autenticación básica
router.get('/', getModulesByCourse);
router.get('/:id', getModuleById);

// Rutas que requieren autenticación y roles específicos
router.post('/', authenticate, createModule);
router.put('/:id', authenticate, updateModule);
router.delete('/:id', authenticate,deleteModule);
router.post('/reorder', authenticate,  reorderModules);

export default router;