import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Order } from "../entity/Order";
import { Product } from "../entity/Product";
import { OrderItem } from "../entity/OrderItem";
import { AuthRequest } from "../middleware/auth";
import PDFDocument from "pdfkit";

export class ReportController {
  private orderRepository = AppDataSource.getRepository(Order);
  private productRepository = AppDataSource.getRepository(Product);

  async getSalesRevenue(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(403).json({ message: "Forbidden" });

      if (user.role === "SELLER") {
        const orders = await this.orderRepository.find({ 
          where: { status: "Processing" },
          relations: ["items", "items.product", "items.product.seller"] 
        });
        
        let totalRevenue = 0;
        let totalOrders = 0;
        
        orders.forEach(order => {
          let hasSellerItem = false;
          order.items.forEach(item => {
            if (item.product?.seller?.id === user.id) {
              totalRevenue += Number(item.priceAtPurchase) * item.quantity;
              hasSellerItem = true;
            }
          });
          if (hasSellerItem) totalOrders++;
        });

        res.json({ totalOrders, totalRevenue });
      } else {
        const orders = await this.orderRepository.find({ where: { status: "Processing" } });
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        res.json({ totalOrders: orders.length, totalRevenue });
      }
    } catch (error) {
      res.status(500).json({ message: "Error calculating revenue", error });
    }
  }

  async getLowStockProducts(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(403).json({ message: "Forbidden" });

      let query = this.productRepository.createQueryBuilder("product")
        .where("product.stockQuantity < :threshold", { threshold: 5 });

      if (user.role === "SELLER") {
        query = query.leftJoin("product.seller", "seller")
                     .andWhere("seller.id = :sellerId", { sellerId: user.id });
      }

      const lowStockProducts = await query.getMany();
      res.json(lowStockProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching low stock products", error });
    }
  }

  async generatePdfReport(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SELLER")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=report-${Date.now()}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text("Marketplace Report", { align: "center" });
      doc.moveDown();

      let totalIncome = 0;
      let totalStockIn = 0; // Current stock remaining
      let totalStockOut = 0; // Items sold
      const expenses = 0; // Defaulting to 0

      if (user.role === "SUPER_ADMIN") {
        doc.fontSize(14).text("Role: SUPER ADMIN");
        const products = await this.productRepository.find();
        products.forEach(p => {
          totalStockIn += p.stockQuantity;
        });

        const orderItemRepository = AppDataSource.getRepository(OrderItem);
        const items = await orderItemRepository.find();
        items.forEach(item => {
          totalStockOut += item.quantity;
          totalIncome += Number(item.priceAtPurchase) * item.quantity;
        });
      } else {
        doc.fontSize(14).text(`Role: SELLER (${user.name})`);
        const products = await this.productRepository.find({ where: { seller: { id: user.id } } });
        const productIds = products.map(p => p.id);
        
        products.forEach(p => {
          totalStockIn += p.stockQuantity;
        });

        if (productIds.length > 0) {
          const orderItemRepository = AppDataSource.getRepository(OrderItem);
          const items = await orderItemRepository.createQueryBuilder("item")
            .leftJoinAndSelect("item.product", "product")
            .where("product.id IN (:...ids)", { ids: productIds })
            .getMany();

          items.forEach(item => {
            totalStockOut += item.quantity;
            totalIncome += Number(item.priceAtPurchase) * item.quantity;
          });
        }
      }

      doc.moveDown();
      doc.fontSize(12).text(`Total Income: RWF ${totalIncome.toLocaleString()}`);
      doc.text(`Total Expenses: RWF ${expenses.toLocaleString()}`);
      doc.text(`Total Stock In (Remaining): ${totalStockIn}`);
      doc.text(`Total Stock Out (Sold): ${totalStockOut}`);

      doc.moveDown(2);
      doc.fontSize(10).fillColor("gray").text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });

      doc.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Error generating report", error });
      }
    }
  }
}
