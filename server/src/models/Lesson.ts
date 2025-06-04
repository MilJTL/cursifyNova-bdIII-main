// server/src/models/Lesson.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de Lección
export interface ILesson extends Document {
    _id: mongoose.Types.ObjectId; // Asumiendo que los IDs de lección son ObjectId estándar
    titulo: string;
    contenido: string; // Puede ser texto o URL de video
    tipo: 'texto' | 'video' | 'quiz';
    moduloId: string; // <--- ¡IMPORTANTE! Cambiado a string para IDs de módulo personalizados
    ordenIndice: number;
    duracionMinutos?: number; // Cambiado de 'duracion: string' a 'duracionMinutos?: number'
    esGratis: boolean;
    recursosAdicionales?: {
        titulo: string;
        url: string;
        tipo: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Definir el esquema de Mongoose para la Lección
const lessonSchema = new Schema<ILesson>({
    titulo: {
        type: String,
        required: [true, 'El título de la lección es obligatorio'],
        trim: true
    },
    contenido: {
        type: String,
        required: [true, 'El contenido de la lección es obligatorio']
    },
    tipo: {
        type: String,
        enum: ['texto', 'video', 'quiz'],
        required: [true, 'El tipo de lección es obligatorio']
    },
    moduloId: {
        type: String, // <--- ¡AQUÍ ESTÁ EL CAMBIO CRUCIAL! Ahora es String
        ref: 'Module', // La referencia sigue siendo al modelo Module
        required: true
    },
    ordenIndice: {
        type: Number,
        required: [true, 'El orden de la lección es obligatorio'],
        min: 0
    },
    duracionMinutos: { // <--- Cambiado de 'duracion' a 'duracionMinutos' y tipo Number
        type: Number,
        min: 0
    },
    esGratis: {
        type: Boolean,
        default: false
    },
    recursosAdicionales: [{
        titulo: { type: String, required: true },
        url: { type: String, required: true },
        tipo: { type: String, enum: ['pdf', 'link'], required: true }
    }]
}, {
    timestamps: true,
    toJSON: { // Añadir transformaciones para el _id a id
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Crear índice compuesto para búsqueda eficiente
lessonSchema.index({ moduloId: 1, ordenIndice: 1 }, { unique: true });
lessonSchema.index({ titulo: 'text', contenido: 'text' }); // Añadido índice de texto si es necesario

export default mongoose.model<ILesson>('Lesson', lessonSchema);
