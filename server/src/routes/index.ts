// src/routes/index.ts
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import moduleRoutes from './modules';
import lessonRoutes from './lessons';
import progressRoutes from './progress';
import searchRoutes from './search';
import commentRoutes from './comments';
import certificateRoutes from './certificates';
//importacion de cors de prueba
import cors from 'cors';

const router = Router();

router.use('/auth', authRoutes);
//router.use('/courses', courseRoutes);
router.use('/courses', cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}), courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/progress', progressRoutes);
router.use('/search', searchRoutes);
router.use('/comments', commentRoutes);
router.use('/certificates', certificateRoutes);

export default router;
