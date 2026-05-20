export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CouponRepository } from "@/core/repositories/coupon.repository";

function getSessionUser() {
  const session = cookies().get("niche_session");
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const coupons = await CouponRepository.getAll();
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    const { code, type, value, minThreshold, usageLimit, expiryDate, active } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Code, type, and discount value are required." },
        { status: 400 }
      );
    }

    const newCoupon = await CouponRepository.create({
      code,
      type,
      value: Number(value),
      minThreshold: Number(minThreshold) || 0,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      active: active !== false,
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create coupon." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id, active } = await request.json();
    if (!id || active === undefined) {
      return NextResponse.json(
        { error: "Coupon ID and active state are required." },
        { status: 400 }
      );
    }

    const updated = await CouponRepository.toggleActive(id, active);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to toggle coupon status." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
    }

    await CouponRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
