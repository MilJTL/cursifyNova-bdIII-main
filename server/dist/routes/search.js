"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const controllerHandler_1 = require("../utils/controllerHandler");
const router = (0, express_1.Router)();
// Rutas de búsqueda (públicas)
router.get('/', (0, controllerHandler_1.asyncHandler)(searchController_1.searchGlobal));
router.get('/courses', (0, controllerHandler_1.asyncHandler)(searchController_1.searchCourses));
router.get('/modules', (0, controllerHandler_1.asyncHandler)(searchController_1.searchModules));
router.get('/lessons', (0, controllerHandler_1.asyncHandler)(searchController_1.searchLessons));
exports.default = router;
