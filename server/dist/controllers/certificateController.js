"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCertificates = exports.verifyCertificate = exports.generateCertificate = void 0;
const Certificate_1 = __importDefault(require("../models/Certificate"));
const Progress_1 = __importDefault(require("../models/Progress"));
const User_1 = __importDefault(require("../models/User"));
// Generar un certificado cuando el usuario completa un curso
const generateCertificate = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const cursoId = req.params.cursoId;
        // Verificar si el usuario ha completado el curso
        const progress = await Progress_1.default.findOne({ userId, cursoId });
        if (!progress || progress.porcentajeCompletado < 100) {
            return res.status(403).json({
                success: false,
                message: 'No puedes obtener un certificado hasta completar el curso'
            });
        }
        // Verificar si ya existe un certificado
        let certificate = await Certificate_1.default.findOne({ userId, cursoId });
        if (certificate) {
            return res.status(200).json({
                success: true,
                message: 'El certificado ya existe',
                data: certificate
            });
        }
        // Generar un código de verificación único
        const codigoVerificacion = `${userId}-${cursoId}-${Date.now()}`;
        // Generar la URL de descarga (esto sería implementado con una biblioteca para generar PDF)
        const baseUrl = process.env.APP_URL || 'http://localhost:5000';
        const urlDescarga = `${baseUrl}/api/certificates/download/${codigoVerificacion}`;
        // Crear el certificado
        certificate = await Certificate_1.default.create({
            userId,
            cursoId,
            fechaEmision: new Date(),
            urlDescarga,
            codigoVerificacion
        });
        // Actualizar el usuario para añadir el certificado
        await User_1.default.findByIdAndUpdate(userId, {
            $addToSet: { certificados: certificate._id }
        });
        res.status(201).json({
            success: true,
            data: certificate
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al generar el certificado'
        });
    }
};
exports.generateCertificate = generateCertificate;
// Verificar un certificado por su código
const verifyCertificate = async (req, res) => {
    try {
        const codigo = req.params.codigo;
        const certificate = await Certificate_1.default.findOne({ codigoVerificacion: codigo })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al verificar el certificado'
        });
    }
};
exports.verifyCertificate = verifyCertificate;
// Obtener todos los certificados de un usuario
const getUserCertificates = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const certificates = await Certificate_1.default.find({ userId })
            .populate('cursoId', 'titulo imagenCurso')
            .sort({ fechaEmision: -1 });
        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los certificados'
        });
    }
};
exports.getUserCertificates = getUserCertificates;
