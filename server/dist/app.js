/*"use strict";
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
    origin: 'https://cursify-nova-bd-iii-main-m1yfxzrh5-miltons-projects-6aa104f3.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Logging
if (config_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}

//ruta de prueba
app.get('/test', (req, res) => {
    res.send('¡Prueba exitosa!');
});
// Ruta raíz para comprobar el estado de la API
app.get('/', (req, res) => {
    res.json({
        message: "API de CursifyNova funcionando correctamente",
        environment: config_1.config.nodeEnv,
        version: "1.0.0"
    });
});
// IMPORTANTE: Registrar las rutas con el prefijo /api
app.use('/api', routes_1.default);
// Registrar rutas de cursos directamente (alternativa para probar)
const courses_1 = __importDefault(require("./routes/courses"));
app.use('/api/courses-direct', courses_1.default);
// Manejar rutas no encontradas
app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});
exports.default = app;*/

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/test', (req, res) => {
  res.send('¡Prueba exitosa simplificada!');
});

app.get('/api/courses', (req, res) => {
  res.json({ message: '¡Ruta de cursos simplificada!' });
});

app.get('/', (req, res) => {
  res.send('¡Hola desde el backend simplificado!');
});

app.listen(port, () => {
  console.log(`Servidor simplificado escuchando en el puerto ${port}`);
});

module.exports = app;
