/**
 * customer-upsert-admin.ts
 * Actualiza la ficha del cliente (`customers/{celular de 10 dígitos}`) a partir de un pedido, DESDE EL SERVIDOR (Admin SDK).
 *
 * Antes lo hacía el navegador del cliente (customers-service.upsertCustomerFromOrder) y por eso las reglas de Firestore
 * tenían que dejar a cualquiera leer, crear y modificar fichas. Con esto las reglas pueden cerrarse al equipo.
 *
 * - Idempotente: marca el pedido con `clienteSincronizado` dentro de una transacción; repetir la llamada no vuelve a sumar.
 * - El id de la ficha es el celular de 10 dígitos, igual que en el panel de WhatsApp (pajarito-plataforma).
 */
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDB } from './firebase-admin';

/** Los 10 dígitos de un celular colombiano, sin indicativo ni símbolos (misma regla que el panel). */
export function celular10(raw: unknown): string {
    const d = String(raw ?? '').replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('57')) return d.slice(2);
    if (d.length === 13 && d.startsWith('057')) return d.slice(3);
    return d;
}

type Datos = Record<string, unknown>;
const texto = (v: unknown, defecto = ''): string => (typeof v === 'string' ? v : defecto);

export type ResultadoFicha = 'creada' | 'actualizada' | 'ya_sincronizado' | 'sin_celular' | 'pedido_no_existe';

export async function upsertCustomerFromOrderAdmin(orderId: string): Promise<ResultadoFicha> {
    const db = getAdminDB();
    const orderRef = db.collection('orders').doc(orderId);

    return db.runTransaction(async (tx) => {
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) return 'pedido_no_existe';
        const order = (orderSnap.data() ?? {}) as Datos;
        if (order.clienteSincronizado === true) return 'ya_sincronizado';

        const cliente = (order.cliente ?? {}) as Datos;
        const id = celular10(cliente.celular);
        if (id.length < 10) return 'sin_celular';

        const total = Number(order.total) || 0;
        const customerRef = db.collection('customers').doc(id);
        const customerSnap = await tx.get(customerRef);
        const now = Timestamp.now();

        if (customerSnap.exists) {
            const actual = (customerSnap.data() ?? {}) as Datos;
            tx.update(customerRef, {
                nombre: texto(cliente.nombre, texto(actual.nombre)),
                email: texto(cliente.email) || texto(actual.email) || null,
                direccion: texto(cliente.direccion, texto(actual.direccion)),
                ciudad: texto(cliente.ciudad, texto(actual.ciudad)),
                departamento: texto(cliente.departamento, texto(actual.departamento)),
                totalSpent: FieldValue.increment(total),
                ordersCount: FieldValue.increment(1),
                lastOrderDate: now,
                updatedAt: now,
            });
            tx.update(orderRef, { clienteSincronizado: true });
            return 'actualizada';
        }

        tx.set(customerRef, {
            id,
            nombre: texto(cliente.nombre),
            cedula: texto(cliente.cedula),
            celular: texto(cliente.celular, id),
            email: texto(cliente.email) || null,
            direccion: texto(cliente.direccion),
            ciudad: texto(cliente.ciudad),
            departamento: texto(cliente.departamento),
            totalSpent: total,
            ordersCount: 1,
            lastOrderDate: now,
            firstOrderDate: now,
            createdAt: now,
            updatedAt: now,
        });
        tx.update(orderRef, { clienteSincronizado: true });
        return 'creada';
    });
}
