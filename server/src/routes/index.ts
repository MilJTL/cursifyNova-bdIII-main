// src/routes/index.ts
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import moduleRoutes from './modules';
import lessonRoutes from './lessons';
import progressRoutes from './progress';
import searchRoutes from './search';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/progress', progressRoutes);
router.use('/search', searchRoutes);

export default router;