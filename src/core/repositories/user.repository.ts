import { prisma } from "../data/prisma";
import { User, Product } from "../domain/entities";

export const UserRepository = {
  async getByEmail(email: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return dbUser as User | null;
  },

  async getById(id: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { id },
    });
    return dbUser as User | null;
  },

  async create(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    const dbUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: "USER",
      },
    });
    return dbUser as User;
  },

  async getWishlist(userId: string): Promise<Product[]> {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { variants: true },
        },
      },
    });
    return wishlists.map((w) => {
      const p = w.product;
      return {
        ...p,
        moodTags: p.moodTags ? p.moodTags.split(",") : [],
        topNotes: p.topNotes ? p.topNotes.split(",") : [],
        heartNotes: p.heartNotes ? p.heartNotes.split(",") : [],
        baseNotes: p.baseNotes ? p.baseNotes.split(",") : [],
      };
    }) as Product[];
  },

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
    });
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  },

  async getAllCustomers(): Promise<Omit<User, "passwordHash">[]> {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return users as Omit<User, "passwordHash">[];
  },

  async getCustomerDetail(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: { product: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      orders: user.orders,
      reviews: user.reviews,
    };
  },
};
