export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "USER" | "ADMIN";
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // "30ml", "50ml", "100ml"
  price: number;
  stockLevel: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  perfumer: string;
  originCountry: string;
  fragranceFamily: string; // Woody, Floral, Fresh, Oriental
  intensity: number; // 1 to 5
  moodTags: string[]; // Parsed from comma-separated string
  topNotes: string[]; // Parsed from comma-separated string
  heartNotes: string[]; // Parsed from comma-separated string
  baseNotes: string[]; // Parsed from comma-separated string
  themeColor: string;
  imageMain: string;
  imageAlt1?: string | null;
  imageAlt2?: string | null;
  active: boolean;
  limited: boolean;
  createdAt: Date;
  updatedAt: Date;
  variants?: ProductVariant[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  price: number;
  productName: string;
  productSize: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  email: string;
  name: string;
  status: "placed" | "confirmed" | "shipped" | "delivered";
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: "standard" | "express";
  shippingCost: number;
  couponCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minThreshold: number;
  usageLimit?: number | null;
  usageCount: number;
  expiryDate?: Date | null;
  active: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: Date;
}
