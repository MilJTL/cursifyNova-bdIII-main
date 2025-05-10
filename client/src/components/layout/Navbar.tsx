import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold">CursifyNova</Link>

                    <div className="hidden md:flex space-x-6 items-center">
                        <Link to="/" className="hover:text-blue-200">Inicio</Link>
                        <Link to="/courses" className="hover:text-blue-200">Cursos</Link>

                        {isAuthenticated ? (
                            <>
                                <div className="relative group">
                                    <button
                                        className="flex items-center hover:text-blue-200 focus:outline-none"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        <span className="mr-1">{user?.nombre}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-gray-800">
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Perfil
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-blue-200">Iniciar sesión</Link>
                                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-300">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Menú móvil */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-16 right-0 left-0 bg-blue-500 p-4 z-10">
                                <div className="flex flex-col space-y-3">
                                    <Link to="/" className="hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
                                    <Link to="/courses" className="hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>Cursos</Link>

                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/profile" className="hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>Perfil</Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="text-left hover:text-blue-200"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>Iniciar sesión</Link>
                                            <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 text-center" onClick={() => setIsMenuOpen(false)}>
                                                Registrarse
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;