// src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';



// Configuración de multer para almacenar avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
    
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Filtro para permitir solo imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter
});

/**
 * @desc    Subir avatar de usuario
 * @route   POST /api/auth/avatar
 * @access  Privado
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    // Crear URL para el avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Actualizar el usuario con la nueva URL de avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      url: avatarUrl,
      message: 'Avatar actualizado correctamente'
    });
  } catch (error: any) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir avatar',
      error: error.message
    });
  }
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { nombre, username, email, password, intereses } = req.body;

        // Verificar si ya existe un usuario con ese email o username
        const existingUser = await User.findOne({
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
        const user = await User.create({
            nombre,
            username,
            email,
            password,
            intereses: intereses || []
        });

        // Generar token
        const token = generateToken({
            userId: (user._id as string).toString(),
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
    } catch (error: any) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
export const login = async (req: Request, res: Response) => {
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
        const user = await User.findOne({ email }).select('+password');

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
        const token = generateToken({
            userId: (user._id as string).toString(),
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
    } catch (error: any) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Buscar al usuario por ID
        const user = await User.findById(userId);
        
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
    } catch (error: any) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil de usuario',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/auth/profile
 * @access  Privado
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const { nombre, username, avatarUrl, biografia, intereses } = req.body;

        // Verificar si ya existe un usuario con ese username (excepto el usuario actual)
        if (username) {
            const existingUser = await User.findOne({ 
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
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                nombre,
                username,
                avatarUrl,
                biografia,
                intereses
            },
            { new: true, runValidators: true }
        );

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
    } catch (error: any) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil de usuario',
            error: error.message
        });
    }
};

/**
 * @desc    Cambiar contraseña
 * @route   PUT /api/auth/change-password
 * @access  Privado
 */
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        
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
        const user = await User.findById(userId).select('+password');
        
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
    } catch (error: any) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};