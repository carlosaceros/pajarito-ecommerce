/**
 * shipping-zones.ts
 * Fuente de verdad para la lógica de zonas y umbrales de envío de Pajarito.
 * PRD: Logística 2026 — Biocambio360 S.A.S.
 */

// Códigos DANE de la zona "Vecino Soachuno" (Soacha, Bosa, Sibaté y sur de Bogotá)
// Formato: primeros 5 dígitos = municipio
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
export const FREE_SHIPPING_LOCAL = 100_000;   // Vecinos Soachunos
export const FREE_SHIPPING_NACIONAL = 180_000; // Resto del país

// Tarifa plana nacional (Pajarito subsidia el excedente del flete real)
export const TARIFA_PLANA_NACIONAL = 18_000;

// Tarifa local (cuando no aplica gratis)
export const TARIFA_LOCAL = 8_000;

// Descuento por pick-up (porcentaje)
export const PICKUP_DISCOUNT_PCT = 0.05;

// Dirección del punto de pick-up
export const PICKUP_ADDRESS = 'Cra. 7C #44-17 Sur, Barrio San Nicolás, Soacha';

// Peso máximo por bulto (kg)
export const PESO_MAX_BULTO_KG = 30;

/**
 * Determina si un código DANE (5-8 dígitos) pertenece a la zona local Soacha.
 */
export function isVecinoSoachuno(destinoCodigo: string): boolean {
    if (!destinoCodigo) return false;
    return SOACHA_ZONE_PREFIXES.some(prefix => destinoCodigo.startsWith(prefix));
}

/**
 * Determina si el nombre de una ciudad pertenece a la zona local Soacha.
 * Útil para validación en UI sin código DANE.
 */
export function isVecinoSoachunoByCityName(ciudad: string): boolean {
    if (!ciudad) return false;
    const upper = ciudad.toUpperCase().trim();
    return SOACHA_ZONE_CITIES.some(c => upper.includes(c));
}

/**
 * Retorna el umbral de envío gratis según la zona.
 */
export function getShippingThreshold(destinoCodigo?: string): number {
    if (destinoCodigo && isVecinoSoachuno(destinoCodigo)) {
        return FREE_SHIPPING_LOCAL;
    }
    return FREE_SHIPPING_NACIONAL;
}

/**
 * Calcula el número de bultos requeridos dado el peso total del pedido.
 */
export function calcularBultos(totalWeightKg: number): number {
    if (totalWeightKg <= 0) return 1;
    return Math.ceil(totalWeightKg / PESO_MAX_BULTO_KG);
}

/**
 * Calcula el costo de envío total considerando múltiples bultos.
 * El primer bulto aplica la tarifa normal; bultos adicionales se cobran aparte.
 */
export function calcularCostoConBultos(
    costoUnBulto: number,
    totalWeightKg: number,
    isFree: boolean,
): { costo: number; bultos: number; mensajeBulto?: string } {
    const bultos = calcularBultos(totalWeightKg);
    if (isFree && bultos === 1) {
        return { costo: 0, bultos };
    }
    if (isFree && bultos > 1) {
        // Solo el primer bulto es gratis; los adicionales se cobran
        const costoExtra = (bultos - 1) * costoUnBulto;
        return {
            costo: costoExtra,
            bultos,
            mensajeBulto: `Tu pedido ocupa ${bultos} bultos. El 1er bulto es gratis; los ${bultos - 1} adicionales tienen costo de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(costoExtra)}.`,
        };
    }
    return {
        costo: costoUnBulto * bultos,
        bultos,
        mensajeBulto: bultos > 1 ? `Tu pedido requiere ${bultos} bultos (${PESO_MAX_BULTO_KG}kg máx. c/u).` : undefined,
    };
}
