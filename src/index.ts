import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import { AppDataSource } from "./data-source";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import reportRoutes from "./routes/reportRoutes";
import requestRoutes from "./routes/requestRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { initSocket } from "./socket";
import { uploadDir } from "./middleware/upload";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Initialize WebSockets
initSocket(server);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files as static assets reliably
app.use("/uploads", express.static(uploadDir));

// Root info
app.get("/", (_req: Request, res: Response) => {
  res.send("Handcraft API is running!");
});

// Health check with database status
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Handcraft API is healthy",
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/requests", requestRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global Server Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

console.log("=== STARTING BACKEND ===");
console.log(`Port configured: ${port}`);
console.log(`Static uploads folder: ${uploadDir}`);
console.log("========================");

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established successfully!");

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Retrying in 1 second...`);
        setTimeout(() => {
          server.close();
          server.listen(port);
        }, 1000);
      } else {
        console.error("Server error:", error);
      }
    });

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log("Database connection failed: ", error));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
