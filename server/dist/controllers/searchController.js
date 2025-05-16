"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLessons = exports.searchModules = exports.searchCourses = exports.searchGlobal = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
// Búsqueda global en todas las entidades
const searchGlobal = async (req, res) => {
    try {
        const { q, tipo = 'all' } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un término de búsqueda (parámetro q)'
            });
        }
        const query = { $text: { $search: q.toString() } };
        const results = {};
        // Buscar en cursos
        if (tipo === 'all' || tipo === 'course') {
            const cursos = await Course_1.default.find(query)
                .select('titulo descripcion nivel imagenCurso etiquetas valoracion')
                .populate('autor', 'nombre username avatarUrl');
            results.courses = cursos;
        }
        // Buscar en módulos
        if (tipo === 'all' || tipo === 'module') {
            const modulos = await Module_1.default.find(query)
                .select('titulo descripcion cursoId')
                .populate('cursoId', 'titulo');
            results.modules = modulos;
        }
        // Buscar en lecciones
        if (tipo === 'all' || tipo === 'lesson') {
            const lecciones = await Lesson_1.default.find(query)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al realizar la búsqueda'
        });
    }
};
exports.searchGlobal = searchGlobal;
// Búsqueda específica de cursos
const searchCourses = async (req, res) => {
    try {
        const { q, nivel, etiquetas, premium } = req.query;
        const query = {};
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        // Filtros adicionales
        if (nivel)
            query.nivel = nivel;
        if (premium !== undefined)
            query.premium = premium === 'true';
        if (etiquetas) {
            const tags = Array.isArray(etiquetas) ? etiquetas : [etiquetas];
            query.etiquetas = { $in: tags };
        }
        const cursos = await Course_1.default.find(query)
            .select('titulo descripcion nivel imagenCurso etiquetas valoracion premium')
            .populate('autor', 'nombre username avatarUrl')
            .sort({ valoracion: -1 });
        res.status(200).json({
            success: true,
            count: cursos.length,
            data: cursos
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar cursos'
        });
    }
};
exports.searchCourses = searchCourses;
// Búsqueda de módulos
const searchModules = async (req, res) => {
    try {
        const { q, courseId } = req.query;
        const query = {};
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        // Filtro por curso
        if (courseId) {
            query.cursoId = courseId;
        }
        const modulos = await Module_1.default.find(query)
            .select('titulo descripcion ordenIndice')
            .populate('cursoId', 'titulo')
            .sort({ ordenIndice: 1 });
        res.status(200).json({
            success: true,
            count: modulos.length,
            data: modulos
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar módulos'
        });
    }
};
exports.searchModules = searchModules;
// Búsqueda de lecciones
const searchLessons = async (req, res) => {
    try {
        const { q, moduleId, tipo } = req.query;
        const query = {};
        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q.toString() };
        }
        // Filtros adicionales
        if (moduleId)
            query.moduloId = moduleId;
        if (tipo)
            query.tipo = tipo;
        const lecciones = await Lesson_1.default.find(query)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al buscar lecciones'
        });
    }
};
exports.searchLessons = searchLessons;
