"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/components/AuthModal";
import ScentWheel from "@/components/ScentWheel";
import { Heart, Star, ShoppingBag, Landmark, Award, Eye, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Product, ProductVariant, Review } from "@/core/domain/entities";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams() as { slug: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // (No gallery tabs — single clean bottle image display)

  // Variant Sizing Selection
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Wishlist state
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRatingInput, setReviewRatingInput] = useState(5);
  const [reviewCommentInput, setReviewCommentInput] = useState("");
  const [reviewNameInput, setReviewNameInput] = useState("");
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addItem } = useCart();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Enforce review character limit
  const reviewCharLimit = 500;

  // Load product data
  useEffect(() => {
    async function loadProductData() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          throw new Error("Fragrance not found in the collection.");
        }
        const data = await res.json();
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProductData();
    }
  }, [slug]);

  // Load wishlist status if user is logged in
  useEffect(() => {
    async function checkWishlist() {
      if (!user || !product) return;
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const list: Product[] = await res.json();
          setInWishlist(list.some((item) => item.id === product.id));
        }
      } catch (e) {
        console.error("Wishlist fetch failed:", e);
      }
    }
    checkWishlist();
  }, [user, product]);

  // Load approved reviews
  useEffect(() => {
    async function loadReviews() {
      if (!product) return;
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) {
        console.error("Reviews load failed:", e);
      } finally {
        setReviewsLoading(false);
      }
    }
    if (product) {
      loadReviews();
    }
  }, [product]);

  const handleWishlistToggle = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setWishlistLoading(true);
    try {
      const nextStatus = !inWishlist;
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          action: nextStatus ? "add" : "remove",
        }),
      });
      if (res.ok) {
        setInWishlist(nextStatus);
      }
    } catch (e) {
      console.error("Wishlist action error:", e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(
      {
        productVariantId: selectedVariant.id,
        price: selectedVariant.price,
        name: product.name,
        size: selectedVariant.size,
        image: product.imageMain,
        slug: product.slug,
        stockLevel: selectedVariant.stockLevel,
      },
      1
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErrorMsg(null);
    setSubmitSuccessMsg(null);

    if (!reviewCommentInput.trim()) {
      setSubmitErrorMsg("Please enter a comment.");
      return;
    }

    if (reviewCommentInput.length > reviewCharLimit) {
      setSubmitErrorMsg(`Comment must not exceed ${reviewCharLimit} characters.`);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          rating: reviewRatingInput,
          comment: reviewCommentInput,
          userName: reviewNameInput || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccessMsg("Thank you! Your review has been submitted for curation approval.");
        setReviewCommentInput("");
        setReviewNameInput("");
        setReviewRatingInput(5);
      } else {
        setSubmitErrorMsg(data.error || "Review submission failed.");
      }
    } catch (err) {
      setSubmitErrorMsg("A network error occurred. Try again later.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 rounded-full border-t border-accent animate-spin" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Loading Olfactive Portrait...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h3 className="text-2xl font-serif text-foreground mb-4">Portrait Missing</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">{error || "Fragrance not found."}</p>
        <a href="/collection" className="px-6 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest rounded-lg">
          Return to Collection
        </a>
      </div>
    );
  }

  // Calculate Average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Gallery Panel — clean single bottle image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl border border-border/40 relative flex items-center justify-center p-12 bg-black/5 dark:bg-white/[0.01] shadow-sm overflow-hidden group">
              {/* Subtle theme colour tint on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: product.themeColor || "transparent" }}
              />
              <img
                src={product.imageMain}
                alt={product.name}
                className="object-contain max-h-[450px] w-auto group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Fragrance Family badge below image */}
            <div className="flex justify-center">
              <span className="px-4 py-1.5 border border-border/60 rounded-full text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-sans">
                {product.fragranceFamily} — Intensity {product.intensity}/5
              </span>
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.3em] text-accent uppercase font-semibold">
                  {product.fragranceFamily}
                </span>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Heart
                    size={20}
                    fill={inWishlist ? "currentColor" : "none"}
                    className={inWishlist ? "text-red-400" : ""}
                  />
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground">
                {product.name}
              </h2>
              <p className="text-sm font-serif italic text-muted-foreground font-light pt-1">
                {product.tagline}
              </p>
            </div>

            {/* Ratings Summary */}
            {avgRating && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground font-semibold">
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Editorial Story */}
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-light">
              {product.description}
            </p>

            {/* Perfumer Profile details */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-border/20 py-4 text-xs font-sans text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Landmark size={14} className="text-accent" />
                <span>Origin: {product.originCountry}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award size={14} className="text-accent" />
                <span>Nose: {product.perfumer}</span>
              </div>
            </div>

            {/* Sizing and Variant Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Select Edition size
              </h4>
              <div className="flex gap-4">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex-1 p-4 border rounded-xl text-left transition-colors flex justify-between items-center ${
                      selectedVariant?.id === variant.id
                        ? "bg-accent border-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase font-sans">
                        {variant.size}
                      </p>
                      <p className="text-[10px] opacity-75 mt-0.5 font-sans">
                        {variant.stockLevel > 0 ? `${variant.stockLevel} units remaining` : "Out of Stock"}
                      </p>
                    </div>
                    <span className="text-sm font-sans font-bold">${variant.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Checkout CTA */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockLevel <= 0}
                className="flex-grow py-4 bg-accent hover:opacity-95 text-accent-foreground text-xs tracking-widest uppercase font-semibold rounded-lg flex items-center justify-center gap-3 transition-opacity disabled:opacity-50"
              >
                <ShoppingBag size={14} />
                <span>Add to Olfactive Cabinet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Olfactive Notes Interactive Scent Wheel Section */}
        <section className="py-12 border-t border-border/10">
          <div className="text-center space-y-2 mb-8">
            <p className="text-[10px] tracking-[0.3em] text-accent uppercase font-semibold">
              STRUCTURE
            </p>
            <h3 className="text-2xl md:text-3xl font-serif font-light tracking-wide text-foreground">
              Olfactive Pyramid
            </h3>
          </div>
          <ScentWheel
            topNotes={product.topNotes}
            heartNotes={product.heartNotes}
            baseNotes={product.baseNotes}
            themeColor={product.themeColor}
          />
        </section>

        {/* Customer Reviews Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-border/10 pt-16">
          {/* Submission Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-foreground font-light tracking-wide">
                Submit Review
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add your personal olfactive interpretation. To prevent spam, all customer reviews go through curation moderation.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setReviewRatingInput(stars)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={18}
                        className={stars <= reviewRatingInput ? "text-accent" : "text-muted-foreground/30"}
                        fill={stars <= reviewRatingInput ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Anonymous Critic"
                  value={reviewNameInput}
                  onChange={(e) => setReviewNameInput(e.target.value)}
                  className="w-full p-3 bg-black/20 border border-border rounded-lg text-xs tracking-wide focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                    Your Impression
                  </label>
                  <span className={`text-[8px] tracking-wider uppercase ${reviewCommentInput.length > reviewCharLimit ? "text-red-400" : "text-muted-foreground/60"}`}>
                    {reviewCommentInput.length} / {reviewCharLimit}
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Notes of damp forest, morning mist, and silent resins..."
                  value={reviewCommentInput}
                  onChange={(e) => setReviewCommentInput(e.target.value)}
                  className="w-full p-3 bg-black/20 border border-border rounded-lg text-xs tracking-wide focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/30 resize-none"
                />
              </div>

              {submitSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-emerald-200 text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              {submitErrorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-xs text-center">
                  {submitErrorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-white text-black font-sans font-semibold text-xs tracking-widest uppercase rounded-lg hover:opacity-90 transition-opacity"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* List of Reviews */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-serif text-foreground font-light tracking-wide border-b border-border/20 pb-4">
              Curation Log ({reviews.length} Approved Impressions)
            </h3>

            {reviewsLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-black/10 rounded w-1/3" />
                <div className="h-12 bg-black/10 rounded w-full" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-2xl p-6">
                <p className="text-xs text-muted-foreground font-serif italic">
                  No curated reviews for this persona yet. Be the first to catalog your impression.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-black/10 dark:bg-white/[0.01] rounded-2xl border border-border/40 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-foreground">{review.userName}</span>
                        {review.verifiedPurchase && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[8px] font-sans font-semibold text-accent tracking-widest uppercase">
                            <ShieldCheck size={10} />
                            <span>Verified buyer</span>
                          </span>
                        )}
                      </div>
                      <div className="flex text-accent">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{review.comment}"
                    </p>
                    <p className="text-[8px] text-muted-foreground/40 font-sans tracking-widest uppercase">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
