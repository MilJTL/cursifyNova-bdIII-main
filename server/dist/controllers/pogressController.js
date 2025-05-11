"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCoursesProgress = exports.updateLastLesson = exports.markLessonAsComplete = exports.initializeProgress = exports.getProgressByCourse = void 0;
const Progress_1 = __importDefault(require("../models/Progress"));
const Course_1 = __importDefault(require("../models/Course"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const User_1 = __importDefault(require("../models/User"));
// Obtener el progreso de un usuario en un curso específico
const getProgressByCourse = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const cursoId = req.params.cursoId;
        const progress = await Progress_1.default.findOne({ userId, cursoId })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso del curso'
        });
    }
};
exports.getProgressByCourse = getProgressByCourse;
// Iniciar progreso de un curso (cuando el usuario se inscribe)
const initializeProgress = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const cursoId = req.params.cursoId;
        // Verificar si el usuario está inscrito en el curso
        const user = await User_1.default.findById(userId);
        if (!user || !user.cursosInscritos || !user.cursosInscritos.some((id) => id.toString() === cursoId)) {
            return res.status(403).json({
                success: false,
                message: 'No estás inscrito en este curso'
            });
        }
        // Verificar si ya existe un progreso para este curso
        let progress = await Progress_1.default.findOne({ userId, cursoId });
        if (progress) {
            return res.status(200).json({
                success: true,
                data: progress,
                message: 'El progreso ya está inicializado'
            });
        }
        // Obtener la primera lección del curso
        const course = await Course_1.default.findById(cursoId).populate({
            path: 'modulos',
            select: '_id', // Ensure _id is included
            options: { sort: { ordenIndice: 1 } }
        });
        if (!course || !course.modulos || course.modulos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado o sin módulos'
            });
        }
        const firstModule = course.modulos[0];
        const firstLesson = await Lesson_1.default.findOne({ moduloId: firstModule._id }).sort({ ordenIndice: 1 });
        // Crear un nuevo registro de progreso
        progress = await Progress_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al inicializar el progreso'
        });
    }
};
exports.initializeProgress = initializeProgress;
// Marcar una lección como completada
const markLessonAsComplete = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { cursoId, leccionId } = req.body;
        // Verificar si la lección existe y pertenece al curso
        const lesson = await Lesson_1.default.findById(leccionId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        // Buscar el progreso actual del usuario
        let progress = await Progress_1.default.findOne({ userId, cursoId });
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
        const course = await Course_1.default.findById(cursoId).populate('modulos');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        // Calcular el número total de lecciones en el curso
        let totalLessons = 0;
        for (const modulo of course.modulos) {
            const count = await Lesson_1.default.countDocuments({ moduloId: modulo._id });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al marcar la lección como completada'
        });
    }
};
exports.markLessonAsComplete = markLessonAsComplete;
// Actualizar la última lección vista
const updateLastLesson = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { cursoId, leccionId } = req.body;
        // Verificar si la lección existe
        const lesson = await Lesson_1.default.findById(leccionId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lección no encontrada'
            });
        }
        // Actualizar el progreso
        const progress = await Progress_1.default.findOneAndUpdate({ userId, cursoId }, {
            ultimaLeccion: leccionId,
            fechaUltimaActividad: new Date()
        }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar la última lección'
        });
    }
};
exports.updateLastLesson = updateLastLesson;
// Obtener el resumen de progreso de todos los cursos de un usuario
const getUserCoursesProgress = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const progress = await Progress_1.default.find({ userId })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el progreso de los cursos'
        });
    }
};
exports.getUserCoursesProgress = getUserCoursesProgress;
