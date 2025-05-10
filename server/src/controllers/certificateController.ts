import { Request, Response } from 'express';
import Certificate from '../models/Certificate';
import Progress from '../models/Progress';
import Course from '../models/Course';
import User from '../models/User';

// Generar un certificado cuando el usuario completa un curso
export const generateCertificate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const cursoId = req.params.cursoId;

        // Verificar si el usuario ha completado el curso
        const progress = await Progress.findOne({ userId, cursoId });
        if (!progress || progress.porcentajeCompletado < 100) {
            return res.status(403).json({
                success: false,
                message: 'No puedes obtener un certificado hasta completar el curso'
            });
        }

        // Verificar si ya existe un certificado
        let certificate = await Certificate.findOne({ userId, cursoId });

        if (certificate) {
            return res.status(200).json({
                success: true,
                message: 'El certificado ya existe',
                data: certificate
            });
        }

        // Generar la URL de descarga (esto sería implementado con una biblioteca para generar PDF)
        const baseUrl = process.env.APP_URL || 'http://localhost:5000';
        const urlDescarga = `${baseUrl}/api/certificates/download/${certificate?.codigoVerificacion}`;

        // Crear el certificado
        certificate = await Certificate.create({
            userId,
            cursoId,
            fechaEmision: new Date(),
            urlDescarga
        });

        // Actualizar el usuario para añadir el certificado
        await User.findByIdAndUpdate(userId, {
            $addToSet: { certificados: certificate._id }
        });

        res.status(201).json({
            success: true,
            data: certificate
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al generar el certificado'
        });
    }
};

// Verificar un certificado por su código
export const verifyCertificate = async (req: Request, res: Response) => {
    try {
        const codigo = req.params.codigo;

        const certificate = await Certificate.findOne({ codigoVerificacion: codigo })
            .populate('userId', 'nombre username')
            .populate('cursoId', 'titulo');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificado no encontrado o inválido'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                usuario: certificate.userId,
                curso: certificate.cursoId,
                fechaEmision: certificate.fechaEmision,
                codigo: certificate.codigoVerificacion,
                valido: true
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al verificar el certificado'
        });
    }
};

// Obtener todos los certificados de un usuario
export const getUserCertificates = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const certificates = await Certificate.find({ userId })
            .populate('cursoId', 'titulo imagenCurso')
            .sort({ fechaEmision: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los certificados'
        });
    }
};