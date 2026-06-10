import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Order } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";
import { Product } from "../entity/Product";
import { Notification } from "../entity/Notification";
import { AuthRequest } from "../middleware/auth";
import { getIo } from "../socket";

export class OrderController {
  private orderRepository = AppDataSource.getRepository(Order);
  private notificationRepository = AppDataSource.getRepository(Notification);

  async createOrder(req: AuthRequest, res: Response) {
    // Start a transaction to ensure database integrity during stock decrement
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { items, guestName, guestPhone, guestEmail, shippingAddress, shippingCity, shippingZipCode } = req.body;
      const user = req.user;

      if (!user && (!guestName || !guestPhone)) {
        return res.status(400).json({ message: "Guest checkout requires name and phone number" });
      }

      let total = 0;
      const orderItemsToSave: OrderItem[] = [];
      const sellerIdsToNotify = new Set<number>();

      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, { 
          where: { id: item.productId },
          relations: ["seller"],
          lock: { mode: "pessimistic_write" } // Lock the row to prevent race conditions during checkout
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Decrement stock (Stock Out)
        product.stockQuantity -= item.quantity;
        await queryRunner.manager.save(product);

        // Calculate order total
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        // Create OrderItem
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItemsToSave.push(orderItem);

        if (product.seller) {
          sellerIdsToNotify.add(product.seller.id);
        }
      }

      // Create Order
      const order = new Order();
      if (user) {
        order.user = user;
      } else {
        order.guestName = guestName;
        order.guestPhone = guestPhone;
        order.guestEmail = guestEmail;
      }
      order.total = total;
      order.status = "Processing";
      order.items = orderItemsToSave;
      
      // Save shipping address
      if (shippingAddress) order.shippingAddress = shippingAddress;
      if (shippingCity) order.shippingCity = shippingCity;
      if (shippingZipCode) order.shippingZipCode = shippingZipCode;

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      // Save and emit realtime notifications
      try {
        const io = getIo();
        
        // Notify Super Admin
        const adminNotif = this.notificationRepository.create({
          title: "New Order Placed",
          message: `A new order (#${savedOrder.id}) was placed totaling $${savedOrder.total.toFixed(2)}`,
          userId: null // null means SUPER_ADMIN
        });
        await this.notificationRepository.save(adminNotif);
        io.to("room:admin").emit("new_order", { message: "A new order was placed!", orderId: savedOrder.id, total: savedOrder.total });
        
        // Notify specific Sellers
        for (const sellerId of Array.from(sellerIdsToNotify)) {
          const sellerNotif = this.notificationRepository.create({
            title: "Product Ordered",
            message: `One of your products was ordered! (Order #${savedOrder.id})`,
            userId: sellerId
          });
          await this.notificationRepository.save(sellerNotif);
          io.to(`room:seller_${sellerId}`).emit("new_order", { message: "One of your products was ordered!", orderId: savedOrder.id });
        }
      } catch (e) {
        console.error("Socket or Notification emit failed", e);
      }

      res.status(201).json(savedOrder);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      res.status(400).json({ message: error.message || "Error creating order" });
    } finally {
      await queryRunner.release();
    }
  }

  async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Ensure users can only fetch their own orders, unless Super Admin
      if (req.user?.id !== userId && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const orders = await this.orderRepository.find({
        where: { user: { id: userId } },
        relations: ["items", "items.product"],
        order: { createdAt: "DESC" }
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  }
  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SELLER") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      let query = this.orderRepository.createQueryBuilder("order")
        .leftJoinAndSelect("order.user", "user")
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .leftJoinAndSelect("product.seller", "seller")
        .orderBy("order.createdAt", "DESC");

      if (req.user.role === "SELLER") {
        query = query.where("seller.id = :sellerId", { sellerId: req.user.id });
      }

      const orders = await query.getMany();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching all orders", error });
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SELLER") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = req.params.id;
      const { status } = req.body;
      const order = await this.orderRepository.findOne({ where: { id } });
      
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = status;
      const results = await this.orderRepository.save(order);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error updating order", error });
    }
  }

  async deleteOrder(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SELLER") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = req.params.id;
      const order = await this.orderRepository.findOne({ where: { id } });
      
      if (!order) return res.status(404).json({ message: "Order not found" });

      await this.orderRepository.softDelete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting order", error });
    }
  }
}
