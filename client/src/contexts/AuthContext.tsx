// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { getProfile, logout } from '../api/auth';

// Define la interfaz UserData si no está disponible en auth.ts
export interface UserData {
    id: string;
    nombre: string;
    username: string;
    email: string;
    rol: string;
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
    children: React.ReactNode;  // Cambiado a React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Verificar si hay un token almacenado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verificar si el token es válido obteniendo el perfil
                    const userData = await getProfile();
                    setUser(userData);
                } catch (err: unknown) {
                    console.error('Error al verificar autenticación:', err);
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An unknown error occurred');
                    }
                    // Si hay error, limpiar token inválido
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Función para cerrar sesión
    const handleLogout = () => {
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