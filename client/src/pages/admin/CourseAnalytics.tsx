import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courses';
import type { Course } from '../../api/courses';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js que necesitamos
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Tipos para los datos analíticos
interface CourseAnalytics {
    enrollmentsByDay: {
        date: string;
        count: number;
    }[];
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
    lessonCompletions: {
        lessonId: string;
        lessonTitle: string;
        completions: number;
        views: number;
    }[];
    studentDemographics: {
        country: string;
        count: number;
    }[];
    moduleCompletionRates: {
        moduleId: string;
        moduleTitle: string;
        completionRate: number;
    }[];
}

const CourseAnalytics: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days' | 'alltime'>('30days');

    // Efecto para cargar los datos del curso
    useEffect(() => {
        if (!id) return;

        const fetchCourseData = async () => {
            try {
                setIsLoading(true);
                const courseData = await getCourseById(id);
                setCourse(courseData);

                // En un escenario real, aquí llamarías a una API para obtener analíticas
                // Aquí generamos datos simulados para demostración
                generateMockAnalytics();
            } catch (err) {
                console.error('Error al cargar el curso:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar los datos analíticos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseData();
    }, [id]);

    // Función que genera datos analíticos simulados
    const generateMockAnalytics = () => {
        // Crear fechas para los últimos 30 días
        const dates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 29 + i);
            return date.toISOString().split('T')[0];
        });

        // Generar inscripciones diarias aleatorias
        const enrollmentsByDay = dates.map(date => ({
            date,
            count: Math.floor(Math.random() * 10) + 1,
        }));

        // Datos simulados para el resto de métricas
        const mockAnalytics: CourseAnalytics = {
            enrollmentsByDay,
            completionRate: Math.random() * 100,
            averageRating: 3 + Math.random() * 2,
            totalRevenue: Math.random() * 5000,
            lessonCompletions: [
                { lessonId: 'l1', lessonTitle: 'Introducción al curso', completions: 87, views: 120 },
                { lessonId: 'l2', lessonTitle: 'Conceptos fundamentales', completions: 72, views: 105 },
                { lessonId: 'l3', lessonTitle: 'Ejercicios prácticos', completions: 65, views: 98 },
                { lessonId: 'l4', lessonTitle: 'Estudio de caso', completions: 50, views: 88 },
                { lessonId: 'l5', lessonTitle: 'Proyecto final', completions: 42, views: 75 },
            ],
            studentDemographics: [
                { country: 'México', count: 45 },
                { country: 'Colombia', count: 30 },
                { country: 'España', count: 25 },
                { country: 'Argentina', count: 20 },
                { country: 'Bolivia', count: 70 },
                { country: 'Otros', count: 35 },
            ],
            moduleCompletionRates: [
                { moduleId: 'm1', moduleTitle: 'Módulo 1: Fundamentos', completionRate: 85 },
                { moduleId: 'm2', moduleTitle: 'Módulo 2: Técnicas avanzadas', completionRate: 70 },
                { moduleId: 'm3', moduleTitle: 'Módulo 3: Aplicaciones prácticas', completionRate: 55 },
                { moduleId: 'm4', moduleTitle: 'Módulo 4: Proyecto final', completionRate: 45 },
            ]
        };

        setAnalytics(mockAnalytics);
    };

    // Datos para el gráfico de inscripciones
    const enrollmentChartData = {
        labels: analytics?.enrollmentsByDay.map(day => day.date) || [],
        datasets: [
            {
                label: 'Inscripciones diarias',
                data: analytics?.enrollmentsByDay.map(day => day.count) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Datos para el gráfico de completamiento de módulos
    const moduleCompletionChartData = {
        labels: analytics?.moduleCompletionRates.map(module => module.moduleTitle.split(':')[0]) || [],
        datasets: [
            {
                label: 'Tasa de completamiento (%)',
                data: analytics?.moduleCompletionRates.map(module => module.completionRate) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Datos para el gráfico de demografía de estudiantes
    const demographicsChartData = {
        labels: analytics?.studentDemographics.map(item => item.country) || [],
        datasets: [
            {
                label: 'Estudiantes por país',
                data: analytics?.studentDemographics.map(item => item.count) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Opciones para los gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Estadísticas del curso',
            },
        },
    };

    // Renderizado para estado de carga
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Renderizado para estado de error
    if (error || !course) {
        return (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Error</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">No se pudieron cargar los datos analíticos.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Volver a mis cursos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Encabezado */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analíticas de Curso</h1>
                            <p className="mt-2 text-sm text-gray-700">
                                {course.titulo}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button
                                onClick={() => navigate(`/instructor/courses/${id}/content`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver contenido del curso
                            </button>
                            <button
                                onClick={() => navigate('/instructor/courses')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver a mis cursos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selector de período */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Período de análisis</h3>
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            <button
                                onClick={() => setSelectedPeriod('7days')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriod === '7days'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Últimos 7 días
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('30days')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriod === '30days'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Últimos 30 días
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('90days')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriod === '90days'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Últimos 90 días
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('alltime')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriod === 'alltime'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Todo el tiempo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de métricas principales */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    {/* Estudiantes totales */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Estudiantes inscritos</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {course.estudiantes || 0}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="sr-only">Incremento</span>
                                            8%
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasa de completamiento */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Tasa de completamiento</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {analytics?.completionRate.toFixed(1)}%
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calificación promedio */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Calificación promedio</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {analytics?.averageRating.toFixed(1)}
                                        </div>
                                        <div className="ml-2 flex items-center">
                                            {[...Array(5)].map((_, index) => (
                                                <svg
                                                    key={index}
                                                    className={`h-4 w-4 ${index < Math.floor(analytics?.averageRating || 0)
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ingresos totales */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Ingresos totales</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            ${analytics?.totalRevenue.toFixed(2)}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="sr-only">Incremento</span>
                                            12%
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Inscripciones */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Inscripciones diarias</h3>
                            <div className="h-80">
                                <Line data={enrollmentChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Completamiento por Módulo */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tasa de completamiento por módulo</h3>
                            <div className="h-80">
                                <Bar data={moduleCompletionChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Demografía */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Demografía de estudiantes</h3>
                            <div className="h-80">
                                <Pie data={demographicsChartData} options={{
                                    ...chartOptions,
                                    maintainAspectRatio: false
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Lecciones */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Completamiento de lecciones</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lección
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Visualizaciones
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Completamientos
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tasa
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {analytics?.lessonCompletions.map((lesson) => (
                                            <tr key={lesson.lessonId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {lesson.lessonTitle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lesson.views}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lesson.completions}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {((lesson.completions / lesson.views) * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de recomendaciones */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recomendaciones para mejorar</h3>
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            La tasa de completamiento del Módulo 4 es baja. Considera revisar el contenido o añadir recursos adicionales para hacerlo más accesible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-l-4 border-green-500 bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            El Módulo 1 tiene una excelente tasa de completamiento. Considera usar un enfoque similar en otros módulos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Hay un alto porcentaje de estudiantes de Bolivia. Considera crear contenido específico o ejemplos relevantes para este mercado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;