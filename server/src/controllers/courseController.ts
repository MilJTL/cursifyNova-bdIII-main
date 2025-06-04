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


// Obtener todos los cursos
export const getCourses = async (req: Request, res: Response) => {
    try {
        const { etiquetas, nivel, premium, busqueda, page = 1, limit = 10 } = req.query;

        const query: any = {};

        // Aplicar filtros
        if (etiquetas) {
            query.etiquetas = { $in: Array.isArray(etiquetas) ? etiquetas : [etiquetas] };
        }
        if (nivel) query.nivel = nivel;
        if (premium !== undefined) query.premium = premium === 'true';
        if (busqueda) {
            query.$text = { $search: busqueda.toString() };
        }

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        const cursos = await Course.find(query)
            // No necesitamos .select('_id ...') porque Mongoose lo incluirá por defecto
            // y el toJSON del esquema lo transformará.
            .populate('autor', 'nombre username avatarUrl') // <--- Re-habilitado el populate
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(limitNum);

        // Obtener el total de documentos para la paginación
        const total = await Course.countDocuments(query);

        // Logs para depurar el _id y la transformación
        if (cursos.length > 0) {
            console.log("Primer curso RAW (con _id):", cursos[0]); // Objeto Mongoose completo
            console.log("Tipo de _id del primer curso:", typeof cursos[0]._id);
            console.log("Valor de _id del primer curso:", cursos[0]._id);
            console.log("Primer curso TRANSFORMADO (con id):", cursos[0].toJSON()); // <--- Nuevo log para ver el resultado de toJSON
        } else {
            console.log("No se encontraron cursos.");
        }

        // Mongoose aplicará automáticamente la transformación toJSON del esquema
        res.status(200).json({
            success: true,
            count: cursos.length,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: cursos // Envía los documentos Mongoose directamente
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
            .populate('autor', 'nombre username avatarUrl biografia');

        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Mongoose aplicará automáticamente la transformación toJSON del esquema
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
