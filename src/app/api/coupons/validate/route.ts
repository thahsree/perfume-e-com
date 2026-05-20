import { NextResponse } from "next/server";
import { CouponService } from "@/core/services/coupon.service";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    const result = await CouponService.validate(code, Number(cartTotal) || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while validating coupon." },
      { status: 500 }
    );
  }
}
