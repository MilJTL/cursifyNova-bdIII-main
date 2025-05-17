import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache';
/**
 * Middleware para cachear respuestas
 * @param ttl Tiempo de vida en segundos
 */
export const cacheResponse = (ttl = 3600) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Solo cachear peticiones GET
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Crear clave única para la caché
    const cacheKey = `api:${req.originalUrl}`;

    try {
      // Intentar obtener desde caché
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      // Si no está en caché, guardar la respuesta
      const originalJson = res.json;
      
      res.json = function(body) {
        // No cachear errores
        if (res.statusCode < 400) {
          cache.set(cacheKey, body, ttl)
            .catch(err => console.error(`Error al guardar en caché: ${err}`));
        }
        
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      next();
    }
  };
};

/**
 * Middleware para limpiar caché por patrón
 */
export const clearCache = (pattern: string) => {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await cache.delPattern(pattern);
    } catch (error) {
      console.error(`Error al limpiar caché: ${error}`);
    }
    next();
  };
};