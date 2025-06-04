import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para Course
export interface ICourse extends Document {
    _id: string;
    titulo: string;
    descripcion: string;
    premium: boolean;
    autor: mongoose.Types.ObjectId;
    modulos: mongoose.Types.ObjectId[]; // Ahora es un array de referencias
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
     _id: { // <--- ¡IMPORTANTE! Definir _id explícitamente como String
        type: String,
        required: true,
        unique: true // Asegura que los IDs sean únicos
    },
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
    modulos: [{
        type: Schema.Types.ObjectId,
        ref: 'Module'
    }],
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
    },
    // Habilitar toJSON y toObject para incluir virtuales y transformaciones
    id: true, // Esto asegura que se genere una propiedad 'id' virtual a partir de '_id'
    toJSON: {
        virtuals: true, // Incluir virtuales (como 'id')
        transform: function (doc, ret) {
            ret.id = ret._id; // _id ya es un string, lo asignamos a id
            delete ret._id; // Eliminar el _id original
            delete ret.__v; // Eliminar __v
        }
    },
    toObject: {
        virtuals: true, // Incluir virtuales
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Crear índices para búsqueda
courseSchema.index({ titulo: 'text', descripcion: 'text' });

export default mongoose.model<ICourse>('Course', courseSchema);
