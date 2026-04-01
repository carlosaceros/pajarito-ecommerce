import { NextRequest, NextResponse } from 'next/server';
import { seedProductsToFirestore } from '@/lib/products-service';

/**
 * POST /api/admin/seed-products
 * Sincroniza los productos hardcoded (products.ts) a Firestore.
 * Protegido por SEED_SECRET env var.
 *
 * Uso: curl -X POST https://tu-sitio.vercel.app/api/admin/seed-products \
 *   -H "Authorization: Bearer TU_SECRET"
 */
export async function POST(req: NextRequest) {
    const auth = req.headers.get('authorization') || '';
    const secret = process.env.SEED_SECRET || 'pajarito2026';

    if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await seedProductsToFirestore();
        return NextResponse.json({
            ok: true,
            message: 'Productos sincronizados a Firestore con precios 2026',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[seed-products]', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
