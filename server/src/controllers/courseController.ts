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

        // Filtro para cursos inscritos (solo si el usuario está autenticado y se solicita 'enrolled')
        if (enrolled === 'true' && userId) {
            const user = await User.findById(userId).select('cursosInscritos');
            if (user && user.cursosInscritos) {
                // Mongoose ObjectId[] a string[] para la consulta si los IDs de curso son string
                query._id = { $in: user.cursosInscritos.map(id => id.toString()) }; 
            } else {
                // Si no hay usuario o cursos inscritos, no devolver nada para esta consulta
                return res.status(200).json({
                    success: true,
                    count: 0,
                    total: 0,
                    pages: 0,
                    currentPage: 1,
                    data: []
                });
            }
        } else if (enrolled === 'true' && !userId) {
            // Si se pide "enrolled" pero no hay usuario, devolver 401
            return res.status(401).json({ success: false, message: 'No autorizado para ver cursos inscritos sin iniciar sesión.' });
        }

        // Filtro para cursos recomendados (puedes implementar tu lógica de recomendación aquí)
        if (recommended === 'true') {
            // Lógica de recomendación de ejemplo: cursos con alta valoración o los más recientes
            // Por ahora, simplemente no aplicamos un filtro restrictivo adicional si no hay lógica compleja
            // Esto podría ser más elaborado, por ejemplo, excluyendo cursos ya inscritos si userId está presente
        }


        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        const cursos = await Course.find(query)
            .populate('autor', 'nombre username avatarUrl')
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Course.countDocuments(query);

        // Asegurarse de que la transformación toJSON se aplique a cada documento
        // Mongoose lo hace automáticamente al enviar la respuesta, pero si quieres
        // manipular los datos antes, puedes mapearlos explícitamente.
        // Para consistencia, podemos mapear a un objeto plano que ya tendrá 'id'.
        const formattedCourses = cursos.map(course => course.toObject());

        res.status(200).json({
            success: true,
            count: formattedCourses.length,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: formattedCourses // Envía los documentos transformados
        });
    } catch (error: any) {
        console.error('❌ Error en getCourses:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener cursos'
        });
    }
};
// Obtener curso por ID
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // El ID del curso viene de los parámetros de la URL

        // <--- ¡IMPORTANTE! Validar si el ID es válido o existe
        if (!id || typeof id !== 'string') { // Asegurarse de que no sea undefined o no sea string
            console.error('❌ Error en getCourseById: ID de curso no proporcionado o inválido:', id);
            return res.status(400).json({ success: false, message: 'ID de curso no proporcionado o inválido.' });
        }

        // Buscar el curso por su ID.
        // El campo '_id' en tu modelo Course.ts ya está definido como String, lo cual es correcto.
        const course = await Course.findById(id)
            .populate({
                path: 'modulos',
                populate: {
                    path: 'lecciones'
                }
            })
            .populate('autor', 'nombre avatarUrl'); // Popula la información del autor

        if (!course) {
            console.warn('⚠️ Curso no encontrado para el ID:', id);
            return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
        }

        res.status(200).json({ success: true, data: course });

    } catch (error: any) {
        // <--- ¡IMPORTANTE! Loguear el error completo aquí
        console.error('❌ Error en getCourseById (catch):', error);

        // Si el error es un CastError (por ejemplo, ID inválido para ObjectId), devolver 400
        // Esto es menos probable ahora que _id en Course es String, pero es buena práctica
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
