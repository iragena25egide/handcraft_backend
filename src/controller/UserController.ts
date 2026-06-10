import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      // Security: Prevent SUPER_ADMIN registration via API
      if (role === "SUPER_ADMIN") {
        return res.status(403).json({ message: "Cannot register as SUPER_ADMIN via API" });
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save user with role or default to BUYER
      const user = this.userRepository.create({ 
        name, 
        email, 
        password: hashedPassword, 
        role: role || "BUYER" 
      });
      await this.userRepository.save(user);

      // Create token with role included
      const token = jwt.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: "30d" });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create token with role included
      const token = jwt.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: "30d" });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  }
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden: Super Admin only" });
      }
      
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden: Super Admin only" });
      }

      const id = parseInt(req.params.id);
      const { role } = req.body;
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) return res.status(404).json({ message: "User not found" });

      user.role = role;
      const results = await this.userRepository.save(user);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error updating user role", error });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden: Super Admin only" });
      }

      const id = parseInt(req.params.id);
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) return res.status(404).json({ message: "User not found" });

      await this.userRepository.softDelete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
}
