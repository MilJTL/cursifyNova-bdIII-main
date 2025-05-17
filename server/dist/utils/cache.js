"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const db_redis_1 = require("../config/db_redis");
// Tiempo de vida por defecto: 1 hora
const DEFAULT_TTL = 3600;
/**
 * Servicio sencillo para manejar caché con Redis
 */
exports.cache = {
    /**
     * Obtener valor de la caché
     */
    async get(key) {
        try {
            const value = await db_redis_1.redisClient.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            console.error(`[Redis DB:12] Error al leer de caché (${key}):`, error);
            return null;
        }
    },
    /**
     * Guardar valor en caché
     */
    async set(key, value, ttl = DEFAULT_TTL) {
        try {
            await db_redis_1.redisClient.set(key, JSON.stringify(value), { EX: ttl });
            return true;
        }
        catch (error) {
            console.error(`Error al guardar en caché (${key}):`, error);
            return false;
        }
    },
    /**
     * Eliminar valor de caché
     */
    async del(key) {
        try {
            await db_redis_1.redisClient.del(key);
            return true;
        }
        catch (error) {
            console.error(`Error al eliminar de caché (${key}):`, error);
            return false;
        }
    },
    /**
     * Eliminar valores por patrón
     */
    async delPattern(pattern) {
        try {
            const keys = await db_redis_1.redisClient.keys(pattern);
            if (keys.length > 0) {
                await db_redis_1.redisClient.del(keys);
            }
            return true;
        }
        catch (error) {
            console.error(`Error al eliminar patrón (${pattern}):`, error);
            return false;
        }
    }
};
