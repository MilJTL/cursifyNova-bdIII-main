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
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging en desarrollo
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Ruta principal para verificar que la API está funcionando
app.get('/', (req, res) => {
    res.json({
        message: 'API de CursifyNova funcionando correctamente',
        environment: config.nodeEnv,
        version: '1.0.0'
    });
});

// Rutas de la API
app.use('/api', routes);

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Middleware para manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error no manejado:', err.stack);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: config.nodeEnv === 'development' ? err.stack : undefined
    });
});

export default app;