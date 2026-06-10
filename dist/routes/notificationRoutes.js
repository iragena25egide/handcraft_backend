"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NotificationController_1 = require("../controller/NotificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const controller = new NotificationController_1.NotificationController();
router.get("/", auth_1.verifyToken, controller.getNotifications.bind(controller));
router.put("/:id/read", auth_1.verifyToken, controller.markAsRead.bind(controller));
exports.default = router;
