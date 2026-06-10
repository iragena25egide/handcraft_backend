import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { Notification } from "../entity/Notification";
import { AuthRequest } from "../middleware/auth";
import { getIo } from "../socket";

export class ProductController {
  private productRepository = AppDataSource.getRepository(Product);
  private notificationRepository = AppDataSource.getRepository(Notification);

  async getAllProducts(req: Request, res: Response) {
    try {
      const { filter, status } = req.query;
      let query = this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.seller", "seller")
        .orderBy("product.createdAt", "DESC");

      if (status === "trash") {
        query = query.withDeleted().andWhere("product.deletedAt IS NOT NULL");
      } else if (status === "all") {
        query = query.withDeleted();
      }

      if (filter === "sale") {
        query = query.andWhere("product.originalPrice > 0");
      } else if (filter === "new") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.andWhere("product.createdAt >= :date", { date: thirtyDaysAgo });
      }

      const products = await query.getMany();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error });
    }
  }

  async getTrashedProducts(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const products = await this.productRepository
        .createQueryBuilder("product")
        .withDeleted()
        .where("product.deletedAt IS NOT NULL")
        .leftJoinAndSelect("product.seller", "seller")
        .getMany();
        
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trashed products", error });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productRepository.findOne({ where: { id }, relations: ["seller"] });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product", error });
    }
  }

  async createProduct(req: AuthRequest, res: Response) {
    try {
      // The user is attached by the verifyToken middleware
      let seller = req.user;
      
      if (!seller) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (seller.role === "SUPER_ADMIN" && req.body.sellerId) {
        seller = { id: parseInt(req.body.sellerId) } as any;
      }

      const productData = { ...req.body, seller };
      
      if (req.files && Array.isArray(req.files)) {
        productData.images = req.files.map((file: any) => {
          return file.path && file.path.startsWith("http") 
            ? file.path 
            : `/uploads/${file.filename}`;
        });
        if (productData.images.length > 0) {
          productData.image = productData.images[0]; // Set first image as main
        }
      }

      if (productData.price) productData.price = parseFloat(productData.price);
      if (productData.originalPrice) productData.originalPrice = parseFloat(productData.originalPrice);
      if (productData.stockQuantity) productData.stockQuantity = parseInt(productData.stockQuantity, 10);
      const product = this.productRepository.create(productData);
      const results = await this.productRepository.save(product);

      if (req.user?.role === "SELLER") {
        try {
          const notification = this.notificationRepository.create({
            title: "New Product Added",
            message: `Seller ${req.user.name} added a new product: ${productData.name}`
          });
          await this.notificationRepository.save(notification);

          getIo().to("room:admin").emit("notification", {
            title: notification.title,
            message: notification.message
          });
        } catch (e) {
          console.error("Socket error", e);
        }
      }

      res.status(201).json(results);
    } catch (error) {
      res.status(500).json({ message: "Error creating product", error });
    }
  }

  async getSellerProducts(req: AuthRequest, res: Response) {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const { status } = req.query;
      
      if (req.user?.id !== sellerId && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      let query = this.productRepository.createQueryBuilder("product")
        .leftJoinAndSelect("product.seller", "seller")
        .where("seller.id = :sellerId", { sellerId })
        .orderBy("product.createdAt", "DESC");

      if (status === "trash") {
        query = query.withDeleted().andWhere("product.deletedAt IS NOT NULL");
      } else if (status === "all") {
        query = query.withDeleted();
      }

      const products = await query.getMany();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seller products", error });
    }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productRepository.findOne({ where: { id }, relations: ["seller"] });
      
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.seller?.id !== req.user?.id && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData = { ...req.body };
      
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // If files are uploaded, append to or replace existing images
        const newImages = req.files.map((file: any) => {
          return file.path && file.path.startsWith("http") 
            ? file.path 
            : `/uploads/${file.filename}`;
        });
        // We'll replace them completely for simplicity here, but you could append
        updateData.images = newImages;
        if (updateData.images.length > 0) {
          updateData.image = updateData.images[0];
        }
      }

      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
      if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity, 10);
      
      if (req.user?.role === "SUPER_ADMIN" && updateData.sellerId) {
        updateData.seller = { id: parseInt(updateData.sellerId) } as any;
      }

      this.productRepository.merge(product, updateData);
      const results = await this.productRepository.save(product);

      if (req.user?.role === "SELLER") {
        try {
          const notification = this.notificationRepository.create({
            title: "Product Updated",
            message: `Seller ${req.user.name} updated product: ${product.name}`
          });
          await this.notificationRepository.save(notification);

          getIo().to("room:admin").emit("notification", {
            title: notification.title,
            message: notification.message
          });
        } catch (e) {
          console.error("Socket error", e);
        }
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error });
    }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productRepository.findOne({ where: { id }, relations: ["seller"] });
      
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.seller?.id !== req.user?.id && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      await this.productRepository.softDelete(id);

      if (req.user?.role === "SELLER") {
        try {
          const notification = this.notificationRepository.create({
            title: "Product Deleted",
            message: `Seller ${req.user.name} moved product to trash: ${product.name}`
          });
          await this.notificationRepository.save(notification);

          getIo().to("room:admin").emit("notification", {
            title: notification.title,
            message: notification.message
          });
        } catch (e) {
          console.error("Socket error", e);
        }
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
    }
  }

  async restoreProduct(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productRepository.findOne({ 
        where: { id }, 
        relations: ["seller"],
        withDeleted: true
      });
      
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.seller?.id !== req.user?.id && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      await this.productRepository.restore(id);
      res.status(200).json({ message: "Product restored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error restoring product", error });
    }
  }
}
