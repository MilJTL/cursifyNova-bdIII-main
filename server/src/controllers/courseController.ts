// server/src/controllers/courseController.ts
import { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User'; // Añadir esta importación

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

// Obtener todos los cursos
export const getCourses = async (req: Request, res: Response) => {
    try {
        const { etiquetas, nivel, premium, busqueda } = req.query;

        const query: any = {};

        // Aplicar filtros
        if (etiquetas) {
            query.etiquetas = { $in: Array.isArray(etiquetas) ? etiquetas : [etiquetas] };
        }
        if (nivel) query.nivel = nivel;
        if (premium !== undefined) query.premium = premium === 'true';
        if (busqueda) query.titulo = { $regex: busqueda, $options: 'i' };

        const cursos = await Course.find(query)
            .populate('autor', 'nombre username avatarUrl')
            .sort({ fechaCreacion: -1 });

        res.status(200).json({
            success: true,
            count: cursos.length,
            data: cursos
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener cursos'
        });
    }
};

// Obtener curso por ID
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const curso = await Course.findById(req.params.id)
            .populate('autor', 'nombre username avatarUrl biografia')
            .populate({
                path: 'modulos',
                populate: {
                    path: 'lecciones'
                }
            });

        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: curso
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el curso'
        });
    }
};

// Crear curso
export const createCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Corregido: userId en lugar de id

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const cursoData = {
            ...req.body,
            autor: userId
        };

        const curso = await Course.create(cursoData);

        res.status(201).json({
            success: true,
            data: curso
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el curso'
        });
    }
};

// Añadir usuario a un curso (inscripción)
export const enrollCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;
        const userId = req.user?.userId; // Corregido: userId en lugar de id

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Actualizar el usuario para añadir el curso a sus cursosInscritos
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { cursosInscritos: courseId } }
        );

        res.status(200).json({
            success: true,
            message: 'Inscripción exitosa'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al inscribirse en el curso'
        });
    }
};
// Añade estas funciones al final de tu courseController.ts

// Actualizar un curso
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;
        const userId = req.user?.userId;
        
        // Verificar si el curso existe
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        
        // Verificar si el usuario es el autor del curso
        if (course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este curso'
            });
        }
        
        // Actualizar el curso
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedCourse
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el curso'
        });
    }
};

// Eliminar un curso
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;
        const userId = req.user?.userId;
        
        // Verificar si el curso existe
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        
        // Verificar si el usuario es el autor del curso
        if (course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este curso'
            });
        }
        
        // Eliminar el curso
        await Course.findByIdAndDelete(courseId);
        
        // También deberías considerar eliminar los módulos, lecciones y progreso asociados
        // Esto lo podrías hacer con operaciones en cascada o usando middleware de Mongoose
        
        res.status(200).json({
            success: true,
            message: 'Curso eliminado correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el curso'
        });
    }
};