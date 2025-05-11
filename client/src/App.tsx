import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonView';
import Dashboard from './pages/Dashboard';
import AdminRoute from './components/layout/AdminRoute';
import PrivateRoute from './components/layout/PrivateRoute';
import Navbar from './components/layout/Navbar';
import NotFound from './pages/NotFound';
import './App.css';
import CourseManagement from './pages/admin/CourseManagement';
import CreateCourse from './pages/admin/CreateCourse';
import EditCourse from './pages/admin/EditCourse';
import ManageCourseContent from './pages/admin/ManageCourseContent';
import CourseAnalytics from './pages/admin/CourseAnalytics';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />

              {/* Rutas protegidas (cualquier usuario autenticado) */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
              </Route>

              {/* Rutas solo para instructores/admin */}
              <Route element={<AdminRoute />}>
                <Route path="/instructor/courses" element={<CourseManagement />} />
                <Route path="/instructor/courses/new" element={<CreateCourse />} />
                <Route path="/instructor/courses/:id/edit" element={<EditCourse />} />
                <Route path="/instructor/courses/:id/content" element={<ManageCourseContent />} />
                <Route path="/instructor/courses/:id/analytics" element={<CourseAnalytics />} />
              </Route>

              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="bg-gray-100 py-4 text-center">
            <div className="container mx-auto">
              <p>© {new Date().getFullYear()} CursifyNova. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;