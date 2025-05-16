// src/models/Progress.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    lessonesCompletadas: mongoose.Types.ObjectId[];
    fechaInicio: Date;
    ultimoAcceso: Date;
    porcentajeCompletado: number;
}

const progressSchema = new Schema<IProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lessonesCompletadas: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: {
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
    timestamps: true
});

// Crear índice compuesto para búsqueda eficiente
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', progressSchema);