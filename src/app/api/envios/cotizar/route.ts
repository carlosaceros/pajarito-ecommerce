/**
 * POST /api/envios/cotizar
 *
 * Lógica PRD 2026:
 * 1. Vecinos Soachunos: gratis >= $100k, de lo contrario $8.000 tarifa local
 * 2. Nacional: NUNCA gratis — cobrar siempre al menos PRECIO_MINIMO_NACIONAL
 * 3. Intentar 99Envíos API (timeout 8s)
 * 4. Fallback → config Firestore o tarifa plana $35.000
 * 5. Subsidio de marca: se aplica pero nunca lleva el precio por debajo de PRECIO_MINIMO_NACIONAL
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

// Precio mínimo que se cobra en envíos nacionales (nunca se regala)
const PRECIO_MINIMO_NACIONAL = 5_000;

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
        const subsidio = calcularSubsidio(totalWeightKg);

        auditLog = {
            destinoCodigo,
            destinoNombre: destinoNombre || '',
            subtotal: subtotal || 0,
            totalWeightKg,
            bultos,
            aplicaContrapago,
            esVecino,
            subsidio,
            source: 'unknown',
        };

        // ── 1. Envío gratis SOLO para vecinos soachunos ───────────────────────
        if (esVecino && subtotal && subtotal >= FREE_SHIPPING_LOCAL) {
            const costoBultos = calcularCostoConBultos(TARIFA_LOCAL, totalWeightKg, true);
            const result = {
                gratis: costoBultos.costo === 0,
                precio: costoBultos.costo,
                bultos,
                esVecino,
                mensaje: `🎁 Envío GRATIS (Zona Vecino Soachuno) — compra superior a $${FREE_SHIPPING_LOCAL.toLocaleString('es-CO')}`,
                source: 'free_shipping_local',
                mensajePaquete: costoBultos.mensajePaquete,
            };
            await writeAuditLog({
                ...auditLog,
                source: 'free_shipping_local',
                precioFinal: result.precio,
                durationMs: Date.now() - startTime,
            });
            return NextResponse.json(result);
        }

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

            // costoUnBulto = flete de transporte (valor) + cargo por recaudo (valor_contrapago si aplica)
            // valor_contrapago es el cargo EXTRA que cobra la transportadora por recoger el dinero
            // NO es el monto a cobrar al cliente; ese es valorDeclarado
            const costoUnBulto = quote.cheapest.valor + (aplicaContrapago ? quote.cheapest.valor_contrapago : 0);
            const costoBultos = calcularCostoConBultos(costoUnBulto, totalWeightKg, false);

            // Aplicar subsidio, pero respetar precio mínimo en nacionales
            let precioFinal: number;
            if (esVecino) {
                precioFinal = Math.max(0, costoBultos.costo - subsidio);
            } else {
                precioFinal = Math.max(PRECIO_MINIMO_NACIONAL, costoBultos.costo - subsidio);
            }

            const result = {
                gratis: false, // Nacional siempre paga algo
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
                cotizaciones: quote.all,
                subsidioAplicado: subsidio,
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
                subsidioAplicado: subsidio,
                precioFinal,
                api99Cotizaciones: api99Raw,
                durationMs: Date.now() - startTime,
            });

            return NextResponse.json(result);

        } catch (enviosError: any) {
            api99Error = enviosError.message;
            console.warn('[Cotizar] 99 Envíos falló, usando fallback:', enviosError.message);
        }

        // ── 3. Fallback desde Firestore ───────────────────────────────────────
        const config = await getShippingConfig();
        const fallback = getFallbackPrice(destinoCodigo, config);

        if (fallback.sinCobertura) {
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

        const costoBultos = calcularCostoConBultos(fallback.precio, totalWeightKg, false);
        let precioFinal: number;
        if (esVecino) {
            precioFinal = Math.max(0, costoBultos.costo - subsidio);
        } else {
            precioFinal = Math.max(PRECIO_MINIMO_NACIONAL, costoBultos.costo - subsidio);
        }

        await writeAuditLog({
            ...auditLog,
            source: 'fallback',
            fallbackPrecio: fallback.precio,
            fallbackZona: fallback.zonaNombre,
            costoBrutoBultos: costoBultos.costo,
            subsidioAplicado: subsidio,
            precioFinal,
            api99Error,
            durationMs: Date.now() - startTime,
        });

        return NextResponse.json({
            gratis: false,
            precio: precioFinal,
            transportadora: null,
            dias: '3-7',
            bultos,
            esVecino,
            mensajePaquete: costoBultos.mensajePaquete,
            source: 'fallback',
            zonaNombre: fallback.zonaNombre,
            subsidioMensaje: !esVecino
                ? 'En Pajarito subsidiamos parte de tu envío para que ahorres comprando directo de fábrica.'
                : undefined,
            mensaje: '* Precio estimado. El costo exacto se confirma al despachar.',
            subsidioAplicado: subsidio,
        });

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
