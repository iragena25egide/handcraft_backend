import { Router } from "express";
import { OrderController } from "../controller/OrderController";
import { verifyToken, optionalAuth, isSeller, isSuperAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderSchema } from "../validations";

const router = Router();
const orderController = new OrderController();

router.post("/", optionalAuth, validate(createOrderSchema), (req, res) =>
  orderController.createOrder(req, res)
);

router.get("/user/:userId", verifyToken, (req, res) =>
  orderController.getUserOrders(req, res)
);

router.get("/", verifyToken, isSeller, (req, res) =>
  orderController.getAllOrders(req, res)
);

router.put("/:id/status", verifyToken, isSeller, (req, res) =>
  orderController.updateOrderStatus(req, res)
);

router.delete("/:id", verifyToken, isSuperAdmin, (req, res) =>
  orderController.deleteOrder(req, res)
);

export default router;
