"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("./data-source");
const Product_1 = require("./entity/Product");
const User_1 = require("./entity/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
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
data_source_1.AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Database connected. Starting seed...");
    // Seed Products
    const productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
    let seededCount = 0;
    for (const item of sampleProducts) {
        const existingProduct = yield productRepository.findOneBy({
            name: item.name,
        });
        if (!existingProduct) {
            const product = new Product_1.Product();
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
            yield productRepository.save(product);
            console.log(`Seeded: ${product.name}`);
            seededCount++;
        }
        else {
            console.log(`Skipped (already exists): ${item.name}`);
        }
    }
    console.log(`\n Seeding complete! ${seededCount} new products added.`);
    // Seed Super Admin
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const adminEmail = "admin@handicraft.co.rw";
    const existingAdmin = yield userRepository.findOneBy({ email: adminEmail });
    if (!existingAdmin) {
        const adminUser = new User_1.User();
        adminUser.name = "Super Admin";
        adminUser.email = adminEmail;
        adminUser.password = yield bcryptjs_1.default.hash("Admin@h2026", 10);
        adminUser.role = User_1.UserRole.SUPER_ADMIN;
        yield userRepository.save(adminUser);
        console.log("Super Admin account seeded successfully!");
    }
    else {
        console.log("Super Admin account already exists.");
    }
    process.exit(0);
}))
    .catch((error) => {
    console.error("Error during database seeding:", error);
    process.exit(1);
});
