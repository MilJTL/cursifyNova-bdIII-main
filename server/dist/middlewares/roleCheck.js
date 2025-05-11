"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isAdmin = exports.checkRole = void 0;
/**
 * Middleware para verificar si el usuario tiene el rol requerido
 * @param roles Array de roles autorizados
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        // El middleware auth.ts ya debe haber verificado el token y añadido el usuario a req
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado - Se requiere autenticación'
            });
        }
        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso prohibido - No tienes los permisos necesarios'
            });
        }
        // Si el rol es válido, continuar
        next();
    };
};
exports.checkRole = checkRole;
// Para uso sencillo con roles específicos
exports.isAdmin = (0, exports.checkRole)(['admin']);
exports.isUser = (0, exports.checkRole)(['user', 'admin']); // Admins también pueden acceder a rutas de usuarios
