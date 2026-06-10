"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.updateProductSchema = exports.createProductSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().valid("BUYER", "SELLER", "SUPER_ADMIN").optional()
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.createProductSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().min(0).required(),
    originalPrice: joi_1.default.number().min(0).optional(),
    artisan: joi_1.default.string().required(),
    image: joi_1.default.string().allow("").optional(),
    category: joi_1.default.string().required(),
    stockQuantity: joi_1.default.number().integer().min(0).required(),
    sellerId: joi_1.default.string().allow("").optional(),
    images: joi_1.default.any().optional()
});
exports.updateProductSchema = joi_1.default.object({
    name: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    price: joi_1.default.number().min(0).optional(),
    originalPrice: joi_1.default.number().min(0).optional(),
    artisan: joi_1.default.string().optional(),
    image: joi_1.default.string().allow("").optional(),
    category: joi_1.default.string().optional(),
    stockQuantity: joi_1.default.number().integer().min(0).optional(),
    sellerId: joi_1.default.string().allow("").optional(),
    images: joi_1.default.any().optional()
});
exports.createOrderSchema = joi_1.default.object({
    items: joi_1.default.array().items(joi_1.default.object({
        productId: joi_1.default.number().required(),
        quantity: joi_1.default.number().integer().min(1).required()
    })).min(1).required(),
    guestName: joi_1.default.string().optional(),
    guestPhone: joi_1.default.string().optional(),
    guestEmail: joi_1.default.string().email().optional(),
    shippingAddress: joi_1.default.string().optional(),
    shippingCity: joi_1.default.string().optional(),
    shippingZipCode: joi_1.default.string().optional()
});
