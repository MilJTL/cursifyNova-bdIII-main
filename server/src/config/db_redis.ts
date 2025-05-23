import { createClient } from 'redis';
import { config } from './index';

// Cliente de Redis
const redisClient = createClient({
  url: config.redisUrl,
  socket: {
    tls: true, // Obligatorio para Upstash
    host: new URL(config.redisUrl).hostname,
    rejectUnauthorized: false, // Puede ser necesario con SSL para Upstash
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
  }
});

// Eventos de conexión
redisClient.on('error', (err) => console.error('❌ Error de Redis:', err));
redisClient.on('connect', () => console.log('✅ Conectado a Redis en:', config.redisUrl));

// Función para conectar a Redis
export const connectRedis = async () => {
  if (!config.redisUrl) {
    console.error("REDIS_URL no está definida en la configuración.");
    // No lanzar un error aquí, ya que el cliente Redis se creará de todos modos.
    // Simplemente registra el error y permite que la aplicación continúe,
    // pero las operaciones de Redis fallarán.
  }
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Error al conectar a Redis:', error);
    // Puedes decidir si la aplicación debe salir aquí o manejarlo de otra manera
    // process.exit(1);
  }
};
export { redisClient };
