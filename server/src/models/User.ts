// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    nombre: string;
    username: string;
    email: string;
    password: string;
    rol: 'user' | 'admin';
    premium: boolean;
    intereses: string[];
    cursosInscritos?: mongoose.Types.ObjectId[];
    certificados?: mongoose.Types.ObjectId[];
    fechaRegistro: Date;
    avatarUrl?: string;
    biografia?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    certificados: [{
        type: mongoose.Schema.Types.ObjectId,
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
    timestamps: true
});

// Middleware para encriptar la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function(next) {
    // Solo hashear la contraseña si ha sido modificada o es nueva
    if (!this.isModified('password')) return next();
    
    try {
        // Generar un salt
        const salt = await bcrypt.genSalt(10);
        
        // Hashear la contraseña con el salt
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
        throw new Error('Error al comparar contraseñas');
    }
};

export default mongoose.model<IUser>('User', UserSchema);