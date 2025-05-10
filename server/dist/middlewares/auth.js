"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware para autenticación con JWT
 */
const authenticate = async (req, res, next) => {
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
        const decodedToken = (0, jwt_1.verifyToken)(token);
        // Añadir el usuario al request
        req.user = decodedToken;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};
exports.authenticate = authenticate;
