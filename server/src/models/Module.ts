// server/src/models/Module.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
    _id: mongoose.Types.ObjectId; // Asumiendo que los IDs de módulo son ObjectId estándar
    titulo: string;
    cursoId: string; // <--- ¡IMPORTANTE! Cambiado a string
    lecciones: mongoose.Types.ObjectId[]; // Asumiendo que los IDs de lección son ObjectId estándar
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
        type: String, // <--- ¡AQUÍ ESTÁ EL CAMBIO CRUCIAL! Ahora es String
        ref: 'Course', // La referencia sigue siendo al modelo Course
        required: true,
    },
    lecciones: [{
        type: Schema.Types.ObjectId, // Asumiendo que los IDs de lección son ObjectId estándar
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
// Añadir al final del schema, antes de exportar el modelo
moduleSchema.index({ titulo: 'text', descripcion: 'text' });

export default mongoose.model<IModule>('Module', moduleSchema);
