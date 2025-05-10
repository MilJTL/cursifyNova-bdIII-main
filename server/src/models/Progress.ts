// src/models/Progress.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[];
    lastAccessedLesson: mongoose.Types.ObjectId;
    lastAccessedAt: Date;
    progressPercentage: number;
}

const ProgressSchema = new Schema<IProgress>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        completedLessons: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        lastAccessedLesson: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
        },
        progressPercentage: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Crear índice compuesto para búsquedas rápidas
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);