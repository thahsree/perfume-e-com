"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuthModal } from "@/components/AuthModal";
import {
  ShoppingBag,
  Sun,
  Moon,
  User,
  Compass,
  Layers,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { openAuthModal } = useAuthModal();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change / resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navBg = scrolled || mobileMenuOpen
    ? "bg-background/95 backdrop-blur-md border-border/40 shadow-sm"
    : "bg-transparent border-transparent";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${navBg}`}
      >
        {/* ─── Single unified bar ─────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative">

          {/* ── LEFT: Hamburger (mobile) | Nav links (desktop) ── */}
          <div className="flex items-center">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Nav links — desktop only */}
            <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase font-sans">
              <Link
                href="/collection"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Layers size={14} />
                <span>The Collection</span>
              </Link>
              <Link
                href="/scent-finder"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Compass size={14} />
                <span>Scent Finder</span>
              </Link>
            </div>
          </div>

          {/* ── CENTER: Brand name (absolute on desktop, in-flow on mobile via flex) ── */}
          {/*
            Desktop: absolute so it stays perfectly centred regardless of
            the asymmetric widths of left/right groups.
            Mobile: static, centred by absolute+translate trick relative to the bar.
          */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <Link href="/" className="pointer-events-auto" onClick={() => setMobileMenuOpen(false)}>
              <h1 className="text-xl md:text-3xl font-serif font-light tracking-[0.2em] text-foreground hover:opacity-90 transition-opacity whitespace-nowrap">
                MÉMOIRE
              </h1>
              <p className="text-[7px] md:text-[8px] tracking-[0.3em] text-muted-foreground uppercase mt-0.5 hidden md:block">
                {"L'Art de l'Olfactive"}
              </p>
            </Link>
          </div>

          {/* ── RIGHT: Action icons (always visible) ── */}
          <div className="flex items-center gap-1 md:gap-3 font-sans">
            {/* Day/Night toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Account — icon only on mobile */}
            {user ? (
              <div className="relative group">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/account"}
                  className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-accent/40"
                    />
                  ) : (
                    <User size={18} />
                  )}
                  <span className="text-xs tracking-wider font-sans font-medium hidden lg:inline max-w-[80px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>

                {/* Hover dropdown — desktop only */}
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                  <div className="glass border border-border/80 rounded-xl p-2 min-w-[130px] shadow-lg">
                    <Link
                      href={user.role === "ADMIN" ? "/admin" : "/account"}
                      className="block px-3 py-1.5 text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-wider uppercase text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-950/20"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Account Login"
              >
                <User size={18} />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="Open Cart"
            >
              <ShoppingBag size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── Mobile slide-down menu ─────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border/20"
            >
              <div className="px-6 py-5 flex flex-col gap-4 font-sans">
                <Link
                  href="/collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <Layers size={16} className="text-accent" />
                  <span>The Collection</span>
                </Link>

                <Link
                  href="/scent-finder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <Compass size={16} className="text-accent" />
                  <span>Scent Finder</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-border/20 pt-4 flex flex-col gap-3">
                  {user ? (
                    <>
                      <Link
                        href={user.role === "ADMIN" ? "/admin" : "/account"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-1"
                      >
                        <User size={16} className="text-accent" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 text-sm tracking-widest uppercase text-red-400 hover:text-red-300 transition-colors py-1 text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-1 text-left"
                    >
                      <User size={16} className="text-accent" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
