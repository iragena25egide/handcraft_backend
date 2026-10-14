"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controller/UserController");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
router.post("/register", (0, validate_1.validate)(validations_1.registerSchema), (req, res) => userController.register(req, res));
router.post("/login", (0, validate_1.validate)(validations_1.loginSchema), (req, res) => userController.login(req, res));
router.get("/me", auth_1.verifyToken, (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const _a = req.user, { password } = _a, safeUser = __rest(_a, ["password"]);
    res.json(safeUser);
});
router.get("/", auth_1.verifyToken, auth_1.isSuperAdmin, (req, res) => userController.getAllUsers(req, res));
router.put("/:id/role", auth_1.verifyToken, auth_1.isSuperAdmin, (req, res) => userController.updateUserRole(req, res));
router.delete("/:id", auth_1.verifyToken, auth_1.isSuperAdmin, (req, res) => userController.deleteUser(req, res));
exports.default = router;
