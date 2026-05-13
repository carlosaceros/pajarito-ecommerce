import { cotizarEnvio } from './src/lib/99envios-service';

async function run() {
    try {
        const result = await cotizarEnvio('05001000', 'Medellín', 50000, true, 20);
        console.log(JSON.stringify(result, null, 2));
    } catch(e: any) {
        console.error(e.message);
    }
}
run();
