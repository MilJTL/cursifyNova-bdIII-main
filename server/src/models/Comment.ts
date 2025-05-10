// src/models/Comment.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IReply {
    replyId: string;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface IComment extends Document {
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    replies: IReply[];
}

const CommentSchema = new Schema<IComment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'El contenido del comentario es requerido'],
            trim: true,
        },
        replies: [
            {
                replyId: {
                    type: String,
                    default: () => new mongoose.Types.ObjectId().toString(),
                },
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IComment>('Comment', CommentSchema);