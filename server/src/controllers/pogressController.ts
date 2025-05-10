import { Request, Response } from 'express';
import Progress from '../models/Progress';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import User from '../models/User';

// Obtener el progreso de un usuario en un curso específico
export const getProgressByCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const cursoId = req.params.cursoId;

        const progress = await Progress.findOne({ userId, cursoId })
            .populate('ultimaLeccion')
            .populate({
                path: 'leccionesCompletadas',
                select: '_id titulo'
            });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró progreso para este curso'
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del curso'
        });
    }
};

// Iniciar progreso de un curso (cuando el usuario se inscribe)
export const initializeProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const cursoId = req.params.cursoId;

        // Verificar si el usuario está inscrito en el curso
        const user = await User.findById(userId);
        if (!user || !user.cursosInscritos || !user.cursosInscritos.some((id: any) => id.toString() === cursoId)) {
            return res.status(403).json({
                success: false,
                message: 'No estás inscrito en este curso'
            });
        }

        // Verificar si ya existe un progreso para este curso
        let progress = await Progress.findOne({ userId, cursoId });

        if (progress) {
            return res.status(200).json({
                success: true,
                data: progress,
                message: 'El progreso ya está inicializado'
            });
        }

        // Obtener la primera lección del curso
        const course = await Course.findById(cursoId).populate({
            path: 'modulos',
            options: { sort: { ordenIndice: 1 } }
        });

        if (!course || !course.modulos || course.modulos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado o sin módulos'
            });
        }

        const firstModule = course.modulos[0];
        const firstLesson = await Lesson.findOne({ moduloId: firstModule._id }).sort({ ordenIndice: 1 });

        // Crear un nuevo registro de progreso
        progress = await Progress.create({
            userId,
            cursoId,
            ultimaLeccion: firstLesson ? firstLesson._id : null,
            leccionesCompletadas: [],
            porcentajeCompletado: 0,
            fechaInicio: new Date(),
            fechaUltimaActividad: new Date()
        });

        res.status(201).json({
            success: true,
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al inicializar el progreso'
        });
    }
};

// Marcar una lección como completada
export const markLessonAsComplete = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { cursoId, leccionId } = req.body;

        // Verificar si la lección existe y pertenece al curso
        const lesson = await Lesson.findById(leccionId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        // Buscar el progreso actual del usuario
        let progress = await Progress.findOne({ userId, cursoId });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No tienes progreso en este curso'
            });
        }

        // Verificar si la lección ya está marcada como completada
        if (progress.leccionesCompletadas.includes(leccionId)) {
            return res.status(200).json({
                success: true,
                message: 'La lección ya estaba marcada como completada',
                data: progress
            });
        }

        // Obtener el total de lecciones en el curso
        const course = await Course.findById(cursoId).populate('modulos');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Calcular el número total de lecciones en el curso
        let totalLessons = 0;
        for (const modulo of course.modulos) {
            const count = await Lesson.countDocuments({ moduloId: modulo._id });
            totalLessons += count;
        }

        // Actualizar el progreso
        progress.leccionesCompletadas.push(leccionId);
        progress.ultimaLeccion = leccionId;
        progress.fechaUltimaActividad = new Date();

        // Calcular el nuevo porcentaje
        if (totalLessons > 0) {
            progress.porcentajeCompletado = (progress.leccionesCompletadas.length / totalLessons) * 100;
        }

        await progress.save();

        res.status(200).json({
            success: true,
            message: 'Lección marcada como completada',
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al marcar la lección como completada'
        });
    }
};

// Actualizar la última lección vista
export const updateLastLesson = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { cursoId, leccionId } = req.body;

        // Verificar si la lección existe
        const lesson = await Lesson.findById(leccionId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }

        // Actualizar el progreso
        const progress = await Progress.findOneAndUpdate(
            { userId, cursoId },
            {
                ultimaLeccion: leccionId,
                fechaUltimaActividad: new Date()
            },
            { new: true }
        );

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No tienes progreso en este curso'
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar la última lección'
        });
    }
};

// Obtener el resumen de progreso de todos los cursos de un usuario
export const getUserCoursesProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const progress = await Progress.find({ userId })
            .populate({
                path: 'cursoId',
                select: 'titulo imagenCurso'
            })
            .populate({
                path: 'ultimaLeccion',
                select: 'titulo'
            });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso de los cursos'
        });
    }
};