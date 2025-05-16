//server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'; // ✅ Correcto - estás importando la configuración de la manera adecuada

// Middleware de autenticación
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Añade este console.log para depuración
        console.log("Headers de autorización:", req.headers.authorization);
        
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No hay token, autorización denegada'
            });
        }

        // Verificar el token
        const token = authHeader.split(' ')[1];
        console.log("Token extraído:", token.substring(0, 20) + "...");
        
        try {
            const decodedToken = jwt.verify(token, config.jwtSecret);
            console.log("Token decodificado:", decodedToken);
            
            // Añadir el usuario a la request
            req.user = {
                userId: (decodedToken as jwt.JwtPayload).userId || (decodedToken as jwt.JwtPayload).id, // Permite ambos formatos
                role: (decodedToken as jwt.JwtPayload).role
            };

            next();
        } catch (tokenError) {
            console.error("Error al verificar token:", tokenError);
            return res.status(401).json({
                success: false,
                message: 'Token no válido o expirado'
            });
        }
    } catch (error) {
        console.error("Error general en autenticación:", error);
        res.status(401).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};