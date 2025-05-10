// src/server.ts
import app from './app';
import connectDB from './config/db';
import { config } from './config';

// Inicializar la conexión a la base de datos
const startServer = async () => {
    try {
        // Conectar a MongoDB
        await connectDB();
        
        // Iniciar el servidor
        const server = app.listen(config.port, () => {
            console.log(`
            ╔═══════════════════════════════════════════════╗
            ║ Servidor CursifyNova ejecutándose             ║
            ║ Puerto: ${config.port.toString().padEnd(37, ' ')}║
            ║ Entorno: ${config.nodeEnv.padEnd(35, ' ')}║
            ╚═══════════════════════════════════════════════╝
            `);
        });

        // Manejo de señales para cierre graceful
        process.on('SIGTERM', () => {
            console.log('SIGTERM recibido. Cerrando servidor...');
            server.close(() => {
                console.log('Servidor cerrado.');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('SIGINT recibido. Cerrando servidor...');
            server.close(() => {
                console.log('Servidor cerrado.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar el servidor
startServer();