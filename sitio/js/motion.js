/* ============================================================
   LA RELAJACIÓN · motion.js — director del scroll
   Secciones fijadas (sticky) que se transforman al recorrerlas.
   · Una sola lectura de scroll por fotograma; solo se escribe transform y opacity.
   · Todas las medidas (posiciones, px de vw/vh/rem/%) se cachean al medir, nunca en el bucle.
   · Sin pins (móvil o «reducir movimiento»): el contenido queda en su estado final.

   Coordenada de cada sección: s = (scrollY − top) / alto de ventana.
     s = −1  la sección asoma por abajo · s = 0 se fija · s = E termina el pin · s = E+1 sale.
   Sintaxis declarativa (atributo data-fx, tramos separados por «|»):
     data-fx="rise @-.8,-.3"            preajuste + tramo [desde, hasta] en unidades s (e = fin del pin)
     data-fx="x:-20vw>0 o:0>1 @0,1"     propiedades x y s r o  (px, vw, vh, rem, %)
     data-fx="rise @-.8,-.3 | shrink @e,e+.9"
   data-stagger="rise @-.8,-.3 step.1"  reparte el escalonado entre los hijos
   data-lines="@-.9,-.4 step.12"        revelado con máscara de cada .ln
   data-words="@-.5,1"                  palabras que se encienden una a una
   data-par="x:.2 y:-.1"                parallax: desplazamiento = factor · s · alto de ventana
   data-h="@.3,e-.3"                    pista horizontal: el scroll vertical la desplaza
   Las curvas vienen del lenguaje de movimiento de FrameBudget (Animaciones.swift · Ritmo).
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const root = document.documentElement;

  /* ---------- Curvas (equivalentes CSS de Ritmo/FrameBudget) ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t;
    const D = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const e = X(t) - x, d = D(t); if (Math.abs(e) < 1e-5) return Y(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 20; i++) { const e = X(t); if (Math.abs(e - x) < 1e-5) break; if (e < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return Y(t);
    };
  }
  const EASE = {
    out: bezier(0.2, 0.7, 0.2, 1),      // --ease de FrameBudget (entrada suave)
    soft: bezier(0.16, 1, 0.3, 1),      // reel-ease
    io: bezier(0.65, 0, 0.25, 1),       // sx-ease-mask
    x: bezier(0.55, 0, 0.15, 1),        // sx-ease-x
    lin: (t) => t
  };
  R.ease = EASE;

  /* ---------- Preajustes ---------- */
  const PRESETS = {
    rise: 'y:6rem>0 o:0>1', fall: 'y:-6rem>0 o:0>1',
    left: 'x:-18vw>0 o:0>1', right: 'x:18vw>0 o:0>1',
    zoom: 's:.82>1 o:0>1', pop: 's:.55>1 o:0>1', fade: 'o:0>1',
    mask: 'y:112%>0',
    up: 'y:0>-8vh o:1>0', shrink: 's:1>.92 y:0>-5vh o:1>0', away: 's:1>1.1 o:1>0', sink: 'y:0>8vh o:1>0'
  };

  /* ---------- Estado ---------- */
  const st = {
    pins: false, secs: [], all: [], fx: [], words: [], pars: [], hs: [],
    y: 0, vh: 1, vw: 1, rem: 16, cur: 0, tween: null, last: 0, dirty: true, snapNext: true
  };
  R.motion = st;

  function parsePos(tok, E) {
    const m = String(tok).trim().match(/^(e)?([+-]?[\d.]+)?$/);
    if (!m) return 0;
    return (m[1] ? E : 0) + (m[2] ? parseFloat(m[2]) : 0);
  }
  function parseVal(v) {
    const m = String(v).trim().match(/^(-?[\d.]+)(vw|vh|rem|px|%)?$/);
    return m ? { n: parseFloat(m[1]), u: m[2] || '' } : { n: 0, u: '' };
  }
  function expand(str) {
    return str.split(/\s+/).map((t) => (PRESETS[t] ? PRESETS[t] : t)).join(' ');
  }
  function parseSpec(str, E, shift) {
    return str.split('|').map((part) => {
      const seg = { a: 0, b: 1, props: {}, ease: EASE.out };
      let d = 0;
      expand(part.trim()).split(/\s+/).forEach((tok) => {
        if (!tok) return;
        if (tok[0] === '@') { const [a, b] = tok.slice(1).split(','); seg.a = parsePos(a, E); seg.b = parsePos(b, E); }
        else if (/^d-?[\d.]+$/.test(tok)) d = parseFloat(tok.slice(1));
        else if (tok.indexOf('ease:') === 0) seg.ease = EASE[tok.slice(5)] || EASE.out;
        else if (tok.indexOf(':') > 0) { const [k, v] = tok.split(':'); const [f, t] = v.split('>'); seg.props[k] = { from: parseVal(f), to: parseVal(t) }; }
      });
      seg.a += d + shift; seg.b += d + shift;
      return seg;
    });
  }

  function toPx(v, el, axis) {
    switch (v.u) {
      case 'vw': return v.n * st.vw / 100;
      case 'vh': return v.n * st.vh / 100;
      case 'rem': return v.n * st.rem;
      case '%': return v.n * (axis === 'y' ? el.offsetHeight : el.offsetWidth) / 100;
      default: return v.n;
    }
  }

  /* ---------- Registro de elementos ---------- */
  function registerAll() {
    st.fx = []; st.words = []; st.pars = []; st.hs = [];
    st.all.forEach((sec) => {
      const E = sec.E;
      // escalonados (se expanden a data-fx de cada hijo)
      $$('[data-stagger]', sec.el).forEach((box) => {
        const spec = box.dataset.stagger; const m = spec.match(/\bstep(-?[\d.]+)/); const step = m ? parseFloat(m[1]) : 0.1;
        Array.from(box.children).forEach((ch, i) => {
          ch.dataset.fx = spec.replace(/\bstep-?[\d.]+/, '') + ' d' + (i * step).toFixed(3);
          ch.style.setProperty('--rd', (i * 0.08).toFixed(2) + 's');
        });
      });
      $$('[data-lines]', sec.el).forEach((box) => {
        const spec = box.dataset.lines; const m = spec.match(/\bstep(-?[\d.]+)/); const step = m ? parseFloat(m[1]) : 0.12;
        $$('.ln > span', box).forEach((sp, i) => {
          sp.dataset.fx = 'mask ' + spec.replace(/\bstep-?[\d.]+/, '') + ' d' + (i * step).toFixed(3);
        });
      });
      $$('[data-fx]', sec.el).forEach((el) => {
        st.fx.push({ el, sec, segs: parseSpec(el.dataset.fx, E, 0), raw: null, tf: '', op: '' });
      });
      $$('[data-words]', sec.el).forEach((el) => {
        const [a, b] = el.dataset.words.replace('@', '').split(',').map((t) => parsePos(t, E));
        st.words.push({ el, sec, a, b, ws: $$('.w', el), v: [] });
      });
      $$('[data-par]', sec.el).forEach((el) => {
        const o = { x: 0, y: 0 };
        el.dataset.par.split(/\s+/).forEach((t) => { const [k, v] = t.split(':'); if (k) o[k] = parseFloat(v); });
        st.pars.push({ el, sec, fx: o.x, fy: o.y, tf: '' });
      });
      $$('[data-h]', sec.el).forEach((el) => {
        const [a, b] = el.dataset.h.replace('@', '').split(',').map((t) => parsePos(t, E));
        const h = { el, sec, a, b, dist: 0, p: 0, hp: [] };
        $$('[data-hp]', el).forEach((c) => h.hp.push({ el: c, k: parseFloat(c.dataset.hp), cx: 0, tf: '' }));
        sec.h = h; st.hs.push(h);
      });
    });
  }

  /* ---------- Medidas (fuera del bucle de scroll) ---------- */
  function measure() {
    st.vh = window.innerHeight; st.vw = window.innerWidth;
    st.rem = parseFloat(getComputedStyle(root).fontSize) || 16;
    const y0 = window.scrollY;
    st.all.forEach((sec) => {
      const r = sec.el.getBoundingClientRect();
      sec.top = r.top + y0; sec.height = sec.el.offsetHeight;
      sec.travel = Math.max(0, sec.height - st.vh);
      sec.E = st.pins && sec.pin ? sec.travel / st.vh : 0;
    });
    st.fx.forEach((f) => {
      f.res = {};
      f.segs.forEach((seg) => Object.keys(seg.props).forEach((k) => {
        const p = seg.props[k], ax = k === 'y' ? 'y' : 'x';
        p.f = k === 'x' || k === 'y' ? toPx(p.from, f.el, ax) : p.from.n;
        p.t = k === 'x' || k === 'y' ? toPx(p.to, f.el, ax) : p.to.n;
      }));
    });
    st.hs.forEach((h) => {
      const view = h.el.parentElement;
      h.dist = Math.max(0, h.el.scrollWidth - view.clientWidth);
      h.vw = view.clientWidth;
      h.hp.forEach((c) => {
        // posición horizontal del elemento respecto a la pista (que es position:relative)
        let x = 0, node = c.el;
        while (node && node !== h.el) { x += node.offsetLeft; node = node.offsetParent; }
        c.cx = x + c.el.offsetWidth / 2;
      });
    });
    st.docH = document.documentElement.scrollHeight;
    st.dirty = true;
    if (R.onMeasure) R.onMeasure();
  }

  function recompute(sec) { return (st.y - sec.top) / st.vh; }

  /* ---------- Escritura por fotograma ---------- */
  function applyFx(f, s) {
    let x = 0, y = 0, sc = 1, r = 0, o = 1, hasT = false, hasO = false;
    const segs = f.segs;
    const acc = {};
    for (let i = 0; i < segs.length; i++) {
      const g = segs[i];
      const t = g.b > g.a ? clamp((s - g.a) / (g.b - g.a), 0, 1) : (s >= g.b ? 1 : 0);
      const e = g.ease(t);
      for (const k in g.props) {
        const p = g.props[k];
        if (s < g.a) { if (acc[k] === undefined) acc[k] = p.f; }
        else acc[k] = lerp(p.f, p.t, e);
      }
    }
    if (acc.x !== undefined) { x = acc.x; hasT = true; }
    if (acc.y !== undefined) { y = acc.y; hasT = true; }
    if (acc.s !== undefined) { sc = acc.s; hasT = true; }
    if (acc.r !== undefined) { r = acc.r; hasT = true; }
    if (acc.o !== undefined) { o = acc.o; hasO = true; }
    if (hasT) {
      const tf = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + (sc !== 1 ? ' scale(' + sc.toFixed(4) + ')' : '') + (r ? ' rotate(' + r.toFixed(2) + 'deg)' : '');
      if (tf !== f.tf) { f.tf = tf; f.el.style.transform = tf; }
    }
    if (hasO) {
      const os = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
      if (os !== f.op) { f.op = os; f.el.style.opacity = os; f.el.style.visibility = ''; }
    }
  }

  function applyWords(w, s) {
    const n = w.ws.length; if (!n) return;
    const q = clamp((s - w.a) / (w.b - w.a), 0, 1) * n;
    for (let i = 0; i < n; i++) {
      const v = clamp(q - i, 0, 1);
      const o = (0.16 + 0.84 * EASE.out(v)).toFixed(2);
      if (w.v[i] !== o) { w.v[i] = o; w.ws[i].style.opacity = o; }
    }
  }

  function applyH(h, s) {
    const q = clamp((s - h.a) / (h.b - h.a), 0, 1);
    h.p = q;
    const x = -h.dist * q;
    const tf = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    if (tf !== h.tf) { h.tf = tf; h.el.style.transform = tf; }
    const center = h.vw / 2;
    for (let i = 0; i < h.hp.length; i++) {
      const c = h.hp[i];
      const off = c.cx + x - center;              // distancia del panel al centro de la vista
      const t = 'translate3d(' + (off * c.k).toFixed(1) + 'px,0,0)';
      if (t !== c.tf) { c.tf = t; c.el.style.transform = t; }
    }
    if (R.onHScroll) R.onHScroll(h.sec.id, q, h);
  }

  /* ---------- Bucle ---------- */
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - st.last) / 1000, 0.1); st.last = now;
    const y = window.scrollY;
    const moved = y !== st.y;
    if (st.tween) tweenStep(now);
    st.y = window.scrollY;
    const secs = st.secs, all = st.all, vh = st.vh;
    // sección actual y mezcla con la siguiente (para el árbol 3D)
    let cur = 0;
    for (let k = 0; k < secs.length; k++) if (secs[k].top <= st.y + vh * 0.5) cur = k;
    const nx = secs[cur + 1];
    const tNext = nx ? clamp((st.y + vh - nx.top) / (vh * 0.95), 0, 1) : 0;
    if (cur !== st.cur) { st.cur = cur; if (R.onSection) R.onSection(cur); }
    const A = secs[cur];
    const qA = A.E > 0 ? clamp(recompute(A) / A.E, 0, 1) : 0;
    if (R.scene && R.scene.setPose) R.scene.setPose(A.id, qA, nx ? nx.id : A.id, smooth(tNext));
    R.sceneCovered = !!(A.covers && recompute(A) > 0.25 && recompute(A) < A.E + 0.2 && tNext < 0.2) || (nx && nx.covers && tNext > 0.8);

    if (!st.pins) { if (R.onFrame) R.onFrame(st.y, cur, 0); return; }

    const k = st.snapNext ? 1 : 1 - Math.exp(-dt * 9);
    let busy = false;
    for (let i = 0; i < all.length; i++) {
      let moving = false;
      const sec = all[i];
      const target = recompute(sec);
      const near = target > -1.35 && target < sec.E + 1.35;
      if (!near) { if (sec.live) { sec.live = false; sec.el.classList.remove('live'); } continue; }
      if (!sec.live) { sec.live = true; sec.el.classList.add('live'); sec.s = target; sec.force = true; }
      const d = target - sec.s;
      if (Math.abs(d) > 0.0004) { sec.s += d * k; moving = true; } else if (d !== 0) { sec.s = target; moving = true; }
      if (moving) busy = true;
      if (!moving && !sec.force && !st.dirty) continue;
      sec.force = false;
      const s = sec.s;
      for (let j = 0; j < st.fx.length; j++) { const f = st.fx[j]; if (f.sec === sec) applyFx(f, s); }
      for (let j = 0; j < st.words.length; j++) { const w = st.words[j]; if (w.sec === sec) applyWords(w, s); }
      for (let j = 0; j < st.pars.length; j++) {
        const p = st.pars[j]; if (p.sec !== sec) continue;
        const tf = 'translate3d(' + (p.fx * s * st.vw).toFixed(1) + 'px,' + (p.fy * s * vh).toFixed(1) + 'px,0)';
        if (tf !== p.tf) { p.tf = tf; p.el.style.transform = tf; }
      }
      if (sec.h) applyH(sec.h, s);
    }
    st.dirty = false; st.snapNext = false;
    if (R.onFrame) R.onFrame(st.y, cur, moved || busy ? 1 : 0);
  }

  /* ---------- Desplazamiento animado (flechas, índice, botones) ---------- */
  function tweenStep(now) {
    const t = st.tween;
    const k = clamp((now - t.t0) / t.dur, 0, 1);
    window.scrollTo(0, Math.round(lerp(t.from, t.to, EASE.io(k))));
    if (k >= 1) { const done = t.done; st.tween = null; if (done) done(); }
  }
  function scrollToY(y, opts) {
    opts = opts || {};
    y = clamp(Math.round(y), 0, Math.max(0, document.documentElement.scrollHeight - st.vh));
    const from = window.scrollY, dist = Math.abs(y - from);
    if (R.reduced || !dist) { st.tween = null; window.scrollTo(0, y); if (opts.done) opts.done(); return; }
    const dur = clamp(520 + dist * 0.28, 650, 1700);
    st.tween = { from, to: y, t0: performance.now(), dur: opts.dur || dur, done: opts.done };
  }
  function cancelTween() { st.tween = null; }
  ['wheel', 'touchstart', 'pointerdown'].forEach((ev) => window.addEventListener(ev, cancelTween, { passive: true }));

  st.scrollToY = scrollToY;
  st.cancel = cancelTween;
  st.yOfS = (i, s) => st.secs[i].top + s * st.vh;
  st.stopY = (i) => {
    const sec = st.secs[i];
    const s = typeof sec.stopFn === 'function' ? sec.stopFn() : sec.stop;
    return sec.top + (st.pins ? s : 0) * st.vh;
  };
  st.sOf = (i) => recompute(st.secs[i]);

  /* ---------- Arranque ---------- */
  st.init = function (slides, bands) {
    const mk = (el, band) => {
      const pin = el.classList.contains('pin');
      const E = pin ? parseFloat(el.dataset.pin) || 0 : 0;
      return { el, id: el.id, band, pin, pinE: E, E, stop: el.dataset.stop != null ? parseFloat(el.dataset.stop) : E, covers: el.hasAttribute('data-covers'), s: 0, top: 0, height: 0, travel: 0, live: false };
    };
    st.secs = slides.map((el) => mk(el, false));
    // bandas de respiro: se procesan igual (parallax) pero no cuentan como secciones
    st.all = st.secs.concat(bands.map((el) => mk(el, true)));
    st.all.forEach((sec) => { if (sec.pin) sec.el.style.setProperty('--pin', sec.pinE); });
    st.last = performance.now();
    applyMode();
    registerAll();
    measure();
    st.y = window.scrollY;
    requestAnimationFrame(frame);
  };

  /* Modo: con pins (escritorio) o plano (móvil / movimiento reducido) */
  const mq = window.matchMedia('(min-width: 901px)');
  function applyMode() {
    const on = !R.reduced && mq.matches;
    st.pins = on;
    root.classList.toggle('pins', on);
    root.classList.toggle('nopin', !on);
    root.classList.toggle('reduced', !!R.reduced);
    // el carril horizontal (modo plano) se recorre con el teclado: debe poder recibir el foco
    $$('.tl-view').forEach((v) => { if (on) v.removeAttribute('tabindex'); else v.setAttribute('tabindex', '0'); });
    if (!on) clearInline();
  }
  function clearInline() {
    st.fx.forEach((f) => { f.el.style.transform = ''; f.el.style.opacity = ''; f.tf = ''; f.op = ''; });
    st.pars.forEach((p) => { p.el.style.transform = ''; p.tf = ''; });
    st.words.forEach((w) => w.ws.forEach((x) => { x.style.opacity = ''; }));
    st.hs.forEach((h) => { h.el.style.transform = ''; h.tf = ''; h.hp.forEach((c) => { c.el.style.transform = ''; c.tf = ''; }); });
  }
  st.measure = function (keepPlace, toTop) {
    let sec = null, s = 0;
    if (keepPlace && st.secs.length) { sec = st.secs[st.cur]; s = toTop ? 0 : recompute(sec); }
    measure();
    if (sec) { window.scrollTo(0, Math.round(sec.top + s * st.vh)); st.y = window.scrollY; }
    st.all.forEach((x) => { x.force = true; });
    st.snapNext = true;
  };
  st.snap = function () { st.snapNext = true; st.dirty = true; };
  // Patrón de useReducedMotion.js (FrameBudget): reacciona si cambia la preferencia del sistema
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  mqReduce.addEventListener('change', () => { if (mqReduce.matches !== !!R.reduced) location.reload(); });
  mq.addEventListener('change', () => { applyMode(); st.measure(true, true); });   // al cambiar de modo se vuelve al inicio de la sección

  let rz = null;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => st.measure(true), 120); });
  window.addEventListener('load', () => st.measure(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (st.secs.length) st.measure(true); });

  /* Revelado simple al entrar (modo plano): sin pins ni parallax */
  st.initReveal = function () {
    if (R.reduced || !('IntersectionObserver' in window)) { $$('[data-fx]').forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('[data-fx]').forEach((e) => io.observe(e));
  };
})();
