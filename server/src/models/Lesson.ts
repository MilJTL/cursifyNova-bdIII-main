// src/models/Lesson.ts
import mongoose, { Document, Schema } from 'mongoose';

interface Resource {
    type: 'pdf' | 'link' | 'quiz' | 'code';
    title: string;
    url: string;
}

export interface ILesson extends Document {
    title: string;
    moduleId: mongoose.Types.ObjectId;
    content: string; // URL del video
    description: string;
    type: 'video' | 'text' | 'quiz';
    duration: string;
    order: number;
    resources: Resource[];
}

const LessonSchema = new Schema<ILesson>(
    {
        title: {
            type: String,
            required: [true, 'El título de la lección es requerido'],
            trim: true,
        },
        moduleId: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'El contenido de la lección es requerido'],
        },
        description: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['video', 'text', 'quiz'],
            default: 'video',
        },
        duration: {
            type: String,
            default: '0min',
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        resources: [
            {
                type: {
                    type: String,
                    enum: ['pdf', 'link', 'quiz', 'code'],
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILesson>('Lesson', LessonSchema);