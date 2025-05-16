"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorCourses = exports.deleteCourse = exports.updateCourse = exports.enrollCourse = exports.createCourse = exports.getFullCourse = exports.getCourseById = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
// Obtener todos los cursos
const getCourses = async (req, res) => {
    try {
        const { etiquetas, nivel, premium, busqueda, page = 1, limit = 10 } = req.query;
        const query = {};
        // Aplicar filtros
        if (etiquetas) {
            query.etiquetas = { $in: Array.isArray(etiquetas) ? etiquetas : [etiquetas] };
        }
        if (nivel)
            query.nivel = nivel;
        if (premium !== undefined)
            query.premium = premium === 'true';
        if (busqueda) {
            query.$text = { $search: busqueda.toString() };
        }
        // Aplicar paginación
        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;
        const cursos = await Course_1.default.find(query)
            .populate('autor', 'nombre username avatarUrl')
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(limitNum);
        // Obtener el total de documentos para la paginación
        const total = await Course_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: cursos.length,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: cursos
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener cursos'
        });
    }
};
exports.getCourses = getCourses;
// Obtener curso por ID
const getCourseById = async (req, res) => {
    try {
        const curso = await Course_1.default.findById(req.params.id)
            .populate('autor', 'nombre username avatarUrl biografia');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el curso'
        });
    }
};
exports.getCourseById = getCourseById;
// Obtener curso completo con módulos y lecciones
const getFullCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        // Buscar el curso
        const curso = await Course_1.default.findById(courseId)
            .populate('autor', 'nombre username avatarUrl biografia');
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        // Buscar los módulos del curso
        const modulos = await Module_1.default.find({ cursoId: courseId })
            .sort({ ordenIndice: 1 })
            .populate({
            path: 'lecciones',
            options: { sort: { ordenIndice: 1 } }
        });
        // Formatear la respuesta
        const cursoCompleto = {
            ...curso.toObject(),
            modulos
        };
        res.status(200).json({
            success: true,
            data: cursoCompleto
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el curso completo'
        });
    }
};
exports.getFullCourse = getFullCourse;
// Crear curso
const createCourse = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Validar campos requeridos
        const { titulo, descripcion } = req.body;
        if (!titulo || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'El título y la descripción son obligatorios'
            });
        }
        const cursoData = {
            ...req.body,
            autor: userId,
            modulos: [] // Inicializar con un array vacío de referencias a módulos
        };
        const curso = await Course_1.default.create(cursoData);
        // Añadir el curso a los cursos creados por el usuario
        await User_1.default.findByIdAndUpdate(userId, { $addToSet: { cursosCreados: curso._id } });
        res.status(201).json({
            success: true,
            data: curso
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el curso'
        });
    }
};
exports.createCourse = createCourse;
// Añadir usuario a un curso (inscripción)
const enrollCourse = async (req, res) => {
    var _a;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Verificar si el curso existe
        const curso = await Course_1.default.findById(courseId);
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        // Verificar si el usuario ya está inscrito
        const user = await User_1.default.findById(userId);
        if (user && user.cursosInscritos && user.cursosInscritos.map(id => id.toString()).includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás inscrito en este curso'
            });
        }
        // Actualizar el usuario para añadir el curso a sus cursosInscritos
        await User_1.default.findByIdAndUpdate(userId, { $addToSet: { cursosInscritos: courseId } });
        res.status(200).json({
            success: true,
            message: 'Inscripción exitosa'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al inscribirse en el curso'
        });
    }
};
exports.enrollCourse = enrollCourse;
// Actualizar un curso
const updateCourse = async (req, res) => {
    var _a, _b;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el curso existe
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        // Verificar si el usuario es el autor del curso o es administrador
        if (course.autor.toString() !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este curso'
            });
        }
        // Actualizar la fecha de actualización
        req.body.fechaActualizacion = Date.now();
        // Actualizar el curso
        const updatedCourse = await Course_1.default.findByIdAndUpdate(courseId, req.body, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedCourse
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el curso'
        });
    }
};
exports.updateCourse = updateCourse;
// Eliminar un curso
const deleteCourse = async (req, res) => {
    var _a, _b;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar si el curso existe
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        // Verificar si el usuario es el autor del curso o administrador
        if (course.autor.toString() !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este curso'
            });
        }
        // Encontrar todos los módulos del curso
        const modulos = await Module_1.default.find({ cursoId: courseId });
        // Eliminar todas las lecciones de cada módulo
        for (const modulo of modulos) {
            await Lesson_1.default.deleteMany({ moduloId: modulo._id });
        }
        // Eliminar todos los módulos
        await Module_1.default.deleteMany({ cursoId: courseId });
        // Eliminar el curso
        await Course_1.default.findByIdAndDelete(courseId);
        // Eliminar la referencia del curso en los usuarios inscritos
        await User_1.default.updateMany({ cursosInscritos: courseId }, { $pull: { cursosInscritos: courseId } });
        // Eliminar la referencia del curso en los cursos creados del autor
        await User_1.default.findByIdAndUpdate(course.autor, { $pull: { cursosCreados: courseId } });
        res.status(200).json({
            success: true,
            message: 'Curso eliminado correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el curso'
        });
    }
};
exports.deleteCourse = deleteCourse;
// Obtener los cursos creados por el instructor actual
const getInstructorCourses = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        // Obtener los cursos donde el usuario es el autor
        const cursos = await Course_1.default.find({ autor: userId })
            .select('titulo descripcion nivel fechaCreacion imagenCurso premium publicado')
            .sort({ fechaCreacion: -1 });
        // Añadir información adicional para cada curso
        const cursosConInfo = await Promise.all(cursos.map(async (curso) => {
            // Contar estudiantes inscritos (opcional)
            const estudiantes = await User_1.default.countDocuments({ cursosInscritos: curso._id });
            return {
                ...curso.toObject(),
                estudiantes
            };
        }));
        res.status(200).json({
            success: true,
            count: cursosConInfo.length,
            data: cursosConInfo
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los cursos del instructor'
        });
    }
};
exports.getInstructorCourses = getInstructorCourses;
