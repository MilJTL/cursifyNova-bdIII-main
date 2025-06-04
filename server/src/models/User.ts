// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para el documento de Usuario
export interface IUser extends Document {
    // Si tus IDs de usuario son ObjectId generados por MongoDB, no necesitas '_id: string;' aquí.
    // Si tus IDs de usuario son strings personalizados (ej. "u100"), entonces sí:
    // _id: string; 
    nombre: string;
    username: string;
    email: string;
    password: string;
    rol: 'user' | 'admin';
    premium: boolean;
    intereses: string[];
    cursosInscritos: string[]; // <--- ¡IMPORTANTE! Cambiado a string[]
    certificados?: mongoose.Types.ObjectId[]; // Asumiendo que Certificate usa ObjectId
    fechaRegistro: Date;
    avatarUrl?: string;
    biografia?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Definir el esquema de Mongoose para el Usuario
const UserSchema: Schema = new Schema({
    // Si tus IDs de usuario son strings personalizados (ej. "u100"), descomenta y usa esto:
    /*
    _id: { 
        type: String,
        required: true,
        unique: true
    },
    */
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingrese un email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No incluir en las consultas por defecto
    },
    rol: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    premium: {
        type: Boolean,
        default: false
    },
    intereses: {
        type: [String],
        default: []
    },
    cursosInscritos: [{
        type: String, // <--- ¡AQUÍ ESTÁ EL CAMBIO CRUCIAL! Ahora es String
        ref: 'Course' // La referencia sigue siendo al modelo Course
    }],
    certificados: [{
        type: mongoose.Schema.Types.ObjectId, // Asumiendo que Certificate usa ObjectId
        ref: 'Certificate'
    }],
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    biografia: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { // Añadir transformaciones para el _id a id
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id; // Convertir _id a id
            delete ret._id;
            delete ret.__v;
            delete ret.password; // Asegurarse de que la contraseña no se envíe
        }
    },
    toObject: { // Añadir transformaciones para el _id a id
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    }
});

// Middleware para encriptar la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        // Loguear el error para depuración
        console.error('Error en comparePassword:', error);
        throw new Error('Error al comparar contraseñas');
    }
};

export default mongoose.model<IUser>('User', UserSchema);
