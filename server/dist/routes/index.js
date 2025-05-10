"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const router = (0, express_1.Router)();
// Montar rutas de autenticación
router.use('/auth', auth_1.default);
// Aquí se añadirán otras rutas (cursos, módulos, lecciones, etc.)
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);
exports.default = router;
