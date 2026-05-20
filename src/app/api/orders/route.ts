export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrderRepository } from "@/core/repositories/order.repository";
import { CouponService } from "@/core/services/coupon.service";
import { CouponRepository } from "@/core/repositories/coupon.repository";
import { prisma } from "@/core/data/prisma";

function getSessionUser() {
  const session = cookies().get("niche_session");
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdminView = searchParams.get("admin") === "true";

    if (isAdminView) {
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const allOrders = await OrderRepository.getAll();
      return NextResponse.json(allOrders);
    }

    // Standard user gets their own history
    const myOrders = await OrderRepository.getByUserId(user.id);
    return NextResponse.json(myOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    const body = await request.json();

    const {
      email,
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      shippingMethod,
      couponCode,
      items, // array of { productVariantId: string, quantity: number }
    } = body;

    if (!email || !name || !addressLine1 || !city || !state || !zipCode || !country || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required contact, delivery, or product variant details." },
        { status: 400 }
      );
    }

    // 1. Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const dbVariant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
      });
      if (!dbVariant) {
        return NextResponse.json({ error: `Variant ID ${item.productVariantId} not found.` }, { status: 404 });
      }
      subtotal += dbVariant.price * item.quantity;
    }

    // 2. Validate Coupon and compute discount
    let discountAmount = 0;
    let freeShippingCoupon = false;

    if (couponCode) {
      const validation = await CouponService.validate(couponCode, subtotal);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      discountAmount = validation.discountAmount;
      if (validation.coupon?.type === "FREE_SHIPPING") {
        freeShippingCoupon = true;
      }
      
      // Increment coupon usage
      if (validation.coupon?.id) {
        await CouponRepository.incrementUsage(validation.coupon.id);
      }
    }

    // 3. Shipping cost calculations
    // Free shipping threshold: $100 for standard shipping
    let shippingCost = 0;
    if (shippingMethod === "express") {
      shippingCost = 30.00;
    } else {
      // standard shipping
      shippingCost = (subtotal >= 100.00 || freeShippingCoupon) ? 0.00 : 15.00;
    }

    const totalAmount = Number((subtotal - discountAmount + shippingCost).toFixed(2));

    // 4. Create database Order in transaction
    const newOrder = await OrderRepository.create(
      {
        userId: user?.id || null,
        email,
        name,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        shippingMethod,
        shippingCost,
        couponCode: couponCode || null,
        discountAmount,
        totalAmount,
      },
      items
    );

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout failed." }, { status: 400 });
  }
}
