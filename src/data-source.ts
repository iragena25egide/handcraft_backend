import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { Order } from "./entity/Order";
import { OrderItem } from "./entity/OrderItem";
import { Notification } from "./entity/Notification";
import { ProductRequest } from "./entity/ProductRequest";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Determine if connecting to localhost or remote
const isLocalhost =
  (databaseUrl &&
    (databaseUrl.includes("localhost") ||
      databaseUrl.includes("127.0.0.1"))) ||
  (!databaseUrl &&
    (!process.env.DB_HOST ||
      process.env.DB_HOST === "localhost" ||
      process.env.DB_HOST === "127.0.0.1"));

// Determine SSL settings
const sslConfig =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : process.env.DB_SSL === "false"
    ? false
    : isLocalhost
    ? false
    : { rejectUnauthorized: false };

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: "postgres",
        url: databaseUrl,
        ssl: sslConfig,
        synchronize: process.env.DB_SYNCHRONIZE !== "false",
        uuidExtension: "pgcrypto",
        logging: process.env.NODE_ENV === "development",
        entities: [User, Product, Order, OrderItem, Notification, ProductRequest],
        migrations: [],
        subscribers: [],
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "handcraft",
        ssl: sslConfig,
        synchronize: process.env.DB_SYNCHRONIZE !== "false",
        uuidExtension: "pgcrypto",
        logging: process.env.NODE_ENV === "development",
        entities: [User, Product, Order, OrderItem, Notification, ProductRequest],
        migrations: [],
        subscribers: [],
      }
);
