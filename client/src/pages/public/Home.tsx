import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, type Course } from '../../api/courses';
import CourseList from '../../components/courses/CourseList';

const Home: React.FC = () => {
    const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
    const [newestCourses, setNewestCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                // Obtener cursos destacados (limitados a 4)
                const featured = await getCourses({ limit: 4, featured: true });
                setFeaturedCourses(featured);

                // Obtener cursos más recientes (limitados a 4)
                const newest = await getCourses({ limit: 4, sort: 'createdAt' });
                setNewestCourses(newest);

                setError(null);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('No se pudieron cargar los cursos. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Aprende nuevas habilidades. Avanza en tu carrera.
                            </h1>
                            <p className="text-xl mb-6">
                                Descubre cursos de calidad impartidos por expertos en sus campos.
                                Aprende a tu ritmo, desde cualquier lugar.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to="/courses"
                                    className="bg-white text-blue-600 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
                                >
                                    Explorar cursos
                                </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="https://via.placeholder.com/600x400?text=CursifyNova"
                                alt="Aprendizaje online"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-2 text-center">Cursos destacados</h2>
                    <p className="text-gray-600 mb-8 text-center">
                        Cursos populares seleccionados por nuestro equipo
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    ) : (
                        <CourseList courses={featuredCourses} />
                    )}

                    <div className="text-center mt-8">
                        <Link
                            to="/courses"
                            className="inline-block bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Ver todos los cursos
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newest Courses Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-2 text-center">Cursos más recientes</h2>
                    <p className="text-gray-600 mb-8 text-center">
                        Lo último en contenido educativo agregado a nuestra plataforma
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    ) : (
                        <CourseList courses={newestCourses} />
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">¿Por qué elegir CursifyNova?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Aprendizaje flexible</h3>
                            <p className="text-gray-600">
                                Aprende a tu propio ritmo, en cualquier momento y desde cualquier lugar.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Instructores expertos</h3>
                            <p className="text-gray-600">
                                Aprende de profesionales con experiencia real en la industria.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Contenido actualizado</h3>
                            <p className="text-gray-600">
                                Accede a contenido siempre actualizado con las últimas tendencias y tecnologías.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu viaje de aprendizaje?</h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Únete a miles de estudiantes que ya están mejorando sus habilidades y avanzando en sus carreras.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-blue-600 font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
                    >
                        Comenzar ahora
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;