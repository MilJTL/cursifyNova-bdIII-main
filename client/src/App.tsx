import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import PrivateRoute from './router/PrivateRoute';


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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            {/* Rutas públicas con PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
            </Route>

            {/* Rutas de estudiante (requieren autenticación) */}
            <Route element={<PrivateRoute />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/courses/:courseId" element={<StudentCourseView />} />
              <Route path="/student/progress/:courseId" element={<StudentProgress />} />
              {/* Ruta de perfil (accesible para todos los usuarios autenticados) */}
              <Route path="/profile" element={<UserProfile />} />
              {/* Rutas de instructor */}
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/courses/new" element={<CourseEditor />} />
              <Route path="/instructor/courses/:courseId/edit" element={<CourseEditor />} />
              <Route path="/instructor/courses/:courseId" element={<CourseManagement />} />
              <Route path="/instructor/courses/:courseId/analytics" element={<CourseAnalytics />} />
              <Route path="/instructor/courses/:courseId/students" element={<StudentManagement />} />
              
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;