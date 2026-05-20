"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useAuthModal } from "@/components/AuthModal";
import { Lock, Mail, ClipboardList, Heart, ChevronDown, ChevronUp, ShoppingBag, Eye, Trash2 } from "lucide-react";
import { Order, Product } from "@/core/domain/entities";
import Link from "next/link";

export default function Account() {
  const { user, loading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { addItem } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Toggle detail rows for orders
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Fetch Order History
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  // Fetch Wishlist Items
  useEffect(() => {
    async function loadWishlist() {
      if (!user) return;
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setWishlist(data);
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setWishlistLoading(false);
      }
    }
    loadWishlist();
  }, [user]);

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action: "remove" }),
      });
      if (res.ok) {
        setWishlist(wishlist.filter((p) => p.id !== productId));
      }
    } catch (e) {
      console.error("Failed to remove item from wishlist:", e);
    }
  };

  const handleAddWishlistItemToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      addItem(
        {
          productVariantId: variant.id,
          price: variant.price,
          name: product.name,
          size: variant.size,
          image: product.imageMain,
          slug: product.slug,
          stockLevel: variant.stockLevel,
        },
        1
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 rounded-full border-t border-accent animate-spin" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Verifying curation session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h3 className="text-2xl font-serif text-foreground mb-4">Dashboard Locked</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          Access to purchase records and personal wishlists requires curator validation.
        </p>
        <button
          onClick={openAuthModal}
          className="px-8 py-4 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-opacity"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Profile Card Header */}
        <div className="rounded-3xl border border-border/40 p-8 bg-black/10 dark:bg-white/[0.01] flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-serif font-semibold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Mail size={12} />
                <span>{user.email}</span>
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <span className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[9px] tracking-widest uppercase font-semibold">
              {user.role} PRIVILEGES
            </span>
            <p className="text-[10px] text-muted-foreground mt-2">
              Valid session cookie active
            </p>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Order history section */}
          <section className="lg:col-span-7 space-y-6">
            <h3 className="text-xl font-serif font-light text-foreground border-b border-border/20 pb-3 tracking-wide flex items-center gap-2">
              <ClipboardList size={18} className="text-accent" />
              <span>Purchase History</span>
            </h3>

            {ordersLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-black/10 rounded-xl" />
                <div className="h-12 bg-black/10 rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
                <p className="text-xs text-muted-foreground font-serif italic">
                  No purchases registered on this profile yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="border border-border/40 rounded-2xl bg-black/10 dark:bg-white/[0.01] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="w-full p-4 flex justify-between items-center text-left text-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground font-mono">{order.id.slice(0, 8)}...</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <span className="px-2.5 py-1 bg-black/20 text-accent font-semibold tracking-wider rounded-md uppercase text-[9px]">
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground font-sans">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </button>

                      {/* Expanded order details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-border/20 text-xs space-y-4 font-sans">
                          
                          {/* Items List */}
                          <div className="space-y-2">
                            <p className="font-semibold text-foreground tracking-wider uppercase text-[10px]">
                              Olfactive Vials
                            </p>
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                <div>
                                  <span className="font-medium text-foreground">{item.productName}</span>
                                  <span className="text-[10px] text-muted-foreground ml-2 uppercase">
                                    {item.productSize} x{item.quantity}
                                  </span>
                                </div>
                                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Address / Summary Details */}
                          <div className="grid grid-cols-2 gap-4 text-[10px] text-muted-foreground">
                            <div>
                              <p className="font-semibold text-foreground uppercase tracking-wider mb-1">
                                Delivery Address
                              </p>
                              <p>{order.name}</p>
                              <p>{order.addressLine1}</p>
                              <p>{order.city}, {order.state} {order.zipCode}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground uppercase tracking-wider mb-1">
                                Invoice Summary
                              </p>
                              <p>Subtotal: ${(order.totalAmount - order.shippingCost + order.discountAmount).toFixed(2)}</p>
                              {order.discountAmount > 0 && <p>Coupon Discount: -${order.discountAmount.toFixed(2)}</p>}
                              <p>Shipping Cost: ${order.shippingCost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Wishlist items section */}
          <section className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-serif font-light text-foreground border-b border-border/20 pb-3 tracking-wide flex items-center gap-2">
              <Heart size={18} className="text-accent" />
              <span>Scent Wishlist ({wishlist.length})</span>
            </h3>

            {wishlistLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-black/10 rounded-xl" />
                <div className="h-16 bg-black/10 rounded-xl" />
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
                <p className="text-xs text-muted-foreground font-serif italic">
                  Your wishlist is empty. Add scents while browsing.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-black/10 border border-border/40 rounded-2xl items-center"
                  >
                    <div className="relative w-16 h-16 bg-black/20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img src={item.imageMain} alt={item.name} className="object-contain max-h-12 w-auto" />
                    </div>
                    <div className="flex-grow flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-serif font-medium text-foreground">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-sans mt-0.5">
                          {item.fragranceFamily}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddWishlistItemToCart(item)}
                          className="p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                          title="Add to Cart"
                        >
                          <ShoppingBag size={12} />
                        </button>
                        <Link
                          href={`/product/${item.slug}`}
                          className="p-2 border border-border text-foreground hover:bg-white/5 rounded-lg transition-colors"
                          title="View Scent Portrait"
                        >
                          <Eye size={12} />
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="p-2 text-muted-foreground hover:text-red-400 border border-border hover:border-red-400/40 rounded-lg transition-colors"
                          title="Remove from list"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
