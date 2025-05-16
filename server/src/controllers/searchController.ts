import { Request, Response } from 'express';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';

// Búsqueda global en todas las entidades
export const searchGlobal = async (req: Request, res: Response) => {
    try {
        const { q, tipo = 'all' } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un término de búsqueda (parámetro q)'
            });
        }

        const query = { $text: { $search: q.toString() } };
        const results: any = {};

        // Buscar en cursos
        if (tipo === 'all' || tipo === 'course') {
            const cursos = await Course.find(query)
                .select('titulo descripcion nivel imagenCurso etiquetas valoracion')
                .populate('autor', 'nombre username avatarUrl');
            
            results.courses = cursos;
        }

        // Buscar en módulos
        if (tipo === 'all' || tipo === 'module') {
            const modulos = await Module.find(query)
                .select('titulo descripcion cursoId')
                .populate('cursoId', 'titulo');
            
            results.modules = modulos;
        }

        // Buscar en lecciones
        if (tipo === 'all' || tipo === 'lesson') {
            const lecciones = await Lesson.find(query)
                .select('titulo contenido tipo moduloId')
                .populate({
                    path: 'moduloId',
                    select: 'titulo cursoId',
                    populate: {
                        path: 'cursoId',
                        select: 'titulo'
                    }
                });
            
            results.lessons = lecciones;
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al realizar la búsqueda'
        });
    }
};

// Búsqueda específica de cursos
export const searchCourses = async (req: Request, res: Response) => {
    try {
        const { q, nivel, etiquetas, premium } = req.query;
        
        const query: any = {};
        
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        
        // Filtros adicionales
        if (nivel) query.nivel = nivel;
        if (premium !== undefined) query.premium = premium === 'true';
        if (etiquetas) {
            const tags = Array.isArray(etiquetas) ? etiquetas : [etiquetas];
            query.etiquetas = { $in: tags };
        }

        const cursos = await Course.find(query)
            .select('titulo descripcion nivel imagenCurso etiquetas valoracion premium')
            .populate('autor', 'nombre username avatarUrl')
            .sort({ valoracion: -1 });

        res.status(200).json({
            success: true,
            count: cursos.length,
            data: cursos
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar cursos'
        });
    }
};

// Búsqueda de módulos
export const searchModules = async (req: Request, res: Response) => {
    try {
        const { q, courseId } = req.query;
        
        const query: any = {};
        
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        
        // Filtro por curso
        if (courseId) {
            query.cursoId = courseId;
        }

        const modulos = await Module.find(query)
            .select('titulo descripcion ordenIndice')
            .populate('cursoId', 'titulo')
            .sort({ ordenIndice: 1 });

        res.status(200).json({
            success: true,
            count: modulos.length,
            data: modulos
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar módulos'
        });
    }
};

// Búsqueda de lecciones
export const searchLessons = async (req: Request, res: Response) => {
    try {
        const { q, moduleId, tipo } = req.query;
        
        const query: any = {};
        
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        
        // Filtros adicionales
        if (moduleId) query.moduloId = moduleId;
        if (tipo) query.tipo = tipo;

        const lecciones = await Lesson.find(query)
            .select('titulo contenido tipo ordenIndice esGratis')
            .populate({
                path: 'moduloId',
                select: 'titulo cursoId',
                populate: {
                    path: 'cursoId',
                    select: 'titulo'
                }
            })
            .sort({ ordenIndice: 1 });

        res.status(200).json({
            success: true,
            count: lecciones.length,
            data: lecciones
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar lecciones'
        });
    }
};