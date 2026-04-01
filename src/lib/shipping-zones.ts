/**
 * shipping-zones.ts
 * Fuente de verdad para la lógica de zonas y umbrales de envío de Pajarito.
 * PRD: Logística 2026 — Biocambio360 S.A.S.
 */

// Códigos DANE de la zona "Veci Soachuno/a" (Soacha, Bosa, Sibaté y sur de Bogotá)
export const SOACHA_ZONE_PREFIXES = [
    '25754', // Soacha
    '25755', // Sibaté
    '11001', // Bogotá D.C. (incluye Bosa, aunque es localidad)
];

// Ciudades de la zona local por nombre (para UI checkout)
export const SOACHA_ZONE_CITIES = [
    'SOACHA',
    'SIBATE',
    'SIBATÉ',
    'BOSA',
];

// Umbrales de envío gratis (COP)
export const FREE_SHIPPING_LOCAL = 100_000;   // Vecis Soachunos/as
export const FREE_SHIPPING_NACIONAL = 180_000; // Resto del país

// Tarifa plana nacional (Pajarito subsidia el excedente del flete real)
export const TARIFA_PLANA_NACIONAL = 18_000;

// Tarifa local (cuando no aplica gratis)
export const TARIFA_LOCAL = 8_000;

// Descuento por pick-up (porcentaje)
export const PICKUP_DISCOUNT_PCT = 0.05;

// Dirección del punto de pick-up
export const PICKUP_ADDRESS = 'Cra. 7C #44-17 Sur, Barrio San Nicolás, Soacha';

// Peso máximo por paquete (kg)
export const PESO_MAX_PAQUETE_KG = 30;

/**
 * Determina si un código DANE (5-8 dígitos) pertenece a la zona local Soacha.
 */
export function isVeciSoacha(destinoCodigo: string): boolean {
    if (!destinoCodigo) return false;
    return SOACHA_ZONE_PREFIXES.some(prefix => destinoCodigo.startsWith(prefix));
}

/**
 * Determina si el nombre de una ciudad pertenece a la zona local Soacha.
 * Útil para validación en UI sin código DANE.
 */
export function isVeciSoachaByCityName(ciudad: string): boolean {
    if (!ciudad) return false;
    const upper = ciudad.toUpperCase().trim();
    return SOACHA_ZONE_CITIES.some(c => upper.includes(c));
}

/**
 * Retorna el umbral de envío gratis según la zona.
 */
export function getShippingThreshold(destinoCodigo?: string): number {
    if (destinoCodigo && isVeciSoacha(destinoCodigo)) {
        return FREE_SHIPPING_LOCAL;
    }
    return FREE_SHIPPING_NACIONAL;
}

/**
 * Calcula el número de paquetes requeridos dado el peso total del pedido.
 */
export function calcularPaquetes(totalWeightKg: number): number {
    if (totalWeightKg <= 0) return 1;
    return Math.ceil(totalWeightKg / PESO_MAX_PAQUETE_KG);
}

/**
 * Calcula el costo de envío total considerando múltiples paquetes.
 * El primer paquete aplica la tarifa normal; paquetes adicionales se cobran aparte.
 */
export function calcularCostoConPaquetes(
    costoUnPaquete: number,
    totalWeightKg: number,
    isFree: boolean,
): { costo: number; paquetes: number; mensajePaquete?: string } {
    const paquetes = calcularPaquetes(totalWeightKg);
    const fmt = (n: number) => new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(n);

    if (isFree && paquetes === 1) {
        return { costo: 0, paquetes };
    }
    if (isFree && paquetes > 1) {
        const costoExtra = (paquetes - 1) * costoUnPaquete;
        return {
            costo: costoExtra,
            paquetes,
            mensajePaquete: `Tu pedido ocupa ${paquetes} paquetes. El 1er paquete es gratis; los ${paquetes - 1} adicionales tienen costo de ${fmt(costoExtra)}.`,
        };
    }
    return {
        costo: costoUnPaquete * paquetes,
        paquetes,
        mensajePaquete: paquetes > 1 ? `Tu pedido requiere ${paquetes} paquetes (${PESO_MAX_PAQUETE_KG}kg máx. c/u).` : undefined,
    };
}

// ── Aliases para backwards-compat con importaciones anteriores ──────────────
/** @deprecated Usa calcularPaquetes */
export const calcularBultos = calcularPaquetes;
/** @deprecated Usa calcularCostoConPaquetes */
export const calcularCostoConBultos = calcularCostoConPaquetes;
/** @deprecated Usa PESO_MAX_PAQUETE_KG */
export const PESO_MAX_BULTO_KG = PESO_MAX_PAQUETE_KG;
/** @deprecated Usa isVeciSoacha */
export const isVecinoSoachuno = isVeciSoacha;
/** @deprecated Usa isVeciSoachaByCityName */
export const isVecinoSoachunoByCityName = isVeciSoachaByCityName;
