import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validations";
import { verifyToken, isSuperAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.post("/register", validate(registerSchema), (req, res) =>
  userController.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) =>
  userController.login(req, res)
);

router.get("/me", verifyToken, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { password, ...safeUser } = req.user as any;
  res.json(safeUser);
});

router.get("/", verifyToken, isSuperAdmin, (req: AuthRequest, res) =>
  userController.getAllUsers(req, res)
);
router.put("/:id/role", verifyToken, isSuperAdmin, (req: AuthRequest, res) =>
  userController.updateUserRole(req, res)
);
router.delete("/:id", verifyToken, isSuperAdmin, (req: AuthRequest, res) =>
  userController.deleteUser(req, res)
);

export default router;
