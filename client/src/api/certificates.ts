// ruta: src/api/certificates.ts
import apiClient from './client';

export interface Certificate {
    _id: string;
    userId: string;
    courseId: string;
    courseTitle: string;
    userName: string;
    issueDate: string;
    verificationCode: string;
    downloadUrl?: string;
}

// Verificar elegibilidad para certificado
export const checkCertificateEligibility = async (courseId: string): Promise<{ isEligible: boolean; message: string }> => {
    try {
        // Añadir console.log para depuración
        console.log('Verificando elegibilidad para curso:', courseId);
        
        // Asegúrate de que esta URL coincida con tu configuración de rutas en el backend
        const response = await apiClient.get(`/api/certificates/eligibility/${courseId}`);
        
        console.log('Respuesta de elegibilidad:', response.data);
        
        // Adaptar la respuesta al formato que espera el frontend
        return {
            isEligible: response.data.eligible || false,
            message: response.data.message || 'No se pudo determinar la elegibilidad'
        };
    } catch (error) {
        console.error('Error al verificar elegibilidad:', error);
        
        // Añadir más información de depuración
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const err = error as import('axios').AxiosError;
            console.error('Detalles del error:', {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers,
                url: err.config?.url
            });
        }
        
        let errorMessage = 'Error al verificar elegibilidad para el certificado';
        if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error
        ) {
            const err = error as import('axios').AxiosError<{ message?: string }>;
            if (
                err.response &&
                typeof err.response.data === 'object' &&
                err.response.data !== null &&
                'message' in err.response.data
            ) {
                errorMessage = err.response.data.message || errorMessage;
            }
        }
        return {
            isEligible: false,
            message: errorMessage
        };
    }
};
// Generar certificado
export const generateCertificate = async (courseId: string): Promise<Certificate | null> => {
    try {
        console.log('Generando certificado para curso:', courseId);
        
        // Asegúrate de que esta URL coincida con tu configuración de rutas
        const response = await apiClient.post(`/api/certificates/generate/${courseId}`);
        
        console.log('Respuesta de generación:', response.data);
        
        if (response.data.success) {
            return {
                _id: response.data._id,
                userId: response.data.userId,
                courseId: response.data.courseId,
                courseTitle: response.data.courseTitle || '', // Ajusta según lo que devuelva tu backend
                userName: response.data.userName || '',
                issueDate: response.data.issueDate || new Date().toISOString(),
                verificationCode: response.data.verificationCode || '',
                downloadUrl: response.data.downloadUrl
            };
        }
        return null;
    } catch (error) {
        console.error('Error al generar certificado:', error);
        
        // Import AxiosError at the top of the file if not already imported
        // import { AxiosError } from 'axios';
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const err = error as import('axios').AxiosError;
            console.error('Detalles del error:', {
                status: err.response?.status,
                data: err.response?.data,
                url: err.config?.url
            });
        }
        
        return null;
    }
};

// Obtener certificados del usuario
export const getUserCertificates = async (): Promise<Certificate[]> => {
    try {
        const response = await apiClient.get(`/api/certificates/user`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener certificados:', error);
        return [];
    }
};

// Descargar certificado
export const downloadCertificate = async (certificateId: string): Promise<Blob | null> => {
    try {
        const response = await apiClient.get(`/api/certificates/${certificateId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error al descargar certificado:', error);
        return null;
    }
};

// Verificar certificado (ruta pública)
export const verifyCertificate = async (verificationCode: string): Promise<Certificate | null> => {
    try {
        const response = await apiClient.get(`/api/certificates/verify/${verificationCode}`);
        return response.data;
    } catch (error) {
        console.error('Error al verificar certificado:', error);
        return null;
    }
};
