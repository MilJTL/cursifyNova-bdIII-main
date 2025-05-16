"use strict";
// server/src/controllers/certificateController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCertificates = exports.verifyCertificate = exports.downloadCertificate = exports.generateCertificate = exports.checkEligibility = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Course_1 = __importDefault(require("../models/Course"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Progress_1 = __importDefault(require("../models/Progress"));
const Certificate_1 = __importDefault(require("../models/Certificate"));
const User_1 = __importDefault(require("../models/User"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const crypto_1 = __importDefault(require("crypto"));
// Verificar si el usuario puede recibir certificado
const checkEligibility = async (req, res) => {
    var _a, _b;
    try {
        const { courseId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Validar que el courseId sea un ObjectId válido
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                eligible: false,
                message: 'ID del curso inválido'
            });
        }
        // Verificar si el curso existe
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({
                eligible: false,
                message: 'Curso no encontrado'
            });
        }
        // Verificar matrícula del estudiante
        const progress = await Progress_1.default.findOne({
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
        const existingCertificate = await Certificate_1.default.findOne({
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
        const modules = await Module_1.default.find({ cursoId: courseId });
        if (!modules.length) {
            return res.status(400).json({
                eligible: false,
                message: 'El curso no tiene módulos disponibles'
            });
        }
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson_1.default.find({ moduloId: { $in: moduleIds } });
        if (!lessons.length) {
            return res.status(400).json({
                eligible: false,
                message: 'El curso no tiene lecciones disponibles'
            });
        }
        // Calcular porcentaje de progreso
        const totalLessons = lessons.length;
        const completedLessons = ((_b = progress.lessonesCompletadas) === null || _b === void 0 ? void 0 : _b.length) || 0;
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
    }
    catch (error) {
        console.error('Error al verificar elegibilidad:', error);
        return res.status(500).json({
            eligible: false,
            message: 'Error al verificar la elegibilidad para el certificado'
        });
    }
};
exports.checkEligibility = checkEligibility;
// Generar certificado
const generateCertificate = async (req, res) => {
    var _a, _b;
    try {
        const { courseId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verificar elegibilidad
        const course = await Course_1.default.findById(courseId)
            .populate('instructor', 'nombre');
        const user = await User_1.default.findById(userId);
        if (!course || !user) {
            return res.status(404).json({
                success: false,
                message: 'Curso o usuario no encontrado'
            });
        }
        // Verificar progreso
        const progress = await Progress_1.default.findOne({ userId, cursoId: courseId });
        if (!progress) {
            return res.status(403).json({
                success: false,
                message: 'No estás matriculado en este curso'
            });
        }
        // Verificar si ya tiene certificado
        const existingCertificate = await Certificate_1.default.findOne({
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
        const modules = await Module_1.default.find({ cursoId: courseId });
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson_1.default.find({ moduloId: { $in: moduleIds } });
        const totalLessons = lessons.length;
        const completedLessons = ((_b = progress.lessonesCompletadas) === null || _b === void 0 ? void 0 : _b.length) || 0;
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        if (progressPercentage < 80) {
            return res.status(403).json({
                success: false,
                message: `Necesitas completar al menos el 80% del curso (actualmente: ${progressPercentage}%)`
            });
        }
        // Crear certificado
        const certificateDir = path_1.default.join(__dirname, '../../uploads/certificates');
        // Asegurar que el directorio existe
        if (!fs_1.default.existsSync(certificateDir)) {
            fs_1.default.mkdirSync(certificateDir, { recursive: true });
        }
        // Generar código de verificación único
        const verificationCode = crypto_1.default.randomBytes(16).toString('hex');
        // Crear el certificado en la base de datos primero
        const certificate = new Certificate_1.default({
            userId,
            cursoId: courseId,
            fechaEmision: new Date(),
            codigoVerificacion: verificationCode,
            urlDescarga: `/api/certificates/${verificationCode}/download` // URL relativa, se ajustará al descargar
        });
        await certificate.save();
        // Generar PDF del certificado
        const pdfPath = path_1.default.join(certificateDir, `${certificate._id}.pdf`);
        await generateCertificatePDF(certificate, course, user, pdfPath);
        return res.status(201).json({
            success: true,
            message: 'Certificado generado correctamente',
            certificateId: certificate._id,
            downloadUrl: certificate.urlDescarga
        });
    }
    catch (error) {
        console.error('Error al generar certificado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al generar el certificado'
        });
    }
};
exports.generateCertificate = generateCertificate;
// Descargar certificado
const downloadCertificate = async (req, res) => {
    var _a;
    try {
        const { certificateId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const certificate = await Certificate_1.default.findById(certificateId);
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
        const course = await Course_1.default.findById(certificate.cursoId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Información del curso no encontrada'
            });
        }
        // Ruta al archivo
        const pdfPath = path_1.default.join(__dirname, '../../uploads/certificates', `${certificate._id}.pdf`);
        // Verificar si existe
        if (!fs_1.default.existsSync(pdfPath)) {
            // Si no existe, regenerarlo
            const user = await User_1.default.findById(certificate.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Información del usuario no encontrada'
                });
            }
            await generateCertificatePDF(certificate, course, user, pdfPath);
            if (!fs_1.default.existsSync(pdfPath)) {
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
        const fileStream = fs_1.default.createReadStream(pdfPath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('Error al descargar certificado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al descargar el certificado'
        });
    }
};
exports.downloadCertificate = downloadCertificate;
// Verificar un certificado (ruta pública)
const verifyCertificate = async (req, res) => {
    var _a, _b;
    try {
        const { verificationCode } = req.params;
        const certificate = await Certificate_1.default.findOne({ codigoVerificacion: verificationCode })
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
            studentName = certificate.userId.nombre;
        }
        else {
            studentName = ((_a = certificate.userId) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        }
        if (certificate.cursoId && typeof certificate.cursoId === 'object' && 'titulo' in certificate.cursoId) {
            courseName = certificate.cursoId.titulo;
        }
        else {
            courseName = ((_b = certificate.cursoId) === null || _b === void 0 ? void 0 : _b.toString()) || '';
        }
        if (certificate.cursoId && typeof certificate.cursoId === 'object' && 'instructor' in certificate.cursoId) {
            const instructorId = certificate.cursoId.instructor;
            const instructor = await User_1.default.findById(instructorId);
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
    }
    catch (error) {
        console.error('Error al verificar certificado:', error);
        return res.status(500).json({
            valid: false,
            message: 'Error al verificar el certificado'
        });
    }
};
exports.verifyCertificate = verifyCertificate;
// Obtener certificados del usuario
const getUserCertificates = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const certificates = await Certificate_1.default.find({ userId })
            .populate('cursoId', 'titulo imagenPortada instructor')
            .sort({ fechaEmision: -1 });
        // Obtener información de los instructores
        const certificatesWithInstructors = await Promise.all(certificates.map(async (cert) => {
            const certObj = cert.toObject();
            let instructorName = '';
            // Verifica si cursoId es un objeto y tiene la propiedad instructor
            if (certObj.cursoId && typeof certObj.cursoId === 'object' && 'instructor' in certObj.cursoId) {
                const instructorId = certObj.cursoId.instructor;
                const instructor = await User_1.default.findById(instructorId, 'nombre');
                if (instructor) {
                    instructorName = instructor.nombre;
                }
            }
            // Devuelve el objeto extendido con instructorName
            return { ...certObj, instructorName };
        }));
        return res.status(200).json(certificatesWithInstructors);
    }
    catch (error) {
        console.error('Error al obtener certificados del usuario:', error);
        return res.status(500).json({ message: 'Error al obtener los certificados' });
    }
};
exports.getUserCertificates = getUserCertificates;
// Función auxiliar para generar el PDF del certificado
const generateCertificatePDF = async (certificate, course, user, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            // Crear stream para escribir a archivo
            const stream = fs_1.default.createWriteStream(outputPath);
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
            doc.text(`Verificar en: ${process.env.FRONTEND_URL || 'https://cursifynova.com'}/verificar-certificado/${certificate.codigoVerificacion}`, { align: 'center' });
            // Finalizar el documento
            doc.end();
            // Manejar eventos de stream
            stream.on('finish', () => {
                resolve();
            });
            stream.on('error', (err) => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
