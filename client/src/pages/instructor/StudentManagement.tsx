import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, getCourseStudents, type Course as ApiCourse } from '../../api/courses';
import { getAllStudentProgress, type CourseProgressSummary } from '../../api/progress';

// Definir interfaces para los tipos de datos que manejamos
interface Student {
    id: string;
    nombre: string;
    username: string;
    email: string;
    avatarUrl?: string;
    fechaInscripcion: string;
    ultimoAcceso: string;
    progresoTotal: number;
}

interface StudentData {
    _id: string;
    id: string;
    nombre: string;
    username: string;
    email: string;
    avatarUrl?: string;
    fechaInscripcion: string;
    ultimoAcceso: string;
}

interface ProgressData {
    estudiante: {
        id: string;
        nombre: string;
    };
    curso: {
        id: string;
        titulo: string;
    };
    porcentajeCompletado: number;
    fechaUltimaActividad?: string;
}

// Interfaz para el curso en este componente 
// (usar solo las propiedades que necesitamos, adaptando desde ApiCourse)
interface Course {
    _id: string; // Es importante que coincida con la propiedad real de la API
    id: string; // Para compatibilidad con el resto del componente
    titulo: string;
    descripcion?: string;
}

const StudentManagement: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [progressFilter, setProgressFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const loadData = async () => {
            if (!courseId) return;

            try {
                setIsLoading(true);

                // Cargar información del curso
                const courseData: ApiCourse = await getCourseById(courseId);
                // Adaptar el curso al formato que espera este componente
                setCourse({
                    _id: courseData._id,
                    id: courseData._id, // Asegurar compatibilidad
                    titulo: courseData.titulo,
                    descripcion: courseData.descripcion
                });

                // Cargar estudiantes del curso
                const studentsData = await getCourseStudents(courseId);

                // Cargar progreso de estudiantes
                const progressDataRaw = await getAllStudentProgress();

                // Adaptamos los datos al formato que espera nuestro componente
                const progressData: ProgressData[] = progressDataRaw.map((item: CourseProgressSummary) => ({
                    estudiante: {
                        id: item.studentId,
                        nombre: item.studentName,
                    },
                    curso: {
                        id: item.courseId,
                        titulo: item.courseTitle,
                    },
                    porcentajeCompletado: item.progressPercentage,
                    fechaUltimaActividad: item.lastAccessed ? new Date(item.lastAccessed).toISOString() : undefined,
                }));

                // Combinar datos de estudiantes con su progreso
                const studentsWithProgress = studentsData.map((student: StudentData) => {
                    const studentProgress = progressData.find(
                        (p) => p.estudiante.id === student.id && p.curso.id === courseId
                    ) as ProgressData | undefined;

                    return {
                        ...student,
                        progresoTotal: studentProgress?.porcentajeCompletado ?? 0
                    };
                });

                setStudents(studentsWithProgress);
                setFilteredStudents(studentsWithProgress);
                setError(null);
            } catch (err) {
                console.error('Error cargando datos de estudiantes:', err);
                setError('No se pudieron cargar los datos de los estudiantes');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [courseId]);



    useEffect(() => {
        // Aplicar filtros y ordenamiento
        let result = [...students];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(student =>
                student.nombre.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term) ||
                student.username.toLowerCase().includes(term)
            );
        }

        // Filtrar por progreso
        if (progressFilter === 'incomplete') {
            result = result.filter(student => student.progresoTotal < 100);
        } else if (progressFilter === 'complete') {
            result = result.filter(student => student.progresoTotal >= 100);
        }

        // Ordenar resultados
        result.sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc'
                    ? a.nombre.localeCompare(b.nombre)
                    : b.nombre.localeCompare(a.nombre);
            } else if (sortBy === 'progress') {
                return sortOrder === 'asc'
                    ? a.progresoTotal - b.progresoTotal
                    : b.progresoTotal - a.progresoTotal;
            } else {
                // Ordenar por fecha
                return sortOrder === 'asc'
                    ? new Date(a.fechaInscripcion).getTime() - new Date(b.fechaInscripcion).getTime()
                    : new Date(b.fechaInscripcion).getTime() - new Date(a.fechaInscripcion).getTime();
            }
        });

        setFilteredStudents(result);
    }, [students, searchTerm, progressFilter, sortBy, sortOrder]);

    const handleSort = (criteria: 'name' | 'progress' | 'date') => {
        if (sortBy === criteria) {
            // Si ya estamos ordenando por este criterio, invertir el orden
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Cambiar el criterio de ordenación
            setSortBy(criteria);
            setSortOrder('desc'); // Por defecto ordenar descendente
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p>{error || 'No se encontraron datos para este curso'}</p>
                </div>
                <div className="mt-4">
                    <Link
                        to="/admin/dashboard"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to={`/admin/courses/${courseId}`}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al curso
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h1 className="text-2xl font-bold mb-2">Estudiantes: {course.titulo}</h1>
                <p className="text-gray-500 mb-6">Total: {students.length} estudiantes inscritos</p>

                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
                    <div className="max-w-md w-full">
                        <label htmlFor="search" className="sr-only">Buscar estudiantes</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Buscar por nombre o email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div>
                            <label htmlFor="progressFilter" className="sr-only">Filtrar por progreso</label>
                            <select
                                id="progressFilter"
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={progressFilter}
                                onChange={(e) => setProgressFilter(e.target.value as 'all' | 'incomplete' | 'complete')}
                            >
                                <option value="all">Todos los estudiantes</option>
                                <option value="complete">Curso completado</option>
                                <option value="incomplete">Curso en progreso</option>
                            </select>
                        </div>

                        <div>
                            <button
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => {
                                    // Descargar CSV de estudiantes
                                    const headers = ['Nombre', 'Email', 'Usuario', 'Fecha de inscripción', 'Progreso'];
                                    const csvContent = [
                                        headers.join(','),
                                        ...filteredStudents.map(student => [
                                            `"${student.nombre}"`,
                                            student.email,
                                            student.username,
                                            formatDate(student.fechaInscripcion),
                                            `${student.progresoTotal}%`
                                        ].join(','))
                                    ].join('\n');

                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.setAttribute('href', url);
                                    a.setAttribute('download', `estudiantes-${course.titulo}.csv`);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                            >
                                <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de estudiantes */}
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-6">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No se encontraron estudiantes con los filtros aplicados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center focus:outline-none"
                                            onClick={() => handleSort('name')}
                                        >
                                            Estudiante
                                            {sortBy === 'name' && (
                                                <svg className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center focus:outline-none"
                                            onClick={() => handleSort('date')}
                                        >
                                            Inscripción
                                            {sortBy === 'date' && (
                                                <svg className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            className="flex items-center focus:outline-none"
                                            onClick={() => handleSort('progress')}
                                        >
                                            Progreso
                                            {sortBy === 'progress' && (
                                                <svg className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {student.avatarUrl ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={student.avatarUrl}
                                                            alt={student.nombre}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {student.nombre.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{student.nombre}</div>
                                                    <div className="text-sm text-gray-500">@{student.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.email}</div>
                                            <div className="text-xs text-gray-500">
                                                Último acceso: {student.ultimoAcceso ? formatDate(student.ultimoAcceso) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(student.fechaInscripcion)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${student.progresoTotal >= 100
                                                        ? 'bg-green-600'
                                                        : student.progresoTotal > 50
                                                            ? 'bg-blue-600'
                                                            : 'bg-yellow-400'
                                                        }`}
                                                    style={{ width: `${student.progresoTotal}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 inline-block">
                                                {student.progresoTotal}% completado
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;