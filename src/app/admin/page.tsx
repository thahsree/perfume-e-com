"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/components/AuthModal";
import {
  TrendingUp,
  Package,
  CheckCircle,
  Tag,
  Star,
  Users,
  Eye,
  Trash2,
  Plus,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Order, Coupon, Review, User } from "@/core/domain/entities";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Lists State
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  // Sub-selection details
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [viewingCustomerModal, setViewingCustomerModal] = useState(false);

  // Coupon Form State
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinThreshold, setCouponMinThreshold] = useState("0");
  const [couponLimit, setCouponLimit] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponFormMsg, setCouponFormMsg] = useState<string | null>(null);

  // Active section tabs
  const [activeTab, setActiveTab] = useState<"orders" | "coupons" | "reviews" | "customers">("orders");

  // Load Dashboard Data
  async function loadDashboardData() {
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const ordersRes = await fetch("/api/orders?admin=true");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      const couponsRes = await fetch("/api/admin/coupons");
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }

      const reviewsRes = await fetch("/api/reviews?pending=true");
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setPendingReviews(reviewsData);
      }

      const customersRes = await fetch("/api/admin/customers");
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }
    } catch (e) {
      console.error("Dashboard statistics loading failed:", e);
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadDashboardData();
    }
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o)));
        loadDashboardData(); // Refresh aggregated charts
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId }),
      });
      if (res.ok) {
        setPendingReviews(pendingReviews.filter((r) => r.id !== reviewId));
        loadDashboardData();
      }
    } catch (e) {
      console.error("Failed to approve review:", e);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId }),
      });
      if (res.ok) {
        setPendingReviews(pendingReviews.filter((r) => r.id !== reviewId));
        loadDashboardData();
      }
    } catch (e) {
      console.error("Failed to delete review:", e);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormMsg(null);

    if (!couponCode) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: Number(couponValue) || 0,
          minThreshold: Number(couponMinThreshold) || 0,
          usageLimit: couponLimit ? Number(couponLimit) : null,
          expiryDate: couponExpiry || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons([data, ...coupons]);
        setCouponCode("");
        setCouponValue("");
        setCouponMinThreshold("0");
        setCouponLimit("");
        setCouponExpiry("");
        setCouponFormMsg("Promotional coupon successfully created!");
      } else {
        setCouponFormMsg(`Error: ${data.error || "Failed to create coupon."}`);
      }
    } catch (err) {
      setCouponFormMsg("Network error. Try again later.");
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });
      if (res.ok) {
        setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c)));
      }
    } catch (e) {
      console.error("Failed to toggle coupon status:", e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete coupon:", e);
    }
  };

  const handleFetchCustomerDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomer(data);
        setViewingCustomerModal(true);
      }
    } catch (e) {
      console.error("Failed to load customer profiles:", e);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 rounded-full border-t border-accent animate-spin" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Verifying curator access...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h3 className="text-2xl font-serif text-foreground mb-4">Access Denied</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          The Admin Dashboard is restricted to authorized credentials.
        </p>
        <button
          onClick={openAuthModal}
          className="px-8 py-4 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Chart Styling theme colors
  const CHART_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="flex justify-between items-baseline flex-wrap gap-4 border-b border-border/20 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-foreground">
              Curator Control Panel
            </h2>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">
              Storefront Administration & Moderation logs
            </p>
          </div>
          <span className="px-3 py-1 bg-accent text-accent-foreground text-[10px] tracking-widest font-semibold rounded-full uppercase">
            Active Admin Session
          </span>
        </div>

        {/* Dashboard Financial Widgets */}
        {statsLoading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-black/10 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl space-y-2">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Total Revenue</p>
              <h4 className="text-2xl font-semibold text-foreground font-sans">${stats.revenue.total.toFixed(2)}</h4>
              <p className="text-[9px] text-accent flex items-center gap-1">
                <TrendingUp size={10} />
                <span>Aggregated gross receipts</span>
              </p>
            </div>

            <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl space-y-2">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Revenues Today</p>
              <h4 className="text-2xl font-semibold text-foreground font-sans">${stats.revenue.today.toFixed(2)}</h4>
              <p className="text-[9px] text-muted-foreground">Recorded since midnight</p>
            </div>

            <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl space-y-2">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Revenues Weekly</p>
              <h4 className="text-2xl font-semibold text-foreground font-sans">${stats.revenue.week.toFixed(2)}</h4>
              <p className="text-[9px] text-muted-foreground">Rolling 7-day total</p>
            </div>

            <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl space-y-2">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Revenues Monthly</p>
              <h4 className="text-2xl font-semibold text-foreground font-sans">${stats.revenue.month.toFixed(2)}</h4>
              <p className="text-[9px] text-muted-foreground">Recorded this calendar month</p>
            </div>
          </div>
        )}

        {/* Analytics Charts & Alerts */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Pie Chart */}
            <div className="lg:col-span-8 p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-3xl min-h-[300px] flex flex-col justify-between">
              <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">
                Orders Status Distribution
              </h4>
              
              <div className="w-full h-56">
                {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.ordersByStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">
                    No orders data mapped to chart views yet.
                  </div>
                )}
              </div>
            </div>

            {/* Stock Alerts & Popular Items */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Low Stock Alerts */}
              <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-3xl space-y-4">
                <h4 className="text-xs font-semibold tracking-wider text-foreground uppercase border-b border-border/20 pb-2">
                  Low stock levels (Qty &lt;= 10)
                </h4>
                {stats.lowStockAlerts.length === 0 ? (
                  <p className="text-[10px] text-accent font-medium">All variants sufficiently stocked.</p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {stats.lowStockAlerts.map((variant: any) => (
                      <div key={variant.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                        <div>
                          <span className="font-semibold text-foreground">{variant.productName}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 uppercase">({variant.size})</span>
                        </div>
                        <span className="font-bold text-red-400">{variant.stock} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Items list */}
              <div className="p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-3xl space-y-4">
                <h4 className="text-xs font-semibold tracking-wider text-foreground uppercase border-b border-border/20 pb-2">
                  Top performing personas
                </h4>
                {stats.topProducts.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No sales recorded yet.</p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {stats.topProducts.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-muted-foreground font-light">{p.name}</span>
                        <span className="font-semibold text-foreground">{p.sales} units sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Admin sections Tabs */}
        <div className="flex gap-4 border-b border-border/20 pb-2 text-xs tracking-wider uppercase font-semibold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "orders" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders Queue
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "coupons" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Coupons Panel
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "reviews" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Reviews Moderation ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "customers" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer Database
          </button>
        </div>

        {/* Tab content panels */}
        <div className="pt-4">
          
          {/* ORDERS QUEUE */}
          {activeTab === "orders" && (
            <div className="rounded-3xl border border-border/40 bg-black/10 dark:bg-white/[0.01] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 border-b border-border/20 text-muted-foreground tracking-wider uppercase">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Courier status</th>
                    <th className="p-4 text-right">Charged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-sans">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-medium text-foreground">{o.id.slice(0, 8)}...</td>
                      <td className="p-4 font-medium text-foreground">
                        <p>{o.name}</p>
                        <p className="text-[10px] text-muted-foreground">{o.email}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-black/40 border border-border text-foreground rounded-lg p-1.5 focus:outline-none focus:border-accent text-xs"
                        >
                          <option value="placed">Placed (Processing)</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped (Transit)</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        ${o.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* COUPONS PANEL */}
          {activeTab === "coupons" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Creator Form */}
              <div className="lg:col-span-4 p-6 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-3xl space-y-4">
                <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase border-b border-border/20 pb-2">
                  Create Coupon
                </h4>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SCENTFALL25"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full p-2.5 bg-black/20 border border-border rounded-lg text-xs tracking-widest uppercase focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                      Discount Type
                    </label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as any)}
                      className="w-full p-2.5 bg-black/20 border border-border rounded-lg text-xs focus:outline-none focus:border-accent text-white"
                    >
                      <option value="PERCENTAGE">Percentage off (%)</option>
                      <option value="FIXED">Fixed Amount off ($)</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                  </div>

                  {couponType !== "FREE_SHIPPING" && (
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                        Discount value
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 15"
                        value={couponValue}
                        onChange={(e) => setCouponValue(e.target.value)}
                        className="w-full p-2.5 bg-black/20 border border-border rounded-lg text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                      Min subtotal threshold ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={couponMinThreshold}
                      onChange={(e) => setCouponMinThreshold(e.target.value)}
                      className="w-full p-2.5 bg-black/20 border border-border rounded-lg text-xs focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                      Usage Limits count
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={couponLimit}
                      onChange={(e) => setCouponLimit(e.target.value)}
                      className="w-full p-2.5 bg-black/20 border border-border rounded-lg text-xs focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  {couponFormMsg && (
                    <p className="text-[10px] text-accent text-center mt-2">{couponFormMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-opacity"
                  >
                    Generate coupon
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="lg:col-span-8 rounded-3xl border border-border/40 bg-black/10 dark:bg-white/[0.01] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-border/20 text-muted-foreground tracking-wider uppercase">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Usage</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 font-sans">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono font-semibold tracking-wider text-foreground uppercase">{c.code}</td>
                        <td className="p-4 text-muted-foreground">{c.type}</td>
                        <td className="p-4 font-semibold text-foreground">
                          {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED" ? `$${c.value}` : "FREESHIP"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {c.usageCount} / {c.usageLimit || "∞"}
                        </td>
                        <td className="p-4 text-right flex gap-3 justify-end items-center">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.active)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                              c.active ? "bg-emerald-950/40 text-emerald-300" : "bg-black/30 text-muted-foreground"
                            }`}
                          >
                            {c.active ? "Active" : "Disabled"}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-3xl p-6">
                  <p className="text-xs text-muted-foreground font-serif italic">
                    Review Moderation Queue is currently clear. All customer feedback approved.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingReviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 bg-black/10 dark:bg-white/[0.01] border border-border/40 rounded-2xl flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-foreground">{r.userName}</span>
                            {r.verifiedPurchase && (
                              <span className="ml-2 inline-flex items-center gap-0.5 text-[8px] text-accent uppercase tracking-widest font-semibold">
                                <ShieldCheck size={10} />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground italic">
                            Product: {r.product.name}
                          </span>
                        </div>

                        <div className="flex text-accent gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill={i < r.rating ? "currentColor" : "none"}
                              className={i < r.rating ? "text-accent" : "text-muted-foreground/30"}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground italic font-sans leading-relaxed">
                          "{r.comment}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-2 font-sans">
                        <button
                          onClick={() => handleRejectReview(r.id)}
                          className="px-3.5 py-1.5 border border-red-900/40 text-red-400 hover:bg-red-950/20 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveReview(r.id)}
                          className="px-3.5 py-1.5 bg-emerald-700 text-emerald-50 text-[10px] font-semibold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER DATABASE */}
          {activeTab === "customers" && (
            <div className="rounded-3xl border border-border/40 bg-black/10 dark:bg-white/[0.01] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 border-b border-border/20 text-muted-foreground tracking-wider uppercase">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-sans">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-foreground">{c.name}</td>
                      <td className="p-4 text-muted-foreground">{c.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleFetchCustomerDetail(c.id)}
                          className="px-3 py-1.5 bg-white/5 border border-border hover:bg-white/10 text-[10px] font-semibold uppercase tracking-wider rounded-lg text-foreground transition-all flex items-center gap-1.5 justify-end ml-auto"
                        >
                          <Eye size={12} />
                          <span>View Logs</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Detail modal views */}
        {viewingCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setViewingCustomerModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl font-sans text-xs space-y-6 no-scrollbar">
              <div className="flex justify-between items-start border-b border-border/20 pb-4">
                <div>
                  <h3 className="text-xl font-serif text-white font-light">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => setViewingCustomerModal(false)}
                  className="p-1 border border-border hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Orders History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground tracking-wider uppercase text-[10px]">
                  Registered Orders ({selectedCustomer.orders?.length || 0})
                </h4>
                {selectedCustomer.orders?.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No purchases logged.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((o: any) => (
                      <div key={o.id} className="p-3 bg-black/20 border border-border/40 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-mono font-semibold text-foreground">{o.id.slice(0, 8)}...</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground font-sans">${o.totalAmount.toFixed(2)}</p>
                          <span className="text-[8px] uppercase tracking-widest text-accent font-semibold">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground tracking-wider uppercase text-[10px]">
                  Submitted Impressions ({selectedCustomer.reviews?.length || 0})
                </h4>
                {selectedCustomer.reviews?.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No reviews submitted.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.reviews.map((r: any) => (
                      <div key={r.id} className="p-3 bg-black/20 border border-border/40 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                          <span>Product: {r.product.name}</span>
                          <span className={r.approved ? "text-emerald-400 uppercase font-semibold" : "text-amber-400 uppercase font-semibold"}>
                            {r.approved ? "Curated" : "Pending Moderation"}
                          </span>
                        </div>
                        <p className="italic text-muted-foreground">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
