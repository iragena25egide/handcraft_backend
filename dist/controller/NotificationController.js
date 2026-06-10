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
exports.NotificationController = void 0;
const data_source_1 = require("../data-source");
const Notification_1 = require("../entity/Notification");
const typeorm_1 = require("typeorm");
class NotificationController {
    constructor() {
        this.notificationRepository = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SELLER") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const whereClause = req.user.role === "SELLER" ? { userId: req.user.id } : { userId: (0, typeorm_1.IsNull)() };
                const notifications = yield this.notificationRepository.find({
                    where: whereClause,
                    order: { createdAt: "DESC" },
                    take: 50
                });
                res.json(notifications);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching notifications", error });
            }
        });
    }
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SELLER") {
                    return res.status(403).json({ message: "Forbidden" });
                }
                const id = parseInt(req.params.id);
                yield this.notificationRepository.update(id, { isRead: true });
                res.status(200).json({ message: "Marked as read" });
            }
            catch (error) {
                res.status(500).json({ message: "Error updating notification", error });
            }
        });
    }
}
exports.NotificationController = NotificationController;
