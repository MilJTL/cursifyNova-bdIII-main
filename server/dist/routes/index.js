"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const courses_1 = __importDefault(require("./courses"));
// Importar más rutas según sea necesario
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/courses', courses_1.default);
// Añadir más rutas según sea necesario
exports.default = router;
