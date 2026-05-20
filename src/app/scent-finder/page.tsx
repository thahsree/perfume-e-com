"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, ChevronRight, RotateCcw, ArrowRight, Eye, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/core/domain/entities";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    sublabel: string;
    value: string; // maps to slug of product
  }[];
}

export default function ScentFinder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [matchingPercentage, setMatchingPercentage] = useState(90);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Products lookup failed:", err);
      }
    }
    loadProducts();
  }, []);

  const questions: Question[] = [
    {
      id: 1,
      text: "Describe your ideal sensory atmosphere.",
      options: [
        {
          label: "A clean minimalist gallery space",
          sublabel: "Neutral tones, silence, and cold transparent window glass.",
          value: "aether",
        },
        {
          label: "A wet forest after heavy rain",
          sublabel: "Crushed green pine needles, damp soil, and ancient tree trunks.",
          value: "terrane",
        },
        {
          label: "A sunlit orange grove by clay walls",
          sublabel: "Zesty warm breeze, spicy dust, and dry amber warmth.",
          value: "sanguine",
        },
        {
          label: "A quiet temple filled with smoked incense",
          sublabel: "Meditative plum blossoms, dark woods, and delicate rising smoke.",
          value: "fleur-japonais",
        },
      ],
    },
    {
      id: 2,
      text: "What is your dominant lifestyle aesthetic?",
      options: [
        {
          label: "Minimalist, precise, modern",
          sublabel: "Structured wool coats, clean linens, and architectural steel.",
          value: "aether",
        },
        {
          label: "Raw, organic, textured",
          sublabel: "Heavy knits, mossy trails, and fireside cabins.",
          value: "terrane",
        },
        {
          label: "Warm, bold, expressive",
          sublabel: "Terracotta tiles, silk scarves, and rich candlelight dinners.",
          value: "sanguine",
        },
        {
          label: "Meditative, mysterious, artistic",
          sublabel: "Lacquer boxes, ink drawings, and velvet twilight.",
          value: "fleur-japonais",
        },
      ],
    },
    {
      id: 3,
      text: "How do you wish to feel when wearing this scent?",
      options: [
        {
          label: "Clean, light, and transparent",
          sublabel: "An extension of your skin, molecular and airy.",
          value: "aether",
        },
        {
          label: "Grounded, quiet, and resilient",
          sublabel: "Connected to soil, wild bark, and primeval nature.",
          value: "terrane",
        },
        {
          label: "Sensual, warm, and magnetic",
          sublabel: "Radiant, spice-fueled, and amber-soaked.",
          value: "sanguine",
        },
        {
          label: "Serene, creative, and complex",
          sublabel: "Introspective, blossom-sweet, and smoky.",
          value: "fleur-japonais",
        },
      ],
    },
  ];

  const handleSelectOption = (value: string) => {
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);

    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Process result
      calculateResult(nextAnswers);
      setStep(4);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    // Tally answers to find the majority slug
    const counts: Record<string, number> = {};
    let maxSlug = finalAnswers[0];
    let maxCount = 0;

    finalAnswers.forEach((slug) => {
      counts[slug] = (counts[slug] || 0) + 1;
      if (counts[slug] > maxCount) {
        maxCount = counts[slug];
        maxSlug = slug;
      }
    });

    const match = products.find((p) => p.slug === maxSlug);
    setMatchedProduct(match || products[0] || null);
    
    // Set random-looking match percentage between 88% and 98%
    const score = 80 + maxCount * 6; 
    setMatchingPercentage(score);
  };

  const handleRestart = () => {
    setAnswers([]);
    setStep(1);
    setMatchedProduct(null);
  };

  const handleAddMatchedToCart = () => {
    if (!matchedProduct || !matchedProduct.variants || matchedProduct.variants.length === 0) return;
    const variant = matchedProduct.variants[0];
    addItem(
      {
        productVariantId: variant.id,
        price: variant.price,
        name: matchedProduct.name,
        size: variant.size,
        image: matchedProduct.imageMain,
        slug: matchedProduct.slug,
        stockLevel: variant.stockLevel,
      },
      1
    );
  };

  const currentQuestion = questions[step - 1];

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-sans px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step <= 3 ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Progress indicator */}
              <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-semibold pb-2 border-b border-border/20">
                <span className="flex items-center gap-1.5 text-accent">
                  <Compass size={14} className="animate-spin-slow" />
                  <span>Scent Matcher</span>
                </span>
                <span>Question {step} of 3</span>
              </div>

              {/* Question Text */}
              <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-foreground">
                {currentQuestion.text}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt.value)}
                    className="p-5 text-left border border-border/60 hover:border-accent bg-black/5 dark:bg-white/[0.01] rounded-2xl transition-all duration-300 group flex justify-between items-center"
                  >
                    <div className="space-y-1 pr-6">
                      <p className="text-sm font-semibold tracking-wide text-foreground group-hover:text-accent transition-colors">
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        {opt.sublabel}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-accent transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            // matched result display
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 0.98 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="glass border border-border/80 rounded-3xl p-8 text-center space-y-8 shadow-2xl"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/15 border border-accent/30 rounded-full text-accent text-[10px] tracking-widest uppercase font-semibold">
                  <Sparkles size={10} />
                  <span>Curation Match: {matchingPercentage}%</span>
                </div>
                <h2 className="text-4xl font-serif font-light text-white tracking-wide">
                  Your Scent Persona
                </h2>
              </div>

              {matchedProduct ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left py-4">
                  
                  {/* Result image container */}
                  <div className="aspect-square rounded-2xl bg-black/25 border border-border/40 flex items-center justify-center p-8">
                    <img
                      src={matchedProduct.imageMain}
                      alt={matchedProduct.name}
                      className="object-contain max-h-48 w-auto hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Result text info */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] tracking-widest text-accent uppercase font-sans font-semibold">
                        {matchedProduct.fragranceFamily} Family
                      </span>
                      <h3 className="text-2xl font-serif text-white font-light tracking-wide mt-1">
                        {matchedProduct.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-serif italic mt-0.5">
                        {matchedProduct.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                      {matchedProduct.description.slice(0, 180)}...
                    </p>

                    <div className="flex gap-3 pt-2 font-sans">
                      <button
                        onClick={handleAddMatchedToCart}
                        className="px-4 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-opacity flex items-center gap-2"
                      >
                        <ShoppingBag size={12} />
                        <span>Add to Cabinet</span>
                      </button>
                      
                      <Link
                        href={`/product/${matchedProduct.slug}`}
                        className="px-4 py-3 border border-border text-foreground hover:bg-white/5 text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye size={12} />
                        <span>View Portrait</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-serif italic">
                  An error occurred locating your persona record.
                </p>
              )}

              {/* Restart control */}
              <div className="border-t border-border/20 pt-6">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-semibold"
                >
                  <RotateCcw size={12} />
                  <span>Restart Analysis</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
