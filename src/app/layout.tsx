import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pajarito - Aseo Industrial a Precio de Fábrica",
  description: "Detergente, Desengrasante, Suavizante y Blanqueador. Directo de fábrica BioCambio 360. Envíos a toda Colombia.",
  keywords: ["detergente industrial", "aseo granel", "productos limpieza", "Colombia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
