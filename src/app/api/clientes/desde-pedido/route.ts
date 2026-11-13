import { NextResponse } from 'next/server';
import { upsertCustomerFromOrderAdmin } from '@/lib/customer-upsert-admin';

export const runtime = 'nodejs';

/**
 * POST { orderId } — el checkout avisa que creó un pedido y el SERVIDOR actualiza la ficha del cliente.
 * No recibe datos del cliente: los lee del pedido, así que no sirve para escribir fichas arbitrarias.
 * Es idempotente (ver customer-upsert-admin.ts).
 */
export async function POST(request: Request) {
    let orderId = '';
    try {
        const body = await request.json();
        orderId = typeof body?.orderId === 'string' ? body.orderId : '';
    } catch {
        return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
    }
    if (!/^[A-Za-z0-9]{10,40}$/.test(orderId)) {
        return NextResponse.json({ error: 'orderId inválido' }, { status: 400 });
    }
    try {
        const resultado = await upsertCustomerFromOrderAdmin(orderId);
        if (resultado === 'pedido_no_existe') return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        return NextResponse.json({ ok: true, resultado });
    } catch (error) {
        console.error('Error actualizando la ficha del cliente:', error);
        return NextResponse.json({ error: 'No se pudo actualizar la ficha' }, { status: 500 });
    }
}
