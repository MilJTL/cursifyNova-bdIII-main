"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config"); // ✅ Correcto - estás importando la configuración de la manera adecuada
// Middleware de autenticación
const authenticate = (req, res, next) => {
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
            const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            console.log("Token decodificado:", decodedToken);
            // Añadir el usuario a la request
            req.user = {
                userId: decodedToken.userId || decodedToken.id, // Permite ambos formatos
                role: decodedToken.role
            };
            next();
        }
        catch (tokenError) {
            console.error("Error al verificar token:", tokenError);
            return res.status(401).json({
                success: false,
                message: 'Token no válido o expirado'
            });
        }
    }
    catch (error) {
        console.error("Error general en autenticación:", error);
        res.status(401).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};
exports.authenticate = authenticate;
