"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
exports.config = {
    // Servidor
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    // JWT
    jwtSecret: process.env.JWT_SECRET || '42311c774f94c15033365c8c2ffa772162f7528d994cf448c4f7d0c0d610e577',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
    // Base de datos - MODIFICAR ESTA LÍNEA
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/CursosNova',
    // Redis (para caché)
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // Configuración de CORS
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    // Subida de archivos
    maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB por defecto
};
