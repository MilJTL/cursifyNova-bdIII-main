// src/models/Module.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
    title: string;
    courseId: mongoose.Types.ObjectId;
    lessons: mongoose.Types.ObjectId[];
    order: number;
}

const ModuleSchema = new Schema<IModule>(
    {
        title: {
            type: String,
            required: [true, 'El título del módulo es requerido'],
            trim: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        lessons: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        order: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IModule>('Module', ModuleSchema);