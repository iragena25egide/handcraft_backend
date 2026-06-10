import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_me_in_prod";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    socket.on("authenticate", (token: string) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: number;
          role: string;
        };

        if (decoded.role === "SUPER_ADMIN") {
          socket.join("room:admin");
          console.log(`Socket ${socket.id} joined room:admin`);
          io.to("room:admin").emit("active_staff", { message: `Super Admin ${decoded.id} is online` });
        } else if (decoded.role === "SELLER") {
          socket.join(`room:seller_${decoded.id}`);
          console.log(`Socket ${socket.id} joined room:seller_${decoded.id}`);
          io.to("room:admin").emit("active_staff", { message: `Seller ${decoded.id} is online` });
        }

        socket.emit("authenticated", { success: true });
      } catch (error) {
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

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
