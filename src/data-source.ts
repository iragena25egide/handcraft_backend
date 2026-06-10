import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { Order } from "./entity/Order";
import { OrderItem } from "./entity/OrderItem";
import { Notification } from "./entity/Notification";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "handcraft",
  synchronize: true,
  uuidExtension: "pgcrypto",
  logging: false,
  entities: [User, Product, Order, OrderItem, Notification],
  migrations: [],
  subscribers: [],
});
