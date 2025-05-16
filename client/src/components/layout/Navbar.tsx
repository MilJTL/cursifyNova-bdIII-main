import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
    // Obtenemos los datos de autenticación usando useAuth
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    
    // Estados separados para diferentes menús
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado local para debugging
    const [authState, setAuthState] = useState({
        isAuth: isAuthenticated,
        user: user
    });
    
    // Efecto para actualizar el estado local cuando cambian los datos de autenticación
    useEffect(() => {
        console.log('Navbar: Estado de autenticación actualizado', { isAuthenticated, user });
        setAuthState({
            isAuth: isAuthenticated,
            user: user
        });
    }, [isAuthenticated, user]);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false); // Cerrar el menú de usuario al cerrar sesión
        navigate('/login');
    };

    // Función mejorada para manejar la búsqueda
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Asegúrate de que haya un término de búsqueda válido
        if (searchTerm.trim()) {
            // Redirecciona a la página de cursos con el parámetro de búsqueda
            navigate(`/courses?q=${encodeURIComponent(searchTerm.trim())}`);
            
            // Cierra el menú móvil si está abierto
            if (mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        }
    };

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-blue-600 font-bold text-xl">
                                CursifyNova
                            </Link>
                        </div>

                        {/* Links de navegación principal - solo visible en desktop */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/courses"
                                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Cursos
                            </Link>
                            {authState.isAuth && (
                                <Link
                                    to="/dashboard"
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Mi Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="hidden md:flex items-center justify-center flex-1 px-2 lg:ml-6 lg:justify-end">
                        <div className="max-w-lg w-full lg:max-w-xs">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    name="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
                                    placeholder="Buscar cursos..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {/* Botón opcional de búsqueda (visible solo en pantallas pequeñas) */}
                                <button
                                    type="submit"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center md:hidden"
                                >
                                    <span className="sr-only">Buscar</span>
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Botones de acción - visibles en desktop */}
                    <div className="hidden md:flex items-center">
                        {!authState.isAuth ? (
                            <>
                                <Link
                                    to="/login"
                                    className="ml-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Registrarse
                                </Link>
                            </>
                        ) : (
                            <div className="ml-4 relative flex-shrink-0">
                                <div>
                                    <button
                                        type="button"
                                        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        id="user-menu"
                                        aria-expanded={userMenuOpen}
                                        aria-haspopup="true"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        <span className="sr-only">Abrir menú de usuario</span>
                                        {authState.user?.avatarUrl ? (
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src={authState.user.avatarUrl}
                                                alt={authState.user.nombre || "Usuario"}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/default-avatar.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                {authState.user?.nombre ? authState.user.nombre.charAt(0).toUpperCase() : "U"}
                                            </div>
                                        )}
                                    </button>
                                </div>
                                {userMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu"
                                    >
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>
                                        {(authState.user?.rol === "admin" || authState.user?.rol === "admin") && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                role="menuitem"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Gestionar Cursos
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botón de menú móvil */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Abrir menú principal</span>
                            {!mobileMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/courses"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Cursos
                        </Link>
                        {authState.isAuth && (
                            <Link
                                to="/dashboard"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Mi Panel
                            </Link>
                        )}
                    </div>

                    {/* Búsqueda en móvil */}
                    <div className="px-4 pb-3">
                        <form onSubmit={handleSearch}>
                            <input
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                placeholder="Buscar cursos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Acciones de usuario en móvil */}
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {authState.isAuth ? (
                            <>
                                <div className="flex items-center px-4">
                                    {authState.user?.avatarUrl ? (
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={authState.user.avatarUrl}
                                            alt={authState.user.nombre || "Usuario"}
                                            onError={(e) => {
                                                e.currentTarget.src = '/assets/default-avatar.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                            {authState.user?.nombre ? authState.user.nombre.charAt(0).toUpperCase() : "U"}
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{authState.user?.nombre}</div>
                                        <div className="text-sm font-medium text-gray-500">{authState.user?.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    {(authState.user?.rol === "instructor" || authState.user?.rol === "admin") && (
                                        <Link
                                            to="/instructor/courses"
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Gestionar Cursos
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-4 space-y-2">
                                <Link
                                    to="/login"
                                    className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;