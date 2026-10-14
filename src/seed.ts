import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Product } from "./entity/Product";
import { User, UserRole } from "./entity/User";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const sampleProducts = [
  {
    name: "Ibitenge w'Abagore",
    price: 85000,
    originalPrice: 100000,
    category: "imyenda",
    image: "image/2.jpeg",
    description: "Umushanana mwiza wa Kinyarwanda uboshywe neza kandi ubereye ibirori gakondo.",
    artisan: "Kigali Fashion Designers",
    rating: 4.9,
    stockQuantity: 20
  },
  {
    name: "Agaseke",
    price: 35000,
    category: "imyenda",
    image: "image/4.jpeg",
    description: "Ijipo ikozwe mu gitambaro cya Kitenge gifite amabara meza kandi kiramba.",
    artisan: "Mama Rwanda Styles",
    rating: 4.7,
    stockQuantity: 15
  },
  {
    name: "Ishati ya Kitenge y'Abagabo",
    price: 40000,
    category: "imyenda",
    image: "image/boss.jpeg",
    description: "Ishati nziza y'abagabo ikozwe muri Kitenge igezweho kandi yoroshye.",
    artisan: "Kigali Men Wear",
    rating: 4.8,
    stockQuantity: 30
  },
  {
    name: "Ikoti rya Kitenge",
    price: 75000,
    category: "imyenda",
    image: "image/gentle.jpeg",
    description: "Ikoti rigezweho rihuza umuco nyarwanda n'imyambarire ya moderne.",
    artisan: "Urban Rwanda Fashion",
    rating: 4.9,
    stockQuantity: 10
  },
  {
    name: "Inkweto z'Imigongo",
    price: 30000,
    category: "imyenda",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    description: "Inkweto nziza zifite imitako y'Imigongo ikorwa n'abanyabugeni b'u Rwanda.",
    artisan: "Rwanda Handmade Shoes",
    rating: 4.6,
    stockQuantity: 25
  },
  {
    name: "Agaseke Hand Bag",
    price: 45000,
    category: "imyenda",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
    description: "Isakoshi nziza ikozwe mu buryo bwa Agaseke gakondo k'u Rwanda.",
    artisan: "Agaseke Collections",
    rating: 4.8,
    stockQuantity: 18
  },
  {
    name: "Igitambaro cya Kinyarwanda",
    price: 18000,
    category: "imyenda",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600",
    description: "Igitambaro cyoroshye kandi cyiza gifite ibirango by'umuco nyarwanda.",
    artisan: "Nyanza Fashion Hub",
    rating: 4.7,
    stockQuantity: 50
  },
  {
    name: "Umukufi w'Amasaro",
    price: 15000,
    category: "imyenda",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
    description: "Umukufi w'amasaro meza akoze mu buryo bwa gakondo nyarwanda.",
    artisan: "Kigali Beads",
    rating: 4.8,
    stockQuantity: 100
  },
  {
    name: "Agaseke k'Amahoro",
    price: 25000,
    originalPrice: 32000,
    category: "ibyo mubukwe",
    image: "image/4.jpeg",
    description: "Agaseke gakondo gakozwe n'intoki, ikimenyetso cy'amahoro n'ubumwe.",
    artisan: "Abanyabukorikori b'i Huye",
    rating: 5.0,
    stockQuantity: 40
  },
  {
    name: "Igishushanyo cy'Imigongo",
    price: 60000,
    category: "imitako",
    image: "image/imigongo.jpeg",
    description: "Ubukorikori bw'Imigongo bukozwe mu buryo gakondo bw'u Rwanda.",
    artisan: "Imigongo Artists Rwanda",
    rating: 4.9,
    stockQuantity: 5
  },
  {
    name: "Ingoma Nyarwanda",
    price: 95000,
    category: "imitako",
    image: "image/ingoma.jpeg",
    description: "Ingoma nziza ikoreshwa mu mbyino n'umuco nyarwanda.",
    artisan: "Cultural Drums Rwanda",
    rating: 5.0,
    stockQuantity: 8
  },
  {
    name: "Agacuma k'Amata",
    price: 28000,
    category: "ibyo murugo",
    image: "image/akebo.jpeg",
    description: "Agacuma gakondo gakoreshwaga mu kubikamo amata mu Rwanda rwo hambere.",
    artisan: "Nyanza Heritage Crafts",
    rating: 4.7,
    stockQuantity: 12
  },
  {
    name: "Ikibindi cy'Ibikoresho",
    price: 22000,
    category: "ibyo murugo",
    image: "image/igisabo.jpeg",
    description: "Ikibindi cyiza gikozwe mu mibereshi n'imigwegwe gakondo.",
    artisan: "Rwanda Basket Makers",
    rating: 4.6,
    stockQuantity: 20
  },
  {
    name: "Akabindi k'Ikawa",
    price: 35000,
    category: "ibyo murugo",
    image: "image/3.jpeg",
    description: "Akabindi gakozwe mu ibumba kabugenewe gutekesha ikawa nyarwanda.",
    artisan: "Gisenyi Pottery",
    rating: 4.8,
    stockQuantity: 15
  },
  {
    name: "Igikoresho cy'Umuziki Inanga",
    price: 120000,
    category: "imitako",
    image: "image/ingoma.jpeg",
    description: "Inanga gakondo y'u Rwanda ikozwe mu giti cyiza kandi iramba.",
    artisan: "Rwanda Music Crafts",
    rating: 5.0,
    stockQuantity: 3
  },
  {
    name: "Icyibo cy'Amasaro",
    price: 30000,
    category: "imitako",
    image: "image/akebo.jpeg",
    description: "Icyibo cyiza cyubakishijwe amasaro n'imigwegwe gakondo.",
    artisan: "Kigali Women Cooperative",
    rating: 4.8,
    stockQuantity: 25
  },
  {
    name: "Ifoto y'Inyambo",
    price: 50000,
    category: "imitako",
    image: "image/inyambo.jpeg",
    description: "Igishushanyo cy'Inyambo, inka z'umuco nyarwanda.",
    artisan: "Royal Arts Rwanda",
    rating: 4.9,
    stockQuantity: 10
  },
  {
    name: "Agatadowa k'Icyuma",
    price: 18000,
    category: "ibyo murugo",
    image: "image/imigongo.jpeg",
    description: "Agatadowa gakondo gakoreshwa mu kumurika mu nzu.",
    artisan: "Royal Arts Rwanda",
    rating: 4.9,
    stockQuantity: 35
  }
];

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected. Starting seed...");

    // Seed Products
    const productRepository = AppDataSource.getRepository(Product);
    let seededCount = 0;

    for (const item of sampleProducts) {
      const existingProduct = await productRepository.findOneBy({
        name: item.name,
      });

      if (!existingProduct) {
        const product = new Product();
        product.name = item.name;
        product.category = item.category;
        product.price = item.price;
        if (item.originalPrice) {
          product.originalPrice = item.originalPrice;
        }
        product.rating = item.rating || 0;
        product.artisan = item.artisan;
        product.description = item.description;
        product.image = item.image;
        product.stockQuantity = item.stockQuantity || 10;
        product.images = [item.image];

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
