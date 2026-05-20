"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Product } from "@/core/domain/entities";

export default function Collection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [intensityFilter, setIntensityFilter] = useState<number | "all">("all");
  const [limitedOnly, setLimitedOnly] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Compute available families for filters
  const families = ["all", ...Array.from(new Set(products.map((p) => p.fragranceFamily)))];

  // Apply filters
  const filteredProducts = products.filter((product) => {
    const matchesFamily = familyFilter === "all" || product.fragranceFamily === familyFilter;
    const matchesIntensity = intensityFilter === "all" || product.intensity === intensityFilter;
    const matchesLimited = !limitedOnly || product.limited;
    return matchesFamily && matchesIntensity && matchesLimited;
  });

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Page Title & Slogan */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent font-semibold">
            THE CATALOGUE
          </p>
          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-wide text-foreground">
            Olfactive Archetypes
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-light leading-relaxed">
            A small-batch, deliberately limited selection of olfactive landscapes. Formulated to be explored slowly, not browsed impulsively.
          </p>
        </div>

        {/* Filters and Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start pt-6">
          
          {/* Filters (Desktop Sidebar) */}
          <aside className="hidden lg:block space-y-8 p-6 rounded-2xl border border-border/40 bg-black/5 dark:bg-white/[0.01]">
            <div className="flex items-center gap-2 pb-4 border-b border-border/20 text-foreground">
              <SlidersHorizontal size={16} />
              <h3 className="text-sm font-semibold tracking-wider uppercase">Filters</h3>
            </div>

            {/* Scent Family Filters */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Scent Family</h4>
              <div className="flex flex-col gap-2">
                {families.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(fam)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg tracking-wider uppercase transition-colors ${
                      familyFilter === fam
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fam === "all" ? "All Families" : fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Filters */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Intensity Rating</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIntensityFilter("all")}
                  className={`text-xs py-1.5 px-3 rounded-lg uppercase tracking-wider transition-colors ${
                    intensityFilter === "all"
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground border border-border hover:border-foreground"
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensityFilter(level)}
                    className={`text-xs py-1.5 px-3.5 rounded-lg font-mono transition-colors ${
                      intensityFilter === level
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground border border-border hover:border-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Limited Edition Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Limited Editions
              </span>
              <button
                onClick={() => setLimitedOnly(!limitedOnly)}
                className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                  limitedOnly ? "bg-accent" : "bg-black/40 border border-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    limitedOnly ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </aside>

          {/* Mobile Filter Action and Sidebar */}
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-black/10 border border-border rounded-xl text-xs tracking-wider uppercase font-semibold text-foreground"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[4/5] bg-black/10 rounded-2xl" />
                    <div className="h-4 bg-black/10 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-2xl p-8">
                <Sparkles size={24} className="text-accent" />
                <p className="text-sm font-serif italic text-muted-foreground">
                  No matching fragrances found. Shift your filter criteria.
                </p>
                <button
                  onClick={() => {
                    setFamilyFilter("all");
                    setIntensityFilter("all");
                    setLimitedOnly(false);
                  }}
                  className="text-xs text-accent underline hover:text-foreground font-semibold uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="group"
                    >
                      <Link href={`/product/${product.slug}`} className="block space-y-4">
                        <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border/40 relative flex items-center justify-center p-12 bg-black/5 dark:bg-white/[0.01] hover:border-accent/40 transition-all duration-500 shadow-sm">
                          {/* Scent Theme background color on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                            style={{ backgroundColor: product.themeColor || "#fff" }}
                          />

                          <img
                            src={product.imageMain}
                            alt={product.name}
                            className="object-contain max-h-72 w-auto group-hover:scale-105 transition-transform duration-700"
                          />

                          {product.limited && (
                            <span className="absolute top-6 left-6 px-2.5 py-1 bg-accent text-accent-foreground text-[8px] font-sans font-bold tracking-widest uppercase rounded">
                              Limited Edition
                            </span>
                          )}

                          {/* Quick details hover tag */}
                          <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                            <div className="p-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-center">
                              <span className="text-[10px] text-accent tracking-widest uppercase font-semibold">
                                View Details & notes
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Text Label */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-xl font-serif font-light text-foreground group-hover:text-accent transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-sans font-medium">
                              From ${product.variants?.[0]?.price || "120.00"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-sans">
                            <span className="italic truncate max-w-[200px]">{product.tagline}</span>
                            <span className="font-semibold tracking-wider uppercase text-[9px] text-accent font-sans">
                              {product.fragranceFamily}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filters overlay */}
      <AnimatePresence>
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersMobile(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-xs bg-card text-card-foreground border-l border-border p-6 flex flex-col h-full space-y-8"
              >
                <div className="flex justify-between items-center pb-4 border-b border-border/20">
                  <h3 className="text-sm font-semibold tracking-wider uppercase">Filters</h3>
                  <button onClick={() => setShowFiltersMobile(false)}>
                    <X size={18} />
                  </button>
                </div>

                {/* Scent Family Filters Mobile */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Family</h4>
                  <div className="flex flex-col gap-2">
                    {families.map((fam) => (
                      <button
                        key={fam}
                        onClick={() => {
                          setFamilyFilter(fam);
                          setShowFiltersMobile(false);
                        }}
                        className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${
                          familyFilter === fam ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {fam === "all" ? "All Families" : fam}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Filters Mobile */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Intensity</h4>
                  <div className="flex flex-wrap gap-2">
                    {["all", 1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setIntensityFilter(level as any);
                          setShowFiltersMobile(false);
                        }}
                        className={`text-xs py-1.5 px-3 rounded-lg transition-colors ${
                          intensityFilter === level ? "bg-accent text-accent-foreground" : "text-muted-foreground border border-border"
                        }`}
                      >
                        {level === "all" ? "All" : level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limited Mobile Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                    Limited Editions
                  </span>
                  <button
                    onClick={() => {
                      setLimitedOnly(!limitedOnly);
                      setShowFiltersMobile(false);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                      limitedOnly ? "bg-accent" : "bg-black/40 border border-border"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        limitedOnly ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
