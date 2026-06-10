"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);
        socket.on("authenticate", (token) => {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.role === "SUPER_ADMIN") {
                    socket.join("room:admin");
                    console.log(`Socket ${socket.id} joined room:admin`);
                    io.to("room:admin").emit("active_staff", { message: `Super Admin ${decoded.id} is online` });
                }
                else if (decoded.role === "SELLER") {
                    socket.join(`room:seller_${decoded.id}`);
                    console.log(`Socket ${socket.id} joined room:seller_${decoded.id}`);
                    io.to("room:admin").emit("active_staff", { message: `Seller ${decoded.id} is online` });
                }
                socket.emit("authenticated", { success: true });
            }
            catch (error) {
                socket.emit("authenticated", {
                    success: false,
                    message: "Invalid token",
                });
            }
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIo = getIo;
