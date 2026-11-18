/* Prueba automática de solapamientos del sitio (v3).
   Uso: node solapes.js <ancho> <alto> <url-base> <salida.json> [seccion,seccion…]
   Requiere playwright-core (se busca en NODE_PATH o en la ruta de PW) y Brave/Chromium.

   Para cada sección y varios puntos del scroll mide los rectángulos de:
     · TEXTOS (una caja por línea) y TARJETAS (cajas con fondo o borde) de la sección
   y los compara con:
     · CONTROLES FIJOS: cabecera (marca, autoría), barra inferior (contador, botones), carril de puntos, barra de progreso
     · BORDES: del viewport y de cualquier ancestro con overflow ≠ visible (texto o tarjeta cortados)
     · ÁRBOL 3D: fracción de píxeles del lienzo WebGL (capturado solo) que quedan detrás del rectángulo
     · OTROS textos/tarjetas (no anidados)
   Cada punto se clasifica como:
     reposo      el scroll está en una «parada» (parada de la sección o paso de un stepper) → debe estar limpio
     fijada      sección pegada (0 ≤ s ≤ E), en movimiento entre paradas → debe estar limpio salvo entradas/salidas por el borde
     transición  la sección entra (s < 0) o sale (s > E): contenido en vuelo, solo informativo
   Solo cuentan los elementos con opacidad efectiva ≥ 0.3. */
const path = require('path');
const fs = require('fs');
const PW = process.env.PW || '/Users/santiago/.hermes/hermes-agent/node_modules/playwright-core';
const { chromium } = require(PW);

const [W, H, BASE, OUT, ONLY] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4], process.argv[5], process.argv[6]];
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const STEP = Number(process.env.STEP || 0.15);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- dentro de la página: recoge rectángulos ---------- */
function collect(secId, opts) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const sec = document.getElementById(secId);
  const stage = sec.querySelector('.stage') || sec;
  const items = [];
  const effOpacity = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.visibility === 'hidden' || cs.display === 'none') return 0;
      o *= parseFloat(cs.opacity);
    }
    return o;
  };
  const clipRect = (el) => {                       // intersección de los ancestros que recortan
    let r = { l: 0, t: 0, r: vw, b: vh }, ownerOf = { l: 'ventana', t: 'ventana', r: 'ventana', b: 'ventana' };
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if ((cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && !n.classList.contains('ln')) {
        const b = n.getBoundingClientRect();
        const nm = (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ')[0] : '');
        if (cs.overflowX !== 'visible') { if (b.left > r.l) { r.l = b.left; ownerOf.l = nm; } if (b.right < r.r) { r.r = b.right; ownerOf.r = nm; } }
        if (cs.overflowY !== 'visible') { if (b.top > r.t) { r.t = b.top; ownerOf.t = nm; } if (b.bottom < r.b) { r.b = b.bottom; ownerOf.b = nm; } }
      }
    }
    return { r, ownerOf };
  };
  const label = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };
  const skip = (el) => el.closest('.numeral,.bg-glow,.sr-only,script,style,svg text,[data-solape-ignora],.flip[aria-pressed="false"] .face.back,.flip[aria-pressed="true"] .face.front');
  // textos
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  const seen = new Map();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || skip(el)) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1);
    if (!rects.length) continue;
    const op = effOpacity(el); if (op < 0.3) continue;
    const key = el;
    let back = 0;                                   // opacidad del fondo que sostiene al texto (tarjeta, chip…)
    for (let n = el; n && n !== stage; n = n.parentElement) {
      const m = getComputedStyle(n).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(','); const a = p.length > 3 ? parseFloat(p[3]) : 1; if (a >= 0.3) { back = Math.max(back, a); break; } }
    }
    const cr = clipRect(el);
    const cs0 = getComputedStyle(el); const lhPx = parseFloat(cs0.lineHeight) || 0;
    rects.forEach((r0) => {
      let r = { left: r0.left, right: r0.right, top: r0.top, bottom: r0.bottom };
      const h0 = r0.height; const lh = lhPx > 0 ? Math.min(lhPx, h0) : h0;
      const mid = (r0.top + r0.bottom) / 2; r.top = mid - lh / 2 * 0.92; r.bottom = mid + lh / 2 * 0.92;   // tinta ≈ 92 % de la línea
      if (r.right < -50 || r.left > vw + 50 || r.bottom < -50 || r.top > vh + 50) return;
      items.push({ kind: 'texto', el: label(el), txt: n.nodeValue.trim().slice(0, 28), l: r.left, t: r.top, r: r.right, b: r.bottom, op, back, clip: cr, node: null, ref: seen.get(key) || (seen.set(key, items.length), items.length) });
      items[items.length - 1]._el = el;
    });
  }
  // tarjetas: elementos con fondo o borde visibles y tamaño de tarjeta
  stage.querySelectorAll('*').forEach((el) => {
    if (skip(el) || el.closest('.paper') === el) return;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
    const a = bg ? (bg[1].split(',').length > 3 ? parseFloat(bg[1].split(',')[3]) : 1) : 0;
    const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
    const hasBorder = bw > 0 && cs.borderTopStyle !== 'none' && !/rgba\(\d+, \d+, \d+, 0\)/.test(cs.borderTopColor);
    if (!(a >= 0.3 || hasBorder)) return;
    if (el.matches('.paper,.bg-glow,i,button,.btn,kbd,.q-dots i,.tl-node,.tl-node *,.chip')) return;   // botones: ya cuentan por su texto
    const b = el.getBoundingClientRect();
    if (b.width < 60 || b.height < 30 || b.width * b.height > vw * vh * 0.7) return;
    if (b.right < -50 || b.left > vw + 50 || b.bottom < -50 || b.top > vh + 50) return;
    const op = effOpacity(el); if (op < 0.3) return;
    // cajas que giran (flips): se usa su caja envolvente
    const cr = clipRect(el);
    const it = { kind: 'tarjeta', el: label(el), txt: '', l: b.left, t: b.top, r: b.right, b: b.bottom, op, back: a, clip: cr, bgAlpha: a };
    it._el = el; items.push(it);
  });
  // controles fijos
  const fixed = [];
  const addFixed = (sel, name) => document.querySelectorAll(sel).forEach((el) => {
    const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    fixed.push({ name: name + ' ' + (el.id ? '#' + el.id : el.className.toString().split(' ')[0] || el.tagName.toLowerCase()), l: b.left, t: b.top, r: b.right, b: b.bottom });
  });
  addFixed('.chrome-top .brand', 'cabecera');
  addFixed('.chrome-top .credit', 'cabecera');
  addFixed('.chrome-bottom .status', 'contador');
  addFixed('.chrome-bottom .ibtn', 'botón');
  addFixed('.rail button', 'carril');
  addFixed('.progress', 'progreso');
  // quita referencias no serializables y calcula anidamiento
  const out = items.map((it, i) => {
    const anc = [];
    items.forEach((o, j) => { if (j !== i && o._el !== it._el && (o._el.contains(it._el))) anc.push(j); });
    const same = [];
    items.forEach((o, j) => { if (j !== i && o._el === it._el) same.push(j); });
    return { i, kind: it.kind, el: it.el, txt: it.txt, l: it.l, t: it.t, r: it.r, b: it.b, op: it.op, back: it.back, clip: it.clip, bgAlpha: it.bgAlpha, anc, same, elIdx: items.findIndex((o) => o._el === it._el) };
  });
  return { items: out, fixed, vw, vh };
}

/* ---------- en la página: cobertura del árbol sobre cada rectángulo ---------- */
async function coverage(page, rects) {
  // Cobertura = fracción de BLOQUES de 6×6 px con brillo medio alto (el polvo disperso del fondo no cuenta; el follaje, sí)
  return page.evaluate(async ({ b64, rects }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data, B = 6, gw = Math.ceil(c.width / B), gh = Math.ceil(c.height / B);
    const grid = new Float32Array(gw * gh);
    for (let by = 0; by < gh; by++) for (let bx = 0; bx < gw; bx++) {
      let sum = 0, n = 0;
      for (let y = by * B; y < Math.min(c.height, by * B + B); y++) for (let x = bx * B; x < Math.min(c.width, bx * B + B); x++) { const p = (y * c.width + x) * 4; sum += Math.max(d[p], d[p + 1], d[p + 2]); n++; }
      grid[by * gw + bx] = sum / n;
    }
    return rects.map((r) => {
      const x0 = Math.max(0, Math.floor(r.l / B)), y0 = Math.max(0, Math.floor(r.t / B)), x1 = Math.min(gw - 1, Math.floor(r.r / B)), y1 = Math.min(gh - 1, Math.floor(r.b / B));
      if (x1 < x0 || y1 < y0) return 0;
      let n = 0, tot = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { tot++; if (grid[y * gw + x] > 38) n++; }
      return n / tot;
    });
  }, { b64: rects.__b64, rects });
}

const { analyse } = require('./lib-analisis.js');

(async () => {
  const browser = await chromium.launch({ executablePath: BRAVE, headless: true, args: ['--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', isMobile: W < 700, hasTouch: W < 700 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));
  await page.addStyleTag({ content: 'html.__cv main,html.__cv main *,html.__cv .chrome,html.__cv .chrome *,html.__cv .rail,html.__cv .rail *,html.__cv .progress,html.__cv .progress *,html.__cv .bg,html.__cv .bg *,html.__cv .bg-glow,html.__cv .overlay,html.__cv .skip{visibility:hidden!important} html.__cv main,html.__cv .chrome,html.__cv .rail,html.__cv .progress,html.__cv .bg,html.__cv .bg-glow,html.__cv .overlay{opacity:0!important} html.__cv{background:#000!important} html.__cv *{transition:none!important;animation:none!important}' });
  await sleep(1500);
  const info = await page.evaluate(() => ({ pins: Relax.motion.pins, vh: innerHeight, secs: Relax.motion.secs.map((s) => ({ id: s.id, top: s.top, E: s.E, stop: Relax.motion.pins ? (typeof s.stopFn === 'function' ? s.stopFn() : s.stop) : 0 })) }));
  const secs = info.secs.filter((s) => !ONLY || ONLY.split(',').includes(s.id));
  const results = [];
  const treeThr = Number(process.env.TREE || 0.12);

  async function sample(sec, y, phase, tag, wait, ctl = 'all') {
    await page.evaluate((y) => { Relax.motion.cancel && Relax.motion.cancel(); window.scrollTo(0, y); Relax.motion.snap(); }, Math.round(y));
    await sleep(wait || 1100);
    const data = await page.evaluate(collect, sec.id);
    let cov = null;
    if (info.pins) {                      // árbol solo con pins (en móvil la escena va a baja opacidad; se mide igual)
      await page.evaluate(() => document.documentElement.classList.add('__cv'));
      await sleep(120);
      const buf = await page.screenshot({ type: 'png' });
      await page.evaluate(() => document.documentElement.classList.remove('__cv'));
      const rects = data.items.map((x) => ({ l: x.l, t: x.t, r: x.r, b: x.b })); rects.__b64 = buf.toString('base64');
      cov = await coverage(page, rects);
    }
    const issues = analyse(data, cov, phase, { treeThr, ctl, nopin: !info.pins, sec: sec.id });
    const raw = { data, cov, ctl };
    const s = (await page.evaluate((id) => Relax.motion.sOf ? Relax.motion.sOf(Relax.motion.secs.findIndex((x) => x.id === id)) : 0, sec.id));
    results.push({ sec: sec.id, tag, phase, s: Math.round(s * 100) / 100, y: Math.round(y), n: data.items.length, issues, raw });
    process.stderr.write('.');
  }

  if (info.pins) {
    for (const sec of secs) {
      const k = info.secs.findIndex((x) => x.id === sec.id);
      const stops = await page.evaluate((k) => {
        const m = Relax.motion, sec = m.secs[k], st = Relax.stepper[sec.id];
        const o = [{ y: m.stopY(k), tag: 'parada' }];
        if (st && st.pos) for (let i = 0; i < st.n; i++) o.push({ y: st.pos(i), tag: 'paso ' + (i + 1) + '/' + st.n });
        return o;
      }, k);
      // recorrido continuo
      const ss = [];
      for (let s = -0.9; s <= sec.E + 0.9 + 1e-6; s += STEP) ss.push(Math.round(s * 1000) / 1000);
      for (const s of ss) {
        const phase = s < 0 || s > sec.E ? 'transición' : 'fijada';
        await sample(sec, sec.top + s * info.vh, phase, 's=' + s.toFixed(2));
      }
      // reposos
      for (const st of stops) {
        if (!(await page.evaluate(() => true))) continue;
        await page.evaluate((id) => { const s = Relax.stepper[id]; if (s && s.set) s.set(0, true); }, sec.id);
        const stepIdx = /paso (\d+)/.exec(st.tag);
        if (stepIdx) await page.evaluate(([id, i]) => Relax.stepper[id].set(i, true), [sec.id, Number(stepIdx[1]) - 1]);
        await sample(sec, st.y, 'reposo', st.tag, 1700);
      }
      // pasos de los demás steppers (sin posición propia): se fijan en la parada
      const st = await page.evaluate((id) => { const s = Relax.stepper[id]; return s && !s.pos ? s.n : 0; }, sec.id);
      const m = await page.evaluate((k) => Relax.motion.stopY(k), k);
      for (let i = 0; i < st; i++) {
        await page.evaluate(([id, i]) => Relax.stepper[id].set(i, true), [sec.id, i]);
        await sample(sec, m, 'reposo', 'paso ' + (i + 1) + '/' + st, 1500);
      }
      await page.evaluate((id) => { const s = Relax.stepper[id]; if (s && s.set) s.set(0, true); }, sec.id);
    }
  } else {
    // sin pins (móvil): se alinea cada sección con su parte alta y se recorre; la línea de tiempo se recorre por tarjetas
    const TOP = 'top', BOT = 'bot', NONE = 'none';
    for (const sec of secs) {
      const len = await page.evaluate((id) => document.getElementById(id).offsetHeight, sec.id);
      const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      // inicio de la sección (su parte alta bajo la cabecera) · recorrido · final (su parte baja sobre la barra inferior)
      await sample(sec, sec.top, 'reposo', 'inicio', 500, TOP);
      for (let y = sec.top + info.vh * 0.5; y < sec.top + len - info.vh; y += info.vh * 0.5) await sample(sec, y, 'fijada', 'y=+' + Math.round(y - sec.top), 400, NONE);
      await sample(sec, Math.min(maxY, sec.top + len - info.vh), 'reposo', 'final', 500, BOT);
      if (sec.id === 'historia') {
        const n = await page.evaluate(() => document.querySelectorAll('#tl-view .tl-ev, #tl-view .tl-intro').length);
        for (let i = 0; i < n; i++) {
          await page.evaluate((i) => { const v = document.getElementById('tl-view'); const c = v.querySelectorAll('.tl-intro, .tl-ev')[i]; v.scrollTo({ left: c.offsetLeft - (v.clientWidth - c.offsetWidth) / 2, behavior: 'instant' }); }, i);
          await sample(sec, sec.top, 'reposo', 'carril ' + (i + 1) + '/' + n, 600, NONE);
        }
        await page.evaluate(() => document.getElementById('tl-view').scrollTo({ left: 0, behavior: 'instant' }));
      }
    }
    // desbordamiento horizontal de la página
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    results.push({ sec: '(página)', tag: 'desborde horizontal', phase: 'reposo', s: 0, y: 0, n: 0, issues: ov.sw > ov.iw + 1 ? [{ tipo: 'borde', a: 'documento', b: 'scrollWidth ' + ov.sw + ' > ' + ov.iw }] : [] });
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify({ viewport: W + 'x' + H, base: BASE, treeThr, errs, results }, null, 1));
  // resumen
  const sum = {};
  results.forEach((r) => {
    sum[r.sec] = sum[r.sec] || { reposo: 0, fijada: 0, transición: 0, puntos: 0 };
    sum[r.sec].puntos++;
    if (r.issues.length) sum[r.sec][r.phase] += 1;
  });
  console.log('\n' + W + 'x' + H + ' — puntos con defectos por sección (reposo / fijada / transición):');
  Object.keys(sum).forEach((k) => console.log('  ' + k.padEnd(13), String(sum[k].reposo).padStart(3), String(sum[k].fijada).padStart(3), String(sum[k].transición).padStart(3), ' de', sum[k].puntos));
  if (errs.length) console.log('Consola:', errs.slice(0, 5));
})().catch((e) => { console.error(e); process.exit(1); });
