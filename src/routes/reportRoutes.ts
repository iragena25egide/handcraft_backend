import { Router } from "express";
import { ReportController } from "../controller/ReportController";
import { verifyToken, isSeller } from "../middleware/auth";

const router = Router();
const reportController = new ReportController();

router.get("/sales", verifyToken, isSeller, (req, res) =>
  reportController.getSalesRevenue(req as any, res)
);
router.get("/low-stock", verifyToken, isSeller, (req, res) =>
  reportController.getLowStockProducts(req as any, res)
);

router.get("/pdf", verifyToken, isSeller, (req, res) =>
  reportController.generatePdfReport(req as any, res)
);

export default router;
