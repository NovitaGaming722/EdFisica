/* Evaluación de solapamientos a partir de los rectángulos medidos (compartida por solapes.js y analiza.js). */
const inter = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 3 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 3;

function analyse(data, cov, phase, ctx) {
  const okCtl = ({ all: () => true, none: () => false, top: (n) => /^(cabecera|progreso)/.test(n), bot: (n) => /^(contador|botón)/.test(n) })[ctx.ctl || 'all'];
  const issues = [];
  const { items, fixed, vw, vh } = data;
  const edgeTol = 2;
  // parte realmente visible de cada caja (recortada por los ancestros con overflow y por la ventana)
  items.forEach((it) => {
    const c = it.clip.r;
    it.v = { l: Math.max(it.l, c.l), t: Math.max(it.t, c.t), r: Math.min(it.r, c.r), b: Math.min(it.b, c.b) };
    it.hidden = it.v.r - it.v.l < 2 || it.v.b - it.v.t < 2;
  });
  const fade = (o) => /#tl-view/.test(o || '');     // bordes con máscara de fundido: entrada/salida, tolerado salvo en reposo
  items.forEach((it, i) => {
    if (it.hidden) return;
    const lab = it.el + (it.txt ? ' «' + it.txt + '»' : '');
    // 1) controles fijos (sobre la parte visible)
    fixed.forEach((f) => {
      if (okCtl(f.name) && inter(it.v, f)) issues.push({ tipo: 'control', a: lab, b: f.name });
    });
    // 2) bordes (viewport o ancestro con overflow)
    const c = it.clip.r, o = it.clip.ownerOf;
    const sides = [];
    const tol = (own) => phase !== 'reposo' && fade(own);
    if (it.l < c.l - edgeTol && !tol(o.l)) sides.push('izq(' + o.l + ') -' + Math.round(c.l - it.l) + 'px');
    if (it.r > c.r + edgeTol && !tol(o.r)) sides.push('der(' + o.r + ') +' + Math.round(it.r - c.r) + 'px');
    if (it.t < c.t - edgeTol && !(ctx.nopin && o.t === 'ventana')) sides.push('arr(' + o.t + ') -' + Math.round(c.t - it.t) + 'px');
    if (it.b > c.b + edgeTol && !(ctx.nopin && o.b === 'ventana')) sides.push('aba(' + o.b + ') +' + Math.round(it.b - c.b) + 'px');
    if (sides.length) issues.push({ tipo: 'borde', a: lab, b: sides.join(' ') });
    // 3) árbol: fracción de la tinta que se vería sobre hojas (cobertura × transparencia del fondo que la sostiene)
    const papel = ctx.sec === 'quiz';                         // el «papel» crema es opaco y la escena se pausa bajo él
    // v3 (intento 2): una tarjeta que solo tiene borde o un fondo tenue (p. ej. `.fx` con border-top, `.amb-box` al 5 %) está sostenida por el fondo del
    // ancestro que sí es opaco; y el texto del orbe de respiración (#br-num, #br-phase) va sobre el orbe, que es opaco.
    let back = it.back || 0;
    if (it.kind === 'tarjeta') (it.anc || []).forEach((j) => { const o = items[j]; if (o && (o.back || 0) >= 0.3) back = Math.max(back, o.back); });
    if (/#br-(num|phase)/.test(it.el)) back = 1;
    const expo = cov && !papel ? cov[i] * (1 - Math.min(1, back)) : 0;
    if (cov && expo > ctx.treeThr) issues.push({ tipo: 'arbol', a: lab, b: Math.round(cov[i] * 100) + '% de hojas detrás, fondo ' + Math.round((it.back || 0) * 100) + '%' });
  });
  // 4) entre sí (no anidados, con opacidad)
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (a.hidden || b.hidden) continue;
    if (a.elIdx === b.elIdx) continue;
    if (a.anc.includes(j) || b.anc.includes(i)) {
      // tarjeta contiene su texto: normal. Texto de otro elemento dentro de una tarjeta ajena, no.
      continue;
    }
    if (a.kind === 'tarjeta' && b.kind === 'tarjeta' && (a.anc.includes(j) || b.anc.includes(i))) continue;
    if (inter(a.v, b.v)) issues.push({ tipo: 'texto-texto', a: a.el + (a.txt ? ' «' + a.txt + '»' : ''), b: b.el + (b.txt ? ' «' + b.txt + '»' : '') });
  }
  // deduplica
  const k = new Set(); return issues.filter((x) => { const s = x.tipo + '|' + x.a + '|' + x.b; if (k.has(s)) return false; k.add(s); return true; });
}


module.exports = { analyse, inter };
