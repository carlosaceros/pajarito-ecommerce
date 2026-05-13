import { cotizarEnvio } from './src/lib/99envios-service';

async function run() {
    try {
        const result = await cotizarEnvio('52788000', 'Tangua', 50000, true, 20);
        console.log(JSON.stringify(result.all.coordinadora, null, 2));
        console.log(JSON.stringify(result.all.servientrega, null, 2));
    } catch(e: any) {
        console.error(e.message);
    }
}
run();
