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
const lessonSchema = new mongoose_1.Schema({
    moduloId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model('Lesson', lessonSchema);
