// server/src/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

// Esquema para recursos adicionales
interface IRecursoAdicional {
    titulo: string;
    url: string;
    tipo: 'pdf' | 'link' | 'video' | 'otro';
}

// Esquema para lecciones
interface ILeccion {
    titulo: string;
    descripcion?: string;
    tipo: 'video' | 'texto' | 'quiz';
    contenido: string;
    videoUrl?: string;
    duracion?: number;
    orden: number;
    recursosAdicionales?: IRecursoAdicional[];
}

const LeccionSchema = new Schema<ILeccion>({
    titulo: {
        type: String,
        required: [true, 'El título de la lección es obligatorio'],
        trim: true
    },
    descripcion: String,
    tipo: {
        type: String,
        enum: ['video', 'texto', 'quiz'],
        required: true
    },
    contenido: String,
    videoUrl: String,
    duracion: Number,
    orden: Number,
    recursosAdicionales: [{
        titulo: String,
        url: String,
        tipo: {
            type: String,
            enum: ['pdf', 'link', 'video', 'otro']
        }
    }]
});

// Esquema para módulos
interface IModulo {
    titulo: string;
    descripcion?: string;
    orden: number;
    lecciones: ILeccion[];
}

const ModuloSchema = new Schema<IModulo>({
    titulo: {
        type: String,
        required: [true, 'El título del módulo es obligatorio'],
        trim: true
    },
    descripcion: String,
    orden: Number,
    lecciones: [LeccionSchema]
});

// Interfaz para Course
export interface ICourse extends Document {
    titulo: string;
    descripcion: string;
    premium: boolean;
    autor: mongoose.Types.ObjectId;
    modulos: IModulo[];
    etiquetas: string[];
    fechaCreacion: Date;
    fechaActualizacion: Date;
    duracionEstimada: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    imagenCurso: string;
    valoracion: number;
    numValoraciones: number;
    publicado: boolean;
}

// Esquema principal del curso
const courseSchema = new Schema<ICourse>({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        maxlength: [100, 'El título no puede tener más de 100 caracteres']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
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
    modulos: [ModuloSchema],
    etiquetas: [{
        type: String,
        trim: true
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
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
    },
    valoracion: {
        type: Number,
        default: 0,
        min: [0, 'La valoración mínima es 0'],
        max: [5, 'La valoración máxima es 5']
    },
    numValoraciones: {
        type: Number,
        default: 0
    },
    publicado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaActualizacion'
    }
});

// Crear índices para búsqueda
courseSchema.index({ titulo: 'text', descripcion: 'text' });

export default mongoose.model<ICourse>('Course', courseSchema);