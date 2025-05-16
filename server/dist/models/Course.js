"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Esquema principal del curso
const courseSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    modulos: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
    }
});
// Crear índices para búsqueda
courseSchema.index({ titulo: 'text', descripcion: 'text' });
exports.default = mongoose_1.default.model('Course', courseSchema);
