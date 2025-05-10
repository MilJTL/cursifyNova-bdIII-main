// src/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    premium: boolean;
    author: mongoose.Types.ObjectId;
    modules: mongoose.Types.ObjectId[];
    tags: string[];
    createdAt: Date;
    estimatedDuration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    imageUrl: string;
}

const CourseSchema = new Schema<ICourse>(
    {
        title: {
            type: String,
            required: [true, 'El título del curso es requerido'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'La descripción del curso es requerida'],
        },
        premium: {
            type: Boolean,
            default: false,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        modules: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Module',
            },
        ],
        tags: {
            type: [String],
            default: [],
        },
        estimatedDuration: {
            type: String,
            default: '0h 0min',
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        imageUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICourse>('Course', CourseSchema);