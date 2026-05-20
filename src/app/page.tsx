"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Heart } from "lucide-react";
import { Product } from "@/core/domain/entities";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Ambient Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=2000&q=80')",
            filter: "brightness(0.35) contrast(1.1)",
          }}
        />

        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/75 z-1" />

        {/* Hero Text */}
        <div className="relative z-10 text-center max-w-4xl px-6 space-y-8 select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-accent font-sans font-semibold">
              MÉMOIRE PERFUMES
            </p>
            <h1 className="text-5xl md:text-8xl font-serif font-extralight tracking-widest text-white leading-tight">
              Olfactive Poetry
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="text-xs md:text-sm font-light text-white/70 max-w-xl mx-auto leading-relaxed tracking-wide font-sans"
          >
            We compose small-batch liquid memories. No generic accords, no synthetic excesses. Just pure organic extractions made to resonate with your personal identity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6 font-sans"
          >
            <Link
              href="/collection"
              className="px-8 py-4 bg-white text-black font-semibold text-xs tracking-widest uppercase rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/scent-finder"
              className="px-8 py-4 bg-white/10 text-white font-semibold text-xs tracking-widest uppercase rounded-lg hover:bg-white/15 border border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-xs"
            >
              <Compass size={14} className="text-accent animate-spin-slow" />
              <span>Find Scent Persona</span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-[9px] tracking-widest uppercase font-sans animate-bounce">
          <span>Scroll</span>
          <div className="w-[1px] h-8 bg-white/30" />
        </div>
      </section>

      {/* Brand Statement / Philosophy */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-light tracking-wide text-foreground leading-snug">
              "A fragrance should not announce your arrival. It should whisper of your presence after you leave."
            </h2>
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
              — Jacques Valois, Lead Curator
            </p>
          </div>
          <div className="space-y-4 pt-4 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
            <p>
              Traditional e-commerce designs force consumers through grids of identical, plastic-wrapped bottles. We believe a perfume is a personal atmosphere.
            </p>
            <p>
              By restricting our catalog to only 4 key personas, each fragrance is treated with editorial weight, combining poetry, origin soil history, and distinct visual themes.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Matcher Promo Banner */}
      <section className="my-12 px-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative py-20 px-8 md:px-16 flex flex-col items-start justify-center min-h-[400px] border border-white/10 glass shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-right bg-no-repeat -z-1 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] tracking-widest uppercase font-sans">
              <Sparkles size={12} />
              <span>Olfactive Matching Engine</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-serif font-light text-white tracking-wide">
              Which persona is yours?
            </h3>
            <p className="text-xs md:text-sm text-white/70 font-sans leading-relaxed">
              Answer 3 simple questions about your atmosphere preferences, preferred seasons, and mood contexts, and let our curator algorithms select your olfactory match.
            </p>
            <Link
              href="/scent-finder"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-accent text-accent-foreground font-sans font-semibold text-xs tracking-widest uppercase rounded-lg hover:opacity-95 transition-opacity"
            >
              <span>Begin Scent Test</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Collection */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.3em] text-accent uppercase font-sans font-semibold">
              THE PORTFOLIO
            </p>
            <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground tracking-wide">
              The Signature Fragrances
            </h3>
          </div>
          <Link
            href="/collection"
            className="text-xs font-sans font-semibold tracking-widest uppercase border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors hidden md:block"
          >
            View Complete Catalog
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[4/5] bg-black/10 rounded-2xl border border-white/5" />
                <div className="h-4 bg-black/10 rounded w-2/3" />
                <div className="h-3 bg-black/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative"
              >
                {/* Product Card container */}
                <Link href={`/product/${product.slug}`} className="block space-y-4">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border/40 relative flex items-center justify-center p-8 bg-black/5 dark:bg-white/[0.02] hover:border-accent/40 transition-all duration-500 shadow-sm">
                    {/* Theme color gradient on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                      style={{ backgroundColor: product.themeColor || "#fff" }}
                    />
                    <img
                      src={product.imageMain}
                      alt={product.name}
                      className="object-contain max-h-60 w-auto group-hover:scale-105 transition-transform duration-700"
                    />

                    {product.limited && (
                      <span className="absolute top-4 left-4 px-2 py-1 bg-accent text-accent-foreground text-[8px] font-sans font-bold tracking-widest uppercase rounded">
                        LTD Edition
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-lg font-serif font-light text-foreground group-hover:text-accent transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-sans font-medium">
                        From ${product.variants?.[0]?.price || "120.00"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans italic truncate">
                      {product.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
