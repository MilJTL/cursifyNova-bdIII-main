// src/api/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Interfaces
export interface RegisterData {
    nombre: string;
    username: string;
    email: string;
    password: string;
    intereses?: string[];
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserData {
    id: string;
    nombre: string;
    username: string;
    email: string;
    rol: string;
    premium: boolean;
    intereses: string[];
    avatarUrl?: string;
    biografia?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: UserData;
}

// Instancia de axios con configuración común
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configurar interceptor para añadir token a las solicitudes
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Funciones para la API
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await authApi.post<AuthResponse>('/auth/register', userData);
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error al registrar usuario');
    }
};

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
    try {
        const response = await authApi.post<AuthResponse>('/auth/login', credentials);
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error al iniciar sesión');
    }
};

export const getProfile = async (): Promise<UserData> => {
    try {
        const response = await authApi.get<{ success: boolean; user: UserData }>('/auth/me');
        return response.data.user;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error al obtener perfil');
    }
};

export const updateProfile = async (profileData: Partial<UserData>): Promise<UserData> => {
    try {
        const response = await authApi.put<{ success: boolean; user: UserData }>('/auth/profile', profileData);
        return response.data.user;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error al actualizar perfil');
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
        await authApi.put('/auth/change-password', { currentPassword, newPassword });
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error al cambiar contraseña');
    }
};

export default {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    changePassword,
};