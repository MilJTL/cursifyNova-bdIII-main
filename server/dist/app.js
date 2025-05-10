"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
// Crear la aplicación Express
const app = (0, express_1.default)();
// Middleware para parsear JSON y urlencoded
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware de seguridad
app.use((0, helmet_1.default)());
// Configuración de CORS
app.use((0, cors_1.default)({
    origin: config_1.config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Logging en desarrollo
if (config_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Ruta principal para verificar que la API está funcionando
app.get('/', (req, res) => {
    res.json({
        message: 'API de CursifyNova funcionando correctamente',
        environment: config_1.config.nodeEnv,
        version: '1.0.0'
    });
});
// Rutas de la API
app.use('/api', routes_1.default);
// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});
// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: config_1.config.nodeEnv === 'development' ? err.stack : undefined
    });
});
exports.default = app;
