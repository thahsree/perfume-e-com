import { prisma } from "../data/prisma";
import { Coupon } from "../domain/entities";

export const CouponRepository = {
  async getByCode(code: string): Promise<Coupon | null> {
    const dbCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    return dbCoupon as Coupon | null;
  },

  async incrementUsage(id: string): Promise<void> {
    await prisma.coupon.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  },

  async getAll(): Promise<Coupon[]> {
    const dbCoupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return dbCoupons as Coupon[];
  },

  async create(data: Omit<Coupon, "id" | "usageCount" | "createdAt">): Promise<Coupon> {
    const dbCoupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        type: data.type,
        value: data.value,
        minThreshold: data.minThreshold,
        usageLimit: data.usageLimit,
        active: data.active,
        expiryDate: data.expiryDate,
      },
    });
    return dbCoupon as Coupon;
  },

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({
      where: { id },
    });
  },

  async toggleActive(id: string, active: boolean): Promise<Coupon> {
    const dbCoupon = await prisma.coupon.update({
      where: { id },
      data: { active },
    });
    return dbCoupon as Coupon;
  },
};
