// src/models/Progress.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    cursoId: mongoose.Types.ObjectId;
    leccionesCompletadas: mongoose.Types.ObjectId[];
    ultimaLeccion: mongoose.Types.ObjectId;
    porcentajeCompletado: number;
    fechaInicio: Date;
    fechaUltimaActividad: Date;
}

const progressSchema = new Schema<IProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cursoId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    leccionesCompletadas: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    }],
    ultimaLeccion: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    porcentajeCompletado: {
        type: Number,
        default: 0,
    },
    fechaInicio: {
        type: Date,
        default: Date.now,
    },
    fechaUltimaActividad: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// Índice compuesto para buscar rápido por usuario y curso
progressSchema.index({ userId: 1, cursoId: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', progressSchema);