// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
// Importar más rutas según sea necesario

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
// Añadir más rutas según sea necesario

export default router;