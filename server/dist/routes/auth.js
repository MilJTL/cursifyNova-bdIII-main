"use strict";
// src/routes/auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const controllerHandler_1 = require("../utils/controllerHandler");
const router = (0, express_1.Router)();
// Rutas públicas
router.post('/register', (0, controllerHandler_1.asyncHandler)(authController_1.register));
router.post('/login', (0, controllerHandler_1.asyncHandler)(authController_1.login));
// Rutas protegidas (requieren autenticación)
router.get('/me', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(authController_1.getProfile));
router.put('/profile', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(authController_1.updateProfile));
router.put('/change-password', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(authController_1.changePassword));
exports.default = router;
