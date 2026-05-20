"use client";

import React, { useState } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubscribed(true);
    setLoading(false);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-black/30 border-t border-border/40 py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Brand Statement */}
        <div className="space-y-4">
          <h4 className="text-xl font-serif font-light tracking-[0.15em] text-foreground">
            MÉMOIRE
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            A curated, olfactive laboratory making each scent a window into memory, landscape, and identity. We reject mass production in favor of editorial-grade craftsmanship.
          </p>
          <div className="flex gap-6 text-[10px] text-muted-foreground/60 tracking-widest uppercase pt-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Kyoto</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Grasse</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Marrakech</span>
          </div>
        </div>

        {/* Right Side: Newsletter signup */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h5 className="text-sm font-serif font-medium text-foreground tracking-wide">
              Subscribe to the Olfactive Journal
            </h5>
            <p className="text-xs text-muted-foreground">
              Pre-launches, limited releases, and essays on scent. Delivered monthly.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="relative max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/50">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-12 py-3.5 bg-black/40 border border-border rounded-lg text-xs tracking-wider uppercase focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/20 transition-colors"
                disabled={subscribed}
              />
              <button
                type="submit"
                disabled={loading || subscribed}
                className="absolute inset-y-1.5 right-1.5 px-3 bg-accent text-accent-foreground rounded-md flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {subscribed ? (
                  <Check size={14} />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>
            
            {subscribed && (
              <p className="absolute left-0 top-full mt-2 text-[10px] text-accent tracking-wider font-sans">
                You have been registered for our next journal edition.
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/40 tracking-widest uppercase gap-4">
        <p>© 2026 MÉMOIRE Perfumeries. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-foreground cursor-pointer transition-colors">Journal</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Exclusives</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
