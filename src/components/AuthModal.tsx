"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalContextType {
  isOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export default function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  const openAuthModal = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      const res = await login(email, password);
      if (res.success) {
        closeAuthModal();
      } else {
        setError(res.error || "Login failed.");
      }
    } else {
      if (!name) {
        setError("Name is required.");
        setLoading(false);
        return;
      }
      const res = await register(email, password, name);
      if (res.success) {
        closeAuthModal();
      } else {
        setError(res.error || "Registration failed.");
      }
    }
    setLoading(false);
  };

  const handleGoogleSimulate = async () => {
    setError(null);
    setLoading(true);
    // Simulating one-tap Google login
    const res = await loginWithGoogle(
      "scent.enthusiast@gmail.com",
      "Scent Enthusiast",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
    );
    if (res.success) {
      closeAuthModal();
    } else {
      setError(res.error || "OAuth failed.");
    }
    setLoading(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl glass p-8 shadow-2xl border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-light mb-2 tracking-wide text-foreground">
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </h3>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">
                  Niche Fragrances Curator
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 text-red-200 text-xs rounded-lg text-center font-sans">
                  {error}
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                      <UserIcon size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/40 transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-accent text-accent-foreground font-medium rounded-lg text-sm tracking-wider uppercase hover:opacity-95 disabled:opacity-50 transition-opacity mt-6 font-sans"
                >
                  {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] text-muted-foreground/50 tracking-widest uppercase">
                  Or
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Google OAuth Simulation button */}
              <button
                type="button"
                onClick={handleGoogleSimulate}
                disabled={loading}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-lg text-sm font-sans flex items-center justify-center gap-3 transition-colors mb-6"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Mode toggles */}
              <div className="text-center font-sans text-xs">
                {mode === "signin" ? (
                  <p className="text-muted-foreground">
                    New to the collection?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="text-accent underline hover:text-foreground transition-colors ml-1"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("signin")}
                      className="text-accent underline hover:text-foreground transition-colors ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
