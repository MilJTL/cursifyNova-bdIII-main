import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Añadir esta importación
import type { User, RegisterData } from '../api/auth';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, getProfile } from '../api/auth';


interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    redirectAfterAuth: () => void; // Nueva función para redireccionar
    refreshUser: () => Promise<User | null>; // Nueva función para refrescar datos del usuario
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getCurrentUser());
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Hook para navegación

    const isAuthenticated = user !== null;

    useEffect(() => {
        // Verificar autenticación al cargar la aplicación
        const verifyAuth = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const userData = await getProfile();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                // Limpiar la sesión si hay error
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    // Función para redirigir según el rol del usuario
    const redirectAfterAuth = () => {
        if (!user) return;

        switch (user.rol) {
            case 'instructor':
                navigate('/instructor/dashboard');
                break;
            case 'admin':
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/student/dashboard');
                break;
        }
    };
    // Dentro de AuthProvider
    const refreshUser = async () => {
        try {
            const userProfile = await getProfile();
            setUser(userProfile);
            return userProfile;
        } catch (error) {
            console.error('Error al refrescar datos del usuario:', error);
            return null;
        }
    };

    /*
        const login = async (email: string, password: string) => {
            setIsLoading(true);
            try {
                const response = await apiLogin({ email, password });
                setUser(response.user);
                
                // Redirigir automáticamente después del login exitoso
                if (response.user) {
                    switch (response.user.rol) {
                        case 'instructor':
                            navigate('/instructor/dashboard');
                            break;
                        case 'admin':
                            navigate('/admin/dashboard');
                            break;
                        default:
                            navigate('/student/dashboard');
                            break;
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };*/
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await apiLogin({ email, password });
            setUser(response.user);

            // Redirigir basado en rol
            if (response.user) {
                switch (response.user.rol) {
                    case 'instructor':
                        navigate('/instructor/dashboard');
                        break;
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    default:
                        navigate('/student/dashboard');
                        break;
                }
            }
        } catch (error) {
            console.error('Error de login:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await apiRegister(userData);
            setUser(response.user);

            // Redirección después de registro exitoso
            if (response.user) {
                navigate('/student/dashboard'); // Los nuevos registros generalmente son estudiantes
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        // Redirigir al home después de cerrar sesión
        navigate('/');
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...userData } : null);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        redirectAfterAuth,// Exponer la nueva función
        refreshUser, // Exponer la función para refrescar datos del usuario
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};