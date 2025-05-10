// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

/**
 * Middleware para autenticación con JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Se requiere token de autenticación'
            });
        }
        
        // Extraer el token
        const token = authHeader.split(' ')[1];
        
        // Verificar el token
        const decodedToken = verifyToken(token);
        
        // Añadir el usuario al request
        req.user = decodedToken;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};