import { cotizarEnvio } from './src/lib/99envios-service';

async function run() {
    try {
        const result = await cotizarEnvio('05001000', 'Medellín', 50000, true, 20);
        // I will monkeypatch the dimensions in the service for a second test if needed
        console.log(JSON.stringify(result.all.coordinadora, null, 2));
    } catch(e: any) {
        console.error(e.message);
    }
}
run();
