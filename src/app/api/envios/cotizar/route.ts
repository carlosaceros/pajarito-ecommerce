import { NextResponse } from 'next/server';
import { cotizarEnvio } from '@/lib/99envios-service';
import { getAdminDB } from '@/lib/firebase-admin';

const CONFIG_DOC_PATH = 'admin_config/shipping';

interface ShippingZone {
    id: string;
    nombre: string;
    cobertura: 'activa' | 'sin_cobertura';
    precio: number;
    ciudades: string[];
}

interface ShippingConfig {
    envioGratis: number;
    precioDefault: number;
    zonas: ShippingZone[];
}

async function getShippingConfig(): Promise<ShippingConfig> {
    try {
        const db = getAdminDB();
        const doc = await db.doc(CONFIG_DOC_PATH).get();
        if (doc.exists) return doc.data() as ShippingConfig;
    } catch (e) {
        console.warn('[Cotizar] Could not read shipping config from Firestore:', e);
    }
    // Hard fallback
    return {
        envioGratis: 100000,
        precioDefault: 18000,
        zonas: [],
    };
}

function getFallbackPrice(destinoCodigo: string, config: ShippingConfig): {
    precio: number;
    sinCobertura: boolean;
    zonaNombre?: string;
} {
    for (const zona of config.zonas) {
        if (zona.ciudades.includes(destinoCodigo)) {
            if (zona.cobertura === 'sin_cobertura') {
                return { precio: 0, sinCobertura: true, zonaNombre: zona.nombre };
            }
            return { precio: zona.precio, sinCobertura: false, zonaNombre: zona.nombre };
        }
    }
    return { precio: config.precioDefault, sinCobertura: false, zonaNombre: 'Precio estándar' };
}

/**
 * POST /api/envios/cotizar
 * Body: { destinoCodigo, destinoNombre, subtotal, aplicaContrapago? }
 *
 * Logic:
 * 1. If subtotal >= envioGratis → free
 * 2. Try 99 Envíos API (with 8s timeout)
 * 3. On failure → use Firestore fallback config
 * 4. If city marked 'sin_cobertura' → return error
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destinoCodigo, destinoNombre, subtotal, aplicaContrapago = true } = body;

        if (!destinoCodigo) {
            return NextResponse.json({ error: 'destinoCodigo es requerido' }, { status: 400 });
        }

        // --- 1. Envío gratis ---
        const config = await getShippingConfig();

        if (subtotal && subtotal >= config.envioGratis) {
            return NextResponse.json({
                gratis: true,
                precio: 0,
                mensaje: `Envío gratis en compras superiores a $${config.envioGratis.toLocaleString('es-CO')}`,
                source: 'free_shipping',
            });
        }

        // --- 2. Intentar 99 Envíos ---
        try {
            const quote = await cotizarEnvio(
                destinoCodigo,
                destinoNombre || '',
                subtotal || 50000,
                aplicaContrapago,
            );

            const total = quote.cheapest.valor + (aplicaContrapago ? quote.cheapest.valor_contrapago : 0);

            return NextResponse.json({
                gratis: false,
                precio: total,
                precioBase: quote.cheapest.valor,
                valorContrapago: quote.cheapest.valor_contrapago,
                transportadora: quote.cheapest.transportadora,
                dias: quote.cheapest.dias,
                fechaEntrega: quote.cheapest.fecha_entrega,
                source: '99envios',
                cotizaciones: quote.all,
            });
        } catch (enviosError: any) {
            console.warn('[Cotizar] 99 Envíos falló, usando fallback:', enviosError.message);
        }

        // --- 3. Fallback desde Firestore ---
        const fallback = getFallbackPrice(destinoCodigo, config);

        if (fallback.sinCobertura) {
            return NextResponse.json({
                sinCobertura: true,
                mensaje: `Lo sentimos, no tenemos cobertura de envío para ${destinoNombre || 'esta ciudad'} (zona: ${fallback.zonaNombre})`,
                source: 'fallback_no_coverage',
            }, { status: 422 });
        }

        return NextResponse.json({
            gratis: false,
            precio: fallback.precio,
            transportadora: null,
            dias: '3-7',
            source: 'fallback',
            zonaNombre: fallback.zonaNombre,
            mensaje: '* Precio estimado. El costo exacto se confirma al despachar.',
        });

    } catch (error: any) {
        console.error('[Cotizar] Error:', error);
        return NextResponse.json({
            error: error.message || 'Error al cotizar el envío',
        }, { status: 500 });
    }
}
