"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUser = exports.validateResetPassword = exports.validateForgotPassword = exports.validateLogin = exports.validateRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRegister = (req, res, next) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        role: joi_1.default.string().optional(),
        profileImage: joi_1.default.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
const validateForgotPassword = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = (req, res, next) => {
    const schema = joi_1.default.object({
        password: joi_1.default.string().min(8).required(),
        token: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateResetPassword = validateResetPassword;
const validateUpdateUser = (req, res, next) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).optional(),
        email: joi_1.default.string().email().optional(),
        phone: joi_1.default.string().optional(),
        gender: joi_1.default.string().optional(),
        country: joi_1.default.string().optional(),
        nickName: joi_1.default.string().optional(),
        role: joi_1.default.forbidden(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateUpdateUser = validateUpdateUser;
