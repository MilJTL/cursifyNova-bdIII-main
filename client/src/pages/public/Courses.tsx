import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCourses, type Course } from '../../api/courses';
import CourseList from '../../components/courses/CourseList';
import { type CoursesFilter } from '../../api/courses';
const Courses: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para los filtros
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    // Extraer niveles de searchParams (pueden ser múltiples)
    const getNivelesFromParams = () => {
        const niveles: string[] = [];
        searchParams.getAll('nivel').forEach(nivel => niveles.push(nivel));
        return niveles;
    };

    const [selectedNiveles, setSelectedNiveles] = useState<string[]>(getNivelesFromParams());
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');

    // Opciones de filtros
    const nivelOptions = [
        { value: 'principiante', label: 'Principiante' },
        { value: 'intermedio', label: 'Intermedio' },
        { value: 'avanzado', label: 'Avanzado' },
    ];

    const sortOptions = [
        { value: '', label: 'Relevancia' },
        { value: 'fechaCreacion', label: 'Más recientes primero' },
        { value: 'valoracion', label: 'Mayor valoración' },
        { value: 'estudiantes', label: 'Más populares' },
    ];

    useEffect(() => {
        fetchCourses();
    }, [searchParams]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Obtener todos los valores para cada parámetro
            const busqueda = searchParams.get('q') || undefined;
            const niveles = searchParams.getAll('nivel');
            const sort = searchParams.get('sort') || undefined;
            console.log('Parámetros de URL:', { busqueda, niveles, sort });
            // Construir objeto de filtros con el tipo correcto
            const filters: CoursesFilter = {
                busqueda,
                sort,
            };

            // Solo incluir niveles si hay alguno seleccionado
            if (niveles && niveles.length > 0) {
                Object.assign(filters, { nivel: niveles });
            }

            console.log('Enviando filtros a API:', filters);
            const fetchedCourses = await getCourses(filters);
            console.log('Cursos recuperados:', fetchedCourses);
            setCourses(fetchedCourses);
            setError(null);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('No se pudieron cargar los cursos. Por favor, intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Actualiza los parámetros de búsqueda y URL
    const updateFilters = () => {
        const params = new URLSearchParams();

        // Establecer término de búsqueda
        if (searchTerm) {
            params.set('q', searchTerm);
        }

        // Establecer múltiples niveles
        selectedNiveles.forEach(nivel => {
            params.append('nivel', nivel);
        });

        // Establecer ordenamiento
        if (sortBy) {
            params.set('sort', sortBy);
        }

        console.log('Actualizando URL con params:', Object.fromEntries(params.entries()));
        setSearchParams(params);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters();
    };

    const handleNivelChange = (nivel: string) => {
        let updatedNiveles;

        if (selectedNiveles.includes(nivel)) {
            // Si ya está seleccionado, quitarlo
            updatedNiveles = selectedNiveles.filter(item => item !== nivel);
        } else {
            // Si no está seleccionado, añadirlo
            updatedNiveles = [...selectedNiveles, nivel];
        }

        setSelectedNiveles(updatedNiveles);

        // Aplicar el filtro inmediatamente
        const params = new URLSearchParams(searchParams);

        // Eliminar todos los parámetros de nivel actuales
        params.delete('nivel');

        // Agregar los niveles actualizados
        updatedNiveles.forEach(n => params.append('nivel', n));

        setSearchParams(params);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        // Aplicar ordenamiento inmediatamente
        const params = new URLSearchParams(searchParams);
        if (e.target.value) {
            params.set('sort', e.target.value);
        } else {
            params.delete('sort');
        }
        setSearchParams(params);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Explora nuestros cursos</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtros - Sidebar */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Filtros</h2>

                    {/* Buscador */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <label htmlFor="search" className="block text-gray-700 mb-2 font-medium">Buscar cursos</label>
                        <div className="flex">
                            <input
                                type="text"
                                id="search"
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Buscar cursos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
                                aria-label="Buscar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Filtro de nivel con checkboxes */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-3">Nivel</h3>
                        <div className="space-y-2">
                            {nivelOptions.map(option => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`nivel-${option.value}`}
                                        checked={selectedNiveles.includes(option.value)}
                                        onChange={() => handleNivelChange(option.value)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor={`nivel-${option.value}`}
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Si hay filtros aplicados, mostrar botón para limpiarlos */}
                    {(searchTerm || selectedNiveles.length > 0 || sortBy) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedNiveles([]);
                                setSortBy('');
                                setSearchParams(new URLSearchParams());
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar todos los filtros
                        </button>
                    )}
                </div>

                {/* Lista de cursos */}
                <div className="lg:col-span-3">
                    {/* Ordenamiento y contador de resultados */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
                        <div className="mb-4 md:mb-0">
                            <p className="text-gray-600">
                                {loading ? 'Cargando cursos...' :
                                    error ? 'Error al cargar cursos' :
                                        `${courses.length} curso(s) encontrado(s)`
                                }
                            </p>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2 text-gray-700">Ordenar por:</label>
                            <select
                                id="sort"
                                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Resultados */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-900 mb-1">No se encontraron cursos</h3>
                            <p className="text-gray-500">
                                Intenta ajustar tus filtros o términos de búsqueda.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedNiveles([]);
                                    setSortBy('');
                                    setSearchParams(new URLSearchParams());
                                }}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Restablecer búsqueda
                            </button>
                        </div>
                    ) : (
                        <CourseList courses={courses} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Courses;