import { createClient } from 'redis';
import { config } from './index';

// Cliente de Redis
const redisClient = createClient({
  url: config.redisUrl,
  database: 12
});

// Eventos de conexión
redisClient.on('error', (err) => console.error('Error de Redis:', err));
redisClient.on('connect', () => console.log('Conectado a Redis'));

// Función para conectar a Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Conexión a Redis establecida');
  } catch (error) {
    console.error('Error al conectar con Redis:', error);
  }
};

export { redisClient };