import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, type Course } from '../../api/courses';
import { getModulesByCourse, type Module } from '../../api/modules';
import { getLessonsByModule, markLessonCompleted, type Lesson } from '../../api/lessons';
import { updateLessonProgress } from '../../api/progress';

const StudentCourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado para seguir el progreso
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string>('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        
        // Obtener datos del curso
        const courseData = await getCourseById(courseId);
        if (!courseData) {
          setError('Curso no encontrado');
          return;
        }
        setCourse(courseData);
        
        // Obtener módulos del curso
        // Usa getModulesByCourse en lugar de getModules
        const modulesData = await getModulesByCourse(courseId);
        setModules(modulesData);
        
        // Establecer módulo activo inicial (primer módulo)
        if (modulesData.length > 0) {
          setActiveModuleId(modulesData[0]._id);
          
          // Obtener lecciones del primer módulo
          // Usa getLessonsByModule en lugar de getLessons
          const lessonsData = await getLessonsByModule(modulesData[0]._id);
          if (lessonsData.length > 0) {
            // Establecer primera lección como activa
            setActiveLessonId(lessonsData[0]._id);
            setCurrentLesson(lessonsData[0]);
          }
        }
        
        // Cargar el progreso del estudiante
        // En un sistema real, obtendrías esto del backend
        setCompletedLessons(['lesson1', 'lesson2']); // IDs de ejemplo
        
        setError(null);
      } catch (err) {
        console.error('Error cargando datos del curso:', err);
        setError('No se pudieron cargar los datos del curso. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);
  
  const handleLessonSelect = async (moduleId: string, lessonId: string) => {
    try {
      // Cargar la lección seleccionada
      // Usa getLessonsByModule en lugar de getLessons
      const lessonsData = await getLessonsByModule(moduleId);
      const selectedLesson = lessonsData.find((lesson: Lesson) => lesson._id === lessonId);
      
      if (selectedLesson) {
        setCurrentLesson(selectedLesson);
        setActiveModuleId(moduleId);
        setActiveLessonId(lessonId);
        
        // En móvil, cerrar sidebar después de seleccionar
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (err) {
      console.error('Error cargando lección:', err);
    }
  };
  
  const markLessonComplete = async () => {
    if (!currentLesson) return;
    
    try {
      // Actualizar progreso en el backend usando markLessonCompleted
      await markLessonCompleted(currentLesson._id);
      
      // También registramos tiempo de visualización si es necesario
      if (currentLesson.tipo === 'video') {
        await updateLessonProgress(currentLesson._id, {
          completed: true,
          timeSpent: 300 // Ejemplo: 300 segundos
        });
      }
      
      // Actualizar estado local
      setCompletedLessons(prev => 
        prev.includes(currentLesson._id) ? prev : [...prev, currentLesson._id]
      );
      
      // Mostrar mensaje de éxito o manejar navegación a la siguiente lección
    } catch (err) {
      console.error('Error actualizando progreso:', err);
    }
  };

  // Función para encontrar la lección anterior y siguiente
  const findAdjacentLessons = () => {
    if (!currentLesson || !modules.length) return { prevLesson: null, nextLesson: null };
    
    let prevLesson = null;
    let nextLesson = null;
    
    // Encontrar el índice del módulo actual
    const currentModuleIndex = modules.findIndex(m => m._id === activeModuleId);
    
    if (currentModuleIndex === -1) return { prevLesson: null, nextLesson: null };
    
    // Obtener todas las lecciones de este módulo
    const currentModuleLessons = modules[currentModuleIndex].lecciones || [];
    
    // Encontrar el índice de la lección actual en su módulo
    const currentLessonIndex = currentModuleLessons.findIndex(l => l._id === activeLessonId);
    
    if (currentLessonIndex === -1) return { prevLesson: null, nextLesson: null };
    
    // Verificar si hay una lección anterior en el mismo módulo
    if (currentLessonIndex > 0) {
      prevLesson = {
        moduleId: activeModuleId,
        lessonId: currentModuleLessons[currentLessonIndex - 1]._id
      };
    } 
    // Si no hay lección anterior en este módulo, buscar en el módulo anterior
    else if (currentModuleIndex > 0) {
      const prevModuleLessons = modules[currentModuleIndex - 1].lecciones || [];
      if (prevModuleLessons.length) {
        prevLesson = {
          moduleId: modules[currentModuleIndex - 1]._id,
          lessonId: prevModuleLessons[prevModuleLessons.length - 1]._id
        };
      }
    }
    
    // Verificar si hay una lección siguiente en el mismo módulo
    if (currentLessonIndex < currentModuleLessons.length - 1) {
      nextLesson = {
        moduleId: activeModuleId,
        lessonId: currentModuleLessons[currentLessonIndex + 1]._id
      };
    } 
    // Si no hay lección siguiente en este módulo, buscar en el módulo siguiente
    else if (currentModuleIndex < modules.length - 1) {
      const nextModuleLessons = modules[currentModuleIndex + 1].lecciones || [];
      if (nextModuleLessons.length) {
        nextLesson = {
          moduleId: modules[currentModuleIndex + 1]._id,
          lessonId: nextModuleLessons[0]._id
        };
      }
    }
    
    return { prevLesson, nextLesson };
  };
  
  const { prevLesson, nextLesson } = findAdjacentLessons();
  
  const navigateToPrevLesson = () => {
    if (prevLesson) {
      handleLessonSelect(prevLesson.moduleId, prevLesson.lessonId);
    }
  };
  
  const navigateToNextLesson = () => {
    if (nextLesson) {
      handleLessonSelect(nextLesson.moduleId, nextLesson.lessonId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {error || 'Curso no encontrado'}
        </div>
        <div className="mt-4">
          <Link 
            to="/student/dashboard" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Cabecera con título del curso */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="mr-4 text-gray-500 hover:text-gray-700"
              aria-label="Volver al dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">{course.titulo}</h1>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar/Contenido del curso */}
        <aside 
          className={`bg-gray-50 border-r border-gray-200 w-80 flex-shrink-0 overflow-y-auto transition-transform duration-300 transform 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
            fixed md:static inset-y-0 left-0 z-30 md:z-0 pt-16 md:pt-0`}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Contenido del curso</h2>
            
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module._id} className="border border-gray-200 rounded-md overflow-hidden">
                  <div 
                    className={`px-4 py-3 font-medium flex justify-between items-center cursor-pointer
                      ${activeModuleId === module._id ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800'}`}
                    onClick={() => setActiveModuleId(prev => prev === module._id ? '' : module._id)}
                  >
                    <span>{module.titulo}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${activeModuleId === module._id ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {activeModuleId === module._id && (
                    <div className="bg-gray-50 py-1">
                      {module.lecciones?.map((lesson) => (
                        <div 
                          key={lesson._id}
                          className={`px-4 py-2 flex items-center cursor-pointer 
                            ${activeLessonId === lesson._id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                          onClick={() => handleLessonSelect(module._id, lesson._id)}
                        >
                          {/* Indicador de completado */}
                          <div className="mr-2 flex-shrink-0">
                            {completedLessons.includes(lesson._id) ? (
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm truncate">{lesson.titulo}</span>
                          
                          {/* Mostrar duración si está disponible */}
                          {lesson.duracionMinutos && (
                            <span className="ml-auto text-xs text-gray-500">
                              {lesson.duracionMinutos} min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
          {currentLesson ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{currentLesson.titulo}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  {currentLesson.duracionMinutos && (
                    <span className="flex items-center mr-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {currentLesson.duracionMinutos} minutos
                    </span>
                  )}
                  <span className="capitalize">
                    Tipo: {currentLesson.tipo}
                  </span>
                </div>
              </div>
              
              {/* Contenido de la lección */}
              <div className="mb-8">
                {currentLesson.tipo === 'video' && currentLesson.videoUrl && (
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe 
                      src={typeof currentLesson.videoUrl === 'string' ? currentLesson.videoUrl : ''}
                      title={currentLesson.titulo}
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                )}
                
                {currentLesson.contenido && (
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: currentLesson.contenido }}
                  />
                )}
                
                {/* Recursos adicionales */}
                {currentLesson.recursosAdicionales && currentLesson.recursosAdicionales.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="font-bold text-lg mb-4">Recursos adicionales</h3>
                    <ul className="space-y-2">
                      {currentLesson.recursosAdicionales.map((recurso, index) => (
                        <li key={index}>
                          <a 
                            href={recurso.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            {/* Icono según el tipo de recurso */}
                            {recurso.tipo === 'pdf' && (
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                            {recurso.tipo === 'link' && (
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                            {recurso.titulo}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Navegación y botón de completar */}
              <div className="border-t border-gray-200 pt-6 flex justify-between">
                <button
                  className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${!prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={navigateToPrevLesson}
                  disabled={!prevLesson}
                >
                  Anterior
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md ${
                    completedLessons.includes(currentLesson._id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={markLessonComplete}
                >
                  {completedLessons.includes(currentLesson._id) ? 'Completado' : 'Marcar como completado'}
                </button>
                
                <button
                  className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${!nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={navigateToNextLesson}
                  disabled={!nextLesson}
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900">Selecciona una lección</h3>
              <p className="text-gray-600 max-w-sm mt-2">
                Elige una lección del menú lateral para comenzar tu aprendizaje.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentCourseView;