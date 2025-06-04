// src/models/Progress.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de Progreso
export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId; // Asumiendo que userId es un ObjectId estándar
    courseId: string; // <--- ¡IMPORTANTE! Cambiado a string para IDs de curso personalizados
    leccionesCompletadas: mongoose.Types.ObjectId[]; // <--- ¡TYPO CORREGIDO! Asumiendo que lessonId es ObjectId
    fechaInicio: Date;
    ultimoAcceso: Date; // <--- Cambiado de 'ultimoAcceso' a 'ultimoAcceso' para coincidir con el controlador
    porcentajeCompletado: number;
}

const progressSchema = new Schema<IProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: String, // <--- ¡AQUÍ ESTÁ EL CAMBIO CRUCIAL! Ahora es String
        ref: 'Course', // La referencia sigue siendo al modelo Course
        required: true
    },
    leccionesCompletadas: [{ // <--- ¡TYPO CORREGIDO!
        type: Schema.Types.ObjectId, // Asumiendo que lessonId es un ObjectId estándar
        ref: 'Lesson'
    }],
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: { // <--- Cambiado de 'ultimoAcceso' a 'ultimoAcceso' para coincidir con el controlador
        type: Date,
        default: Date.now
    },
    porcentajeCompletado: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true,
    toJSON: { // Añadir transformaciones para el _id a id si es necesario
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
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', progressSchema);
