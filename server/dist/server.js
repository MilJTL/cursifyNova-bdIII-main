"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const config_1 = require("./config");
// Inicializar la conexión a la base de datos
const startServer = async () => {
    try {
        // Conectar a MongoDB
        await (0, db_1.default)();
        // Iniciar el servidor
        const server = app_1.default.listen(config_1.config.port, () => {
            console.log(`
            ╔═══════════════════════════════════════════════╗
            ║ Servidor CursifyNova ejecutándose             ║
            ║ Puerto: ${config_1.config.port.toString().padEnd(37, ' ')}║
            ║ Entorno: ${config_1.config.nodeEnv.padEnd(35, ' ')}║
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
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
// Iniciar el servidor
startServer();
