// src/routes/auth.ts

import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, upload, uploadAvatar } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/controllerHandler';

const router = Router();

// Rutas públicas
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, asyncHandler(getProfile));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.put('/change-password', authenticate, asyncHandler(changePassword));

// Ruta para subir avatar - Usar authenticate en lugar de protect
router.post('/avatar', authenticate, upload.single('avatar'), asyncHandler(uploadAvatar));

export default router;