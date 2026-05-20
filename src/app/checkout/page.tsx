"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, CreditCard, Gift, ShieldAlert, BadgeCheck, ClipboardList, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Checkout() {
  const {
    cart,
    subtotal,
    total,
    discountAmount,
    shippingCost,
    shippingMethod,
    coupon,
    clearCart,
  } = useCart();

  const { user } = useAuth();

  // Address fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Control state
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any | null>(null);

  // Pre-fill address if logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
    }
  }, [user]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (cart.length === 0) {
      setOrderError("Your shopping bag is empty.");
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvv) {
      setOrderError("Please enter valid credit card details.");
      return;
    }

    setPlacingOrder(true);
    try {
      const itemsPayload = cart.map((i) => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          state,
          zipCode,
          country,
          shippingMethod,
          couponCode: coupon?.code || undefined,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPlacedOrderDetails(data);
        clearCart();
      } else {
        setOrderError(data.error || "Order placement failed.");
      }
    } catch (err) {
      setOrderError("A network error occurred. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // If order was successfully completed
  if (placedOrderDetails) {
    return (
      <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans px-6">
        <div className="max-w-xl mx-auto rounded-3xl glass border border-border/80 p-8 text-center space-y-8 shadow-2xl">
          <div className="flex justify-center text-accent">
            <CheckCircle2 size={64} className="animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-light text-foreground tracking-wide">
              Olfactive Cabinet Populated
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">
              Thank you for your purchase
            </p>
          </div>

          <div className="p-4 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl text-left text-xs space-y-3 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <span className="text-muted-foreground uppercase tracking-wider">Order ID:</span>
              <span className="font-semibold font-mono text-foreground">{placedOrderDetails.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider">Courier Status:</span>
              <span className="font-semibold text-accent uppercase tracking-wider flex items-center gap-1">
                <Truck size={12} />
                <span>Placed (Processing)</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider">Delivery Mode:</span>
              <span className="font-semibold text-foreground uppercase tracking-wider">
                {placedOrderDetails.shippingMethod === "express" ? "Express Courier" : "Standard Post"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider">Net Charged:</span>
              <span className="font-bold text-foreground font-sans">
                ${placedOrderDetails.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            A confirmation receipt has been sent to <span className="text-foreground">{placedOrderDetails.email}</span>. You can track courier updates inside your Account Dashboard.
          </p>

          <div className="pt-4 flex flex-col gap-3 font-sans">
            <Link
              href="/account"
              className="px-6 py-3.5 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-opacity"
            >
              Go to Account Dashboard
            </Link>
            <Link
              href="/collection"
              className="px-6 py-3 bg-white/5 border border-border text-foreground hover:bg-white/10 text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-foreground">
          Cabinet checkout
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl space-y-6 max-w-lg mx-auto">
            <ShoppingBag size={32} className="text-muted-foreground mx-auto" />
            <p className="text-sm font-serif italic text-muted-foreground">
              Your olfactive selection is empty.
            </p>
            <Link
              href="/collection"
              className="inline-block px-6 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Delivery and Billing details form */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-light text-foreground border-b border-border/20 pb-2 tracking-wide">
                  Contact Information
                </h3>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-light text-foreground border-b border-border/20 pb-2 tracking-wide">
                  Delivery Address
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="RECIPIENT FULL NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                  />
                  <input
                    type="text"
                    required
                    placeholder="STREET ADDRESS"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                  />
                  <input
                    type="text"
                    placeholder="APARTMENT, SUITE, UNIT (OPTIONAL)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="CITY"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                    />
                    <input
                      type="text"
                      required
                      placeholder="STATE / PROVINCE"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="ZIP CODE / POSTAL CODE"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                    />
                    <input
                      type="text"
                      required
                      placeholder="COUNTRY"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3.5 bg-black/20 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Secure Payment */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                  <CreditCard size={18} className="text-accent" />
                  <h3 className="text-lg font-serif font-light text-foreground tracking-wide">
                    Simulated Secure Payment
                  </h3>
                </div>

                <div className="p-4 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl space-y-4 font-sans">
                  <input
                    type="text"
                    required
                    placeholder="CARD NUMBER"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-3.5 bg-black/30 border border-border rounded-lg text-xs tracking-wider focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans font-medium"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="EXPIRY (MM/YY)"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-3.5 bg-black/30 border border-border rounded-lg text-xs tracking-wider focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans font-medium"
                    />
                    <input
                      type="password"
                      required
                      placeholder="CVV"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-3.5 bg-black/30 border border-border rounded-lg text-xs tracking-wider focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 font-sans font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Summary Review */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl border border-border/40 bg-black/10 dark:bg-white/[0.01] shadow-md space-y-6 font-sans">
                <h3 className="text-lg font-serif font-light text-foreground tracking-wide pb-2 border-b border-border/20 flex items-center justify-between">
                  <span>Order Review</span>
                  <ClipboardList size={16} className="text-accent" />
                </h3>

                {/* Items in Checkout */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.productVariantId} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-foreground font-serif tracking-wide">{item.name}</span>
                        <span className="text-muted-foreground text-[10px] uppercase font-sans tracking-wider ml-2">
                          {item.size} x{item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground font-sans">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Calculation */}
                <div className="border-t border-border/30 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount ({coupon?.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping ({shippingMethod === "express" ? "Express Courier" : "Standard Post"})</span>
                    <span>{shippingCost === 0 ? "Complimentary" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-3 text-foreground font-serif">
                    <span>Grand Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-xs text-center font-sans">
                    {orderError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full py-4 bg-accent hover:opacity-95 text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity"
                >
                  {placingOrder ? "Authorizing Payment..." : "Purchase Collection"}
                </button>
              </div>

              {/* Secure Trust Info */}
              <div className="p-4 rounded-2xl bg-black/10 border border-border/30 flex items-start gap-3 font-sans text-xs text-muted-foreground leading-relaxed">
                <BadgeCheck size={20} className="text-accent flex-shrink-0 mt-0.5" />
                <p>
                  You are exploring a simulated payment interface. Standard HTTPS certificates secure all connections. No real currency is drawn.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
