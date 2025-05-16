import { Router } from 'express';
import { 
    getModulesByCourse,
    getModuleById,
    createModule,
    updateModule, 
    deleteModule,
    reorderModules
} from '../controllers/moduleController';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Rutas públicas o con autenticación básica
router.get('/', asyncHandler(getModulesByCourse));
router.get('/:id', asyncHandler(getModuleById));

// Rutas que requieren autenticación y roles específicos
router.post('/', authenticate, asyncHandler(createModule));
router.put('/:id', authenticate, asyncHandler(updateModule));
router.delete('/:id', authenticate, asyncHandler(deleteModule));
router.post('/reorder', authenticate, asyncHandler(reorderModules));

export default router;