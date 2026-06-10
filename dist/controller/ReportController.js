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
exports.ReportController = void 0;
const data_source_1 = require("../data-source");
const Order_1 = require("../entity/Order");
const Product_1 = require("../entity/Product");
const OrderItem_1 = require("../entity/OrderItem");
const pdfkit_1 = __importDefault(require("pdfkit"));
class ReportController {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(Order_1.Order);
        this.productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
    }
    getSalesRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield this.orderRepository.find({ where: { status: "Processing" } });
                const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
                res.json({
                    totalOrders: orders.length,
                    totalRevenue: totalRevenue
                });
            }
            catch (error) {
                res.status(500).json({ message: "Error calculating revenue", error });
            }
        });
    }
    getLowStockProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find products with stock quantity less than 5
                const lowStockProducts = yield this.productRepository
                    .createQueryBuilder("product")
                    .where("product.stockQuantity < :threshold", { threshold: 5 })
                    .getMany();
                res.json(lowStockProducts);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching low stock products", error });
            }
        });
    }
    generatePdfReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SELLER")) {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const doc = new pdfkit_1.default({ margin: 50 });
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=report-${Date.now()}.pdf`);
                doc.pipe(res);
                doc.fontSize(20).text("Marketplace Report", { align: "center" });
                doc.moveDown();
                let totalIncome = 0;
                let totalStockIn = 0; // Current stock remaining
                let totalStockOut = 0; // Items sold
                const expenses = 0; // Defaulting to 0
                if (user.role === "SUPER_ADMIN") {
                    doc.fontSize(14).text("Role: SUPER ADMIN");
                    const products = yield this.productRepository.find();
                    products.forEach(p => {
                        totalStockIn += p.stockQuantity;
                    });
                    const orderItemRepository = data_source_1.AppDataSource.getRepository(OrderItem_1.OrderItem);
                    const items = yield orderItemRepository.find();
                    items.forEach(item => {
                        totalStockOut += item.quantity;
                        totalIncome += Number(item.priceAtPurchase) * item.quantity;
                    });
                }
                else {
                    doc.fontSize(14).text(`Role: SELLER (${user.name})`);
                    const products = yield this.productRepository.find({ where: { seller: { id: user.id } } });
                    const productIds = products.map(p => p.id);
                    products.forEach(p => {
                        totalStockIn += p.stockQuantity;
                    });
                    if (productIds.length > 0) {
                        const orderItemRepository = data_source_1.AppDataSource.getRepository(OrderItem_1.OrderItem);
                        const items = yield orderItemRepository.createQueryBuilder("item")
                            .leftJoinAndSelect("item.product", "product")
                            .where("product.id IN (:...ids)", { ids: productIds })
                            .getMany();
                        items.forEach(item => {
                            totalStockOut += item.quantity;
                            totalIncome += Number(item.priceAtPurchase) * item.quantity;
                        });
                    }
                }
                doc.moveDown();
                doc.fontSize(12).text(`Total Income: RWF ${totalIncome.toLocaleString()}`);
                doc.text(`Total Expenses: RWF ${expenses.toLocaleString()}`);
                doc.text(`Total Stock In (Remaining): ${totalStockIn}`);
                doc.text(`Total Stock Out (Sold): ${totalStockOut}`);
                doc.moveDown(2);
                doc.fontSize(10).fillColor("gray").text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
                doc.end();
            }
            catch (error) {
                if (!res.headersSent) {
                    res.status(500).json({ message: "Error generating report", error });
                }
            }
        });
    }
}
exports.ReportController = ReportController;
