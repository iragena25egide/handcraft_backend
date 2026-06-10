import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("BUYER", "SELLER", "SUPER_ADMIN").optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional(),
  artisan: Joi.string().required(),
  image: Joi.string().allow("").optional(),
  category: Joi.string().required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  sellerId: Joi.string().allow("").optional(),
  images: Joi.any().optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  originalPrice: Joi.number().min(0).optional(),
  artisan: Joi.string().optional(),
  image: Joi.string().allow("").optional(),
  category: Joi.string().optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  sellerId: Joi.string().allow("").optional(),
  images: Joi.any().optional()
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  guestName: Joi.string().optional(),
  guestPhone: Joi.string().optional(),
  guestEmail: Joi.string().email().optional(),
  shippingAddress: Joi.string().optional(),
  shippingCity: Joi.string().optional(),
  shippingZipCode: Joi.string().optional()
});
