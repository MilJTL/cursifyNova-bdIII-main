"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapController = exports.asyncHandler = void 0;
/**
 * Wrapper para controladores que convierte las funciones de controlador
 * a un formato compatible con el sistema de tipos de Express
 *
 * @param controller Función de controlador
 * @returns Función de middleware compatible con Express
 */
const asyncHandler = (controller) => {
    return (req, res, next) => {
        Promise.resolve(controller(req, res, next))
            .catch((err) => {
            console.error('Error en controlador:', err);
            next(err);
        });
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Versión simplificada del wrapper para controladores síncronos
 */
const wrapController = (controller) => {
    return (req, res, next) => {
        try {
            controller(req, res, next);
        }
        catch (err) {
            console.error('Error en controlador síncrono:', err);
            next(err);
        }
    };
};
exports.wrapController = wrapController;
