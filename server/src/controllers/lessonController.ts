import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import Module from '../models/Module';
import Course from '../models/Course';

// Obtener todas las lecciones de un módulo
export const getLessonsByModule = async (req: Request, res: Response) => {
    try {
        const moduloId = req.params.moduloId;

        const lessons = await Lesson.find({ moduloId })
            .sort({ ordenIndice: 1 });

        res.status(200).json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener las lecciones'
        });
    }
};

// Obtener una lección específica
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.id;

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener la lección'
        });
    }
};

// Crear una nueva lección
export const createLesson = async (req: Request, res: Response) => {
    try {
        const {
            moduloId,
            titulo,
            contenido,
            tipo,
            duracion,
            recursosAdicionales,
            esGratis
        } = req.body;

        const userId = req.user?.userId;

        // Verificar si el módulo existe
        const module = await Module.findById(moduloId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        // Verificar que el usuario es el autor del curso
        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para añadir lecciones a este módulo'
            });
        }

        // Obtener el último índice de orden para añadir la lección al final
        const lastLesson = await Lesson.findOne({ moduloId }).sort({ ordenIndice: -1 });
        const ordenIndice = lastLesson ? lastLesson.ordenIndice + 1 : 0;

        // Crear la lección
        const newLesson = await Lesson.create({
            moduloId,
            titulo,
            contenido,
            tipo,
            duracion,
            recursosAdicionales: recursosAdicionales || [],
            esGratis: esGratis || false,
            ordenIndice
        });

        // Actualizar el módulo para añadir la referencia a la lección
        await Module.findByIdAndUpdate(moduloId, {
            $push: { lecciones: newLesson._id }
        });

        res.status(201).json({
            success: true,
            data: newLesson
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear la lección'
        });
    }
};

// Actualizar una lección
export const updateLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.id;
        const updateData = req.body;
        const userId = req.user?.userId;

        // Verificar si la lección existe
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        // Verificar que el usuario es el autor del curso asociado
        const module = await Module.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar esta lección'
            });
        }

        // Actualizar la lección
        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedLesson
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar la lección'
        });
    }
};

// Eliminar una lección
export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user?.userId;

        // Verificar si la lección existe
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        // Verificar que el usuario es el autor del curso asociado
        const module = await Module.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta lección'
            });
        }

        // Eliminar la lección
        await Lesson.findByIdAndDelete(lessonId);

        // Actualizar el módulo para eliminar la referencia a la lección
        await Module.findByIdAndUpdate(lesson.moduloId, {
            $pull: { lecciones: lessonId }
        });

        res.status(200).json({
            success: true,
            message: 'Lección eliminada correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar la lección'
        });
    }
};

// Reordenar lecciones
export const reorderLessons = async (req: Request, res: Response) => {
    try {
        const { moduloId, lessonOrder } = req.body;
        const userId = req.user?.userId;

        // Verificar el módulo existe
        const module = await Module.findById(moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        // Verificar que el usuario es el autor del curso
        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para reordenar estas lecciones'
            });
        }

        // Actualizar el orden de cada lección
        const updatePromises = lessonOrder.map((item: { id: string, order: number }) => {
            return Lesson.findByIdAndUpdate(item.id, { ordenIndice: item.order });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Lecciones reordenadas correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al reordenar las lecciones'
        });
    }
};