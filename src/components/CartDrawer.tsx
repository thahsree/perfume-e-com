"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const {
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
    removeItem,
    updateQuantity,
    setShippingMethod,
    applyCoupon,
    removeCoupon,
    addItem,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Free shipping threshold logic
  const freeShipThreshold = 100.0;
  const amountNeededForFreeShip = Math.max(0, freeShipThreshold - subtotal);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    const success = await applyCoupon(couponCodeInput);
    if (success) {
      setCouponCodeInput("");
    }
    setValidatingCoupon(false);
  };

  // Upsell Discovery Set details
  const handleAddDiscoverySet = () => {
    addItem(
      {
        productVariantId: "DISC-SET",
        price: 20.0,
        name: "Olfactive Discovery Set",
        size: "4 x 2ml",
        image: "/images/perfumes/aether.png", // Reuse the beautiful Aether image
        slug: "aether", // Redirects to product
        stockLevel: 100,
      },
      1
    );
  };

  const discoverySetInCart = cart.some((i) => i.productVariantId === "DISC-SET");

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-card text-card-foreground border-l border-border flex flex-col h-full shadow-2xl"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-accent" />
                  <h3 className="text-xl font-serif tracking-wide text-foreground">
                    Your Collection ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Items list */}
              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                {/* Free Shipping Alert */}
                {cart.length > 0 && shippingMethod === "standard" && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-center">
                    {amountNeededForFreeShip > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        You are{" "}
                        <span className="font-semibold text-accent font-sans">
                          ${amountNeededForFreeShip.toFixed(2)}
                        </span>{" "}
                        away from complimentary standard shipping.
                      </p>
                    ) : (
                      <p className="text-xs text-accent font-medium tracking-wide">
                        Complimentary standard shipping is applied to your order.
                      </p>
                    )}
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground font-serif italic mb-6">
                      The catalog remains empty. Discover scent personas to populate it.
                    </p>
                    <Link
                      href="/collection"
                      onClick={() => setCartOpen(false)}
                      className="px-6 py-3 bg-accent text-accent-foreground rounded-lg text-xs tracking-widest uppercase hover:opacity-95 transition-opacity"
                    >
                      Browse Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.productVariantId}
                        className="flex gap-4 p-3 bg-black/10 border border-border/40 rounded-xl"
                      >
                        <div className="relative w-20 h-20 bg-black/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain max-h-16 w-auto"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-serif font-medium tracking-wide text-foreground">
                                {item.name}
                              </h4>
                              <p className="text-sm font-sans font-medium text-accent">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
                              Size: {item.size}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border rounded-lg bg-black/20">
                              <button
                                onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-xs font-sans font-semibold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeItem(item.productVariantId)}
                              className="text-muted-foreground/60 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upsell Box */}
                {!discoverySetInCart && cart.length > 0 && (
                  <div className="p-4 border border-accent/20 bg-accent/5 rounded-xl flex items-center justify-between gap-4 mt-6">
                    <div className="space-y-1">
                      <h5 className="text-xs font-serif font-semibold text-foreground">
                        Scent Discovery Set
                      </h5>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Experience all 4 signature perfume vials (2ml each) before committing. Only $20.00.
                      </p>
                    </div>
                    <button
                      onClick={handleAddDiscoverySet}
                      className="px-3 py-2 bg-accent text-accent-foreground text-[10px] font-sans font-semibold tracking-wider uppercase rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      Add Set
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Summary (Sticky at bottom) */}
              {cart.length > 0 && (
                <div className="border-t border-border bg-black/40 px-6 py-6 space-y-4">
                  {/* Coupon Codes Form */}
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                        <Tag size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="PROMO CODE"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={validatingCoupon}
                      className="px-4 py-2 bg-foreground text-background font-sans font-semibold text-xs tracking-widest uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  </form>

                  {/* Coupon feedback */}
                  {coupon && (
                    <div className="flex items-center justify-between p-2.5 bg-accent/10 border border-accent/20 rounded-lg text-xs">
                      <div className="flex items-center gap-2 text-accent">
                        <Tag size={12} />
                        <span className="font-semibold">{coupon.code}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : coupon.type === "FIXED" ? `$${coupon.value} off` : "Free Shipping"})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[10px] text-red-400 font-sans text-center mt-1">
                      {couponError}
                    </p>
                  )}

                  {/* Shipping tier selection */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-muted-foreground">Shipping Mode:</span>
                    <div className="flex border border-border rounded-lg bg-black/20 p-0.5 font-sans">
                      <button
                        type="button"
                        onClick={() => setShippingMethod("standard")}
                        className={`px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-md transition-all ${
                          shippingMethod === "standard"
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setShippingMethod("express")}
                        className={`px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-md transition-all ${
                          shippingMethod === "express"
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Express
                      </button>
                    </div>
                  </div>

                  {/* Price calculations */}
                  <div className="space-y-2 pt-2 border-t border-border/30 text-sm font-sans">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-accent">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping ({shippingMethod === "express" ? "Express" : "Standard"})</span>
                      <span>{shippingCost === 0 ? "Complimentary" : `$${shippingCost.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between text-base font-serif font-semibold border-t border-border/50 pt-2 text-foreground">
                      <span>Total Collection Price</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full mt-4 py-4 bg-accent hover:opacity-95 text-accent-foreground font-sans font-semibold tracking-widest uppercase rounded-lg text-xs flex items-center justify-center gap-3 transition-opacity group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
