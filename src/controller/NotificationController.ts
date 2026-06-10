import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { AuthRequest } from "../middleware/auth";
import { IsNull } from "typeorm";

export class NotificationController {
  private notificationRepository = AppDataSource.getRepository(Notification);

  async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SELLER") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const whereClause = req.user.role === "SELLER" ? { userId: req.user.id } : { userId: IsNull() };

      const notifications = await this.notificationRepository.find({
        where: whereClause,
        order: { createdAt: "DESC" },
        take: 50
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications", error });
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SELLER") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = parseInt(req.params.id);
      await this.notificationRepository.update(id, { isRead: true });
      res.status(200).json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating notification", error });
    }
  }
}
