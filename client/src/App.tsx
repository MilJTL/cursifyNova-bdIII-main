import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import PrivateRoute from './router/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

// Páginas de estudiante
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourseView from './pages/student/StudentCourseView';
import StudentProgress from './pages/student/StudentProgress';
import UserProfile from './pages/student/UserProfile';

// Páginas de instructor/admin
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseManagement from './pages/instructor/CourseManagement';
import CourseEditor from './pages/instructor/EditCourse';
import CourseAnalytics from './pages/instructor/CourseAnalytics';
import StudentManagement from './pages/instructor/StudentManagement';

// Importaciones directas en lugar de lazy loading
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import NotFound from './pages/public/NotFound';

// Componente para redireccionar según el rol
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.rol) {
    case 'instructor':
      return <Navigate to="/instructor/dashboard" />;
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/student/dashboard" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            {/* Ruta base para redirigir según el rol */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
            {/* Rutas públicas con PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
            </Route>

            {/* Rutas protegidas (requieren autenticación) */}
            <Route element={<PrivateRoute />}>
              {/* Perfil de usuario (accesible para todos los usuarios) */}
              <Route path="/profile" element={<UserProfile />} />
              
              {/* Rutas de estudiante */}
              <Route path="/student">
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses/:courseId" element={<StudentCourseView />} />
                <Route path="progress/:courseId" element={<StudentProgress />} />
              </Route>
              
              {/* Rutas de instructor */}
              <Route path="/admin"> 
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="courses/new" element={<CourseEditor />} />
                <Route path="courses/:courseId/edit" element={<CourseEditor />} />
                <Route path="courses/:courseId" element={<CourseManagement />} />
                <Route path="courses/:courseId/analytics" element={<CourseAnalytics />} />
                <Route path="courses/:courseId/students" element={<StudentManagement />} />
              </Route>
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;