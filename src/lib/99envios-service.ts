const API_BASE_URL = 'https://integration1.99envios.app/api/integration/v1';

// In-memory token cache to avoid logging in on every request if the token is still valid.
let cachedToken: string | null = null;
let tokenExpirationTime: number | null = null;

/**
 * Ensures we have a valid JWT token. If expired or not present,
 * it requests a new one from /api/integration/v1/login.
 */
async function getAuthToken(): Promise<string> {
    const email = process.env.ENV_99ENVIOS_EMAIL;
    const password = process.env.ENV_99ENVIOS_PASSWORD;

    if (!email || !password) {
        throw new Error('Las variables de entorno ENV_99ENVIOS_EMAIL y ENV_99ENVIOS_PASSWORD son requeridas.');
    }

    // Return cached token if it's still valid (e.g., assuming 1 hour expiry, we refresh 5 mins early)
    if (cachedToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return cachedToken;
    }

    console.log('[99Envíos] Solicitando nuevo token...');
    
    // Perform login
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email || "", password: password || "" })
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('[99Envíos] Error de autenticación:', errorData);
        throw new Error(`Falló la autenticación con 99 Envíos. Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.token) {
        throw new Error('Respuesta de 99 Envíos no contiene un token válido.');
    }

    cachedToken = data.token;
    // Set expiration to 55 minutes from now to be safe (assuming 1 hour expiration standard)
    tokenExpirationTime = Date.now() + (55 * 60 * 1000);

    return cachedToken as string;
}

export interface QuoteRequest {
    destino: {
        nombre: string;
        codigo: string; // DANE Divipola
    };
    origen: {
        nombre: string;
        codigo: string; // e.g., Envigado DANE
    };
    IdTipoEntrega: number; // 1 for domicilio
    IdServicio: number; // 1 standard
    valorDeclarado: number;
    peso: number;
    alto: number;
    largo: number;
    ancho: number;
    fecha: string; // DD-MM-YYYY
    seguro99?: boolean;
    seguro99plus?: boolean;
    AplicaContrapago: boolean; // Assuming false for prepaid shipping from cart
}

export interface QuotaTransportadora {
    mensaje: string;
    valor: number;
    valor_contrapago: number;
    dias: string | number;
    fecha_entrega: string | null;
    exito: boolean;
    IdServicio: number;
}

export interface QuoteResponse {
    [key: string]: QuotaTransportadora;
}

/**
 * Gets a shipping quote from 99 Envíos using provided logistics data.
 */
export async function cotizarEnvio(quoteData: QuoteRequest): Promise<QuoteResponse | null> {
    try {
        const token = await getAuthToken();

        const response = await fetch(`${API_BASE_URL}/cotizar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(quoteData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('[99Envíos] Error cotizando:', errorData, JSON.stringify(quoteData));
            throw new Error(`Error de 99 Envíos: ${errorData}`);
        }

        const quotes: QuoteResponse = await response.json();
        return quotes;
    } catch (error: any) {
        console.error('[99Envíos] Error en cotizarEnvio:', error);
        throw error;
    }
}
