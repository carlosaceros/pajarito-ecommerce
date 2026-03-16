import { NextResponse } from 'next/server';
import { cotizarEnvio, QuoteRequest } from '@/lib/99envios-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destinoCodigo, destinoNombre, subtotal, totalItems } = body;

        if (!destinoCodigo) {
            return NextResponse.json(
                { error: 'El código DANE del destino es requerido' },
                { status: 400 }
            );
        }

        // According to requirement: Free shipping above $100.000 COP
        if (subtotal >= 100000) {
            return NextResponse.json({
                gratis: true,
                mensaje: 'Envío Gratis por compras superiores a $100.000',
                costo: 0
            });
        }

        // Determine basic dimensions/weight based on items (approximate logic for demo)
        // Adjust these as needed if products have real dimensions in the DB
        const pesoEstimado = totalItems * 5; // 5kg per item avg
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const quoteRequest: QuoteRequest = {
            destino: { codigo: destinoCodigo, nombre: destinoNombre || 'CIUDAD DESTINO' },
            origen: { codigo: '05001000', nombre: 'BIOCAMBIO360' }, // Setting the user's exact branch name and an assumed origin code for Medellin
            IdTipoEntrega: 1, // Domicilio
            IdServicio: 1, // Normal
            valorDeclarado: Math.max(10000, subtotal), // Min declaration
            peso: 1, // Reduce weight to 1kg just in case
            alto: 10,
            largo: 10,
            ancho: 10,
            fecha: `${dd}-${mm}-${yyyy}`,
            seguro99: false,
            seguro99plus: false,
            AplicaContrapago: true
        };

        const result = await cotizarEnvio(quoteRequest);

        if (!result) {
            throw new Error('No se obtuvieron cotizaciones de 99 Envíos');
        }

        return NextResponse.json({
            gratis: false,
            cotizaciones: result
        });

    } catch (error: any) {
        console.error('[API Cotizar Envío] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error procesando cotización', details: error.toString() },
            { status: 500 }
        );
    }
}
