// src/api/auth.ts
import apiClient from './client';

export interface User {
    id: string;
    nombre: string;
    username: string;
    email: string;
    rol: string;
    premium: boolean;
    avatarUrl?: string;
    biografia?: string;
    intereses?: string[];
    fechaRegistro: string;

}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    nombre: string;
    username: string;
    email: string;
    password: string;
    intereses?: string[];
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);

    // Guardar el token en localStorage
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', userData);

    // Guardar el token en localStorage
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};

export const getProfile = async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
};

export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/auth/profile', profileData);

    // Actualizar la información del usuario en localStorage
    if (response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            ...response.data.user
        }));
    }

    return response.data.user;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
};
//** agregado */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/password', { currentPassword, newPassword });
};
export const uploadAvatar = async (avatarFile: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await apiClient.post('/auth/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    return response.data;
};