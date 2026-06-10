import "reflect-metadata";
import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { AppDataSource } from "./data-source";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import reportRoutes from "./routes/reportRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { initSocket } from "./socket";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

initSocket(server);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running!" });
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

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
  console.log("Unhandled Rejection:", err);
});
