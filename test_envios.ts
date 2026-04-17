import { cotizarEnvio } from './src/lib/99envios-service';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    try {
        console.log("Testing with env var set:", !!process.env.ENV_99ENVIOS_EMAIL);
        const res = await cotizarEnvio('68276000', 'FLORIDABLANCA', 0, false, 33);
        console.log("Success! Cheapest is:", res.cheapest);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
