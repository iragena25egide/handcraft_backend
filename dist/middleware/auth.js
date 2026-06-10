"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isSeller = exports.optionalAuth = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            return res.status(401).json({ message: "Invalid token: user not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});
exports.verifyToken = verifyToken;
const optionalAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ id: decoded.id });
        if (user) {
            req.user = user;
        }
    }
    catch (error) { }
    next();
});
exports.optionalAuth = optionalAuth;
const isSeller = (req, res, next) => {
    if (req.user &&
        (req.user.role === User_1.UserRole.SELLER ||
            req.user.role === User_1.UserRole.SUPER_ADMIN)) {
        next();
    }
    else {
        res.status(403).json({ message: "Requires SELLER privileges" });
    }
};
exports.isSeller = isSeller;
const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === User_1.UserRole.SUPER_ADMIN) {
        next();
    }
    else {
        res.status(403).json({ message: "Requires SUPER_ADMIN privileges" });
    }
};
exports.isSuperAdmin = isSuperAdmin;
