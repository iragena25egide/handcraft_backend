import express from "express";
import { NotificationController } from "../controller/NotificationController";
import { verifyToken, isSeller } from "../middleware/auth";

const router = express.Router();
const controller = new NotificationController();

router.get("/", verifyToken, isSeller, controller.getNotifications.bind(controller));
router.put("/:id/read", verifyToken, isSeller, controller.markAsRead.bind(controller));

export default router;
