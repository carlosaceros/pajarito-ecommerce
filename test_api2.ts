import { cotizarEnvio } from './src/lib/99envios-service';

async function run() {
    try {
        const fetch = require('node-fetch');
        // Let's copy the payload and test directly
        const payload = {
            destino: { codigo: '05001000', nombre: 'Medellín' },
            origen: { codigo: '25754000', nombre: 'Soacha' },
            IdTipoEntrega: 1,
            IdServicio: 1,
            valorDeclarado: 50000,
            peso: 20,
            alto: 30,
            largo: 30,
            ancho: 30,
            fecha: '05-05-2026',
            seguro99: true,
            seguro99plus: 1,
            AplicaContrapago: true,
        };

        const res = await fetch(`https://apiclt.99minutos.com/api/integration/v1/cotizar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.TEST_TOKEN}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch(e: any) {
        console.error(e.message);
    }
}
run();
