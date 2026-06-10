import express from "express";
import { NotificationController } from "../controller/NotificationController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();
const controller = new NotificationController();

router.get("/", verifyToken, controller.getNotifications.bind(controller));
router.put("/:id/read", verifyToken, controller.markAsRead.bind(controller));

export default router;
