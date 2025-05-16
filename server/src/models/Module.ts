// server/src/models/Module.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
    titulo: string;
    cursoId: mongoose.Types.ObjectId;
    lecciones: mongoose.Types.ObjectId[];
    descripcion?: string;
    ordenIndice: number; // Para mantener el orden de los módulos en un curso
}

const moduleSchema = new Schema<IModule>({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
    },
    cursoId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    lecciones: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    }],
    descripcion: {
        type: String,
    },
    ordenIndice: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});
// Añadir al final del schema, antes de exportar el modelo
moduleSchema.index({ titulo: 'text', descripcion: 'text' });

export default mongoose.model<IModule>('Module', moduleSchema);