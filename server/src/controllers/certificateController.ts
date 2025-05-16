// server/src/controllers/certificateController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import Progress from '../models/Progress';
import Certificate, { ICertificate } from '../models/Certificate';
import User from '../models/User';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import crypto from 'crypto';

// Verificar si el usuario puede recibir certificado
export const checkEligibility = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.userId;

        // Validar que el courseId sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                eligible: false,
                message: 'ID del curso inválido'
            });
        }

        // Verificar si el curso existe
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                eligible: false,
                message: 'Curso no encontrado'
            });
        }

        // Verificar matrícula del estudiante
        const progress = await Progress.findOne({
            userId,
            cursoId: courseId
        });

        if (!progress) {
            return res.status(403).json({
                eligible: false,
                message: 'No estás matriculado en este curso'
            });
        }

        // Verificar si ya tiene certificado
        const existingCertificate = await Certificate.findOne({
            userId,
            cursoId: courseId
        });

        if (existingCertificate) {
            return res.status(200).json({
                eligible: true,
                hasCertificate: true,
                certificateId: existingCertificate._id,
                message: 'Ya tienes un certificado para este curso',
                downloadUrl: existingCertificate.urlDescarga
            });
        }

        // Calcular progreso del curso
        const modules = await Module.find({ cursoId: courseId });
        if (!modules.length) {
            return res.status(400).json({
                eligible: false,
                message: 'El curso no tiene módulos disponibles'
            });
        }

        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ moduloId: { $in: moduleIds } });

        if (!lessons.length) {
            return res.status(400).json({
                eligible: false,
                message: 'El curso no tiene lecciones disponibles'
            });
        }

        // Calcular porcentaje de progreso
        const totalLessons = lessons.length;
        const completedLessons = progress.lessonesCompletadas?.length || 0;
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

        // Verificar si cumple el umbral (80% completado)
        const isEligible = progressPercentage >= 80;

        return res.status(200).json({
            eligible: isEligible,
            progress: progressPercentage,
            completedLessons,
            totalLessons,
            hasCertificate: false,
            message: isEligible
                ? 'Puedes obtener tu certificado'
                : `Necesitas completar al menos el 80% del curso (actualmente: ${progressPercentage}%)`
        });

    } catch (error) {
        console.error('Error al verificar elegibilidad:', error);
        return res.status(500).json({
            eligible: false,
            message: 'Error al verificar la elegibilidad para el certificado'
        });
    }
};

// Generar certificado
export const generateCertificate = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.userId;

        // Verificar elegibilidad
        const course = await Course.findById(courseId)
            .populate('instructor', 'nombre');
        const user = await User.findById(userId);

        if (!course || !user) {
            return res.status(404).json({
                success: false,
                message: 'Curso o usuario no encontrado'
            });
        }

        // Verificar progreso
        const progress = await Progress.findOne({ userId, cursoId: courseId });
        if (!progress) {
            return res.status(403).json({
                success: false,
                message: 'No estás matriculado en este curso'
            });
        }

        // Verificar si ya tiene certificado
        const existingCertificate = await Certificate.findOne({
            userId,
            cursoId: courseId
        });

        if (existingCertificate) {
            return res.status(200).json({
                success: true,
                message: 'Ya tienes un certificado para este curso',
                certificateId: existingCertificate._id,
                downloadUrl: existingCertificate.urlDescarga
            });
        }

        // Verificar progreso mínimo (80%)
        const modules = await Module.find({ cursoId: courseId });
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ moduloId: { $in: moduleIds } });

        const totalLessons = lessons.length;
        const completedLessons = progress.lessonesCompletadas?.length || 0;
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

        if (progressPercentage < 80) {
            return res.status(403).json({
                success: false,
                message: `Necesitas completar al menos el 80% del curso (actualmente: ${progressPercentage}%)`
            });
        }

        // Crear certificado
        const certificateDir = path.join(__dirname, '../../uploads/certificates');

        // Asegurar que el directorio existe
        if (!fs.existsSync(certificateDir)) {
            fs.mkdirSync(certificateDir, { recursive: true });
        }

        // Generar código de verificación único
        const verificationCode = crypto.randomBytes(16).toString('hex');

        // Crear el certificado en la base de datos primero
        const certificate = new Certificate({
            userId,
            cursoId: courseId,
            fechaEmision: new Date(),
            codigoVerificacion: verificationCode,
            urlDescarga: `/api/certificates/${verificationCode}/download` // URL relativa, se ajustará al descargar
        });

        await certificate.save();

        // Generar PDF del certificado
        const pdfPath = path.join(certificateDir, `${certificate._id}.pdf`);
        await generateCertificatePDF(certificate, course, user, pdfPath);

        return res.status(201).json({
            success: true,
            message: 'Certificado generado correctamente',
            certificateId: certificate._id,
            downloadUrl: certificate.urlDescarga
        });

    } catch (error) {
        console.error('Error al generar certificado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al generar el certificado'
        });
    }
};

// Descargar certificado
export const downloadCertificate = async (req: Request, res: Response) => {
    try {
        const { certificateId } = req.params;
        const userId = req.user?.userId;

        const certificate = await Certificate.findById(certificateId);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificado no encontrado'
            });
        }

        // Verificar propiedad del certificado
        if (certificate.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para acceder a este certificado'
            });
        }

        // Obtener el curso y usuario para el nombre del archivo
        const course = await Course.findById(certificate.cursoId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Información del curso no encontrada'
            });
        }

        // Ruta al archivo
        const pdfPath = path.join(__dirname, '../../uploads/certificates', `${certificate._id}.pdf`);

        // Verificar si existe
        if (!fs.existsSync(pdfPath)) {
            // Si no existe, regenerarlo
            const user = await User.findById(certificate.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Información del usuario no encontrada'
                });
            }

            await generateCertificatePDF(certificate, course, user, pdfPath);

            if (!fs.existsSync(pdfPath)) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al generar el certificado'
                });
            }
        }

        // Preparar para descarga
        const courseName = course.titulo.replace(/\s+/g, '-').toLowerCase();
        const fileName = `certificado-${courseName}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Enviar el archivo
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error al descargar certificado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al descargar el certificado'
        });
    }
};

// Verificar un certificado (ruta pública)
export const verifyCertificate = async (req: Request, res: Response) => {
    try {
        const { verificationCode } = req.params;

        const certificate = await Certificate.findOne({ codigoVerificacion: verificationCode })
            .populate('userId', 'nombre email')
            .populate('cursoId', 'titulo instructor');

        if (!certificate) {
            return res.status(404).json({
                valid: false,
                message: 'Certificado no encontrado o código de verificación inválido'
            });
        }

        // Obtener información del instructor
        let instructorName = 'Instructor';
        let studentName = '';
        let courseName = '';

        // Asegurarse de que userId y cursoId están poblados
        if (certificate.userId && typeof certificate.userId === 'object' && 'nombre' in certificate.userId) {
            studentName = (certificate.userId as any).nombre;
        } else {
            studentName = certificate.userId?.toString() || '';
        }

        if (certificate.cursoId && typeof certificate.cursoId === 'object' && 'titulo' in certificate.cursoId) {
            courseName = (certificate.cursoId as any).titulo;
        } else {
            courseName = certificate.cursoId?.toString() || '';
        }

        if (certificate.cursoId && typeof certificate.cursoId === 'object' && 'instructor' in certificate.cursoId) {
            const instructorId = (certificate.cursoId as any).instructor;
            const instructor = await User.findById(instructorId);
            if (instructor) {
                instructorName = instructor.nombre;
            }
        }

        return res.status(200).json({
            valid: true,
            certificate: {
                studentName,
                courseName,
                instructorName,
                issueDate: certificate.fechaEmision,
                verificationCode: certificate.codigoVerificacion
            }
        });

    } catch (error) {
        console.error('Error al verificar certificado:', error);
        return res.status(500).json({
            valid: false,
            message: 'Error al verificar el certificado'
        });
    }
};

// Obtener certificados del usuario
export const getUserCertificates = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const certificates = await Certificate.find({ userId })
            .populate('cursoId', 'titulo imagenPortada instructor')
            .sort({ fechaEmision: -1 });

        // Obtener información de los instructores
        const certificatesWithInstructors = await Promise.all(certificates.map(async (cert) => {
            const certObj = cert.toObject() as any;
            let instructorName = '';
            // Verifica si cursoId es un objeto y tiene la propiedad instructor
            if (certObj.cursoId && typeof certObj.cursoId === 'object' && 'instructor' in certObj.cursoId) {
                const instructorId = certObj.cursoId.instructor;
                const instructor = await User.findById(instructorId, 'nombre');
                if (instructor) {
                    instructorName = instructor.nombre;
                }
            }
            // Devuelve el objeto extendido con instructorName
            return { ...certObj, instructorName };
        }));

        return res.status(200).json(certificatesWithInstructors);

    } catch (error) {
        console.error('Error al obtener certificados del usuario:', error);
        return res.status(500).json({ message: 'Error al obtener los certificados' });
    }
};

// Función auxiliar para generar el PDF del certificado
const generateCertificatePDF = async (
    certificate: ICertificate,
    course: any,
    user: any,
    outputPath: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Crear stream para escribir a archivo
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Obtener el instructor 
            let instructorName = 'Instructor';
            if (course.instructor && course.instructor.nombre) {
                instructorName = course.instructor.nombre;
            }

            // Añadir contenido al certificado
            // Título
            doc.font('Helvetica-Bold')
                .fontSize(28)
                .fillColor('#333333')
                .text('CERTIFICADO DE FINALIZACIÓN', { align: 'center' });

            doc.moveDown(2);

            // Logo o imagen decorativa (si existe)
            // doc.image('path/to/logo.png', { width: 150, align: 'center' });

            // Contenido principal
            doc.font('Helvetica')
                .fontSize(16)
                .fillColor('#555555')
                .text('Este certificado acredita que:', { align: 'center' });

            doc.moveDown();

            doc.font('Helvetica-Bold')
                .fontSize(24)
                .fillColor('#000000')
                .text(user.nombre, { align: 'center' });

            doc.moveDown();

            doc.font('Helvetica')
                .fontSize(16)
                .fillColor('#555555')
                .text('ha completado exitosamente el curso:', { align: 'center' });

            doc.moveDown();

            doc.font('Helvetica-Bold')
                .fontSize(20)
                .fillColor('#3366cc')
                .text(course.titulo, { align: 'center' });

            doc.moveDown(2);

            // Detalles adicionales
            doc.font('Helvetica')
                .fontSize(14)
                .fillColor('#555555')
                .text(`Impartido por: ${instructorName}`, { align: 'center' });

            doc.moveDown();

            // Fecha de emisión
            const fechaFormateada = certificate.fechaEmision.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            doc.text(`Fecha de emisión: ${fechaFormateada}`, { align: 'center' });

            doc.moveDown(2);

            // Código de verificación
            doc.fontSize(10)
                .fillColor('#777777')
                .text(`Código de verificación: ${certificate.codigoVerificacion}`, { align: 'center' });

            doc.moveDown();

            doc.text(`Verificar en: ${process.env.FRONTEND_URL || 'https://cursifynova.com'}/verificar-certificado/${certificate.codigoVerificacion}`,
                { align: 'center' });

            // Finalizar el documento
            doc.end();

            // Manejar eventos de stream
            stream.on('finish', () => {
                resolve();
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};