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
exports.UserController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role } = req.body;
                // Security: Prevent SUPER_ADMIN registration via API
                if (role === "SUPER_ADMIN") {
                    return res.status(403).json({ message: "Cannot register as SUPER_ADMIN via API" });
                }
                // Check if user already exists
                const existingUser = yield this.userRepository.findOneBy({ email });
                if (existingUser) {
                    return res.status(400).json({ message: "User already exists with this email" });
                }
                // Hash password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                // Save user with role or default to BUYER
                const user = this.userRepository.create({
                    name,
                    email,
                    password: hashedPassword,
                    role: role || "BUYER"
                });
                yield this.userRepository.save(user);
                // Create token with role included
                const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: "30d" });
                res.status(201).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Error registering user", error });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Find user
                const user = yield this.userRepository.findOneBy({ email });
                if (!user) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }
                // Check password
                const isMatch = yield bcryptjs_1.default.compare(password, user.password || "");
                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }
                // Create token with role included
                const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: "30d" });
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Error logging in", error });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
                    return res.status(403).json({ message: "Forbidden: Super Admin only" });
                }
                const users = yield this.userRepository.find();
                res.json(users);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching users", error });
            }
        });
    }
    updateUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
                    return res.status(403).json({ message: "Forbidden: Super Admin only" });
                }
                const id = parseInt(req.params.id);
                const { role } = req.body;
                const user = yield this.userRepository.findOne({ where: { id } });
                if (!user)
                    return res.status(404).json({ message: "User not found" });
                user.role = role;
                const results = yield this.userRepository.save(user);
                res.json(results);
            }
            catch (error) {
                res.status(500).json({ message: "Error updating user role", error });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
                    return res.status(403).json({ message: "Forbidden: Super Admin only" });
                }
                const id = parseInt(req.params.id);
                const user = yield this.userRepository.findOne({ where: { id } });
                if (!user)
                    return res.status(404).json({ message: "User not found" });
                yield this.userRepository.softDelete(id);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting user", error });
            }
        });
    }
}
exports.UserController = UserController;
