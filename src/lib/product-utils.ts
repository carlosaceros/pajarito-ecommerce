import { Product, PRODUCTOS } from './products';
import { Metadata } from 'next';

/**
 * Generate SEO-friendly slug from product name
 * Example: "Detergente Ropa" -> "detergente-ropa-industrial"
 */
export function generateProductSlug(id: string, nombre: string): string {
    // Mapeo de IDs a términos descriptivos adicionales para SEO
    const seoTerms: Record<string, string> = {
        'detergente': 'industrial',
        'desengrasante': 'multiusos',
        'suavizante': 'textil-ropa',
        'blanqueador': 'desinfectante'
    };

    const baseName = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const seoTerm = seoTerms[id] || '';

    return seoTerm ? `${baseName}-${seoTerm}` : baseName;
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | null {
    return PRODUCTOS.find(p => generateProductSlug(p.id, p.nombre) === slug) || null;
}

/**
 * Get all product slugs for SSG
 */
export function getAllProductSlugs(): string[] {
    return PRODUCTOS.map(p => generateProductSlug(p.id, p.nombre));
}

/**
 * Generate metadata for product page (Next.js 16 Metadata API)
 */
export function generateProductMetadata(product: Product, size?: string): Metadata {
    const slug = generateProductSlug(product.id, product.nombre);
    const selectedSize = size || '10L';
    const price = product.precios[selectedSize as keyof typeof product.precios];
    const pricePerMl = (price / parseFloat(selectedSize.replace('L', '')) / 1000).toFixed(2);

    // SEO-optimized title with long-tail keywords
    const title = `${product.nombre} ${selectedSize} Industrial - $${price.toLocaleString('es-CO')} | Pajarito`;
    const description = `${product.descripcion} • Precio x mililitro: $${pricePerMl}/ml • ${product.slogan} • Calidad industrial BioCambio 360 • Envíos toda Colombia con 99Envíos.`;

    return {
        title,
        description,
        keywords: [
            product.nombre.toLowerCase(),
            `${product.nombre.toLowerCase()} industrial`,
            `${product.nombre.toLowerCase()} ${selectedSize}`,
            'aseo granel colombia',
            'productos limpieza por mayor',
            'biocambio 360',
            'pajarito aseo',
            slug,
            ...product.beneficios.map(b => b.toLowerCase())
        ],
        openGraph: {
            title,
            description,
            images: [
                {
                    url: `/images/${product.imgFile}`,
                    width: 800,
                    height: 800,
                    alt: `${product.nombre} ${selectedSize} Industrial - Pajarito`
                }
            ],
            locale: 'es_CO',
            siteName: 'Pajarito - Aseo Industrial'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`/images/${product.imgFile}`]
        },
        alternates: {
            canonical: `/producto/${slug}`
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        }
    };
}

/**
 * Generate Product Schema (Schema.org Product)
 */
export function generateProductSchema(product: Product, size: string = '10L') {
    const slug = generateProductSlug(product.id, product.nombre);
    const price = product.precios[size as keyof typeof product.precios];

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${product.nombre} ${size} Industrial`,
        "description": product.descripcion,
        "image": `/images/${product.imgFile}`,
        "brand": {
            "@type": "Brand",
            "name": "Pajarito",
            "manufacturer": {
                "@type": "Organization",
                "name": "BioCambio 360 S.A.S.",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Cra. 7C #44-17 Sur",
                    "addressLocality": "Soacha",
                    "addressRegion": "Cundinamarca",
                    "addressCountry": "CO"
                }
            }
        },
        "offers": {
            "@type": "Offer",
            "url": `https://pajarito.com/producto/${slug}`,
            "priceCurrency": "COP",
            "price": price,
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "BioCambio 360 S.A.S."
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "12000",
                    "currency": "COP"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 2,
                        "unitCode": "DAY"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 2,
                        "maxValue": 5,
                        "unitCode": "DAY"
                    }
                }
            }
        },
        "sku": product.id.toUpperCase(),
        "category": "Productos de Limpieza Industrial",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
        }
    };
}

/**
 * Generate Breadcrumb Schema
 */
export function generateBreadcrumbSchema(product: Product) {
    const slug = generateProductSlug(product.id, product.nombre);

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://pajarito.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Productos",
                "item": "https://pajarito.com/#catalogo"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.nombre,
                "item": `https://pajarito.com/producto/${slug}`
            }
        ]
    };
}

/**
 * Get related products based on simple logic
 */
export function getRelatedProducts(currentProductId: string, limit: number = 3): Product[] {
    return PRODUCTOS
        .filter(p => p.id !== currentProductId)
        .slice(0, limit);
}
