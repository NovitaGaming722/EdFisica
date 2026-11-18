// Lee un JSON de solapes.js y lista los defectos únicos por sección y fase
const d = require(require('path').resolve(process.argv[2]));
const phases = (process.argv[3] || 'reposo,fijada').split(',');
const only = process.argv[4] ? process.argv[4].split(',') : null;
const by = {};
d.results.forEach((r) => {
  if (!phases.includes(r.phase) || (only && !only.includes(r.sec))) return;
  r.issues.forEach((i) => {
    const k = r.sec + ' | ' + i.tipo + ' | ' + i.a + ' ↔ ' + i.b.replace(/-?\+?\d+px/g, 'Npx').replace(/\d+%/g, 'N%');
    (by[k] = by[k] || []).push(r.phase + ':' + r.tag);
  });
});
Object.keys(by).forEach((k) => console.log(k, '\n      ', by[k].slice(0, 6).join(', '), by[k].length > 6 ? '… (' + by[k].length + ')' : ''));
