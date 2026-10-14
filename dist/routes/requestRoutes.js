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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const ProductRequest_1 = require("../entity/ProductRequest");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all requests (Admin and Seller only)
router.get("/", auth_1.verifyToken, auth_1.isSeller, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestRepo = data_source_1.AppDataSource.getRepository(ProductRequest_1.ProductRequest);
        const requests = yield requestRepo.find({
            order: { createdAt: "DESC" },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch requests", error });
    }
}));
// POST new request (Public for customer inquiries)
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerName, customerPhone, customerEmail, productId, productName } = req.body;
        if (!customerName || !customerPhone) {
            return res.status(400).json({ message: "Name and phone are required" });
        }
        const requestRepo = data_source_1.AppDataSource.getRepository(ProductRequest_1.ProductRequest);
        const newRequest = requestRepo.create({
            customerName,
            customerPhone,
            customerEmail,
            productId: productId ? Number(productId) : undefined,
            productName,
        });
        const savedRequest = yield requestRepo.save(newRequest);
        res.status(201).json(savedRequest);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create request", error });
    }
}));
// PATCH update status (Admin and Seller only)
router.patch("/:id/status", auth_1.verifyToken, auth_1.isSeller, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const requestRepo = data_source_1.AppDataSource.getRepository(ProductRequest_1.ProductRequest);
        const productReq = yield requestRepo.findOneBy({ id });
        if (!productReq) {
            return res.status(404).json({ message: "Request not found" });
        }
        productReq.status = status;
        yield requestRepo.save(productReq);
        res.json(productReq);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update request status", error });
    }
}));
exports.default = router;
