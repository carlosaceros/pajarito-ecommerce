import { NextResponse } from 'next/server';
import { obtenerPdfGuia } from '@/lib/99envios-service';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const guia = searchParams.get('guia');
        const tipo = (searchParams.get('tipo') || 'sticker') as 'sticker' | 'estandar';

        if (!guia) {
            return NextResponse.json({ error: 'Falta el parámetro de guía' }, { status: 400 });
        }

        const { buffer, contentType } = await obtenerPdfGuia([guia], tipo);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="guia-${guia}-${tipo}.pdf"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error: any) {
        console.error('[API PDF Guía] Error:', error);
        return NextResponse.json({ error: error.message || 'Error al obtener PDF de guía' }, { status: 500 });
    }
}
