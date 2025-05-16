// server/src/routes/certificates.ts

import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as certificateController from '../controllers/certificateController';
import { asyncHandler } from '../utils/controllerHandler';

const router = express.Router();

// Verificar si el usuario puede recibir certificado
router.get('/courses/:courseId/eligibility', authenticate, asyncHandler(certificateController.checkEligibility));

// Generar certificado
router.post('/courses/:courseId/generate', authenticate, asyncHandler(certificateController.generateCertificate));

// Descargar certificado
router.get('/:certificateId/download', authenticate, asyncHandler(certificateController.downloadCertificate));

// Verificar un certificado (ruta pública)
router.get('/verify/:verificationCode', asyncHandler(certificateController.verifyCertificate));

// Obtener certificados del usuario
router.get('/user', authenticate, asyncHandler(certificateController.getUserCertificates));

export default router;