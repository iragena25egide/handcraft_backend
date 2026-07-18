import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validations";
import { verifyToken, AuthRequest } from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.post("/register", validate(registerSchema), (req, res) =>
  userController.register(req, res),
);
router.post("/login", validate(loginSchema), (req, res) =>
  userController.login(req, res),
);

router.get("/me", verifyToken, (req: AuthRequest, res) => {
  res.json(req.user);
});

router.get("/", verifyToken, (req: AuthRequest, res) =>
  userController.getAllUsers(req, res),
);
router.put("/:id/role", verifyToken, (req: AuthRequest, res) =>
  userController.updateUserRole(req, res),
);
router.delete("/:id", verifyToken, (req: AuthRequest, res) =>
  userController.deleteUser(req, res),
);

export default router;
