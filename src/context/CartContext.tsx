"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productVariantId: string;
  quantity: number;
  price: number;
  name: string;
  size: string;
  image: string;
  slug: string;
  stockLevel: number;
}

interface CouponDetails {
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minThreshold: number;
}

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  total: number;
  discountAmount: number;
  shippingCost: number;
  shippingMethod: "standard" | "express";
  coupon: CouponDetails | null;
  couponError: string | null;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setShippingMethod: (method: "standard" | "express") => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethodState] = useState<"standard" | "express">("standard");
  const [coupon, setCoupon] = useState<CouponDetails | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("niche_perfumes_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart local storage", e);
      }
    }
  }, []);

  // Save cart to localStorage when changed
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("niche_perfumes_cart", JSON.stringify(newCart));
  };

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number) => {
    const existing = cart.find((i) => i.productVariantId === item.productVariantId);
    let newCart = [];
    if (existing) {
      newCart = cart.map((i) =>
        i.productVariantId === item.productVariantId
          ? { ...i, quantity: Math.min(i.quantity + quantity, i.stockLevel) }
          : i
      );
    } else {
      newCart = [...cart, { ...item, quantity: Math.min(quantity, item.stockLevel) }];
    }
    saveCart(newCart);
    setCartOpen(true); // Open drawer on addition
  };

  const removeItem = (variantId: string) => {
    const newCart = cart.filter((i) => i.productVariantId !== variantId);
    saveCart(newCart);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    const item = cart.find((i) => i.productVariantId === variantId);
    if (!item) return;
    const cleanQty = Math.max(1, Math.min(quantity, item.stockLevel));
    const newCart = cart.map((i) =>
      i.productVariantId === variantId ? { ...i, quantity: cleanQty } : i
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setCouponError(null);
  };

  const setShippingMethod = (method: "standard" | "express") => {
    setShippingMethodState(method);
  };

  const subtotal = Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

  // Re-validate coupon if cart total changes
  useEffect(() => {
    if (coupon && subtotal < coupon.minThreshold) {
      setCoupon(null);
      setCouponError(`Coupon removed: Subtotal dropped below minimum threshold of $${coupon.minThreshold}`);
    }
  }, [subtotal, coupon]);

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCoupon({
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          minThreshold: data.coupon.minThreshold,
        });
        return true;
      } else {
        setCouponError(data.error || "Failed to validate coupon.");
        return false;
      }
    } catch (e) {
      setCouponError("Network error. Please try again.");
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // Discount computation
  let discountAmount = 0;
  let freeShippingCoupon = false;
  if (coupon) {
    if (coupon.type === "PERCENTAGE") {
      discountAmount = subtotal * (coupon.value / 100);
    } else if (coupon.type === "FIXED") {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === "FREE_SHIPPING") {
      freeShippingCoupon = true;
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));

  // Shipping cost computation
  let shippingCost = 0;
  if (shippingMethod === "express") {
    shippingCost = 30.0;
  } else {
    shippingCost = (subtotal >= 100.0 || freeShippingCoupon || subtotal === 0) ? 0.0 : 15.0;
  }

  const total = Number((subtotal - discountAmount + shippingCost).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        total,
        discountAmount,
        shippingCost,
        shippingMethod,
        coupon,
        couponError,
        isCartOpen,
        setCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setShippingMethod,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
