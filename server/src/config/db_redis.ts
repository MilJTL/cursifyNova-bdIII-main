import { createClient } from 'redis';
import { config } from './index';

// Cliente de Redis
const redisClient = createClient({
  url: config.redisUrl,

  socket: {
    tls: true,                  // <- Obligatorio para Upstash
    host: new URL(config.redisUrl).hostname, 
    rejectUnauthorized: false    // <- Necesario con SSL
  }

    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000)}

});

// Eventos de conexión
redisClient.on('error', (err) => console.error('❌ Error de Redis:', err));
redisClient.on('connect', () => console.log('✅ Conectado a Redis en:', config.redisUrl));

// Función para conectar a Redis
export const connectRedis = async () => {
    if (!config.redisUrl) throw new Error("REDIS_URL no está definida");
    await redisClient.connect();
};

export { redisClient };
