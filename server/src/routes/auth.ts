// src/routes/auth.ts

import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';
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

export default router;