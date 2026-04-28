/**
 * POST /api/envios/cotizar
 *
 * Lógica PRD 2026:
 * 1. Vecinos Soachunos: Lógica de subsidio universal (no hay umbral de gratis)
 * 2. Nacional: Lógica de subsidio universal
 * 3. Intentar 99Envíos API (timeout 8s)
 * 4. Fallback → Promedio histórico (desde 27 Abril), luego config Firestore o tarifa plana $35.000
 * 5. Subsidio de marca: se aplica siempre; si el resultado es 0 o menos, el envío es GRATIS.
 * 
 * Logs de auditoría escritos a Firestore: shipping_audit_logs
 */

import { NextResponse } from 'next/server';
import { cotizarEnvio } from '@/lib/99envios-service';
import { getAdminDB } from '@/lib/firebase-admin';
import {
    isVecinoSoachuno,
    FREE_SHIPPING_LOCAL,
    TARIFA_PLANA_NACIONAL,
    TARIFA_LOCAL,
    calcularBultos,
    calcularCostoConBultos,
    PESO_MAX_BULTO_KG,
    calcularSubsidio,
} from '@/lib/shipping-zones';

const CONFIG_DOC_PATH = 'admin_config/shipping';
const LOGS_COLLECTION = 'shipping_audit_logs';

// Precio mínimo que se cobra en envíos nacionales (ajustado a 0 por PRD 27 ABRIL)
const PRECIO_MINIMO_NACIONAL = 0;

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
    tarifasSubsidio?: Record<string, number>;
}

// Quote Cache Interfaces
interface QuoteCacheData {
    destinoCodigo: string;
    valor: number;
    valor_contrapago: number;
    transportadora: string;
    dias: string;
    updatedAt: string;
}
const QUOTES_CACHE_COLLECTION = 'shipping_quotes_cache';

async function getShippingConfig(): Promise<ShippingConfig> {
    try {
        const db = getAdminDB();
        const doc = await db.doc(CONFIG_DOC_PATH).get();
        if (doc.exists) return doc.data() as ShippingConfig;
    } catch (e) {
        console.warn('[Cotizar] Could not read shipping config from Firestore:', e);
    }
    return {
        envioGratis: Infinity,
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

/**
 * Calcula el promedio de costo por bulto para un destino basado en logs desde el 27 de abril de 2026.
 */
async function getHistoricalAveragePrice(destinoCodigo: string): Promise<number | null> {
    try {
        const db = getAdminDB();
        // Filtrar logs desde el 27 de abril de 2026 a las 00:00
        const minDate = '2026-04-27T00:00:00Z';
        
        const snapshot = await db.collection(LOGS_COLLECTION)
            .where('destinoCodigo', '==', destinoCodigo)
            .where('source', '==', '99envios')
            .where('timestamp', '>=', minDate)
            .limit(10) // Suficiente para un promedio reciente
            .get();

        if (snapshot.empty) return null;

        let total = 0;
        let count = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (typeof data.costoUnBulto === 'number') {
                total += data.costoUnBulto;
                count++;
            }
        });

        return count > 0 ? Math.round(total / count) : null;
    } catch (e) {
        console.warn('[Cotizar] Error al calcular promedio histórico:', e);
        return null;
    }
}

/** Escribe log de auditoría en Firestore (no bloquea la respuesta) */
async function writeAuditLog(log: Record<string, unknown>) {
    try {
        const db = getAdminDB();
        await db.collection(LOGS_COLLECTION).add({
            ...log,
            timestamp: new Date().toISOString(),
        });
    } catch (e) {
        console.warn('[Cotizar] No se pudo escribir log de auditoría:', e);
    }
}

export async function POST(request: Request) {
    const startTime = Date.now();
    let auditLog: Record<string, unknown> = {};

    try {
        const body = await request.json();
        const {
            destinoCodigo,
            destinoNombre,
            subtotal,
            aplicaContrapago = true,
            totalWeightKg = 5,
        } = body;

        if (!destinoCodigo) {
            return NextResponse.json({ error: 'destinoCodigo es requerido' }, { status: 400 });
        }

        const esVecino = isVecinoSoachuno(destinoCodigo);
        const bultos = calcularBultos(totalWeightKg);
        const config = await getShippingConfig();
        const subsidioDescuento = calcularSubsidio(totalWeightKg, config.tarifasSubsidio);

        auditLog = {
            destinoCodigo,
            destinoNombre: destinoNombre || '',
            subtotal: subtotal || 0,
            totalWeightKg,
            bultos,
            aplicaContrapago,
            esVecino,
            subsidioDescuento,
            source: 'unknown',
        };

        // ── 1. Envío gratis (Desactivado por PRD 27 Abril - Todo pasa por subsidio) ──
        /* 
        if (esVecino && subtotal && subtotal >= FREE_SHIPPING_LOCAL) {
            ...
        } 
        */

        // ── 2. Intentar 99 Envíos ─────────────────────────────────────────────
        let api99Error: string | null = null;
        let api99Raw: Record<string, unknown> | null = null;

        try {
            const pesoParaCotizar = Math.min(totalWeightKg, PESO_MAX_BULTO_KG);
            const quote = await cotizarEnvio(
                destinoCodigo,
                destinoNombre || '',
                subtotal || 50000,
                aplicaContrapago,
                pesoParaCotizar,
            );

            api99Raw = quote.all as unknown as Record<string, unknown>;

            const costoUnBulto = quote.cheapest.valor + (aplicaContrapago ? quote.cheapest.valor_contrapago : 0);
            const costoBultos = calcularCostoConBultos(costoUnBulto, totalWeightKg, false);

            // El precio final descuenta el subsidio. Si es <= 0, es gratis.
            let precioFinal = Math.max(0, costoBultos.costo - subsidioDescuento);

            // El subsidio aplicado es la diferencia
            const subsidioAplicado = Math.max(0, costoBultos.costo - precioFinal);

            const result = {
                gratis: precioFinal === 0,
                precio: precioFinal,
                precioBase: quote.cheapest.valor,
                valorContrapago: quote.cheapest.valor_contrapago,
                transportadora: quote.cheapest.transportadora,
                dias: quote.cheapest.dias,
                fechaEntrega: quote.cheapest.fecha_entrega,
                bultos,
                esVecino,
                mensajePaquete: costoBultos.mensajePaquete,
                source: '99envios',
                mensaje: precioFinal === 0 ? '🎁 Tu subsidio cubre el 100% del envío. ¡Es GRATIS!' : undefined,
                cotizaciones: quote.all,
                subsidioAplicado,
                subsidioMensaje: !esVecino
                    ? 'En Pajarito subsidiamos parte de tu envío para que ahorres comprando directo de fábrica.'
                    : undefined,
            };

            await writeAuditLog({
                ...auditLog,
                source: '99envios',
                transportadora: quote.cheapest.transportadora,
                valorBase99: quote.cheapest.valor,
                valorContrapago99: quote.cheapest.valor_contrapago,
                costoUnBulto,
                costoBrutoBultos: costoBultos.costo,
                subsidioAplicado: subsidioAplicado,
                precioFinal,
                api99Cotizaciones: api99Raw,
                durationMs: Date.now() - startTime,
            });

            // Save to cache
            try {
                const db = getAdminDB();
                const cacheData: QuoteCacheData = {
                    destinoCodigo,
                    valor: quote.cheapest.valor,
                    valor_contrapago: quote.cheapest.valor_contrapago,
                    transportadora: quote.cheapest.transportadora,
                    dias: String(quote.cheapest.dias),
                    updatedAt: new Date().toISOString(),
                };
                await db.collection(QUOTES_CACHE_COLLECTION).doc(destinoCodigo).set(cacheData);
            } catch (cacheErr) {
                console.warn('[Cotizar] Could not save to cache:', cacheErr);
            }

            return NextResponse.json(result);

        } catch (enviosError: any) {
            api99Error = enviosError.message;
            console.warn('[Cotizar] 99 Envíos falló, usando fallback:', enviosError.message);
        }

        // ── 3. Fallback: Intentar leer del caché de cotizaciones ────────────────
        let fallbackBasePrice: number | null = null;
        let fallbackSource = 'config_fallback';

        try {
            const db = getAdminDB();
            const cachedDoc = await db.collection(QUOTES_CACHE_COLLECTION).doc(destinoCodigo).get();
            if (cachedDoc.exists) {
                const data = cachedDoc.data() as QuoteCacheData;
                // Only use cache if it's less than 30 days old
                const cacheDate = new Date(data.updatedAt).getTime();
                const now = Date.now();
                const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
                if (daysDiff <= 30) {
                    fallbackBasePrice = data.valor + (aplicaContrapago ? data.valor_contrapago : 0);
                    fallbackSource = 'cache_fallback';
                }
            }
        } catch (cacheErr) {
            console.warn('[Cotizar] Could not read from cache:', cacheErr);
        }

        // ── 4. Fallback: Promedio Histórico (PRD 27 Abril) ──────────────────────
        if (fallbackBasePrice === null) {
            const avgPrice = await getHistoricalAveragePrice(destinoCodigo);
            if (avgPrice !== null) {
                fallbackBasePrice = avgPrice;
                fallbackSource = 'historical_average';
            }
        }

        // ── 5. Fallback desde Firestore Config (si no hay caché ni promedio) ────
        let finalFallbackBasePrice = fallbackBasePrice;
        let isSinCobertura = false;
        
        if (finalFallbackBasePrice === null) {
            const fallback = getFallbackPrice(destinoCodigo, config);
            if (fallback.sinCobertura) {
                isSinCobertura = true;
            } else {
                finalFallbackBasePrice = fallback.precio;
            }
        }

        if (isSinCobertura) {
            await writeAuditLog({
                ...auditLog,
                source: 'fallback_no_coverage',
                api99Error,
                durationMs: Date.now() - startTime,
            });
            return NextResponse.json({
                sinCobertura: true,
                mensaje: `Lo sentimos, no tenemos cobertura de envío para ${destinoNombre || 'esta ciudad'}. Por favor contáctanos.`,
                source: 'fallback_no_coverage',
            }, { status: 422 });
        }

        // Usar finalFallbackBasePrice como costo por bulto
        const costoUnBulto = finalFallbackBasePrice || TARIFA_PLANA_NACIONAL;
        const costoBultos = calcularCostoConBultos(costoUnBulto, totalWeightKg, false);

        // El precio final descuenta el subsidio
        let precioFinal = Math.max(0, costoBultos.costo - subsidioDescuento);

        const subsidioAplicado = Math.max(0, costoBultos.costo - precioFinal);

        const result = {
            gratis: precioFinal === 0,
            precio: precioFinal,
            bultos,
            esVecino,
            mensajePaquete: costoBultos.mensajePaquete,
            source: fallbackSource,
            error: api99Error,
            mensaje: precioFinal === 0 
                ? '🎁 Tu subsidio cubre el 100% del envío. ¡Es GRATIS!' 
                : 'Cotización aproximada (basada en historial reciente).',
            subsidioAplicado,
            subsidioMensaje: !esVecino
                ? 'En Pajarito subsidiamos parte de tu envío para que ahorres comprando directo de fábrica.'
                : undefined,
        };

        await writeAuditLog({
            ...auditLog,
            source: fallbackSource,
            costoUnBulto,
            costoBrutoBultos: costoBultos.costo,
            subsidioAplicado: subsidioAplicado,
            precioFinal,
            api99Error,
            durationMs: Date.now() - startTime,
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Cotizar] Error:', error);
        await writeAuditLog({
            ...auditLog,
            source: 'error',
            errorMessage: error.message,
            durationMs: Date.now() - startTime,
        });
        return NextResponse.json({
            error: error.message || 'Error al cotizar el envío',
        }, { status: 500 });
    }
}
