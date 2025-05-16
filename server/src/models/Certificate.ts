// ruta: src/models/Certificate.ts
import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface ICertificate extends Document {
    userId: mongoose.Types.ObjectId;
    cursoId: mongoose.Types.ObjectId;
    fechaEmision: Date;
    codigoVerificacion: string;
    urlDescarga: string;
}

const certificateSchema = new Schema<ICertificate>({
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
    fechaEmision: {
        type: Date,
        default: Date.now,
    },
    codigoVerificacion: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomBytes(16).toString('hex'),
    },
    urlDescarga: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados
certificateSchema.index({ userId: 1, cursoId: 1 }, { unique: true });

export default mongoose.model<ICertificate>('Certificate', certificateSchema);