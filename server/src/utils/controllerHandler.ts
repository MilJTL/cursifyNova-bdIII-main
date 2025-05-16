import { Request, Response, NextFunction } from 'express';

/**
 * Tipo para los controladores de Express que pueden devolver una respuesta o undefined
 */
export type ControllerFunction = (
    req: Request,
    res: Response,
    next?: NextFunction
) => Promise<any> | any;

/**
 * Wrapper para controladores que convierte las funciones de controlador
 * a un formato compatible con el sistema de tipos de Express
 * 
 * @param controller Función de controlador
 * @returns Función de middleware compatible con Express
 */
export const asyncHandler = (controller: ControllerFunction) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(controller(req, res, next))
            .catch((err) => {
                console.error('Error en controlador:', err);
                next(err);
            });
    };
};

/**
 * Versión simplificada del wrapper para controladores síncronos
 */
export const wrapController = (controller: ControllerFunction) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            controller(req, res, next);
        } catch (err) {
            console.error('Error en controlador síncrono:', err);
            next(err);
        }
    };
};