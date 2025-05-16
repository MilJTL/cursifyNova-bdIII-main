import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, getCourseAnalytics } from '../../api/courses';
import { type Course } from '../../api/courses';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    type ChartData
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface AnalyticsData {
    enrollmentsByDay: {
        date: string;
        count: number;
    }[];
    moduleCompletionRates: {
        moduleTitle: string;
        completionRate: number;
    }[];
    lessonEngagement: {
        lessonTitle: string;
        views: number;
        completions: number;
    }[];
    studentDemographics: {
        category: string;
        count: number;
    }[];
    overallStats: {
        totalEnrollments: number;
        activeStudents: number;
        completionRate: number;
        averageRating: number;
        reviewCount: number;
        revenue: number;
    };
}

const CourseAnalytics: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    
    // Usa el tipo Course importado directamente de tu API
    const [course, setCourse] = useState<Course | null>(null);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    useEffect(() => {
        const loadData = async () => {
            if (!courseId) return;

            try {
                setIsLoading(true);

                // Cargar información del curso
                const courseData = await getCourseById(courseId);
                setCourse(courseData);

                // Cargar datos analíticos
                const analytics = await getCourseAnalytics(courseId);
                setAnalyticsData(analytics);

                setError(null);
            } catch (err) {
                console.error('Error cargando datos analíticos:', err);
                setError('No se pudieron cargar los datos analíticos del curso');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [courseId]);

    // Preparar datos para los gráficos
    const prepareEnrollmentChartData = () => {
        if (!analyticsData) return null;

        const filteredData = filterDataByDateRange(analyticsData.enrollmentsByDay);

        return {
            labels: filteredData.map(item => formatDate(item.date)),
            datasets: [
                {
                    label: 'Inscripciones',
                    data: filteredData.map(item => item.count),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.3
                }
            ]
        };
    };

    const prepareModuleCompletionData = () => {
        if (!analyticsData) return null;

        return {
            labels: analyticsData.moduleCompletionRates.map(item => truncateText(item.moduleTitle, 20)),
            datasets: [
                {
                    label: 'Tasa de finalización (%)',
                    data: analyticsData.moduleCompletionRates.map(item => item.completionRate * 100),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };
    };

    const prepareLessonEngagementData = () => {
        if (!analyticsData) return null;

        return {
            labels: analyticsData.lessonEngagement.map(item => truncateText(item.lessonTitle, 15)),
            datasets: [
                {
                    label: 'Vistas',
                    data: analyticsData.lessonEngagement.map(item => item.views),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Completadas',
                    data: analyticsData.lessonEngagement.map(item => item.completions),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };
    };

    const prepareDemographicsData = () => {
        if (!analyticsData) return null;

        return {
            labels: analyticsData.studentDemographics.map(item => item.category),
            datasets: [
                {
                    data: analyticsData.studentDemographics.map(item => item.count),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // Funciones auxiliares
    const filterDataByDateRange = (data: { date: string; count: number }[]) => {
        if (dateRange === 'all') return data;

        const now = new Date();
        const cutoffDate = new Date();

        if (dateRange === '7d') cutoffDate.setDate(now.getDate() - 7);
        else if (dateRange === '30d') cutoffDate.setDate(now.getDate() - 30);
        else if (dateRange === '90d') cutoffDate.setDate(now.getDate() - 90);

        return data.filter(item => new Date(item.date) >= cutoffDate);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!course || !analyticsData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p>{error || 'No se encontraron datos para este curso'}</p>
                </div>
                <div className="mt-4">
                    <Link
                        to="/instructor/dashboard"
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
                    to={`/instructor/courses/${courseId}`}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al curso
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Analíticas: {course.titulo}</h1>
                        <p className="text-gray-500">Datos actualizados al {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="mt-3 md:mt-0">
                        <label htmlFor="dateRange" className="sr-only">Rango de fechas</label>
                        <select
                            id="dateRange"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                        >
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Últimos 30 días</option>
                            <option value="90d">Últimos 90 días</option>
                            <option value="all">Todo el tiempo</option>
                        </select>
                    </div>
                </div>

                {/* Tarjetas con métricas importantes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Inscripciones totales</h3>
                        <p className="text-2xl font-bold">{analyticsData.overallStats.totalEnrollments}</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Estudiantes activos</h3>
                        <p className="text-2xl font-bold">{analyticsData.overallStats.activeStudents}</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Tasa de finalización</h3>
                        <p className="text-2xl font-bold">{(analyticsData.overallStats.completionRate * 100).toFixed(1)}%</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Valoración media</h3>
                        <p className="text-2xl font-bold flex items-center">
                            {analyticsData.overallStats.averageRating.toFixed(1)}
                            <svg className="w-5 h-5 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Número de reseñas</h3>
                        <p className="text-2xl font-bold">{analyticsData.overallStats.reviewCount}</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Ingresos generados</h3>
                        <p className="text-2xl font-bold">${analyticsData.overallStats.revenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Inscripciones en el tiempo</h3>
                        {prepareEnrollmentChartData() && (
                            <div className="h-64">
                                <Line
                                    data={prepareEnrollmentChartData() as ChartData<'line'>}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Tasa de finalización por módulo (%)</h3>
                        {prepareModuleCompletionData() && (
                            <div className="h-64">
                                <Bar
                                    data={prepareModuleCompletionData() as ChartData<'bar'>}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Participación en lecciones</h3>
                        {prepareLessonEngagementData() && (
                            <div className="h-64">
                                <Bar
                                    data={prepareLessonEngagementData() as ChartData<'bar'>}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Demografía de estudiantes</h3>
                        {prepareDemographicsData() && (
                            <div className="h-64 flex justify-center items-center">
                                <div style={{ width: '80%', height: '80%' }}>
                                    <Doughnut
                                        data={prepareDemographicsData() as ChartData<'doughnut'>}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'right',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;