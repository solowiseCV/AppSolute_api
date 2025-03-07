"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userTask_controller_1 = require("../controllers/userTask.controller");
const router = (0, express_1.Router)();
router.post("/answer/:userId", userTask_controller_1.answerTaskHandler);
exports.default = router;
