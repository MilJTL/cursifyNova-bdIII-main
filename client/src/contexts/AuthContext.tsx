// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { getProfile, logout, checkServerAvailability } from '../api/auth';

// Define la interfaz UserData si no está disponible en auth.ts
export interface UserData {
    id: string;
    nombre: string;
    username: string;
    email: string;
    rol: 'usuario' | 'admin';
    premium?: boolean;
    intereses: string[];
    avatarUrl?: string;
    biografia?: string;
    fechaRegistro?: string;
}

interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    setUser: (user: UserData | null) => void;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    setUser: () => { },
    logout: () => { },
    clearError: () => { },
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Verificar si hay un token almacenado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            console.log('Verificando autenticación...');
            setIsLoading(true);

            try {
                // Primero verificar si el servidor está disponible
                const isServerAvailable = await checkServerAvailability();
                
                if (!isServerAvailable) {
                    console.warn('⚠️ Servidor no disponible, usando modo alternativo');
                    
                    // Si estamos en desarrollo, podemos usar un usuario simulado
                    if (import.meta.env.DEV){
                        console.log('Usando usuario simulado para desarrollo');
                        const mockUser: UserData = {
                            id: 'dev-user-id',
                            nombre: 'Usuario Desarrollo',
                            username: 'dev_user',
                            email: 'dev@example.com',
                            rol: 'admin', // Cambia según necesites probar
                            premium: true,
                            intereses: [],
                            avatarUrl: 'https://via.placeholder.com/150',
                            biografia: 'Usuario de desarrollo'
                        };
                        setUser(mockUser);
                    } else {
                        setError('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
                    }
                    
                    setIsLoading(false);
                    return;
                }

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        // Verificar si el token es válido obteniendo el perfil
                        console.log('Obteniendo perfil con token...');
                        const userData = await getProfile();
                        console.log('Perfil obtenido:', userData);
                        
                        // Asegurarse de que el rol sea válido
                        const transformedUserData: UserData = {
                            ...userData,
                            rol: userData.rol === 'usuario' || userData.rol === 'admin' ? userData.rol : 'usuario',
                        };
                        
                        setUser(transformedUserData);
                        setError(null);
                    } catch (err: unknown) {
                        console.error('Error al verificar autenticación:', err);
                        if (err instanceof Error) {
                            setError(err.message);
                        } else {
                            setError('Ocurrió un error desconocido');
                        }
                        // Si hay error, limpiar token inválido
                        localStorage.removeItem('token');
                    }
                }
            } catch (err: unknown) {
                console.error('Error general en checkAuth:', err);
                setError('Error al verificar la autenticación');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Función para cerrar sesión
    const handleLogout = () => {
        console.log('Cerrando sesión...');
        logout();
        setUser(null);
    };

    // Limpiar errores
    const clearError = () => setError(null);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        setUser,
        logout: handleLogout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;