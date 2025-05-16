// src/api/client.ts
import axios from 'axios';
import { API_URL, getAuthHeaders } from '../config/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
    (config) => {
        const headers = getAuthHeaders();
        if (headers.Authorization) {
            config.headers.Authorization = headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;


/*import axios from 'axios';
import { API_URL, getAuthHeaders } from '../config/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

// Interceptor para añadir headers de autorización
apiClient.interceptors.request.use(config => {
    const headers = getAuthHeaders();
    Object.entries(headers).forEach(([key, value]) => {
        config.headers?.set(key, value);
    });
    return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Redirigir al login cuando el token expira
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;*/