"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const generateToken = (payload) => {
    // Usar aserción de tipo para evitar errores con expiresIn
    const options = {
        expiresIn: config_1.config.jwtExpire
    };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        // Solución: Añadir aserciones de tipo
        return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
    }
    catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
exports.verifyToken = verifyToken;
