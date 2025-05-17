// src/config/api.ts

//import axios from 'axios';

// Reemplaza esto:
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Con esto:
//export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
/*
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);*/

//export default api;

//ruta client/src/config/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};