"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moduleController_1 = require("../controllers/moduleController");
const auth_1 = require("../middlewares/auth");
const controllerHandler_1 = require("../utils/controllerHandler");
const router = (0, express_1.Router)();
// Rutas públicas o con autenticación básica
router.get('/', (0, controllerHandler_1.asyncHandler)(moduleController_1.getModulesByCourse));
router.get('/:id', (0, controllerHandler_1.asyncHandler)(moduleController_1.getModuleById));
// Rutas que requieren autenticación y roles específicos
router.post('/', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(moduleController_1.createModule));
router.put('/:id', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(moduleController_1.updateModule));
router.delete('/:id', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(moduleController_1.deleteModule));
router.post('/reorder', auth_1.authenticate, (0, controllerHandler_1.asyncHandler)(moduleController_1.reorderModules));
exports.default = router;
