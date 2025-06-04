// server/src/controllers/courseController.ts
import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course';
import User from '../models/User';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import { Document } from 'mongoose';

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


export const getCourses = async (req: Request, res: Response) => {
    try {
        const { etiquetas, nivel, premium, busqueda, page = 1, limit = 10, enrolled, recommended } = req.query;
        const userId = req.user?.userId; // Obtener el ID del usuario autenticado

        const query: any = {};

        // Aplicar filtros de búsqueda y categoría
        if (etiquetas) {
            query.etiquetas = { $in: Array.isArray(etiquetas) ? etiquetas : [etiquetas] };
        }
        if (nivel) query.nivel = nivel;
        if (premium !== undefined) query.premium = premium === 'true'; 
        if (busqueda) {
            query.$text = { $search: busqueda.toString() };
        }

        // Filtro para cursos inscritos
        if (enrolled === 'true') {
            if (!userId) {
                console.warn('⚠️ getCourses: Solicitud de cursos inscritos sin usuario autenticado.');
                return res.status(401).json({ success: false, message: 'No autorizado para ver cursos inscritos sin iniciar sesión.' });
            }
            const user = await User.findById(userId).select('cursosInscritos');
            if (user && user.cursosInscritos && user.cursosInscritos.length > 0) {
                query._id = { $in: user.cursosInscritos.map(id => id.toString()) };
            } else {
                console.log('ℹ️ getCourses: Usuario autenticado pero sin cursos inscritos.');
                return res.status(200).json({
                    success: true,
                    count: 0,
                    total: 0,
                    pages: 0,
                    currentPage: 1,
                    data: []
                });
            }
        }

        // Filtro para cursos recomendados (si tienes lógica específica)
        if (recommended === 'true') {
            // Implementa aquí tu lógica de recomendación si es diferente a la búsqueda general
            // Por ejemplo, buscar cursos con alta valoración o los más recientes, excluyendo los ya inscritos
        }

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        console.log('🔍 getCourses: Consulta final a MongoDB:', JSON.stringify(query)); // Log de la consulta

        const cursos = await Course.find(query)
            .populate('autor', 'nombre username avatarUrl')
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Course.countDocuments(query);

        const formattedCourses = cursos.map(course => course.toObject());

        console.log(`✅ getCourses: Encontrados ${formattedCourses.length} cursos. Total: ${total}`); // Log de resultados

        res.status(200).json({
            success: true,
            count: formattedCourses.length,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: formattedCourses
        });
    } catch (error: any) {
        // <--- ¡IMPORTANTE! Log detallado del error
        console.error('❌ Error en getCourses (catch):', error.message, error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener cursos'
        });
    }
};

// @desc    Obtener un curso por ID
// @route   GET /api/courses/:id
// @access  Public (o Private si solo usuarios inscritos pueden verlo)
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            console.error('❌ getCourseById: ID de curso no proporcionado o inválido:', id);
            return res.status(400).json({ success: false, message: 'ID de curso no proporcionado o inválido.' });
        }

        console.log('🔍 getCourseById: Buscando curso con ID:', id); // Log de la búsqueda

        const course = await Course.findById(id)
            .populate({
                path: 'modulos',
                populate: {
                    path: 'lecciones'
                }
            })
            .populate('autor', 'nombre avatarUrl');

        if (!course) {
            console.warn('⚠️ getCourseById: Curso no encontrado para el ID:', id);
            return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
        }

        console.log('✅ getCourseById: Curso encontrado:', course.titulo); // Log de éxito

        res.status(200).json({ success: true, data: course });

    } catch (error: any) {
        // <--- ¡IMPORTANTE! Log detallado del error
        console.error('❌ Error en getCourseById (catch):', error.message, error.stack);

        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: `ID de curso inválido: ${error.value}` });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el curso'
        });
    }
};


// Obtener curso completo con módulos y lecciones
export const getFullCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;
        
        // Buscar el curso
        const curso = await Course.findById(courseId)
            .populate('autor', 'nombre username avatarUrl biografia');
            
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }
        
        // Buscar los módulos del curso
        const modulos = await Module.find({ cursoId: courseId })
            .sort({ ordenIndice: 1 })
            .populate({
                path: 'lecciones',
                options: { sort: { ordenIndice: 1 } }
            });
            
        // Formatear la respuesta (aquí curso.toObject() ya debería tener el 'id' si el toObject del esquema funciona)
        const cursoCompleto = {
            ...curso.toObject(), // toObject() también aplicará la transformación del esquema
            modulos
        };
        
        res.status(200).json({
            success: true,
            data: cursoCompleto
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el curso completo'
        });
    }
};

// Crear curso
export const createCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Validar campos requeridos
        const { _id, titulo, descripcion } = req.body; // Asegúrate de que _id se envíe si lo estás manejando manualmente
        if (!_id || !titulo || !descripcion) { // Validar _id también
            return res.status(400).json({
                success: false,
                message: 'El ID, título y la descripción son obligatorios'
            });
        }

        const cursoData = {
            ...req.body,
            _id: _id, // Asignar el _id manualmente
            autor: userId,
            modulos: [] // Inicializar con un array vacío de referencias a módulos
        };

        const curso = await Course.create(cursoData);

        // Añadir el curso a los cursos creados por el usuario
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { cursosCreados: curso._id } }
        );

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
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Verificar si el curso existe
        const curso = await Course.findById(courseId);
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Verificar si el usuario ya está inscrito
        const user = await User.findById(userId);
        if (user && user.cursosInscritos && user.cursosInscritos.map(id => id.toString()).includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás inscrito en este curso'
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
        console.error('❌ Error en enrollCourse:', error); 
        res.status(500).json({
            success: false,
            message: error.message || 'Error al inscribirse en el curso'
        });
    }
};

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

        // Verificar si el usuario es el autor del curso o es administrador
        if (course.autor.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este curso'
            });
        }

        // Actualizar la fecha de actualización
        req.body.fechaActualizacion = Date.now();

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

        // Verificar si el usuario es el autor del curso o administrador
        if (course.autor.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este curso'
            });
        }

        // Encontrar todos los módulos del curso
        const modulos = await Module.find({ cursoId: courseId });
        
        // Eliminar todas las lecciones de cada módulo
        for (const modulo of modulos) {
            await Lesson.deleteMany({ moduloId: modulo._id });
        }
        
        // Eliminar todos los módulos
        await Module.deleteMany({ cursoId: courseId });
        
        // Eliminar el curso
        await Course.findByIdAndDelete(courseId);

        // Eliminar la referencia del curso en los usuarios inscritos
        await User.updateMany(
            { cursosInscritos: courseId },
            { $pull: { cursosInscritos: courseId } }
        );

        // Eliminar la referencia del curso en los cursos creados del autor
        await User.findByIdAndUpdate(
            course.autor,
            { $pull: { cursosCreados: courseId } }
        );

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

// Obtener los cursos creados por el instructor actual
export const getInstructorCourses = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Obtener los cursos donde el usuario es el autor
        const cursos = await Course.find({ autor: userId })
            .select('titulo descripcion nivel fechaCreacion imagenCurso premium publicado')
            .sort({ fechaCreacion: -1 });

        // Añadir información adicional para cada curso
        const cursosConInfo = await Promise.all(cursos.map(async (curso) => {
            // Contar estudiantes inscritos (opcional)
            const estudiantes = await User.countDocuments({ cursosInscritos: curso._id });
            
            // toObject() aplicará la transformación de toJSON/toObject del esquema
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los cursos del instructor'
        });
    }
};
