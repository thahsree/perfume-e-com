import { prisma } from "../data/prisma";
import { Review } from "../domain/entities";

export const ReviewRepository = {
  async getByProductId(productId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews as Review[];
  },

  async create(data: {
    productId: string;
    userId?: string | null;
    userName: string;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
  }): Promise<Review> {
    const dbReview = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId || null,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        verifiedPurchase: data.verifiedPurchase,
        approved: false, // Moderated by default
      },
    });
    return dbReview as Review;
  },

  async getPending(): Promise<(Review & { product: { name: string } })[]> {
    const reviews = await prisma.review.findMany({
      where: { approved: false },
      include: {
        product: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews as (Review & { product: { name: string } })[];
  },

  async approve(id: string): Promise<Review> {
    const dbReview = await prisma.review.update({
      where: { id },
      data: { approved: true },
    });
    return dbReview as Review;
  },

  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  },
};
