/* ============================================================
   LA RELAJACIÓN · modo exposición
   Navegación por paradas, progreso, pantalla completa, atajos.
   El scroll dinámico (pins, parallax, máscaras) vive en motion.js.
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  R.init = R.init || [];
  R.hotkeys = R.hotkeys || {};
  R.stepper = R.stepper || {};
  R.onLeave = R.onLeave || {};
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, '0');

  const slides = $$('.slide');
  const bands = $$('.band');
  const ids = slides.map((s) => s.id);
  const N = slides.length;
  R.ids = ids;
  R.active = ids[0];
  let cur = 0, navTarget = null;
  const M = () => R.motion;

  /* ---------- Texto que se enciende palabra a palabra ---------- */
  function splitWords() {
    $$('.split').forEach((el) => {
      let i = 0;
      (function walk(node) {
        Array.from(node.childNodes).forEach((ch) => {
          if (ch.nodeType === 3) {
            const frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach((tok) => {
              if (!tok) return;
              if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(tok));
              else { const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--wi', i++); s.textContent = tok; frag.appendChild(s); }
            });
            ch.replaceWith(frag);
          } else if (ch.nodeType === 1) walk(ch);
        });
      })(el);
    });
  }

  /* ---------- Navegación ----------
     Cada sección tiene una «parada» (M.stopY): el punto del scroll donde su coreografía
     ya terminó y se puede interactuar. Las flechas recorren parada → pasos → siguiente parada. */
  function goTo(i, dir) {
    i = clamp(i, 0, N - 1);
    const st = R.stepper[ids[i]];
    let y = M().stopY(i);
    if (st && dir != null && i !== cur) {
      const k = dir < 0 ? st.n - 1 : 0;
      st.set(k, true);
      if (st.pos && M().pins) y = st.pos(k);
    }
    navTarget = i;
    M().scrollToY(y, { done: () => { navTarget = null; } });
    if (R.reduced) { navTarget = null; setCurrent(i); }
  }
  R.goToId = (id) => { const i = ids.indexOf(id); if (i >= 0) goTo(i, 1); };

  function toStop(i) {
    navTarget = i;
    M().scrollToY(M().stopY(i), { done: () => { navTarget = null; } });
  }

  function next() {
    const base = navTarget != null ? navTarget : cur;
    const st = R.stepper[ids[base]];
    if (navTarget == null) {
      // primero se completa la transformación de la sección; luego sus pasos
      if (M().pins && window.scrollY < M().stopY(base) - 0.12 * M().vh) { toStop(base); return; }
      if (st && st.i < st.n - 1) { st.set(st.i + 1); return; }
    }
    if (base < N - 1) goTo(base + 1, 1);
  }
  function prev() {
    const base = navTarget != null ? navTarget : cur;
    const st = R.stepper[ids[base]];
    if (navTarget == null) {
      if (st && st.i > 0) { st.set(st.i - 1); return; }
      if (M().pins && window.scrollY > M().stopY(base) + 0.12 * M().vh) { toStop(base); return; }
    }
    if (base > 0) goTo(base - 1, -1);
  }
  R.next = next; R.prev = prev;

  /* ---------- Estado visible ---------- */
  const elNum = $('#st-num'), elName = $('#st-name'), elTot = $('#st-total'), fill = $('#progress-fill');
  const glow1 = $('#glow-1'), glow2 = $('#glow-2');
  elTot.textContent = pad(N);
  let lastProg = -1, lastLabel = '';

  function setCurrent(i) {
    const prevId = ids[cur];
    if (i === cur && R.active === ids[i] && slides[i].classList.contains('is-active')) return;
    cur = i; R.active = ids[i];
    if (R.onLeave[prevId] && prevId !== ids[i]) R.onLeave[prevId]();
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    elNum.textContent = pad(i + 1);
    $$('#rail button').forEach((b, k) => b.classList.toggle('on', k === i));
    $$('#menu-list button').forEach((b, k) => b.classList.toggle('on', k === i));
    try { history.replaceState(null, '', '#' + ids[i]); } catch (e) { /* file:// restringido */ }
    document.title = (i === 0 ? '' : slides[i].dataset.title + ' · ') + 'La relajación — Exposición interactiva';
  }

  // Los llama motion.js una vez por fotograma
  R.onSection = (i) => setCurrent(i);
  R.onFrame = (y, c) => {
    if (navTarget != null && !M().tween) navTarget = null;
    const max = Math.max(1, (M().docH || document.documentElement.scrollHeight) - M().vh);
    const p = clamp(y / max, 0, 1);
    if (Math.abs(p - lastProg) > 1e-4) {
      lastProg = p; fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (glow1 && M().pins) {   // capas de luz de fondo con parallax global
        glow1.style.transform = 'translate3d(' + (-p * 30).toFixed(1) + 'vw,' + (p * 70).toFixed(1) + 'vh,0)';
        glow2.style.transform = 'translate3d(' + (p * 26).toFixed(1) + 'vw,' + (-p * 60).toFixed(1) + 'vh,0)';
      }
    }
    const st = R.stepper[ids[c]];
    const label = slides[c].dataset.title + (st && !st.quiet && st.n > 1 ? ' · paso ' + (st.i + 1) + '/' + st.n : '');
    if (label !== lastLabel) { lastLabel = label; elName.textContent = label; }
  };

  /* ---------- Rail e índice ---------- */
  function buildNav() {
    const rail = $('#rail'), list = $('#menu-list');
    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', pad(i + 1) + ' · ' + s.dataset.title);
      b.innerHTML = '<span>' + s.dataset.title + '</span>';
      b.addEventListener('click', () => goTo(i, 1));
      rail.appendChild(b);
      const li = document.createElement('li'), m = document.createElement('button');
      m.type = 'button'; m.innerHTML = '<b>' + pad(i + 1) + '</b>' + s.dataset.title;
      m.addEventListener('click', () => { closeOverlays(); goTo(i, 1); });
      li.appendChild(m); list.appendChild(li);
    });
  }

  /* ---------- Superposiciones ---------- */
  const menu = $('#menu'), help = $('#help');
  let lastFocus = null;
  function openOverlay(el) {
    closeOverlays(true);
    lastFocus = document.activeElement;
    el.hidden = false;
    const f = $('button', el); if (f) f.focus();
  }
  function closeOverlays(silent) {
    [menu, help].forEach((o) => { o.hidden = true; });
    if (!silent && lastFocus && lastFocus.focus) { try { lastFocus.focus(); lastFocus.blur(); } catch (e) { /* noop */ } }
  }
  const isOpen = () => !menu.hidden || !help.hidden;
  [menu, help].forEach((o) => {
    o.addEventListener('click', (e) => { if (e.target === o || e.target.closest('[data-close]')) closeOverlays(); });
  });

  /* ---------- Pantalla completa ---------- */
  function toggleFS() {
    const d = document, el = d.documentElement;
    const on = d.fullscreenElement || d.webkitFullscreenElement;
    try {
      if (on) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
      else {
        const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) { /* no disponible */ }
  }
  function onFS() {
    const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.documentElement.classList.toggle('is-fs', on);
    $('#b-fs').setAttribute('aria-label', on ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)');
    wake();
    // el cambio de tamaño lo remide motion.js (resize) conservando el punto de la sección
  }
  document.addEventListener('fullscreenchange', onFS);
  document.addEventListener('webkitfullscreenchange', onFS);

  let idleT = null;
  function wake() {
    document.documentElement.classList.remove('idle');
    clearTimeout(idleT);
    if (document.fullscreenElement || document.webkitFullscreenElement) idleT = setTimeout(() => document.documentElement.classList.add('idle'), 3500);
  }

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', (e) => {
    wake();
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target, tag = t.tagName, k = e.key;
    const isRange = tag === 'INPUT' && t.type === 'range';
    if ((tag === 'INPUT' && !isRange) || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;
    if (k === 'Escape') { if (isOpen()) { closeOverlays(); e.preventDefault(); } return; }
    if (k === 'm' || k === 'M') { e.preventDefault(); isOpen() && !menu.hidden ? closeOverlays() : openOverlay(menu); return; }
    if (k === '?' || k === 'h' || k === 'H') { e.preventDefault(); isOpen() && !help.hidden ? closeOverlays() : openOverlay(help); return; }
    if (isOpen()) return;
    if (k === 'f' || k === 'F') { e.preventDefault(); toggleFS(); return; }
    const lower = k.length === 1 ? k.toLowerCase() : k;
    const hk = R.hotkeys[R.active];
    if (hk && hk[lower]) { e.preventDefault(); hk[lower](); return; }
    if (lower === 'b') { e.preventDefault(); R.goToId('respiracion'); return; }
    // Los botones y las opciones activan con Espacio/Intro de forma nativa
    const onBtn = tag === 'BUTTON' || tag === 'A' || t.getAttribute('role') === 'radio';
    if (isRange && /^(Arrow|Home|End|Page)/.test(k)) return;
    switch (k) {
      case 'ArrowRight': case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case ' ': if (onBtn) return; e.preventDefault(); e.shiftKey ? prev() : next(); break;
      case 'Home': e.preventDefault(); goTo(0, -1); break;
      case 'End': e.preventDefault(); goTo(N - 1, 1); break;
      case 'ArrowDown': case 'ArrowUp': M().cancel(); break;   // el scroll nativo manda
      default: break;
    }
  });
  // Tras un clic con ratón el botón suelta el foco: así Espacio sigue avanzando
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button');
    if (b && e.detail > 0 && !b.closest('.overlay')) setTimeout(() => b.blur(), 0);
  });
  ['pointermove', 'pointerdown'].forEach((ev) => document.addEventListener(ev, wake, { passive: true }));
  // Teclado (Tab): si el foco entra en una sección que no es la actual, la página se desplaza hasta su parada
  document.addEventListener('focusin', (e) => {
    const sec = e.target.closest && e.target.closest('.slide');
    const i = sec ? ids.indexOf(sec.id) : -1;
    if (i >= 0 && i !== cur && navTarget == null && !isOpen()) goTo(i);
  });

  /* ---------- Arranque ---------- */
  function boot() {
    splitWords();
    buildNav();
    slides[0].classList.add('is-active');

    R.init.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });   // widgets y escena
    R.motion.init(slides, bands);
    const hist = R.motion.secs.find((x) => x.id === 'historia');
    if (hist && R.timelineStop) hist.stopFn = R.timelineStop;
    R.motion.initReveal();

    $('#b-prev').addEventListener('click', prev);
    $('#b-next').addEventListener('click', next);
    $('#b-menu').addEventListener('click', () => openOverlay(menu));
    $('#b-help').addEventListener('click', () => openOverlay(help));
    $('#b-fs').addEventListener('click', toggleFS);
    $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(Number(a.dataset.go), -1); }));
    const eb = $('#end-breath'), et = $('#end-top');
    if (eb) eb.addEventListener('click', () => R.breathing && R.breathing.begin('box'));
    if (et) et.addEventListener('click', () => goTo(0, -1));

    window.addEventListener('hashchange', () => { const i = ids.indexOf(location.hash.slice(1)); if (i >= 0 && i !== cur && navTarget == null) goTo(i, 1); });

    // ir directamente a #seccion (sin animación, con las capas ya en su sitio).
    // El navegador hace su propio salto al ancla al terminar la carga: se recoloca después.
    const start = ids.indexOf(location.hash.slice(1));
    let moved = false;
    ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { moved = true; }, { once: true, passive: true }));
    const place = () => {
      if (start <= 0 || moved) return;
      const st = R.stepper[ids[start]];
      if (st) st.set(0, true);
      window.scrollTo(0, M().stopY(start));
      M().snap();
      setCurrent(start);
    };
    place();
    window.addEventListener('load', () => { place(); setTimeout(place, 80); });

    // «inhala / exhala» de la portada, sincronizado con el árbol
    const cue = $('#breath-cue');
    setInterval(() => {
      if (!cue || R.t == null || document.hidden) return;
      const w = R.idleInhaling(R.t) ? 'inhala' : 'exhala';
      if (cue.textContent !== w) cue.textContent = w;
    }, 250);

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    document.documentElement.classList.add('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
