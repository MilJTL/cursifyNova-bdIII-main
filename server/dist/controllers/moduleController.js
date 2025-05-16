"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderModules = exports.deleteModule = exports.updateModule = exports.createModule = exports.getModuleById = exports.getModulesByCourse = void 0;
const Module_1 = __importDefault(require("../models/Module"));
const Course_1 = __importDefault(require("../models/Course"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
// Obtener todos los módulos de un curso
const getModulesByCourse = async (req, res) => {
    try {
        // CORREGIDO: Obtener desde query params en lugar de route params
        const cursoId = req.query.cursoId;
        if (!cursoId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un ID de curso'
            });
        }
        const modules = await Module_1.default.find({ cursoId })
            .sort({ ordenIndice: 1 })
            .populate('lecciones');
        res.status(200).json({
            success: true,
            count: modules.length,
            data: modules
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los módulos'
        });
    }
};
exports.getModulesByCourse = getModulesByCourse;
// Obtener un módulo específico
const getModuleById = async (req, res) => {
    try {
        const moduleId = req.params.id;
        const module = await Module_1.default.findById(moduleId)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el módulo'
        });
    }
};
exports.getModuleById = getModuleById;
// Crear un nuevo módulo
const createModule = async (req, res) => {
    var _a;
    try {
        const { cursoId, titulo, descripcion } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el curso existe y pertenece al usuario
        const course = await Course_1.default.findById(cursoId);
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
        const lastModule = await Module_1.default.findOne({ cursoId }).sort({ ordenIndice: -1 });
        const ordenIndice = lastModule ? lastModule.ordenIndice + 1 : 0;
        // Crear el módulo
        const newModule = await Module_1.default.create({
            cursoId,
            titulo,
            descripcion,
            ordenIndice,
            lecciones: []
        });
        // Actualizar el curso para añadir la referencia al módulo
        await Course_1.default.findByIdAndUpdate(cursoId, {
            $push: { modulos: newModule._id }
        });
        res.status(201).json({
            success: true,
            data: newModule
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el módulo'
        });
    }
};
exports.createModule = createModule;
// Actualizar un módulo
const updateModule = async (req, res) => {
    var _a;
    try {
        const moduleId = req.params.id;
        const { titulo, descripcion } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el módulo existe
        const module = await Module_1.default.findById(moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        // Verificar que el usuario es el autor del curso asociado
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este módulo'
            });
        }
        // Actualizar el módulo
        const updatedModule = await Module_1.default.findByIdAndUpdate(moduleId, { titulo, descripcion }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedModule
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el módulo'
        });
    }
};
exports.updateModule = updateModule;
// Eliminar un módulo
const deleteModule = async (req, res) => {
    var _a;
    try {
        const moduleId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el módulo existe
        const module = await Module_1.default.findById(moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        // Verificar que el usuario es el autor del curso asociado
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este módulo'
            });
        }
        // Eliminar todas las lecciones asociadas al módulo
        await Lesson_1.default.deleteMany({ moduloId: moduleId });
        // Eliminar el módulo
        await Module_1.default.findByIdAndDelete(moduleId);
        // Actualizar el curso para eliminar la referencia al módulo
        await Course_1.default.findByIdAndUpdate(module.cursoId, {
            $pull: { modulos: moduleId }
        });
        res.status(200).json({
            success: true,
            message: 'Módulo eliminado correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el módulo'
        });
    }
};
exports.deleteModule = deleteModule;
// Reordenar módulos
const reorderModules = async (req, res) => {
    var _a;
    try {
        const { cursoId, moduleOrder } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar que el usuario es el autor del curso
        const course = await Course_1.default.findById(cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para reordenar estos módulos'
            });
        }
        // Actualizar el orden de cada módulo
        const updatePromises = moduleOrder.map((item) => {
            return Module_1.default.findByIdAndUpdate(item.id, { ordenIndice: item.order });
        });
        await Promise.all(updatePromises);
        res.status(200).json({
            success: true,
            message: 'Módulos reordenados correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al reordenar los módulos'
        });
    }
};
exports.reorderModules = reorderModules;
