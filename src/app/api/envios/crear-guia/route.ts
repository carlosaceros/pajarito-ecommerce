import { NextResponse } from 'next/server';
import { crearPreenvio } from '@/lib/99envios-service';
import { getAdminDB } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, transportadora, pesoKg, bultos, diceContener, observaciones } = body;

        if (!orderId || !transportadora) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos (orderId, transportadora)' }, { status: 400 });
        }

        const db = getAdminDB();
        // Obtener la orden de Firestore
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return NextResponse.json({ error: 'La orden especificada no existe' }, { status: 404 });
        }

        const order = orderSnap.data() as any;
        const cliente = order.cliente;

        if (!cliente) {
            return NextResponse.json({ error: 'La orden no contiene información de cliente' }, { status: 400 });
        }

        // Determinar código DANE/idLocalidad (5 dígitos para preenvío de 99envíos)
        const idLocalidad = cliente.idLocalidad || (cliente.codigoDane ? cliente.codigoDane.slice(0, 5) : '11001');

        // Separar nombre y apellido del cliente
        const partesNombre = (cliente.nombre || 'Cliente Pajarito').trim().split(' ');
        const nombre = partesNombre[0] || 'Cliente';
        const primerApellido = partesNombre.slice(1).join(' ') || 'Pajarito';

        // Invocar la creación de preenvío en 99 Envíos
        const preenvioRes = await crearPreenvio({
            destinatario: {
                tipoDocumento: 'CC',
                numeroDocumento: cliente.cedula || '123456789',
                nombre,
                primerApellido,
                telefono: cliente.celular || '3000000000',
                direccion: cliente.direccion || 'Dirección Principal',
                idLocalidad,
                correo: cliente.email || '',
            },
            valorDeclarado: Math.max(75000, order.subtotal || order.total || 75000),
            valorContrapago: order.metodoPago === 'contraentrega' ? order.total : 0,
            transportadora,
            pesoKg: pesoKg || 5,
            diceContener: diceContener || 'Productos de limpieza y hogar',
            observaciones: observaciones || 'FRÁGIL - LÍQUIDOS',
        });

        // Extraer número de guía asignado
        const guiaNumber = preenvioRes.guia || preenvioRes.numeroGuia || preenvioRes.id || `99-${Date.now()}`;

        const labelData = {
            guiaNumber,
            transportadora,
            fechaCreacion: new Date().toISOString(),
            estadoGuia: 'generada',
            bultos: bultos || 1,
            pesoKg: pesoKg || 5,
            valorDeclarado: Math.max(75000, order.subtotal || order.total || 75000),
            fleteCosto: order.envio || 0,
            diceContener: diceContener || 'Productos de limpieza y hogar',
            observaciones: observaciones || 'FRÁGIL - LÍQUIDOS',
            pdfStickerUrl: `/api/envios/pdf-guia?guia=${guiaNumber}&tipo=sticker`,
            pdfEstandarUrl: `/api/envios/pdf-guia?guia=${guiaNumber}&tipo=estandar`,
        };

        const timelineEvent = {
            status: 'preparacion',
            timestamp: new Date(),
            user: 'admin:sistema',
            note: `Guía #${guiaNumber} generada exitosamente con ${transportadora.toUpperCase()} (99 Envíos).`,
        };

        // Actualizar Firestore
        await orderRef.update({
            guiaEnvio: labelData,
            status: 'preparacion',
            timeline: FieldValue.arrayUnion(timelineEvent),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            guiaNumber,
            labelData,
            preenvioResponse: preenvioRes,
        });
    } catch (error: any) {
        console.error('[API Crear Guía] Error:', error);
        return NextResponse.json({ error: error.message || 'Error al generar la guía' }, { status: 500 });
    }
}
