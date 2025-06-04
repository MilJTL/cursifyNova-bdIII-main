import { Request, Response } from 'express';
import Progress from '../models/Progress'; // Asegúrate de que el modelo Progress esté importado
import Course from '../models/Course'; // Necesario para verificar el curso
import Module from '../models/Module'; // Necesario para obtener módulos
import Lesson from '../models/Lesson'; // Necesario para obtener lecciones

// Extender la interfaz Request para incluir user (TypeScript)
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role?: string;
                // otras propiedades que puedas tener
            };
        }
    }
}

// Obtener el progreso general del usuario en todos sus cursos
export const getUserProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'No autorizado.' });
        }

        // Asegúrate de que 'courseId' y 'userId' en el modelo Progress sean compatibles con String
        const progress = await Progress.find({ userId })
            .populate('courseId', 'titulo imagenCurso nivel') // 'courseId' es el campo en Progress que referencia a Course
            .sort({ ultimoAcceso: -1 });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });
    } catch (error: any) {
        console.error('❌ Error en getUserProgress:', error); // Log detallado
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

        if (!userId) {
            return res.status(401).json({ success: false, message: 'No autorizado. Se requiere autenticación.' });
        }

        // Buscar el progreso existente
        // Asegúrate de que 'userId' y 'courseId' en el modelo Progress sean compatibles con String
        let progress = await Progress.findOne({ userId, courseId })
            .populate('leccionesCompletadas'); // <--- ¡TYPO CORREGIDO!

        if (!progress) {
            // Si no existe, inicializar uno nuevo
            progress = await Progress.create({
                userId,
                courseId,
                leccionesCompletadas: [], // <--- ¡TYPO CORREGIDO!
                porcentajeCompletado: 0,
                ultimoAcceso: new Date() // Inicializar ultimoAcceso
            });
        }

        // Obtener total de lecciones del curso para calcular porcentaje
        // Asegúrate de que 'cursoId' en el modelo Module sea compatible con String
        const modules = await Module.find({ cursoId: courseId });
        let totalLessons = 0;
        
        for (const module of modules) {
            // Asegúrate de que 'moduloId' en el modelo Lesson sea compatible con el _id del módulo (ObjectId o String)
            const lessonCount = await Lesson.countDocuments({ moduloId: module._id });
            totalLessons += lessonCount;
        }

        // Actualizar el porcentaje completado
        const porcentajeCompletado = totalLessons > 0 
            ? (progress.leccionesCompletadas.length / totalLessons) * 100 // <--- ¡TYPO CORREGIDO!
            : 0;

        // Si el porcentaje cambió, actualizarlo
        if (progress.porcentajeCompletado !== porcentajeCompletado) {
            progress.porcentajeCompletado = porcentajeCompletado;
            await progress.save();
        }

        res.status(200).json({
            success: true,
            progressPercentage: porcentajeCompletado, // Renombrado para coincidir con el frontend
            completedLessons: progress.leccionesCompletadas.length, // <--- ¡TYPO CORREGIDO!
            totalLessons,
            lastAccessed: progress.ultimoAcceso, // Asegúrate de que este campo exista en el modelo Progress
            message: 'Progreso obtenido exitosamente.'
        });
    } catch (error: any) {
        console.error('❌ Error en getCourseProgress:', error); // Log detallado
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

        if (!userId) {
            return res.status(401).json({ success: false, message: 'No autorizado.' });
        }

        // Verificar si la lección existe
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lección no encontrada.' });
        }

        // Obtener el módulo al que pertenece la lección
        const module = await Module.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });
        }

        const courseId = module.cursoId; // Asegúrate de que 'cursoId' en Module sea String

        // Buscar o crear un registro de progreso
        let progress = await Progress.findOne({ userId, courseId });
        
        if (!progress) {
            progress = await Progress.create({
                userId,
                courseId,
                leccionesCompletadas: [lessonId], // <--- ¡TYPO CORREGIDO!
                ultimoAcceso: new Date(),
                porcentajeCompletado: 0 // Inicializar
            });
        } else {
            // Verificar si ya está marcada como completada
            const yaCompletada = progress.leccionesCompletadas // <--- ¡TYPO CORREGIDO!
                .map(id => id.toString())
                .includes(lessonId);

            if (!yaCompletada) {
                // Añadir la lección a las completadas
                progress.leccionesCompletadas.push(lessonId as any); // <--- ¡TYPO CORREGIDO!
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
            ? (progress.leccionesCompletadas.length / totalLessons) * 100 // <--- ¡TYPO CORREGIDO!
            : 0;

        progress.porcentajeCompletado = porcentajeCompletado;
        await progress.save();

        res.status(200).json({
            success: true,
            message: 'Lección marcada como completada',
            data: {
                porcentajeCompletado,
                totalLessons,
                completedLessons: progress.leccionesCompletadas.length // <--- ¡TYPO CORREGIDO!
            }
        });
    } catch (error: any) {
        console.error('❌ Error al marcar la lección como completada:', error); // Log detallado
        res.status(500).json({
            success: false,
            message: error.message || 'Error al marcar la lección como completada'
        });
    }
};
