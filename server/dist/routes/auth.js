"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Rutas públicas
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
// Rutas protegidas (requieren autenticación)
router.get('/me', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticate, authController_1.changePassword);
exports.default = router;
