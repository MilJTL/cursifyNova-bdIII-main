import { Request, Response } from 'express';
import Progress from '../models/Progress';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';

// Obtener el progreso general del usuario en todos sus cursos
export const getUserProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const progress = await Progress.find({ userId })
            .populate('courseId', 'titulo imagenCurso nivel')
            .sort({ ultimoAcceso: -1 });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del usuario'
        });
    }
};

// Obtener el progreso detallado del usuario en un curso específico
export const getCourseProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const courseId = req.params.id;

        // Buscar el progreso existente
        let progress = await Progress.findOne({ userId, courseId })
            .populate('lessonesCompletadas');

        if (!progress) {
            // Si no existe, inicializar uno nuevo
            progress = await Progress.create({
                userId,
                courseId,
                lessonesCompletadas: [],
                porcentajeCompletado: 0
            });
        }

        // Obtener total de lecciones del curso para calcular porcentaje
        const modules = await Module.find({ cursoId: courseId });
        let totalLessons = 0;
        
        for (const module of modules) {
            const lessonCount = await Lesson.countDocuments({ moduloId: module._id });
            totalLessons += lessonCount;
        }

        // Actualizar el porcentaje completado
        const porcentajeCompletado = totalLessons > 0 
            ? (progress.lessonesCompletadas.length / totalLessons) * 100 
            : 0;

        // Si el porcentaje cambió, actualizarlo
        if (progress.porcentajeCompletado !== porcentajeCompletado) {
            progress.porcentajeCompletado = porcentajeCompletado;
            await progress.save();
        }

        res.status(200).json({
            success: true,
            data: {
                ...progress.toObject(),
                totalLessons,
                completedLessons: progress.lessonesCompletadas.length
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del curso'
        });
    }
};

// Marcar una lección como completada
export const markLessonAsCompleted = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const lessonId = req.params.id;

        // Verificar si la lección existe
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        // Obtener el módulo al que pertenece la lección
        const module = await Module.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        const courseId = module.cursoId;

        // Buscar o crear un registro de progreso
        let progress = await Progress.findOne({ userId, courseId });
        
        if (!progress) {
            progress = await Progress.create({
                userId,
                courseId,
                lessonesCompletadas: [lessonId],
                ultimoAcceso: new Date()
            });
        } else {
            // Verificar si ya está marcada como completada
            const yaCompletada = progress.lessonesCompletadas
                .map(id => id.toString())
                .includes(lessonId);

            if (!yaCompletada) {
                // Añadir la lección a las completadas
                progress.lessonesCompletadas.push(lessonId as any);
            }
            
            // Actualizar fecha de último acceso
            progress.ultimoAcceso = new Date();
            await progress.save();
        }

        // Recalcular porcentaje de completado
        const modules = await Module.find({ cursoId: courseId });
        let totalLessons = 0;
        
        for (const mod of modules) {
            const lessonCount = await Lesson.countDocuments({ moduloId: mod._id });
            totalLessons += lessonCount;
        }

        const porcentajeCompletado = totalLessons > 0 
            ? (progress.lessonesCompletadas.length / totalLessons) * 100 
            : 0;

        progress.porcentajeCompletado = porcentajeCompletado;
        await progress.save();

        res.status(200).json({
            success: true,
            message: 'Lección marcada como completada',
            data: {
                porcentajeCompletado,
                totalLessons,
                completedLessons: progress.lessonesCompletadas.length
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al marcar la lección como completada'
        });
    }
};