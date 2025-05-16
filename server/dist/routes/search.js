"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController"); // Asegúrate de crear este controlador
const router = (0, express_1.Router)();
// Rutas de búsqueda (públicas)
router.get('/', searchController_1.searchGlobal);
router.get('/courses', searchController_1.searchCourses);
router.get('/modules', searchController_1.searchModules);
router.get('/lessons', searchController_1.searchLessons);
exports.default = router;
