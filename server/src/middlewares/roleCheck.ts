import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt';

// Extendemos el tipo Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * Middleware para verificar si el usuario tiene el rol requerido
 * @param roles Array de roles autorizados
 */
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // El middleware auth.ts ya debe haber verificado el token y añadido el usuario a req
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado - Se requiere autenticación'
            });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso prohibido - No tienes los permisos necesarios'
            });
        }

        // Si el rol es válido, continuar
        next();
    };
};

// Para uso sencillo con roles específicos
export const isAdmin = checkRole(['admin']);
export const isUser = checkRole(['user', 'admin']); // Admins también pueden acceder a rutas de usuarios