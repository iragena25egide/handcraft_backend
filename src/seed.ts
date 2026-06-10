import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Product } from "./entity/Product";
import { User, UserRole } from "./entity/User";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const sampleProducts = [
  {
    name: "Intore Dancer Wood Carving",
    category: "handicraft",
    price: 45,
    originalPrice: 60,
    rating: 4.9,
    artisan: "Jean Bosco",
    description:
      "Hand-carved mahogany wood sculpture depicting the traditional Intore warrior dance. Each piece takes over 40 hours to complete.",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80",
    stockQuantity: 25,
  },
  {
    name: "Modern Kitenge Jacket",
    category: "fashion",
    price: 85,
    rating: 4.8,
    artisan: "Kigali Designs",
    description:
      "Contemporary bomber jacket featuring vibrant, authentic Kitenge prints. Fully lined and perfect for any season.",
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80",
    stockQuantity: 15,
  },
  {
    name: "Woven Peace Basket",
    category: "handicraft",
    price: 35,
    originalPrice: 45,
    rating: 5.0,
    artisan: "Gahaya Links",
    description:
      "Traditional Agaseke basket woven from sweetgrass and sisal. A symbol of peace and hope in Rwandan culture.",
    image:
      "https://images.unsplash.com/photo-1588624103191-8735df1dd294?auto=format&fit=crop&q=80",
    stockQuantity: 50,
  },
  {
    name: "Imigongo Wall Art",
    category: "handicraft",
    price: 120,
    rating: 4.7,
    artisan: "Umutoni Arts",
    description:
      "Large traditional Imigongo art piece. Made using natural pigments and cow dung, featuring classic geometric patterns.",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80",
    stockQuantity: 5,
  },
  {
    name: "Leather Safari Bag",
    category: "fashion",
    price: 150,
    rating: 4.9,
    artisan: "Rwandan Leather Co.",
    description:
      "Premium handcrafted leather duffel bag. Durable, stylish, and made using locally sourced, ethically tanned leather.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80",
    stockQuantity: 8,
  },
  {
    name: "Banana Leaf Bowl",
    category: "handicraft",
    price: 25,
    rating: 4.6,
    artisan: "Nyamirambo Women's Center",
    description:
      "Eco-friendly decorative bowl woven tightly from dried banana leaves. Perfect for holding fruit or keys.",
    image:
      "https://images.unsplash.com/photo-1618219967677-1756fdf10668?auto=format&fit=crop&q=80",
    stockQuantity: 120,
  },
  {
    name: "Kitenge Wrap Dress",
    category: "fashion",
    price: 65,
    originalPrice: 80,
    rating: 4.8,
    artisan: "Moshions",
    description:
      "Elegant wrap dress designed to flatter all body types, featuring bold African prints and breathable cotton fabric.",
    image:
      "https://images.unsplash.com/photo-1550614000-4b95dd2449bb?auto=format&fit=crop&q=80",
    stockQuantity: 20,
  },
  {
    name: "Gorilla Silver Sculpt",
    category: "handicraft",
    price: 200,
    rating: 5.0,
    artisan: "Volcanoes Artisans",
    description:
      "Intricate silver sculpture of the majestic Rwandan Silverback Gorilla. A stunning centerpiece for any collection.",
    image:
      "https://images.unsplash.com/photo-1543850756-3ebae2f60d69?auto=format&fit=crop&q=80",
    stockQuantity: 3,
  },
];

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected for seeding...");

    const productRepository = AppDataSource.getRepository(Product);

    console.log(
      "Clearing existing products (optional, uncomment to enable)..."
    );

    let seededCount = 0;
    for (const item of sampleProducts) {
      const existingProduct = await productRepository.findOneBy({
        name: item.name,
      });
      if (!existingProduct) {
        const product = new Product();
        product.name = item.name;
        product.description = item.description;
        product.price = item.price;
        product.category = item.category;
        product.image = item.image;
        product.stockQuantity = item.stockQuantity;
        product.artisan = item.artisan;
        if (item.originalPrice) product.originalPrice = item.originalPrice;
        if (item.rating) product.rating = item.rating;

        await productRepository.save(product);
        console.log(`Seeded: ${product.name}`);
        seededCount++;
      } else {
        console.log(`Skipped (already exists): ${item.name}`);
      }
    }

    console.log(`\n Seeding complete! ${seededCount} new products added.`);

    // Seed Super Admin
    const userRepository = AppDataSource.getRepository(User);
    const adminEmail = "admin@handicraft.co.rw";
    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User();
      adminUser.name = "Super Admin";
      adminUser.email = adminEmail;
      adminUser.password = await bcrypt.hash("Admin@h2026", 10);
      adminUser.role = UserRole.SUPER_ADMIN;
      
      await userRepository.save(adminUser);
      console.log("Super Admin account seeded successfully!");
    } else {
      console.log("Super Admin account already exists.");
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during database seeding:", error);
    process.exit(1);
  });
