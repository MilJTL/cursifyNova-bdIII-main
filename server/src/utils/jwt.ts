// src/utils/jwt.ts
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'cursifynova_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

export interface TokenPayload {
    userId: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
    });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};