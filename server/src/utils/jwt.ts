import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
    userId: string;
    role: string;
    [key: string]: any; // Permite propiedades adicionales
}

export const generateToken = (payload: TokenPayload): string => {
    // Usar aserción de tipo para evitar errores con expiresIn
    const options = {
        expiresIn: config.jwtExpire
    } as jwt.SignOptions;
    
    return jwt.sign(
        payload as object, 
        config.jwtSecret as string,
        options
    );
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        // Solución: Añadir aserciones de tipo
        return jwt.verify(token, config.jwtSecret as string) as TokenPayload;
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};