// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Montar rutas de autenticación
router.use('/auth', authRoutes);

// Aquí se añadirán otras rutas (cursos, módulos, lecciones, etc.)
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);

export default router;