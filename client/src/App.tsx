import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PrivateRoute from './components/layout/PrivateRoute';
import Navbar from './components/layout/Navbar';
import NotFound from './pages/NotFound';
import './App.css';

// Componentes temporales para desarrollo
const Dashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
    <p>Bienvenido a CursifyNova - Tu plataforma de aprendizaje en línea</p>
  </div>
);

const Courses = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Cursos disponibles</h1>
    <p>Aquí se mostrarán los cursos disponibles (en desarrollo)</p>
  </div>
);

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
              
              {/* Rutas protegidas */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses" element={<Courses />} />
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