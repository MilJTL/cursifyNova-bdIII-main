import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInstructorCourses, type Course } from '../../api/courses';
//import { getStudentStats } from '../../api/progress';

const InstructorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener cursos del instructor
        const coursesData = await getInstructorCourses();
        setCourses(coursesData);
        
        // Calcular estadísticas generales
        let totalStudents = 0;
        let totalRevenue = 0;
        let totalRating = 0;
        let ratingCount = 0;
        
        coursesData.forEach(course => {
          totalStudents += course.estudiantes || 0;
          totalRevenue += (course.premium && course.precio ? course.precio * (course.estudiantes || 0) : 0);
          
          if (course.valoracion) {
            totalRating += course.valoracion;
            ratingCount++;
          }
        });
        
        setStats({
          totalStudents,
          totalCourses: coursesData.length,
          totalRevenue,
          averageRating: ratingCount ? totalRating / ratingCount : 0
        });
        
        setError(null);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard del Instructor</h1>
        <Link 
          to="/instructor/courses/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear nuevo curso
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Estudiantes totales</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Cursos activos</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Ingresos totales</p>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Valoración promedio</p>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-yellow-500 mr-2">{stats.averageRating.toFixed(1)}</p>
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className="w-5 h-5" 
                  fill={star <= Math.round(stats.averageRating) ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      <h2 className="text-xl font-bold mb-4">Tus cursos</h2>
      
      {courses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos creados aún</h3>
          <p className="text-gray-500 mb-6">Empieza a crear contenido educativo para compartir tu conocimiento con estudiantes de todo el mundo.</p>
          <Link 
            to="/instructor/courses/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear mi primer curso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col"
            >
              {course.imagenCurso ? (
                <img 
                  src={course.imagenCurso} 
                  alt={course.titulo} 
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{course.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.publicado 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="flex items-center mr-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {course.estudiantes || 0} estudiantes
                  </span>
                  
                  {course.valoracion && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {course.valoracion.toFixed(1)}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{course.descripcion}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.nivel && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                      {course.nivel.charAt(0).toUpperCase() + course.nivel.slice(1)}
                    </span>
                  )}
                  
                  {course.premium && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                      Premium
                    </span>
                  )}
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between">
                  <Link
                    to={`/instructor/courses/${course._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Gestionar curso
                  </Link>
                  
                  <Link
                    to={`/instructor/courses/${course._id}/analytics`}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Ver estadísticas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;