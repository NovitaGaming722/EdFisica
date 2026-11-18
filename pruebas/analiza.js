/* Reevalúa un JSON de solapes.js con otros umbrales y resume por sección y fase.
   Uso: node analiza.js <json> [umbralArbol=0.12] [--detalle fase,fase] */
const fs = require('fs'), path = require('path');
const { analyse } = require('./lib-analisis.js');
const f = process.argv[2]; const thr = Number(process.argv[3] || 0.12);
const det = process.argv.includes('--detalle') ? process.argv[process.argv.indexOf('--detalle') + 1].split(',') : [];
const d = JSON.parse(fs.readFileSync(path.resolve(f)));
const sum = {}; const out = [];
d.results.forEach((r) => {
  if (r.raw) r.issues = analyse(r.raw.data, r.raw.cov, r.phase, { treeThr: thr, ctl: r.raw.ctl, nopin: Number(d.viewport.split('x')[0]) < 901, sec: r.sec });
  const S = (sum[r.sec] = sum[r.sec] || { reposo: 0, fijada: 0, transición: 0, puntos: 0, tipos: {} });
  S.puntos++;
  if (r.issues.length) {
    S[r.phase]++;
    if (r.phase !== 'transición') r.issues.forEach((i) => { S.tipos[i.tipo] = (S.tipos[i.tipo] || 0) + 1; });
  }
  if (det.includes(r.phase) && r.issues.length) out.push(r);
});
console.log(d.viewport + ' (umbral árbol ' + thr + ') — puntos con defectos: reposo / fijada / transición · tipos (reposo+fijada)');
let tr = 0, tf = 0, tt = 0, tp = 0;
Object.keys(sum).forEach((k) => {
  const s = sum[k]; tr += s.reposo; tf += s.fijada; tt += s.transición; tp += s.puntos;
  console.log('  ' + k.padEnd(13), String(s.reposo).padStart(3), String(s.fijada).padStart(3), String(s.transición).padStart(3), ' de', String(s.puntos).padStart(3), ' ', JSON.stringify(s.tipos));
});
console.log('  ' + 'TOTAL'.padEnd(13), String(tr).padStart(3), String(tf).padStart(3), String(tt).padStart(3), ' de', String(tp).padStart(3));
out.forEach((r) => { console.log('\n[' + r.sec + '] ' + r.phase + ' ' + r.tag); r.issues.slice(0, 14).forEach((i) => console.log('   ', i.tipo, '|', i.a, '|', i.b)); });
