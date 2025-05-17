import { redisClient } from '../config/db_redis';

// Tiempo de vida por defecto: 1 hora
const DEFAULT_TTL = 3600;

/**
 * Servicio sencillo para manejar caché con Redis
 */
export const cache = {
  /**
   * Obtener valor de la caché
   */
  async get(key: string) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      console.error(`[Redis DB:12] Error al leer de caché (${key}):`, error);
      return null;
    }
  },

  /**
   * Guardar valor en caché
   */
  async set(key: string, value: any, ttl = DEFAULT_TTL) {
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      console.error(`Error al guardar en caché (${key}):`, error);
      return false;
    }
  },

  /**
   * Eliminar valor de caché
   */
  async del(key: string) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar de caché (${key}):`, error);
      return false;
    }
  },

  /**
   * Eliminar valores por patrón
   */
  async delPattern(pattern: string) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`Error al eliminar patrón (${pattern}):`, error);
      return false;
    }
  }
};