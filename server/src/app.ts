// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import routes from './routes';

// Crear la aplicación Express
const app = express();

// Middleware para parsear JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
    origin: 'https://cursify-nova-bd-iii-main-jluofxvyn-miltons-projects-6aa104f3.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
}

// Ruta raíz para comprobar el estado de la API
app.get('/', (req, res) => {
    res.json({
        message: "API de CursifyNova funcionando correctamente",
        environment: config.nodeEnv,
        version: "1.0.0"
    });
});

// IMPORTANTE: Registrar las rutas con el prefijo /api
app.use('/api', routes);

// Registrar rutas de cursos directamente (alternativa para probar)
import courseRoutes from './routes/courses';
app.use('/api/courses-direct', courseRoutes);

// Manejar rutas no encontradas
app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

export default app;
