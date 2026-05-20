import { prisma } from "../data/prisma";
import { Order, OrderItem } from "../domain/entities";

export const OrderRepository = {
  async create(
    orderData: {
      userId?: string | null;
      email: string;
      name: string;
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
    },
    items: { productVariantId: string; quantity: number }[]
  ): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch variant prices and snapshot details
      const orderItemsData = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`Variant not found: ${item.productVariantId}`);
        }

        if (variant.stockLevel < item.quantity) {
          throw new Error(
            `Insufficient stock for ${variant.product.name} (${variant.size}). Available: ${variant.stockLevel}, Requested: ${item.quantity}`
          );
        }

        // Deduct variant stock
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockLevel: {
              decrement: item.quantity,
            },
          },
        });

        orderItemsData.push({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: variant.price,
          productName: variant.product.name,
          productSize: variant.size,
        });
      }

      // 2. Create the main Order
      const dbOrder = await tx.order.create({
        data: {
          userId: orderData.userId || null,
          email: orderData.email,
          name: orderData.name,
          addressLine1: orderData.addressLine1,
          addressLine2: orderData.addressLine2,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.zipCode,
          country: orderData.country,
          shippingMethod: orderData.shippingMethod,
          shippingCost: orderData.shippingCost,
          couponCode: orderData.couponCode,
          discountAmount: orderData.discountAmount,
          totalAmount: orderData.totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return dbOrder as unknown as Order;
    });
  },

  async getById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const dbOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return dbOrder as (Order & { items: OrderItem[] }) | null;
  },

  async getByUserId(userId: string): Promise<Order[]> {
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return dbOrders as unknown as Order[];
  },

  async getAll(): Promise<Order[]> {
    const dbOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return dbOrders as unknown as Order[];
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const dbOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return dbOrder as unknown as Order;
  },

  async getAdminStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Totals calculations
    const allOrders = await prisma.order.findMany({
      select: { totalAmount: true, createdAt: true, status: true },
    });

    const revenueTotal = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const revenueToday = allOrders
      .filter((o) => o.createdAt >= startOfToday)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const revenueWeek = allOrders
      .filter((o) => o.createdAt >= startOfWeek)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const revenueMonth = allOrders
      .filter((o) => o.createdAt >= startOfMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Orders status groupings (for Donut Chart)
    const statusCounts = allOrders.reduce((acc: Record<string, number>, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const orderStatusDonut = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    // Product stock alerts (low stock level <= 10)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stockLevel: { lte: 10 } },
      include: { product: true },
      take: 5,
    });

    const lowStockAlerts = lowStockVariants.map((v) => ({
      id: v.id,
      productName: v.product.name,
      size: v.size,
      stock: v.stockLevel,
    }));

    // Popular items (aggregate quantities sold in OrderItems)
    const itemsAggregation = await prisma.orderItem.groupBy({
      by: ["productName", "productSize"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProducts = itemsAggregation.map((item) => ({
      name: `${item.productName} (${item.productSize})`,
      sales: item._sum.quantity || 0,
    }));

    return {
      revenue: {
        total: revenueTotal,
        today: revenueToday,
        week: revenueWeek,
        month: revenueMonth,
      },
      ordersCount: allOrders.length,
      ordersByStatus: orderStatusDonut,
      lowStockAlerts,
      topProducts,
    };
  },
};
