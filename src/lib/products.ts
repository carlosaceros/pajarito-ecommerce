// Product data types and constants
export interface FAQ {
    q: string;
    a: string;
}

/**
 * Todos los tamaños disponibles en la plataforma.
 * Los "extra" (250ml, 500ml, 1L) aplican solo a algunos productos.
 */
export type ProductSize = '1L' | '3.8L' | '10L' | '20L';

export interface Product {
    id: string;
    nombre: string;
    slogan: string;
    descripcion: string;
    imgFile: string;
    imgFileSmall?: string;
    beneficios: string[];
    badge: string;
    color: string;
    faqs: FAQ[];
    precios: Partial<Record<ProductSize, number>>;
    competidorPromedio: Partial<Record<ProductSize, number>>;
    /** Peso aproximado en kg por cada tamaño, para calcular bultos */
    pesos?: Partial<Record<ProductSize, number>>;
}

/** Orden canónico de tamaños en la UI */
export const SIZE_ORDER: ProductSize[] = ['1L', '3.8L', '10L', '20L'];

/** Peso exacto en kg por tamaño (líquidos de densidad ≈1 kg/L) */
export const PESOS_POR_TALLA: Record<ProductSize, number> = {
    '1L': 1.0,
    '3.8L': 3.8,
    '10L': 10.0,
    '20L': 20.0,
};

export const PRODUCTOS: Product[] = [
    {
        id: 'detergente',
        nombre: 'Detergente Ropa',
        slogan: 'Cuida el color y tu bolsillo',
        descripcion: 'Fórmula concentrada industrial. Protege las fibras de ropa blanca y color. Rinde el doble gracias a su viscosidad optimizada.',
        imgFile: 'PAJARITO_DETERGENTE%20ROPA_10L.png',
        imgFileSmall: 'PAJARITO_DETERGENTE ROPA Galón.webp',
        beneficios: ['Protección Color', 'pH Neutro', 'Baja Espuma (Ahorra agua)'],
        badge: 'MÁS VENDIDO',
        color: 'bg-blue-600',
        faqs: [
            { q: '¿Sirve para lavadora frontal?', a: 'Sí, nuestra fórmula de baja espuma protege los sensores de lavadoras HE (Alta Eficiencia) y carga frontal.' },
            { q: '¿Necesito usar suavizante?', a: 'El detergente limpia profundamente, pero recomendamos usar nuestro Suavizante Textil para restaurar la suavidad de las fibras.' },
            { q: '¿Es biodegradable?', a: 'Totalmente. Nuestros tensoactivos se degradan en menos de 28 días según norma OECD 301D, siendo seguros para vertimientos.' },
            { q: '¿Cuál es la dosificación correcta?', a: 'Para una carga completa (15kg) de ropa muy sucia, use 100ml. Para suciedad normal, 60ml son suficientes.' }
        ],
        // Catálogo 2026 — PRD Logística Pajarito
        precios: {
            '1L': 10_000,
            '3.8L': 27_000,
            '10L': 43_000,
            '20L': 63_000,
        },
        competidorPromedio: {
            '1L': 16_000,
            '3.8L': 38_000,
            '10L': 58_000,
            '20L': 86_000,
        },
    },
    {
        id: 'suavizante',
        nombre: 'Suavizante Textil',
        slogan: 'Suavidad que enamora',
        descripcion: 'Microcápsulas de aroma importado que perduran en las fibras. Facilita el planchado y elimina la estática.',
        imgFile: 'PAJARITO_SUAVIZANTE_10L.png',
        imgFileSmall: 'PAJARITO_SUAVIZANTE Galón.webp',
        beneficios: ['Fácil Planchado', 'Aroma 48h', 'Desemreda Fibras'],
        badge: 'AROMA PREMIUM',
        color: 'bg-pink-500',
        faqs: [
            { q: '¿Mancha la ropa?', a: 'No. Nuestra fórmula "Cero-Grasa" hidrata la fibra sin dejar residuos aceitosos que manchan la ropa oscura.' },
            { q: '¿Qué aroma es?', a: 'Floral-Oceánico con tecnología de microcápsulas que liberan aroma por fricción hasta por 48 horas.' },
            { q: '¿Es hipoalergénico?', a: 'Formulado para minimizar riesgos de alergia, libre de colorantes agresivos. Apto para ropa de bebé.' }
        ],
        // Catálogo 2026 — PRD Logística Pajarito
        precios: {
            '1L': 10_000,
            '3.8L': 27_000,
            '10L': 43_000,
            '20L': 63_000,
        },
        competidorPromedio: {
            '1L': 17_000,
            '3.8L': 38_000,
            '10L': 58_000,
            '20L': 85_000,
        },
    },
    {
        id: 'blanqueador',
        nombre: 'Blanqueador',
        slogan: 'Blancura sin dañar',
        descripcion: 'Hipoclorito de sodio estabilizado. Desinfección hospitalaria para baños, pisos y ropa blanca percudida.',
        imgFile: 'PAJARITO_BLANQUEADOR%2010L.png',
        imgFileSmall: 'PAJARITO_BLANQUEADOR Galón.webp',
        beneficios: ['Desinfección 99.9%', 'Blancura Total', 'Estabilizado'],
        badge: 'ECONÓMICO',
        color: 'bg-teal-500',
        faqs: [
            { q: '¿Qué concentración tiene?', a: 'Hipoclorito de Sodio al 5.25% a la salida de fábrica. Estabilizado para durar más tiempo activo.' },
            { q: '¿Sirve para purificar agua?', a: 'Sí. Aplique 4 gotas por litro de agua clara, espere 30 minutos. Elimina 99.9% de bacterias y virus.' },
            { q: '¿Daña la ropa blanca?', a: 'El uso excesivo puede amarillentar. Use la dosis recomendada (1/2 taza por carga) para mantener el blanco brillante.' },
            { q: '¿Se puede mezclar con otros productos?', a: 'PELIGRO: NUNCA mezcle blanqueador con desengrasantes, ácidos o amoníaco. Libera gases tóxicos.' }
        ],
        // Catálogo 2026 — PRD Logística Pajarito
        precios: {
            '3.8L': 17_000,
            '10L': 36_000,
            '20L': 53_000,
        },
        competidorPromedio: {
            '3.8L': 24_000,
            '10L': 42_000,
            '20L': 68_000,
        },
    },
    {
        id: 'desengrasante',
        nombre: 'Desengrasante Rojo',
        slogan: 'Arranca grasa al instante',
        descripcion: 'El terror de la grasa. Fórmula activa para cocinas industriales, motores, pisos de taller y juntas de cerámica.',
        imgFile: 'PAJARITO_DESENGRASANTE%20ROJO_10L.png',
        imgFileSmall: 'PAJARITO_DESENGRASANTE galón_octubre 2025.webp',
        beneficios: ['Multiusos Potente', 'Acción Inmediata', 'Biodegradable'],
        badge: 'PODER TOTAL',
        color: 'bg-red-600',
        faqs: [
            { q: '¿Daña el aluminio?', a: 'El producto es alcalino. Para aluminio o teflón, diluir 1 parte de producto en 5 de agua y enjuagar rápido.' },
            { q: '¿Sirve para ropa?', a: 'Excelente para cuellos y puños o grasa mecánica en overoles. Aplicar directo 5 min antes del lavado.' },
            { q: '¿Tiene registro sanitario?', a: 'Sí, cumplimos con normatividad INVIMA para productos de aseo industrial y doméstico línea desengrasante.' },
            { q: '¿Quita cochambre de estufas?', a: 'Es su especialidad. Aplique puro sobre la plancha o estufa caliente (60°C), deje actuar 10 min y retire con esponja.' }
        ],
        // Catálogo 2026 — PRD Logística Pajarito
        precios: {
            '3.8L': 27_000,
            '10L': 43_000,
            '20L': 63_000,
        },
        competidorPromedio: {
            '3.8L': 42_000,
            '10L': 68_000,
            '20L': 98_000,
        },
    }
];

// Helper function: Calculate savings
export interface SavingsData {
    nuestroPrecioML: string;
    ahorroPorcentaje: number;
    ahorroDinero: number;
    mostrarFOMO: boolean;
}

export const calcularAhorro = (
    precioNuestro: number,
    volumen: string,
    competidorPrecioAbsoluto: number
): SavingsData => {
    // Normalizar volumen a ml para calcular precio/ml
    const volumenML = volumenToML(volumen);
    const nuestroPrecioML = volumenML > 0 ? precioNuestro / volumenML : 0;

    // Safety check in case the competitor price is missing or 0
    if (!competidorPrecioAbsoluto || competidorPrecioAbsoluto <= precioNuestro) {
        return {
            nuestroPrecioML: nuestroPrecioML.toFixed(2),
            ahorroPorcentaje: 0,
            ahorroDinero: 0,
            mostrarFOMO: false
        };
    }

    const ahorroDinero = competidorPrecioAbsoluto - precioNuestro;
    const ahorroPorcentaje = (ahorroDinero / competidorPrecioAbsoluto) * 100;

    return {
        nuestroPrecioML: nuestroPrecioML.toFixed(2),
        ahorroPorcentaje: Math.round(ahorroPorcentaje),
        ahorroDinero: Math.round(ahorroDinero),
        mostrarFOMO: ahorroDinero > 0
    };
};

/** Convierte un string de tamaño a mililitros */
function volumenToML(volumen: string): number {
    if (volumen.endsWith('ml')) return parseFloat(volumen);
    if (volumen.endsWith('L')) return parseFloat(volumen) * 1000;
    return parseFloat(volumen) * 1000; // fallback
}

// Format currency helper
export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);
};
