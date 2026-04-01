import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const BASE_URL = 'https://www.productospajarito.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pajarito - Aseo Industrial a Precio de Fábrica | Biocambio360",
    template: "%s | Pajarito"
  },
  description: "Detergente, Desengrasante, Suavizante y Blanqueador industrial en presentaciones de 3.8L, 10L y 20L. Calidad Biocambio360, directo de fábrica. Envíos a toda Colombia.",
  keywords: [
    "detergente industrial colombia",
    "desengrasante industrial granel",
    "productos aseo por mayor",
    "aseo granel colombia",
    "blanqueador industrial",
    "suavizante ropa por mayor",
    "Biocambio360",
    "pajarito aseo"
  ],
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: '/favicon.png',
  },
  verification: {
    google: ["D8korwn8MSRpH3qaGd1j5outfbLxO_WUtxe7Ok8vhz8", "htb2Q-eSNiKBROAxC3B3cERhsIdD7VD3qWmeUs8vYVw"],
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: BASE_URL,
    siteName: "Pajarito - Aseo Industrial",
    title: "Pajarito - Aseo Industrial a Precio de Fábrica",
    description: "Detergente, Desengrasante, Suavizante y Blanqueador industrial. Envíos a toda Colombia.",
    images: [
      {
        url: `${BASE_URL}/images/og-pajarito.png`,
        width: 1200,
        height: 630,
        alt: "Pajarito Aseo Industrial - Biocambio360"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pajarito - Aseo Industrial a Precio de Fábrica",
    description: "Detergente, Desengrasante, Suavizante y Blanqueador industrial. Envíos a toda Colombia.",
    images: [`${BASE_URL}/images/og-pajarito.png`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  alternates: {
    canonical: BASE_URL,
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Biocambio360 S.A.S.",
  "alternateName": "Pajarito",
  "url": BASE_URL,
  "logo": `${BASE_URL}/images/logo.png`,
  "description": "Fabricantes de productos de aseo industrial en Colombia. Línea Pajarito: Detergente, Desengrasante, Blanqueador y Suavizante industial.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Cra. 7C #44-17 Sur",
    "addressLocality": "Soacha",
    "addressRegion": "Cundinamarca",
    "postalCode": "250001",
    "addressCountry": "CO"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": "Spanish",
    "areaServed": "CO"
  },
  "sameAs": []
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
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

