import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";

export interface AuthRequest extends Request {
  user?: User;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: "Invalid token: user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });
    if (user) {
      req.user = user;
    }
  } catch (error) {}
  next();
};

export const isSeller = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (
    req.user &&
    (req.user.role === UserRole.SELLER ||
      req.user.role === UserRole.SUPER_ADMIN)
  ) {
    next();
  } else {
    res.status(403).json({ message: "Requires SELLER privileges" });
  }
};

export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === UserRole.SUPER_ADMIN) {
    next();
  } else {
    res.status(403).json({ message: "Requires SUPER_ADMIN privileges" });
  }
};
