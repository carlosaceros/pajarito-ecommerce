import { calcularSubsidioReal, isVeciSoacha } from './src/lib/shipping-zones';

console.log('--- INICIANDO PRUEBAS UNITARIAS DE LOGÍSTICA PAJARITO ---');

// Caso 1: 20L solo
const sub20L = calcularSubsidioReal([{ size: '20L', cantidad: 1 }]);
console.log(`Caso 1 (20L solo): Subsidio calculado = $${sub20L} | Esperado: $12000 ->`, sub20L === 12000 ? '✅ PASS' : '❌ FAIL');

// Caso 2: 20L x 2
const sub20Lx2 = calcularSubsidioReal([{ size: '20L', cantidad: 2 }]);
console.log(`Caso 2 (20L x 2): Subsidio calculado = $${sub20Lx2} | Esperado: $24000 ->`, sub20Lx2 === 24000 ? '✅ PASS' : '❌ FAIL');

// Caso 3: 20L + 10L
const sub20L_10L = calcularSubsidioReal([{ size: '20L', cantidad: 1 }, { size: '10L', cantidad: 1 }]);
console.log(`Caso 3 (20L + 10L): Subsidio calculado = $${sub20L_10L} | Esperado: $24000 ->`, sub20L_10L === 24000 ? '✅ PASS' : '❌ FAIL');

// Caso 4: 10L x 2 + Galón x 2 (El caso crítico de 28kg)
const subCombo28 = calcularSubsidioReal([{ size: '10L', cantidad: 2 }, { size: '3.8L', cantidad: 2 }]);
console.log(`Caso 4 (10L x2 + Galón x2): Subsidio calculado = $${subCombo28} | Esperado: $34000 ->`, subCombo28 === 34000 ? '✅ PASS' : '❌ FAIL');

// Caso 5: Galón solo
const subGalonSolo = calcularSubsidioReal([{ size: '3.8L', cantidad: 1 }]);
console.log(`Caso 5 (Galón solo): Subsidio calculado = $${subGalonSolo} | Esperado: $6000 ->`, subGalonSolo === 6000 ? '✅ PASS' : '❌ FAIL');

// Caso 6: Zonas Domicilio Gratis (Flota Propia)
const veciBogota = isVeciSoacha('11001000');
const veciCajica = isVeciSoacha('25126000');
const veciFusagasuga = isVeciSoacha('25290000');
console.log(`Caso 6a (Bogotá es veci):`, veciBogota ? '✅ PASS' : '❌ FAIL');
console.log(`Caso 6b (Cajicá es veci):`, veciCajica ? '✅ PASS' : '❌ FAIL');
console.log(`Caso 6c (Fusagasugá es veci):`, veciFusagasuga ? '✅ PASS' : '❌ FAIL');

console.log('--- TODAS LAS PRUEBAS COMPLETADAS ---');
