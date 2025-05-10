// server/src/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    titulo: string;
    descripcion: string;
    premium: boolean;
    autor: mongoose.Types.ObjectId;
    modulos: mongoose.Types.ObjectId[];
    etiquetas: string[];
    fechaCreacion: Date;
    duracionEstimada: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    imagenCurso: string;
}

const courseSchema = new Schema<ICourse>({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
    },
    premium: {
        type: Boolean,
        default: false,
    },
    autor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    modulos: [{
        type: Schema.Types.ObjectId,
        ref: 'Module',
    }],
    etiquetas: [{
        type: String,
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    duracionEstimada: {
        type: String,
    },
    nivel: {
        type: String,
        enum: ['principiante', 'intermedio', 'avanzado'],
        default: 'principiante',
    },
    imagenCurso: {
        type: String,
        default: 'default-course.jpg',
    }
});

export default mongoose.model<ICourse>('Course', courseSchema);