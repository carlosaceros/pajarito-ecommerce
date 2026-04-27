/**
 * 99envios-service.ts
 * Integración con la API de 99 Envíos (multi-mensajería).
 * Origen fijo: Soacha / Biocambio360 S.A.S.
 *
 * Regla crítica PRD: NUNCA retornar transportadoras con valor === 0 o sin cobertura.
 */

const API_BASE = 'https://integration1.99envios.app/api/integration/v1';

// Origen fijo de Pajarito (SOACHA/CUNDINAMARCA, sucursal Biocambio360)
const ORIGEN = {
    codigo: '25754000',
    nombre: 'SOACHA',
};

// --- Token cache ---
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAuthToken(): Promise<string> {
    const email = process.env.ENV_99ENVIOS_EMAIL;
    const password = process.env.ENV_99ENVIOS_PASSWORD;

    if (!email || !password) {
        throw new Error('Faltan ENV_99ENVIOS_EMAIL o ENV_99ENVIOS_PASSWORD');
    }

    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        throw new Error(`Login 99 Envíos falló: ${res.status}`);
    }

    const data = await res.json();
    if (!data.token) throw new Error('No se recibió token de 99 Envíos');

    cachedToken = data.token;
    tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 min
    return cachedToken as string;
}

// --- Tipos de respuesta ---
export interface QuoteCarrier {
    mensaje: string;
    valor: number;
    valor_contrapago: number;
    dias: string | number;
    fecha_entrega: string | null;
    exito: boolean;
    IdServicio: number;
}

export interface QuoteResult {
    cheapest: {
        transportadora: string;
        valor: number;
        valor_contrapago: number;
        dias: string | number;
        fecha_entrega: string | null;
    };
    all: Record<string, QuoteCarrier>;
}

/**
 * Cotiza el envío a una ciudad destino (por su código DANE 8 dígitos).
 * Usa el origen de la cuenta (SOACHA/Biocambio360).
 *
 * @param destinoCodigo Código DANE 8 dígitos del destino (ej: "11001000")
 * @param destinoNombre Nombre de la ciudad destino
 * @param valorDeclarado Valor del pedido
 * @param aplicaContrapago Si paga contra entrega
 * @param pesoKg Peso total del pedido en kg (default 5kg para un galón)
 */
export async function cotizarEnvio(
    destinoCodigo: string,
    destinoNombre: string,
    valorDeclarado: number,
    aplicaContrapago: boolean = true,
    pesoKg: number = 5,
): Promise<QuoteResult> {
    const token = await getAuthToken();

    // La fecha debe ser mañana (el API no acepta la fecha actual)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const yyyy = tomorrow.getFullYear();
    const fecha = `${dd}-${mm}-${yyyy}`;

    // Dimensiones aproximadas proporcionales al peso
    const alto = Math.max(20, Math.round(pesoKg * 1.5));
    const largo = Math.max(15, Math.round(pesoKg * 1.2));
    const ancho = Math.max(15, Math.round(pesoKg * 1.0));

    const payload = {
        destino: { codigo: destinoCodigo, nombre: destinoNombre },
        origen: ORIGEN,
        IdTipoEntrega: 1,
        IdServicio: 1,
        valorDeclarado: Math.max(10000, valorDeclarado),
        peso: Math.min(pesoKg, 20), // API máx. 20kg por guía (actualizado según nueva regla bulto)
        alto,
        largo,
        ancho,
        fecha,
        seguro99: false,
        seguro99plus: aplicaContrapago ? 1 : 0,
        AplicaContrapago: aplicaContrapago,
    };

    const res = await fetch(`${API_BASE}/cotizar`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`99 Envíos cotizar error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data: Record<string, QuoteCarrier> = await res.json();

    // --- Regla crítica PRD: filtrar transportadoras con valor === 0 o sin cobertura ---
    // Iterar y encontrar la más barata con exito: true Y valor > 0
    let cheapestName = '';
    let cheapestValor = Infinity;

    for (const [name, carrier] of Object.entries(data)) {
        if (
            carrier.exito &&
            typeof carrier.valor === 'number' &&
            carrier.valor > 0 && // PRD: NUNCA mostrar valor 0
            carrier.valor < cheapestValor
        ) {
            cheapestValor = carrier.valor;
            cheapestName = name;
        }
    }

    if (!cheapestName) {
        throw new Error('Ninguna transportadora pudo cotizar este destino con cobertura válida');
    }

    const cheapest = data[cheapestName];
    return {
        cheapest: {
            transportadora: cheapestName,
            valor: cheapest.valor,
            valor_contrapago: cheapest.valor_contrapago || 0,
            dias: cheapest.dias,
            fecha_entrega: cheapest.fecha_entrega,
        },
        all: data,
    };
}

/**
 * Genera un preenvío (guía) con 99 Envíos.
 */
export interface PreenvioData {
    destinatario: {
        tipoDocumento: string;
        numeroDocumento?: string;
        nombre: string;
        primerApellido: string;
        telefono: string;
        direccion: string;
        idLocalidad: string; // código DANE
        correo?: string;
    };
    valorDeclarado: number;
    valorContrapago?: number;
    transportadora: string; // 'interrapidisimo' | 'tcc' | 'servientrega' | 'coordinadora' | 'envia'
    pesoKg?: number;
    diceContener?: string;
    observaciones?: string;
}

export async function crearPreenvio(data: PreenvioData): Promise<any> {
    const token = await getAuthToken();
    const pesoKg = data.pesoKg ?? 5;

    const payload = {
        IdTipoEntrega: 1,
        IdServicio: 1,
        AplicaContrapago: !!(data.valorContrapago && data.valorContrapago > 0),
        peso: Math.min(pesoKg, 20),
        largo: Math.max(15, Math.round(pesoKg * 1.2)),
        ancho: Math.max(15, Math.round(pesoKg * 1.0)),
        alto: Math.max(20, Math.round(pesoKg * 1.5)),
        diceContener: data.diceContener || 'Productos de limpieza y hogar',
        valorDeclarado: data.valorDeclarado,
        seguro99: false,
        seguro99plus: !!(data.valorContrapago && data.valorContrapago > 0) ? 1 : 0,
        Destinatario: {
            tipoDocumento: data.destinatario.tipoDocumento,
            numeroDocumento: data.destinatario.numeroDocumento || '',
            nombre: data.destinatario.nombre,
            primerApellido: data.destinatario.primerApellido,
            telefono: data.destinatario.telefono,
            direccion: data.destinatario.direccion,
            idLocalidad: data.destinatario.idLocalidad,
            correo: data.destinatario.correo || '',
        },
        Observaciones: data.observaciones || '',
        transportadora: {
            pais: 'colombia',
            nombre: data.transportadora,
        },
        origenCreacion: 1,
    };

    const res = await fetch(`${API_BASE}/preenvio`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(`Preenvío falló: ${JSON.stringify(result)}`);
    return result;
}
