import { CouponRepository } from "../repositories/coupon.repository";
import { Coupon } from "../domain/entities";

export interface ValidationResult {
  valid: boolean;
  discountAmount: number;
  error?: string;
  coupon?: Coupon;
}

export const CouponService = {
  async validate(code: string, cartTotal: number): Promise<ValidationResult> {
    const coupon = await CouponRepository.getByCode(code);

    if (!coupon) {
      return { valid: false, discountAmount: 0, error: "Coupon code does not exist." };
    }

    if (!coupon.active) {
      return { valid: false, discountAmount: 0, error: "This coupon is no longer active." };
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discountAmount: 0, error: "This coupon has expired." };
    }

    // Usage limit check
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, error: "This coupon has reached its maximum usage limit." };
    }

    // Threshold check
    if (cartTotal < coupon.minThreshold) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Minimum order amount of $${coupon.minThreshold.toFixed(2)} required to use this coupon.`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = cartTotal * (coupon.value / 100);
    } else if (coupon.type === "FIXED") {
      discountAmount = Math.min(coupon.value, cartTotal);
    } else if (coupon.type === "FREE_SHIPPING") {
      discountAmount = 0; // Handled separately by reducing shipping cost to 0
    }

    return {
      valid: true,
      discountAmount: Number(discountAmount.toFixed(2)),
      coupon,
    };
  },
};
