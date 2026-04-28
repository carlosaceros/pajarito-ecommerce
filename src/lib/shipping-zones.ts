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

// Umbrales de envío gratis (COP) - DESACTIVADOS POR PRD 27 ABRIL
export const FREE_SHIPPING_LOCAL = Infinity;   // Desactivado para local
export const FREE_SHIPPING_NACIONAL = Infinity; // Desactivado para Nacional

// Tarifa plana nacional (Pajarito subsidia el excedente del flete real)
export const TARIFA_PLANA_NACIONAL = 35_000;

// Tarifa local (cuando no aplica gratis)
export const TARIFA_LOCAL = 8_000;

// Descuento por pick-up (porcentaje)
export const PICKUP_DISCOUNT_PCT = 0.05;

// Dirección del punto de pick-up
export const PICKUP_ADDRESS = 'Cra. 7C #44-17 Sur, Barrio San Nicolás, Soacha';

// Peso máximo por paquete (kg)
export const PESO_MAX_PAQUETE_KG = 20;

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

/**
 * Tabla de subsidios por defecto (Logística 2026)
 * Basada en la tabla oficial de KG vs VALOR A DESCONTAR (Subsidio).
 * Estas son las tarifas fijas que Pajarito asume del costo real del envío.
 */
export const DEFAULT_SUBSIDIOS: Record<number, number> = {
    1: 1000, 2: 2000, 3: 4000, 4: 5000, 5: 6000, 6: 8000, 7: 9000, 8: 10000, 9: 11000, 10: 12000,
    11: 14000, 12: 15000, 13: 16000, 14: 17000, 15: 18000, 16: 20000, 17: 21000, 18: 22000, 19: 23000, 20: 12000,
    21: 13000, 22: 15000, 23: 16000, 24: 17000, 25: 18000, 26: 20000, 27: 21000, 28: 22000, 29: 23000, 30: 24000,
    31: 25000, 32: 27000, 33: 28000, 34: 29000, 35: 30000, 36: 32000, 37: 33000, 38: 34000, 39: 35000, 40: 24000
};

/**
 * Retorna el valor de subsidio (descuento) que se le debe aplicar al flete real del cliente.
 * Si el peso excede los 40kg, se aplica lógica modular por bulto de 20kg ($12.000 de subsidio por bulto lleno).
 */
export function calcularSubsidio(totalWeightKg: number, customTable?: Record<string, number>): number {
    const weight = Math.ceil(totalWeightKg);
    if (weight <= 0) return 0;
    
    const tableToUse = customTable || DEFAULT_SUBSIDIOS;
    
    // Convert keys to numbers if it's from JSON
    const getValue = (kg: number) => {
        const anyTable = tableToUse as any;
        const val = anyTable[kg.toString()] ?? anyTable[kg];
        return typeof val === 'number' ? val : 0;
    };
    
    // Si está en la tabla (hasta 40kg)
    const exactValue = getValue(weight);
    if (exactValue > 0 && weight <= 40) {
        return exactValue;
    }
    
    // Para pesos superiores a 40kg, calculamos bultos de 20kg
    // Cada bulto de 20kg recibe 12,000 de subsidio (o lo que dicte la tabla para 20kg).
    const subsidioBultoLleno = getValue(20) || 12000;
    const numFullBultos = Math.floor(weight / 20);
    const remainder = weight % 20;
    
    if (remainder === 0) {
        return numFullBultos * subsidioBultoLleno;
    }
    
    return (numFullBultos * subsidioBultoLleno) + getValue(remainder);
}


