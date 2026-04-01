/**
 * POST /api/envios/cotizar
 *
 * Lógica PRD 2026:
 * 1. Si subtotal >= umbral (local $100k / nacional $180k) → gratis
 * 2. Si >30kg → calcular bultos, ajustar precio
 * 3. Intentar 99Envíos API (timeout 8s), filtrando carrieros con valor=0
 * 4. Fallback → config Firestore o tarifa plana $18.000 (subsidiada por marca)
 */

import { NextResponse } from 'next/server';
import { cotizarEnvio } from '@/lib/99envios-service';
import { getAdminDB } from '@/lib/firebase-admin';
import {
    isVecinoSoachuno,
    FREE_SHIPPING_LOCAL,
    FREE_SHIPPING_NACIONAL,
    TARIFA_PLANA_NACIONAL,
    TARIFA_LOCAL,
    calcularBultos,
    calcularCostoConBultos,
    PESO_MAX_BULTO_KG,
} from '@/lib/shipping-zones';

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
        envioGratis: FREE_SHIPPING_NACIONAL,
        precioDefault: TARIFA_PLANA_NACIONAL,
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            destinoCodigo,
            destinoNombre,
            subtotal,
            aplicaContrapago = true,
            totalWeightKg = 5, // kg totales del pedido
        } = body;

        if (!destinoCodigo) {
            return NextResponse.json({ error: 'destinoCodigo es requerido' }, { status: 400 });
        }

        // --- Determinar zona y umbral ---
        const esVecino = isVecinoSoachuno(destinoCodigo);
        const umbralGratis = esVecino ? FREE_SHIPPING_LOCAL : FREE_SHIPPING_NACIONAL;
        const tarifaBase = esVecino ? TARIFA_LOCAL : TARIFA_PLANA_NACIONAL;
        const bultos = calcularBultos(totalWeightKg);

        // --- 1. Envío gratis ---
        if (subtotal && subtotal >= umbralGratis) {
            // Si hay múltiples bultos, solo el primero es gratis
            const costoBultos = calcularCostoConBultos(tarifaBase, totalWeightKg, true);
            if (costoBultos.costo === 0) {
                return NextResponse.json({
                    gratis: true,
                    precio: 0,
                    bultos,
                    esVecino,
                    mensaje: `🎁 Envío GRATIS${esVecino ? ' (Zona Vecino Soachuno)' : ''} — compra superior a $${umbralGratis.toLocaleString('es-CO')}`,
                    source: 'free_shipping',
                });
            } else {
                // Primer bulto gratis, adicionales con costo
                return NextResponse.json({
                    gratis: false,
                    precio: costoBultos.costo,
                    bultos,
                    esVecino,
                    primerBultoGratis: true,
                    mensaje: costoBultos.mensajeBulto,
                    source: 'free_partial',
                });
            }
        }

        // --- 2. Intentar 99 Envíos ---
        try {
            const pesoParaCotizar = Math.min(totalWeightKg, PESO_MAX_BULTO_KG);
            const quote = await cotizarEnvio(
                destinoCodigo,
                destinoNombre || '',
                subtotal || 50000,
                aplicaContrapago,
                pesoParaCotizar,
            );

            const costoUnBulto = quote.cheapest.valor + (aplicaContrapago ? quote.cheapest.valor_contrapago : 0);
            const costoBultos = calcularCostoConBultos(costoUnBulto, totalWeightKg, false);

            return NextResponse.json({
                gratis: false,
                precio: costoBultos.costo,
                precioBase: quote.cheapest.valor,
                valorContrapago: quote.cheapest.valor_contrapago,
                transportadora: quote.cheapest.transportadora,
                dias: quote.cheapest.dias,
                fechaEntrega: quote.cheapest.fecha_entrega,
                bultos,
                esVecino,
                mensajeBulto: costoBultos.mensajeBulto,
                source: '99envios',
                cotizaciones: quote.all,
            });
        } catch (enviosError: any) {
            console.warn('[Cotizar] 99 Envíos falló, usando fallback:', enviosError.message);
        }

        // --- 3. Fallback desde Firestore ---
        const config = await getShippingConfig();
        const fallback = getFallbackPrice(destinoCodigo, config);

        if (fallback.sinCobertura) {
            return NextResponse.json({
                sinCobertura: true,
                mensaje: `Lo sentimos, no tenemos cobertura de envío para ${destinoNombre || 'esta ciudad'}. Por favor contáctanos.`,
                source: 'fallback_no_coverage',
            }, { status: 422 });
        }

        const costoBultos = calcularCostoConBultos(fallback.precio, totalWeightKg, false);

        return NextResponse.json({
            gratis: false,
            precio: costoBultos.costo,
            transportadora: null,
            dias: '3-7',
            bultos,
            esVecino,
            mensajeBulto: costoBultos.mensajeBulto,
            source: 'fallback',
            zonaNombre: fallback.zonaNombre,
            // Tooltip subsidio — comunicar valor de marca
            subsidioMensaje: !esVecino
                ? 'En Pajarito subsidiamos parte de tu envío nacional para que ahorres comprando directo de fábrica.'
                : undefined,
            mensaje: '* Precio estimado. El costo exacto se confirma al despachar.',
        });

    } catch (error: any) {
        console.error('[Cotizar] Error:', error);
        return NextResponse.json({
            error: error.message || 'Error al cotizar el envío',
        }, { status: 500 });
    }
}
