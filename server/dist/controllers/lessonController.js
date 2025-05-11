"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.getLessonById = exports.getLessonsByModule = void 0;
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Module_1 = __importDefault(require("../models/Module"));
const Course_1 = __importDefault(require("../models/Course"));
// Obtener todas las lecciones de un módulo
const getLessonsByModule = async (req, res) => {
    try {
        const moduloId = req.params.moduloId;
        const lessons = await Lesson_1.default.find({ moduloId })
            .sort({ ordenIndice: 1 });
        res.status(200).json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener las lecciones'
        });
    }
};
exports.getLessonsByModule = getLessonsByModule;
// Obtener una lección específica
const getLessonById = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const lesson = await Lesson_1.default.findById(lessonId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener la lección'
        });
    }
};
exports.getLessonById = getLessonById;
// Crear una nueva lección
const createLesson = async (req, res) => {
    var _a;
    try {
        const { moduloId, titulo, contenido, tipo, duracion, recursosAdicionales, esGratis } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el módulo existe
        const module = await Module_1.default.findById(moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        // Verificar que el usuario es el autor del curso
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para añadir lecciones a este módulo'
            });
        }
        // Obtener el último índice de orden para añadir la lección al final
        const lastLesson = await Lesson_1.default.findOne({ moduloId }).sort({ ordenIndice: -1 });
        const ordenIndice = lastLesson ? lastLesson.ordenIndice + 1 : 0;
        // Crear la lección
        const newLesson = await Lesson_1.default.create({
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
        await Module_1.default.findByIdAndUpdate(moduloId, {
            $push: { lecciones: newLesson._id }
        });
        res.status(201).json({
            success: true,
            data: newLesson
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear la lección'
        });
    }
};
exports.createLesson = createLesson;
// Actualizar una lección
const updateLesson = async (req, res) => {
    var _a;
    try {
        const lessonId = req.params.id;
        const updateData = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si la lección existe
        const lesson = await Lesson_1.default.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        // Verificar que el usuario es el autor del curso asociado
        const module = await Module_1.default.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar esta lección'
            });
        }
        // Actualizar la lección
        const updatedLesson = await Lesson_1.default.findByIdAndUpdate(lessonId, updateData, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedLesson
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar la lección'
        });
    }
};
exports.updateLesson = updateLesson;
// Eliminar una lección
const deleteLesson = async (req, res) => {
    var _a;
    try {
        const lessonId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si la lección existe
        const lesson = await Lesson_1.default.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        // Verificar que el usuario es el autor del curso asociado
        const module = await Module_1.default.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta lección'
            });
        }
        // Eliminar la lección
        await Lesson_1.default.findByIdAndDelete(lessonId);
        // Actualizar el módulo para eliminar la referencia a la lección
        await Module_1.default.findByIdAndUpdate(lesson.moduloId, {
            $pull: { lecciones: lessonId }
        });
        res.status(200).json({
            success: true,
            message: 'Lección eliminada correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar la lección'
        });
    }
};
exports.deleteLesson = deleteLesson;
// Reordenar lecciones
const reorderLessons = async (req, res) => {
    var _a;
    try {
        const { moduloId, lessonOrder } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar el módulo existe
        const module = await Module_1.default.findById(moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        // Verificar que el usuario es el autor del curso
        const course = await Course_1.default.findById(module.cursoId);
        if (!course || course.autor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para reordenar estas lecciones'
            });
        }
        // Actualizar el orden de cada lección
        const updatePromises = lessonOrder.map((item) => {
            return Lesson_1.default.findByIdAndUpdate(item.id, { ordenIndice: item.order });
        });
        await Promise.all(updatePromises);
        res.status(200).json({
            success: true,
            message: 'Lecciones reordenadas correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al reordenar las lecciones'
        });
    }
};
exports.reorderLessons = reorderLessons;
