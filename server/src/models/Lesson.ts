import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
    moduloId: mongoose.Types.ObjectId;
    titulo: string;
    contenido: string;
    tipo: 'video' | 'texto' | 'quiz';
    duracion: string;
    ordenIndice: number; // Para mantener el orden de las lecciones en un módulo
    recursosAdicionales: {
        tipo: string;
        url: string;
        titulo: string;
    }[];
    esGratis: boolean; // Indica si la lección es gratuita incluso en un curso premium
}

const lessonSchema = new Schema<ILesson>({
    moduloId: {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
    },
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
    },
    tipo: {
        type: String,
        enum: ['video', 'texto', 'quiz'],
        default: 'video',
    },
    duracion: {
        type: String,
    },
    ordenIndice: {
        type: Number,
        default: 0,
    },
    recursosAdicionales: [{
        tipo: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        titulo: {
            type: String,
            required: true,
        }
    }],
    esGratis: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});
// Añadir al final del schema, antes de exportar el modelo
lessonSchema.index({ titulo: 'text', contenido: 'text' });
export default mongoose.model<ILesson>('Lesson', lessonSchema);