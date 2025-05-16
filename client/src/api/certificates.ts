import axios from 'axios';
import { API_URL } from '../config/api';

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
        const response = await axios.get(
            `${API_URL}/certificates/courses/${courseId}/eligibility`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error al verificar elegibilidad:', error);
        return {
            isEligible: false,
            message: 'Error al verificar elegibilidad para el certificado'
        };
    }
};

// Generar certificado
export const generateCertificate = async (courseId: string): Promise<Certificate | null> => {
    try {
        const response = await axios.post(
            `${API_URL}/certificates/courses/${courseId}/generate`,
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error al generar certificado:', error);
        return null;
    }
};

// Obtener certificados del usuario
export const getUserCertificates = async (): Promise<Certificate[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/certificates/user`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener certificados:', error);
        return [];
    }
};

// Descargar certificado
export const downloadCertificate = async (certificateId: string): Promise<Blob | null> => {
    try {
        const response = await axios.get(
            `${API_URL}/certificates/${certificateId}/download`,
            {
                withCredentials: true,
                responseType: 'blob'
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al descargar certificado:', error);
        return null;
    }
};

// Verificar certificado (ruta pública)
export const verifyCertificate = async (verificationCode: string): Promise<Certificate | null> => {
    try {
        const response = await axios.get(`${API_URL}/certificates/verify/${verificationCode}`);
        return response.data;
    } catch (error) {
        console.error('Error al verificar certificado:', error);
        return null;
    }
};