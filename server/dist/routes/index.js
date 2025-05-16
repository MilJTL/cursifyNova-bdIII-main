"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
// src/routes/index.ts
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const courses_1 = __importDefault(require("./courses"));
const modules_1 = __importDefault(require("./modules"));
const lessons_1 = __importDefault(require("./lessons"));
const progress_1 = __importDefault(require("./progress"));
const search_1 = __importDefault(require("./search"));
const comments_1 = __importDefault(require("./comments"));
const certificates_1 = __importDefault(require("./certificates"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/courses', courses_1.default);
router.use('/modules', modules_1.default);
router.use('/lessons', lessons_1.default);
router.use('/progress', progress_1.default);
router.use('/search', search_1.default);
router.use('/comments', comments_1.default);
router.use('/certificates', certificates_1.default);
exports.default = router;
