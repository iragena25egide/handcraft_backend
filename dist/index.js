"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("./data-source");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = process.env.PORT || 5000;
(0, socket_1.initSocket)(server);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// Serve uploaded files as static assets
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Backend is running!" });
});
app.use("/api/products", productRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/reports", reportRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connection established successfully!");
    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.error(`Port ${port} is already in use. Retrying in 1 second...`);
            setTimeout(() => {
                server.close();
                server.listen(port);
            }, 1000);
        }
        else {
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
