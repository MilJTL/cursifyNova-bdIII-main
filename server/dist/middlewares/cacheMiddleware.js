"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheResponse = void 0;
const cache_1 = require("../utils/cache");
/**
 * Middleware para cachear respuestas
 * @param ttl Tiempo de vida en segundos
 */
const cacheResponse = (ttl = 3600) => {
    return async (req, res, next) => {
        // Solo cachear peticiones GET
        if (req.method !== 'GET') {
            next();
            return;
        }
        // Crear clave única para la caché
        const cacheKey = `api:${req.originalUrl}`;
        try {
            // Intentar obtener desde caché
            const cachedData = await cache_1.cache.get(cacheKey);
            if (cachedData) {
                res.json(cachedData);
                return;
            }
            // Si no está en caché, guardar la respuesta
            const originalJson = res.json;
            res.json = function (body) {
                // No cachear errores
                if (res.statusCode < 400) {
                    cache_1.cache.set(cacheKey, body, ttl)
                        .catch(err => console.error(`Error al guardar en caché: ${err}`));
                }
                return originalJson.call(this, body);
            };
            next();
        }
        catch (error) {
            console.error('Error en middleware de caché:', error);
            next();
        }
    };
};
exports.cacheResponse = cacheResponse;
/**
 * Middleware para limpiar caché por patrón
 */
const clearCache = (pattern) => {
    return async (_req, _res, next) => {
        try {
            await cache_1.cache.delPattern(pattern);
        }
        catch (error) {
            console.error(`Error al limpiar caché: ${error}`);
        }
        next();
    };
};
exports.clearCache = clearCache;
