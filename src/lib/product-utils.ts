import { Product } from './products';
import { getAllProducts } from './products-service';
import { Metadata } from 'next';

const BASE_URL = 'https://www.productospajarito.com';

/**
 * Generate SEO-friendly slug from product name
 * Example: "Detergente Ropa" -> "detergente-ropa-industrial"
 */
export function generateProductSlug(id: string, nombre: string): string {
    // Mapeo de IDs a términos descriptivos de alto valor (AEO/SEO) para hogar
    const seoTerms: Record<string, string> = {
        'detergente': 'alto-rendimiento-hogar',
        'desengrasante': 'arranca-grasa-extremo',
        'suavizante': 'maxima-suavidad-aroma',
        'blanqueador': 'desinfeccion-total'
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
export async function getProductBySlug(slug: string): Promise<Product | null> {
    const products = await getAllProducts();
    return products.find(p => {
        const currentSlug = generateProductSlug(p.id, p.nombre);
        
        // Base name without SEO terms to ensure backward compatibility with old URLs
        const baseName = p.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
            
        return currentSlug === slug || slug.startsWith(baseName);
    }) || null;
}

/**
 * Get all product slugs for SSG
 */
export async function getAllProductSlugs(): Promise<string[]> {
    const products = await getAllProducts();
    return products.map(p => generateProductSlug(p.id, p.nombre));
}

/**
 * Generate metadata for product page (Next.js 16 Metadata API)
 * metadataBase is set in layout.tsx so all relative paths resolve correctly.
 */
export function generateProductMetadata(product: Product, size?: string): Metadata {
    const slug = generateProductSlug(product.id, product.nombre);
    const selectedSize = size || '10L';
    const price = product.precios[selectedSize as keyof typeof product.precios] ?? 0;
    const priceNum = parseFloat(selectedSize.replace('L', '').replace('ml', ''));
    const pricePerMl = priceNum > 0 ? (price / priceNum / (selectedSize.endsWith('ml') ? 1 : 1000)).toFixed(2) : '0.00';

    // SEO-optimized title using new fields if available
    const baseTitle = product.seoTitle || `${product.nombre} ${selectedSize} - Rendimiento Superior`;
    const title = `${baseTitle} | Pajarito`;
    
    // SEO-optimized description using new fields if available
    // We add the price information to the provided description to keep the dynamic aspect
    const baseDesc = product.seoDescription || `Calidad industrial segura para tu hogar. ${product.descripcion} ${product.slogan}.`;
    const description = `Compra ${product.nombre} ${selectedSize} a $${price.toLocaleString('es-CO')}. ${baseDesc} Costo por ml: $${pricePerMl}/ml. Envíos Colombia Biocambio360.`;
    
    const absoluteImageUrl = `${BASE_URL}/images/${product.imgFile.replace(/%20/g, ' ')}`;

    return {
        title,
        description,
        keywords: [
            product.nombre.toLowerCase(),
            `${product.nombre.toLowerCase()} hogar`,
            `${product.nombre.toLowerCase()} alto rendimiento`,
            `${product.nombre.toLowerCase()} ${selectedSize}`,
            `${product.nombre.toLowerCase()} seguro`,
            'aseo hogar colombia',
            'productos limpieza premium',
            'pajarito aseo rinde mas',
            slug,
            ...product.beneficios.map(b => b.toLowerCase())
        ],
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'es_CO',
            url: `${BASE_URL}/producto/${slug}`,
            siteName: 'Pajarito - Rinde Más',
            images: [
                {
                    url: absoluteImageUrl,
                    width: 800,
                    height: 800,
                    alt: `${product.nombre} ${selectedSize} - Pajarito Rinde Más`
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [absoluteImageUrl]
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
 * Includes an Offers array with ALL 3 size variants for Google Shopping.
 * NOTE: aggregateRating removed — never fake ratings, Google penalizes this.
 */
export function generateProductSchema(product: Product, size: string = '10L') {
    const slug = generateProductSlug(product.id, product.nombre);
    const absoluteImageUrl = `${BASE_URL}/images/${product.imgFile.replace(/%20/g, ' ')}`;

    // Build one Offer per size variant (better for Google Shopping)
    const sizes: Array<'3.8L' | '10L' | '20L'> = ['3.8L', '10L', '20L'];
    const offers = sizes.map((s) => {
        const price = product.precios[s] ?? 0;
        return {
            "@type": "Offer",
            "url": `${BASE_URL}/producto/${slug}`,
            "priceCurrency": "COP",
            "price": price,
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "name": `${product.nombre} ${s}`,
            "sku": `${product.id.toUpperCase()}-${s.replace('.', '_')}`,
            "seller": {
                "@type": "Organization",
                "name": "Biocambio360 S.A.S."
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "12000",
                    "currency": "COP"
                },
                "freeShippingThreshold": {
                    "@type": "MonetaryAmount",
                    "value": "100000",
                    "currency": "COP"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "CO"
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
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "CO",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 15,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            }
        };
    });

    const additionalProperty = product.especificaciones 
        ? product.especificaciones.map(spec => ({
            "@type": "PropertyValue",
            "name": spec.clave,
            "value": spec.valor
        }))
        : [];

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.seoTitle || `${product.nombre} Hogar`,
        "description": product.seoDescription || product.descripcion,
        "image": absoluteImageUrl,
        "brand": {
            "@type": "Brand",
            "name": "Pajarito"
        },
        "manufacturer": {
            "@type": "Organization",
            "name": "Biocambio360 S.A.S.",
            "url": BASE_URL,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Cra. 7C #44-17 Sur",
                "addressLocality": "Soacha",
                "addressRegion": "Cundinamarca",
                "postalCode": "250001",
                "addressCountry": "CO"
            }
        },
        "sku": product.id.toUpperCase(),
        "category": "Productos de Limpieza Hogar Alto Rendimiento",
        "offers": offers,
        "additionalProperty": additionalProperty.length > 0 ? additionalProperty : undefined
    };
}

/**
 * Generate FAQ Schema for product page
 */
export function generateFAQSchema(product: Product) {
    if (!product.faqs || product.faqs.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": product.faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
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
                "item": BASE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Productos",
                "item": `${BASE_URL}/#catalogo`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.nombre,
                "item": `${BASE_URL}/producto/${slug}`
            }
        ]
    };
}

/**
 * Get related products based on simple logic
 */
export async function getRelatedProducts(currentProductId: string, limit: number = 3): Promise<Product[]> {
    const products = await getAllProducts();
    return products
        .filter(p => p.id !== currentProductId)
        .slice(0, limit);
}
