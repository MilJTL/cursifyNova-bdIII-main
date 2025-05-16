"use strict";
// server/src/routes/certificates.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const certificateController = __importStar(require("../controllers/certificateController"));
const controllerHandler_1 = require("../utils/controllerHandler");
const router = express_1.default.Router();
// Verificar si el usuario puede recibir certificado
router.get('/courses/:courseId/eligibility', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(certificateController.checkEligibility));
// Generar certificado
router.post('/courses/:courseId/generate', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(certificateController.generateCertificate));
// Descargar certificado
router.get('/:certificateId/download', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(certificateController.downloadCertificate));
// Verificar un certificado (ruta pública)
router.get('/verify/:verificationCode', (0, controllerHandler_1.asyncHandler)(certificateController.verifyCertificate));
// Obtener certificados del usuario
router.get('/user', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(certificateController.getUserCertificates));
exports.default = router;
