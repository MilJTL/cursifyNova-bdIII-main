import { Request, Response } from 'express';
import Module from '../models/Module';
import Course from '../models/Course';
import Lesson from '../models/Lesson';

// Obtener todos los módulos de un curso
export const getModulesByCourse = async (req: Request, res: Response) => {
    try {
        // CORREGIDO: Obtener desde query params en lugar de route params
        const cursoId = req.query.cursoId as string;
        
        if (!cursoId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un ID de curso'
            });
        }

        const modules = await Module.find({ cursoId })
            .sort({ ordenIndice: 1 })
            .populate('lecciones');

        res.status(200).json({
            success: true,
            count: modules.length,
            data: modules
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los módulos'
        });
    }
};

// Obtener un módulo específico
export const getModuleById = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.id;

        const module = await Module.findById(moduleId)
            .populate('lecciones');

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: module
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el módulo'
        });
    }
};

// Crear un nuevo módulo
export const createModule = async (req: Request, res: Response) => {
    try {
        const { cursoId, titulo, descripcion } = req.body;
        const userId = req.user?.userId;

        // Verificar si el curso existe y pertenece al usuario
        const course = await Course.findById(cursoId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Verificar que el usuario es el autor del curso
        if (course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para añadir módulos a este curso'
            });
        }

        // Obtener el último índice de orden para añadir el módulo al final
        const lastModule = await Module.findOne({ cursoId }).sort({ ordenIndice: -1 });
        const ordenIndice = lastModule ? lastModule.ordenIndice + 1 : 0;

        // Crear el módulo
        const newModule = await Module.create({
            cursoId,
            titulo,
            descripcion,
            ordenIndice,
            lecciones: []
        });

        // Actualizar el curso para añadir la referencia al módulo
        await Course.findByIdAndUpdate(cursoId, {
            $push: { modulos: newModule._id }
        });

        res.status(201).json({
            success: true,
            data: newModule
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el módulo'
        });
    }
};

// Actualizar un módulo
export const updateModule = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.id;
        const { titulo, descripcion } = req.body;
        const userId = req.user?.userId;

        // Verificar si el módulo existe
        const module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        // Verificar que el usuario es el autor del curso asociado
        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este módulo'
            });
        }

        // Actualizar el módulo
        const updatedModule = await Module.findByIdAndUpdate(
            moduleId,
            { titulo, descripcion },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedModule
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el módulo'
        });
    }
};

// Eliminar un módulo
export const deleteModule = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.id;
        const userId = req.user?.userId;

        // Verificar si el módulo existe
        const module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }

        // Verificar que el usuario es el autor del curso asociado
        const course = await Course.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este módulo'
            });
        }

        // Eliminar todas las lecciones asociadas al módulo
        await Lesson.deleteMany({ moduloId: moduleId });

        // Eliminar el módulo
        await Module.findByIdAndDelete(moduleId);

        // Actualizar el curso para eliminar la referencia al módulo
        await Course.findByIdAndUpdate(module.cursoId, {
            $pull: { modulos: moduleId }
        });

        res.status(200).json({
            success: true,
            message: 'Módulo eliminado correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el módulo'
        });
    }
};

// Reordenar módulos
export const reorderModules = async (req: Request, res: Response) => {
    try {
        const { cursoId, moduleOrder } = req.body;
        const userId = req.user?.userId;

        // Verificar que el usuario es el autor del curso
        const course = await Course.findById(cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para reordenar estos módulos'
            });
        }

        // Actualizar el orden de cada módulo
        const updatePromises = moduleOrder.map((item: { id: string, order: number }) => {
            return Module.findByIdAndUpdate(item.id, { ordenIndice: item.order });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Módulos reordenados correctamente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al reordenar los módulos'
        });
    }
};