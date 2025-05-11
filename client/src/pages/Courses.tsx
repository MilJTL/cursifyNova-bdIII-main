import React, { useState, useEffect } from 'react';
import { getCourses, type Course, type CoursesFilter } from '../api/courses';
import CourseCard from '../components/courses/CourseCard';



const Courses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filters, setFilters] = useState<CoursesFilter>({});

    // Lista de etiquetas populares para el filtro
    const popularTags = ['html', 'css', 'javascript', 'react', 'node', 'python', 'diseño web'];

    // Función para cargar los cursos con los filtros aplicados
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getCourses(filters);
            setCourses(data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al cargar los cursos');
            }
        } finally {
            setLoading(false);
        }
    };

    // Cargar cursos cuando cambian los filtros
    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Manejar la búsqueda
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            busqueda: searchTerm.trim() === '' ? undefined : searchTerm
        }));
    };

    // Manejar cambios en los filtros de etiquetas
    const toggleTagFilter = (tag: string) => {
        setFilters(prev => {
            const currentTags = prev.etiquetas || [];
            const updatedTags = currentTags.includes(tag)
                ? currentTags.filter(t => t !== tag)
                : [...currentTags, tag];

            return {
                ...prev,
                etiquetas: updatedTags.length > 0 ? updatedTags : undefined
            };
        });
    };

    // Manejar cambio en el filtro de nivel
    const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            nivel: value ? value as 'principiante' | 'intermedio' | 'avanzado' : undefined
        }));
    };

    // Manejar cambio en el filtro de premium
    const handlePremiumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            premium: value === '' ? undefined : value === 'true'
        }));
    };

    // Limpiar todos los filtros
    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Explora nuestros cursos</h1>

                {/* Barra de búsqueda */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                    <form onSubmit={handleSearchSubmit} className="flex mb-4">
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg transition"
                        >
                            Buscar
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                                Nivel
                            </label>
                            <select
                                id="nivel"
                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.nivel || ''}
                                onChange={handleNivelChange}
                            >
                                <option value="">Todos los niveles</option>
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="premium" className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo
                            </label>
                            <select
                                id="premium"
                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.premium === undefined ? '' : String(filters.premium)}
                                onChange={handlePremiumChange}
                            >
                                <option value="">Todos</option>
                                <option value="true">Premium</option>
                                <option value="false">Gratuitos</option>
                            </select>
                        </div>

                        {/* Botón para limpiar filtros */}
                        {(filters.busqueda || filters.nivel || filters.premium !== undefined || (filters.etiquetas && filters.etiquetas.length > 0)) && (
                            <button
                                onClick={clearFilters}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-auto"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Etiquetas populares */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Etiquetas populares</h2>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTagFilter(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${filters.etiquetas?.includes(tag)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presentación de los resultados */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron cursos</h3>
                        <p className="mt-1 text-gray-500">Prueba con diferentes filtros o vuelve más tarde.</p>
                        <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-800">Limpiar filtros</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                {...course}
                                imagenCurso={course.imagenCurso || 'default-image-url.jpg'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;