"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
const register = async (req, res) => {
    try {
        const { nombre, username, email, password, intereses } = req.body;
        // Verificar si ya existe un usuario con ese email o username
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'El email ya está registrado'
                    : 'El nombre de usuario ya está en uso'
            });
        }
        // Crear nuevo usuario
        const user = await User_1.default.create({
            nombre,
            username,
            email,
            password,
            intereses: intereses || []
        });
        // Generar token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            role: user.rol
        });
        // Responder con el token y datos del usuario
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                username: user.username,
                email: user.email,
                rol: user.rol,
                intereses: user.intereses
            }
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};
exports.register = register;
/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Verificar que se proporcionen email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporcione email y contraseña'
            });
        }
        // Buscar al usuario y seleccionar explícitamente el campo password
        const user = await User_1.default.findOne({ email }).select('+password');
        // Verificar si el usuario existe
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        // Verificar si la contraseña es correcta
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        // Generar token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            role: user.rol
        });
        // Responder con el token y datos del usuario
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                username: user.username,
                email: user.email,
                rol: user.rol,
                premium: user.premium,
                intereses: user.intereses,
                avatarUrl: user.avatarUrl || ''
            }
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};
exports.login = login;
/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado
 */
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Buscar al usuario por ID
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        // Responder con los datos del usuario
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                nombre: user.nombre,
                username: user.username,
                email: user.email,
                rol: user.rol,
                premium: user.premium,
                intereses: user.intereses,
                avatarUrl: user.avatarUrl || '',
                biografia: user.biografia || '',
                fechaRegistro: user.fechaRegistro
            }
        });
    }
    catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil de usuario',
            error: error.message
        });
    }
};
exports.getProfile = getProfile;
/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/auth/profile
 * @access  Privado
 */
const updateProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        const { nombre, username, avatarUrl, biografia, intereses } = req.body;
        // Verificar si ya existe un usuario con ese username (excepto el usuario actual)
        if (username) {
            const existingUser = await User_1.default.findOne({
                username,
                _id: { $ne: userId }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                });
            }
        }
        // Actualizar usuario
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, {
            nombre,
            username,
            avatarUrl,
            biografia,
            intereses
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            user: {
                id: updatedUser._id,
                nombre: updatedUser.nombre,
                username: updatedUser.username,
                email: updatedUser.email,
                rol: updatedUser.rol,
                premium: updatedUser.premium,
                intereses: updatedUser.intereses,
                avatarUrl: updatedUser.avatarUrl || '',
                biografia: updatedUser.biografia || ''
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil de usuario',
            error: error.message
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * @desc    Cambiar contraseña
 * @route   PUT /api/auth/change-password
 * @access  Privado
 */
const changePassword = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren la contraseña actual y la nueva contraseña'
            });
        }
        // Obtener usuario con la contraseña (que normalmente se excluye)
        const user = await User_1.default.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        // Verificar si la contraseña actual es correcta
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }
        // Actualizar contraseña
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};
exports.changePassword = changePassword;
