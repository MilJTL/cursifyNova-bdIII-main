"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const index_1 = require("./index");
// Cliente de Redis
const redisClient = (0, redis_1.createClient)({
    url: index_1.config.redisUrl,
    database: 12
});
exports.redisClient = redisClient;
// Eventos de conexión
redisClient.on('error', (err) => console.error('Error de Redis:', err));
redisClient.on('connect', () => console.log('Conectado a Redis'));
// Función para conectar a Redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Conexión a Redis establecida');
    }
    catch (error) {
        console.error('Error al conectar con Redis:', error);
    }
};
exports.connectRedis = connectRedis;
