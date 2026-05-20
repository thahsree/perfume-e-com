import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModalProvider from "@/components/AuthModal";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Niche Perfumes — Immersive Olfactive Storytelling",
  description: "A luxury-grade, editorially-driven online boutique for a curated collection of rare, small-batch fragrances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <AuthModalProvider>
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <CartDrawer />
              </AuthModalProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
