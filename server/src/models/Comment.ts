// src/models/Comment.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IReply {
    id: string;
    userId: mongoose.Types.ObjectId;
    contenido: string;
    fecha: Date;
}

export interface IComment extends Document {
    userId: mongoose.Types.ObjectId;
    leccionId: mongoose.Types.ObjectId;
    contenido: string;
    fecha: Date;
    respuestas: IReply[];
}

const commentSchema = new Schema<IComment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    leccionId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
        trim: true,
    },
    fecha: {
        type: Date,
        default: Date.now,
    },
    respuestas: [{
        id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        contenido: {
            type: String,
            required: true,
            trim: true,
        },
        fecha: {
            type: Date,
            default: Date.now,
        }
    }]
}, {
    timestamps: true
});

// Índices para búsquedas eficientes
commentSchema.index({ leccionId: 1 });
commentSchema.index({ userId: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);