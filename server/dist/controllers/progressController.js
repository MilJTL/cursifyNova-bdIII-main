"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markLessonAsCompleted = exports.getCourseProgress = exports.getUserProgress = void 0;
const Progress_1 = __importDefault(require("../models/Progress"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
// Obtener el progreso general del usuario en todos sus cursos
const getUserProgress = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const progress = await Progress_1.default.find({ userId })
            .populate('courseId', 'titulo imagenCurso nivel')
            .sort({ ultimoAcceso: -1 });
        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del usuario'
        });
    }
};
exports.getUserProgress = getUserProgress;
// Obtener el progreso detallado del usuario en un curso específico
const getCourseProgress = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const courseId = req.params.id;
        // Buscar el progreso existente
        let progress = await Progress_1.default.findOne({ userId, courseId })
            .populate('lessonesCompletadas');
        if (!progress) {
            // Si no existe, inicializar uno nuevo
            progress = await Progress_1.default.create({
                userId,
                courseId,
                lessonesCompletadas: [],
                porcentajeCompletado: 0
            });
        }
        // Obtener total de lecciones del curso para calcular porcentaje
        const modules = await Module_1.default.find({ cursoId: courseId });
        let totalLessons = 0;
        for (const module of modules) {
            const lessonCount = await Lesson_1.default.countDocuments({ moduloId: module._id });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del curso'
        });
    }
};
exports.getCourseProgress = getCourseProgress;
// Marcar una lección como completada
const markLessonAsCompleted = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const lessonId = req.params.id;
        // Verificar si la lección existe
        const lesson = await Lesson_1.default.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        // Obtener el módulo al que pertenece la lección
        const module = await Module_1.default.findById(lesson.moduloId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Módulo no encontrado'
            });
        }
        const courseId = module.cursoId;
        // Buscar o crear un registro de progreso
        let progress = await Progress_1.default.findOne({ userId, courseId });
        if (!progress) {
            progress = await Progress_1.default.create({
                userId,
                courseId,
                lessonesCompletadas: [lessonId],
                ultimoAcceso: new Date()
            });
        }
        else {
            // Verificar si ya está marcada como completada
            const yaCompletada = progress.lessonesCompletadas
                .map(id => id.toString())
                .includes(lessonId);
            if (!yaCompletada) {
                // Añadir la lección a las completadas
                progress.lessonesCompletadas.push(lessonId);
            }
            // Actualizar fecha de último acceso
            progress.ultimoAcceso = new Date();
            await progress.save();
        }
        // Recalcular porcentaje de completado
        const modules = await Module_1.default.find({ cursoId: courseId });
        let totalLessons = 0;
        for (const mod of modules) {
            const lessonCount = await Lesson_1.default.countDocuments({ moduloId: mod._id });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al marcar la lección como completada'
        });
    }
};
exports.markLessonAsCompleted = markLessonAsCompleted;
