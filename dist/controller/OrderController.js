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
exports.OrderController = void 0;
const data_source_1 = require("../data-source");
const Order_1 = require("../entity/Order");
const OrderItem_1 = require("../entity/OrderItem");
const Product_1 = require("../entity/Product");
const Notification_1 = require("../entity/Notification");
const socket_1 = require("../socket");
class OrderController {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(Order_1.Order);
        this.notificationRepository = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start a transaction to ensure database integrity during stock decrement
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const { items, guestName, guestPhone, guestEmail, shippingAddress, shippingCity, shippingZipCode } = req.body;
                const user = req.user;
                if (!user && (!guestName || !guestPhone)) {
                    return res.status(400).json({ message: "Guest checkout requires name and phone number" });
                }
                let total = 0;
                const orderItemsToSave = [];
                const sellerIdsToNotify = new Set();
                for (const item of items) {
                    const product = yield queryRunner.manager.findOne(Product_1.Product, {
                        where: { id: item.productId },
                        relations: ["seller"],
                        lock: { mode: "pessimistic_write" } // Lock the row to prevent race conditions during checkout
                    });
                    if (!product) {
                        throw new Error(`Product with ID ${item.productId} not found`);
                    }
                    if (product.stockQuantity < item.quantity) {
                        throw new Error(`Insufficient stock for product: ${product.name}`);
                    }
                    // Decrement stock (Stock Out)
                    product.stockQuantity -= item.quantity;
                    yield queryRunner.manager.save(product);
                    // Calculate order total
                    const itemTotal = product.price * item.quantity;
                    total += itemTotal;
                    // Create OrderItem
                    const orderItem = new OrderItem_1.OrderItem();
                    orderItem.product = product;
                    orderItem.quantity = item.quantity;
                    orderItem.priceAtPurchase = product.price;
                    orderItemsToSave.push(orderItem);
                    if (product.seller) {
                        sellerIdsToNotify.add(product.seller.id);
                    }
                }
                // Create Order
                const order = new Order_1.Order();
                if (user) {
                    order.user = user;
                }
                else {
                    order.guestName = guestName;
                    order.guestPhone = guestPhone;
                    order.guestEmail = guestEmail;
                }
                order.total = total;
                order.status = "Processing";
                order.items = orderItemsToSave;
                // Save shipping address
                if (shippingAddress)
                    order.shippingAddress = shippingAddress;
                if (shippingCity)
                    order.shippingCity = shippingCity;
                if (shippingZipCode)
                    order.shippingZipCode = shippingZipCode;
                const savedOrder = yield queryRunner.manager.save(Order_1.Order, order);
                yield queryRunner.commitTransaction();
                // Save and emit realtime notifications
                try {
                    const io = (0, socket_1.getIo)();
                    // Notify Super Admin
                    const adminNotif = this.notificationRepository.create({
                        title: "New Order Placed",
                        message: `A new order (#${savedOrder.id}) was placed totaling $${savedOrder.total.toFixed(2)}`,
                        userId: null // null means SUPER_ADMIN
                    });
                    yield this.notificationRepository.save(adminNotif);
                    io.to("room:admin").emit("new_order", { message: "A new order was placed!", orderId: savedOrder.id, total: savedOrder.total });
                    // Notify specific Sellers
                    for (const sellerId of Array.from(sellerIdsToNotify)) {
                        const sellerNotif = this.notificationRepository.create({
                            title: "Product Ordered",
                            message: `One of your products was ordered! (Order #${savedOrder.id})`,
                            userId: sellerId
                        });
                        yield this.notificationRepository.save(sellerNotif);
                        io.to(`room:seller_${sellerId}`).emit("new_order", { message: "One of your products was ordered!", orderId: savedOrder.id });
                    }
                }
                catch (e) {
                    console.error("Socket or Notification emit failed", e);
                }
                res.status(201).json(savedOrder);
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                res.status(400).json({ message: error.message || "Error creating order" });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    getUserOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = parseInt(req.params.userId);
                // Ensure users can only fetch their own orders, unless Super Admin
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SUPER_ADMIN") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const orders = yield this.orderRepository.find({
                    where: { user: { id: userId } },
                    relations: ["items", "items.product"],
                    order: { createdAt: "DESC" }
                });
                res.json(orders);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching orders", error });
            }
        });
    }
    getAllOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SELLER") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                let query = this.orderRepository.createQueryBuilder("order")
                    .leftJoinAndSelect("order.user", "user")
                    .leftJoinAndSelect("order.items", "items")
                    .leftJoinAndSelect("items.product", "product")
                    .leftJoinAndSelect("product.seller", "seller")
                    .orderBy("order.createdAt", "DESC");
                if (req.user.role === "SELLER") {
                    query = query.where("seller.id = :sellerId", { sellerId: req.user.id });
                }
                const orders = yield query.getMany();
                res.json(orders);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching all orders", error });
            }
        });
    }
    updateOrderStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SELLER") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const id = req.params.id;
                const { status } = req.body;
                const order = yield this.orderRepository.findOne({ where: { id } });
                if (!order)
                    return res.status(404).json({ message: "Order not found" });
                order.status = status;
                const results = yield this.orderRepository.save(order);
                res.json(results);
            }
            catch (error) {
                res.status(500).json({ message: "Error updating order", error });
            }
        });
    }
    deleteOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SELLER") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const id = req.params.id;
                const order = yield this.orderRepository.findOne({ where: { id } });
                if (!order)
                    return res.status(404).json({ message: "Order not found" });
                yield this.orderRepository.softDelete(id);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting order", error });
            }
        });
    }
}
exports.OrderController = OrderController;
