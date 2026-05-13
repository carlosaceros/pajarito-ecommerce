import { cotizarEnvio } from './src/lib/99envios-service';

async function run() {
    try {
        const fetch = require('node-fetch');
        const email = process.env.ENV_99ENVIOS_EMAIL;
        const password = process.env.ENV_99ENVIOS_PASSWORD;

        const loginRes = await fetch('https://integration1.99envios.app/api/integration/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const { token } = await loginRes.json();

        const payload = {
            destino: { codigo: '05001000', nombre: 'Medellín' },
            origen: { codigo: '25754000', nombre: 'SOACHA' },
            IdTipoEntrega: 1,
            IdServicio: 1,
            valorDeclarado: 50000,
            peso: 20,
            alto: 45,
            largo: 40,
            ancho: 40,
            fecha: '05-05-2026',
            seguro99: false,
            seguro99plus: 1,
            AplicaContrapago: true,
        };

        const res = await fetch(`https://integration1.99envios.app/api/integration/v1/cotizar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(JSON.stringify(data.coordinadora, null, 2));
    } catch(e: any) {
        console.error(e.message);
    }
}
run();
