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
  url: "postgresql://postgres:LEMXNJrrXqFbFDLqwKnblHqoSTVwhjsO@tokaido.proxy.rlwy.net:12938/railway",
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  uuidExtension: "pgcrypto",
  logging: false,
  entities: [User, Product, Order, OrderItem, Notification],
  migrations: [],
  subscribers: [],
});
