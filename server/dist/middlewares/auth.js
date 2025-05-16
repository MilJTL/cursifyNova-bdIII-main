"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
// Middleware de autenticación
const authenticate = (req, res, next) => {
    try {
        // Añade este console.log para depuración
        console.log("Headers de autorización:", req.headers.authorization);
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No hay token, autorización denegada'
            });
            return; // Importante: return sin devolver res.status()
        }
        // Verificar el token
        const token = authHeader.split(' ')[1];
        console.log("Token extraído:", token.substring(0, 20) + "...");
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            console.log("Token decodificado:", decodedToken);
            // Añadir el usuario a la request
            req.user = {
                userId: decodedToken.userId || decodedToken.id,
                role: decodedToken.role
            };
            next();
        }
        catch (tokenError) {
            console.error("Error al verificar token:", tokenError);
            res.status(401).json({
                success: false,
                message: 'Token no válido o expirado'
            });
            // No uses return res.status()
        }
    }
    catch (error) {
        console.error("Error general en autenticación:", error);
        res.status(401).json({
            success: false,
            message: 'Error de autenticación'
        });
        // No uses return res.status()
    }
};
exports.authenticate = authenticate;
// Si necesitas el middleware authorize que se menciona en el error
const authorize = (roles) => {
    return (req, res, next) => {
        var _a;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        if (!roles.includes((_a = req.user.role) !== null && _a !== void 0 ? _a : '')) {
            res.status(403).json({
                success: false,
                message: 'No tienes permiso para acceder a este recurso'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
/*import { Request, Response, NextFunction } from 'express';
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
};*/ 
