// client/src/api/courses.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
// Cambia a false cuando quieras usar la API real
const USE_MOCK_DATA = false;

// Crear una instancia configurada de axios (similar a auth.ts)
const coursesApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para añadir el token de autenticación automáticamente
coursesApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Definición de interfaces/tipos

// Actualizar la interfaz Course para incluir módulos
export interface Course {
    _id: string;
    titulo: string;
    descripcion: string;
    premium: boolean;
    autor: {
        _id: string;
        nombre: string;
        username: string;
        avatarUrl?: string;
        biografia?: string;
    };
    etiquetas: string[];
    fechaCreacion: Date;
    duracionEstimada: string;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    imagenCurso?: string;
    modulos?: Module[];
    // Campos para el dashboard del instructor
    estudiantes?: number;
    calificacion?: number;
    precio?: number;
}

// Interfaz para crear o actualizar cursos
export interface CourseFormData {
    titulo: string;
    descripcion: string;
    premium?: boolean;
    nivel: 'principiante' | 'intermedio' | 'avanzado';
    duracionEstimada?: string;
    precio?: number;
    etiquetas?: string[];
    imagenCurso?: string;
}

// Interfaz de Módulo
export interface Module {
    _id: string;
    titulo: string;
    descripcion?: string;
    ordenIndice: number;
    lecciones: Lesson[];
}

// Interfaz de Lección
export interface Lesson {
    _id: string;
    titulo: string;
    contenido: string;
    tipo: 'video' | 'texto' | 'quiz';
    duracion: string;
    ordenIndice: number;
    videoUrl?: string;
    recursosAdicionales?: {
        tipo: string;
        url: string;
        titulo: string;
    }[];
    esGratis: boolean;
}

export interface CoursesFilter {
    etiquetas?: string[];
    nivel?: 'principiante' | 'intermedio' | 'avanzado';
    premium?: boolean;
    busqueda?: string;
}

// Para desarrollo/pruebas mientras no tengas backend
// Actualizar los datos de ejemplo para incluir módulos y lecciones
const mockCourses: Course[] = [
    {
        _id: "c101",
        titulo: "Fundamentos de HTML y CSS",
        descripcion: "Aprende los fundamentos de HTML y CSS desde cero",
        premium: false,
        autor: {
            _id: "u001",
            nombre: "Juan Pérez",
            username: "juanperez",
            avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
            biografia: "Desarrollador web con más de 8 años de experiencia. Me apasiona enseñar y compartir conocimientos."
        },
        etiquetas: ["html", "css", "web"],
        fechaCreacion: new Date("2025-01-15"),
        duracionEstimada: "4h 30min",
        nivel: "principiante",
        imagenCurso: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=1632&auto=format&fit=crop",
        estudiantes: 42,
        calificacion: 4.7,
        precio: 29.99,
        modulos: [
            {
                _id: "m101-1",
                titulo: "Introducción al desarrollo web",
                descripcion: "Conceptos básicos de desarrollo web y herramientas necesarias.",
                ordenIndice: 0,
                lecciones: [
                    {
                        _id: "l101-1-1",
                        titulo: "¿Qué es HTML y CSS?",
                        contenido: "<p>HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. Define la estructura y el contenido de una página web mediante elementos representados por etiquetas.</p><p>CSS (Cascading Style Sheets) es un lenguaje utilizado para describir la presentación de documentos HTML, incluyendo colores, diseño y fuentes.</p>",
                        tipo: "texto",
                        duracion: "10min",
                        ordenIndice: 0,
                        esGratis: true
                    },
                    {
                        _id: "l101-1-2",
                        titulo: "Configuración del entorno de trabajo",
                        contenido: "<p>En esta lección aprenderás a configurar tu entorno de desarrollo para trabajar con HTML y CSS.</p>",
                        tipo: "video",
                        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        duracion: "15min",
                        ordenIndice: 1,
                        esGratis: true,
                        recursosAdicionales: [
                            {
                                tipo: "documento",
                                url: "https://example.com/document.pdf",
                                titulo: "Manual de instalación de VS Code"
                            }
                        ]
                    }
                ]
            },
            {
                _id: "m101-2",
                titulo: "Conceptos básicos de HTML",
                descripcion: "Elementos fundamentales de HTML.",
                ordenIndice: 1,
                lecciones: [
                    {
                        _id: "l101-2-1",
                        titulo: "Estructura básica de un documento HTML",
                        contenido: "<p>Toda página HTML debe comenzar con la declaración DOCTYPE y contener los elementos html, head y body.</p>",
                        tipo: "texto",
                        duracion: "12min",
                        ordenIndice: 0,
                        esGratis: true
                    },
                    {
                        _id: "l101-2-2",
                        titulo: "Elementos HTML comunes",
                        contenido: "<p>En esta lección aprenderás sobre los elementos más comunes de HTML.</p>",
                        tipo: "video",
                        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        duracion: "20min",
                        ordenIndice: 1,
                        esGratis: false
                    }
                ]
            }
        ]
    },
    {
        _id: "c102",
        titulo: "JavaScript Avanzado",
        descripcion: "Domina las características avanzadas de JavaScript",
        premium: true,
        autor: {
            _id: "u002",
            nombre: "Ana García",
            username: "anagarcia",
            avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
            biografia: "Ingeniera de software especializada en JavaScript. He trabajado en empresas como Google y Facebook."
        },
        etiquetas: ["javascript", "es6", "web"],
        fechaCreacion: new Date("2025-02-20"),
        duracionEstimada: "8h 15min",
        nivel: "avanzado",
        imagenCurso: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop",
        estudiantes: 28,
        calificacion: 4.9,
        precio: 49.99,
        modulos: [
            {
                _id: "m102-1",
                titulo: "Características modernas de JavaScript",
                descripcion: "Novedades de ES6+",
                ordenIndice: 0,
                lecciones: [
                    {
                        _id: "l102-1-1",
                        titulo: "Arrow Functions y Templates Literals",
                        contenido: "<p>Las arrow functions proporcionan una sintaxis más corta para escribir funciones. Los template literals permiten expresiones incrustadas.</p>",
                        tipo: "texto",
                        duracion: "15min",
                        ordenIndice: 0,
                        esGratis: true
                    },
                    {
                        _id: "l102-1-2",
                        titulo: "Destructuring y Spread Operator",
                        contenido: "<p>En esta lección aprenderás sobre la asignación por destructuring y el operador spread.</p>",
                        tipo: "video",
                        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        duracion: "18min",
                        ordenIndice: 1,
                        esGratis: false
                    }
                ]
            }
        ]
    }
    // Puedes añadir más cursos con sus respectivos módulos y lecciones
];

// Función para filtrar los cursos simulados
export const getCourses = async (filters?: CoursesFilter): Promise<Course[]> => {
    try {
        if (USE_MOCK_DATA) {
            // Simulando una llamada a API con un retraso
            await new Promise(resolve => setTimeout(resolve, 800));

            // Filtrar los cursos según los criterios
            let filteredCourses = [...mockCourses];

            if (filters) {
                // Filtrar por etiquetas
                if (filters.etiquetas && filters.etiquetas.length > 0) {
                    filteredCourses = filteredCourses.filter(course =>
                        filters.etiquetas!.some(tag => course.etiquetas.includes(tag))
                    );
                }

                // Filtrar por nivel
                if (filters.nivel) {
                    filteredCourses = filteredCourses.filter(course =>
                        course.nivel === filters.nivel
                    );
                }

                // Filtrar por premium
                if (filters.premium !== undefined) {
                    filteredCourses = filteredCourses.filter(course =>
                        course.premium === filters.premium
                    );
                }

                // Filtrar por búsqueda
                if (filters.busqueda) {
                    const searchTerm = filters.busqueda.toLowerCase();
                    filteredCourses = filteredCourses.filter(course =>
                        course.titulo.toLowerCase().includes(searchTerm) ||
                        course.descripcion.toLowerCase().includes(searchTerm)
                    );
                }
            }

            console.log("Filtros aplicados:", filters);
            console.log("Resultados filtrados:", filteredCourses.length);

            return filteredCourses;
        } else {
            // Construir parámetros para la API real
            const params = new URLSearchParams();

            if (filters) {
                if (filters.busqueda) params.append('busqueda', filters.busqueda);
                if (filters.nivel) params.append('nivel', filters.nivel);
                if (filters.premium !== undefined) params.append('premium', String(filters.premium));
                if (filters.etiquetas && filters.etiquetas.length > 0) {
                    filters.etiquetas.forEach(tag => {
                        params.append('etiquetas', tag);
                    });
                }
            }

            // Hacer la llamada API real
            const response = await coursesApi.get(`/courses?${params.toString()}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw new Error("Error al obtener los cursos");
    }
};

// Actualizar getCourseById con el mismo patrón
export const getCourseById = async (id: string): Promise<Course> => {
    try {
        if (USE_MOCK_DATA) {
            // Simulación actual
            await new Promise(resolve => setTimeout(resolve, 500));

            const course = mockCourses.find(c => c._id === id);

            if (!course) {
                throw new Error("Curso no encontrado");
            }

            return course;
        } else {
            // Llamada a API real
            const response = await coursesApi.get(`/courses/${id}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching course:", error);
        throw new Error("Error al obtener el curso");
    }
};

// Actualizar enrollCourse con el mismo patrón
export const enrollCourse = async (id: string): Promise<void> => {
    try {
        if (USE_MOCK_DATA) {
            // Simulación actual
            await new Promise(resolve => setTimeout(resolve, 500));

            const course = mockCourses.find(c => c._id === id);

            if (!course) {
                throw new Error("Curso no encontrado");
            }

            console.log(`Inscripción simulada al curso: ${course.titulo}`);
        } else {
            // Llamada a API real
            await coursesApi.post(`/courses/${id}/enroll`);
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
        throw new Error("Error al inscribirse en el curso");
    }
};

// Obtener una lección por ID
export const getLessonById = async (id: string): Promise<Lesson> => {
    try {
        if (USE_MOCK_DATA) {
            // Simular retraso de red
            await new Promise(resolve => setTimeout(resolve, 500));

            // Buscar la lección en los módulos de los cursos de muestra
            for (const course of mockCourses) {
                for (const module of course.modulos || []) {
                    const lesson = module.lecciones.find(l => l._id === id);
                    if (lesson) {
                        return lesson;
                    }
                }
            }

            throw new Error("Lección no encontrada");
        } else {
            const response = await coursesApi.get(`/lessons/${id}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching lesson:", error);
        throw new Error("Error al obtener la lección");
    }
};

// Marcar una lección como completada
export const markLessonComplete = async (courseId: string, lessonId: string): Promise<void> => {
    try {
        if (USE_MOCK_DATA) {
            // Simular retraso de red
            await new Promise(resolve => setTimeout(resolve, 800));

            console.log(`Lección ${lessonId} del curso ${courseId} marcada como completada`);
            return;
        } else {
            await coursesApi.post('/progress/lesson/complete', {
                cursoId: courseId,
                leccionId: lessonId
            });
        }
    } catch (error) {
        console.error("Error marking lesson as complete:", error);
        throw new Error("Error al marcar la lección como completada");
    }
};

// Obtener cursos creados por el instructor actual
export const getInstructorCourses = async () => {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            return [
                {
                    _id: "c101",
                    titulo: "Fundamentos de HTML y CSS",
                    descripcion: "Aprende los fundamentos de HTML y CSS desde cero",
                    fechaCreacion: new Date("2023-01-15"),
                    estudiantes: 42,
                    calificacion: 4.7,
                    precio: 29.99,
                    nivel: "principiante",
                    imagenCurso: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=1632&auto=format&fit=crop"
                },
                {
                    _id: "c102",
                    titulo: "JavaScript Avanzado",
                    descripcion: "Domina las características avanzadas de JavaScript",
                    fechaCreacion: new Date("2023-02-20"),
                    estudiantes: 28,
                    calificacion: 4.9,
                    precio: 49.99,
                    nivel: "avanzado",
                    imagenCurso: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop"
                }
            ];
        } else {
            const response = await coursesApi.get('/courses/instructor');
            return response.data.data;
        }
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        throw new Error('No se pudieron obtener los cursos del instructor');
    }
};

// Crear un nuevo curso (para instructores)
export const createCourse = async (courseData: CourseFormData): Promise<Course> => {
    try {
        if (USE_MOCK_DATA) {
            // Simular retraso de red
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCourse = {
                _id: `c${Date.now()}`,
                ...courseData,
                fechaCreacion: new Date(),
                estudiantes: 0,
                calificacion: 0,
                autor: {
                    _id: "current-user-id",
                    nombre: "Usuario Actual",
                    username: "usuario_actual",
                    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg"
                },
                etiquetas: courseData.etiquetas || []
            };
            
            console.log('Curso creado (simulación):', newCourse);
            return newCourse as Course;
        } else {
            const response = await coursesApi.post('/courses', courseData);
            return response.data.data;
        }
    } catch (error) {
        console.error('Error creating course:', error);
        throw new Error('Error al crear el curso');
    }
};

// Actualizar un curso existente (para instructores)
export const updateCourse = async (id: string, courseData: CourseFormData): Promise<Course> => {
    try {
        if (USE_MOCK_DATA) {
            // Simular retraso de red
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const course = mockCourses.find(c => c._id === id);
            
            if (!course) {
                throw new Error("Curso no encontrado");
            }
            
            const updatedCourse = {
                ...course,
                ...courseData,
            };
            
            console.log('Curso actualizado (simulación):', updatedCourse);
            return updatedCourse as Course;
        } else {
            const response = await coursesApi.put(`/courses/${id}`, courseData);
            return response.data.data;
        }
    } catch (error) {
        console.error('Error updating course:', error);
        throw new Error('Error al actualizar el curso');
    }
};

// Eliminar un curso (para instructores)
export const deleteCourse = async (id: string): Promise<void> => {
    try {
        if (USE_MOCK_DATA) {
            // Simular retraso de red
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const course = mockCourses.find(c => c._id === id);
            
            if (!course) {
                throw new Error("Curso no encontrado");
            }
            
            console.log(`Curso eliminado (simulación): ${id} - ${course.titulo}`);
            return;
        } else {
            await coursesApi.delete(`/courses/${id}`);
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        throw new Error('Error al eliminar el curso');
    }
};

// Exportación por defecto para compatibilidad con importaciones existentes
export default {
    getCourses,
    getCourseById,
    enrollCourse,
    getLessonById,
    markLessonComplete,
    getInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse
};