/* ============================================================
   LA RELAJACIÓN · modo exposición
   Navegación, progreso, pantalla completa, atajos, revelado
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
  const ids = slides.map((s) => s.id);
  const N = slides.length;
  R.ids = ids;
  R.active = ids[0];
  let cur = 0, navTarget = null, navTimer = null, tops = [];

  /* ---------- Texto que aparece palabra a palabra ---------- */
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

  /* ---------- Navegación ---------- */
  function measure() { tops = slides.map((s) => s.offsetTop); }

  function goTo(i, dir) {
    i = clamp(i, 0, N - 1);
    const st = R.stepper[ids[i]];
    if (st && dir != null && i !== cur) st.set(dir < 0 ? st.n - 1 : 0);
    navTarget = i;
    measure();
    window.scrollTo({ top: tops[i], behavior: R.reduced ? 'auto' : 'smooth' });
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navTarget = null; }, 1400);
    if (R.reduced) { navTarget = null; setCurrent(i); }
  }
  R.goToId = (id) => { const i = ids.indexOf(id); if (i >= 0) goTo(i, 1); };

  function next() {
    const base = navTarget != null ? navTarget : cur;
    const st = R.stepper[ids[base]];
    if (st && navTarget == null && st.i < st.n - 1) { st.set(st.i + 1); return; }
    if (base < N - 1) goTo(base + 1, 1);
  }
  function prev() {
    const base = navTarget != null ? navTarget : cur;
    const st = R.stepper[ids[base]];
    if (st && navTarget == null && st.i > 0) { st.set(st.i - 1); return; }
    if (base > 0) goTo(base - 1, -1);
  }
  R.next = next; R.prev = prev;

  /* ---------- Estado visible ---------- */
  const elNum = $('#st-num'), elName = $('#st-name'), elTot = $('#st-total'), fill = $('#progress-fill');
  elTot.textContent = pad(N);
  let lastProg = -1, lastLabel = '';

  function setCurrent(i) {
    const prevId = ids[cur];
    if (i === cur && R.active === ids[i]) return;
    cur = i; R.active = ids[i];
    if (R.onLeave[prevId] && prevId !== ids[i]) R.onLeave[prevId]();
    elNum.textContent = pad(i + 1);
    $$('#rail button').forEach((b, k) => b.classList.toggle('on', k === i));
    $$('#menu-list button').forEach((b, k) => b.classList.toggle('on', k === i));
    try { history.replaceState(null, '', '#' + ids[i]); } catch (e) { /* file:// restringido */ }
    document.title = (i === 0 ? '' : slides[i].dataset.title + ' · ') + 'La relajación — Exposición interactiva';
  }

  function refresh() {
    const st = R.stepper[ids[cur]];
    const frac = st ? (st.i + 1) / st.n : 1;
    const p = (cur + frac) / N;
    if (Math.abs(p - lastProg) > 1e-4) { lastProg = p; fill.style.transform = 'scaleX(' + p.toFixed(4) + ')'; }
    const label = slides[cur].dataset.title + (st && !st.quiet && st.n > 1 ? ' · paso ' + (st.i + 1) + '/' + st.n : '');
    if (label !== lastLabel) { lastLabel = label; elName.textContent = label; }
  }

  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    if (!tops.length) measure();
    let i = 0, j = 0;
    for (let k = 0; k < N; k++) { if (tops[k] <= y + vh * 0.5) i = k; if (tops[k] <= y + 2) j = k; }
    if (navTarget != null && Math.abs(y - tops[navTarget]) < 3) { navTarget = null; clearTimeout(navTimer); }
    if (i !== cur) setCurrent(i);
    let f = j;
    if (j < N - 1) f = j + clamp((y - tops[j]) / (tops[j + 1] - tops[j]), 0, 1);
    if (R.scene) R.scene.setProgress(f);
    refresh();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

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
    setTimeout(() => { if (window.innerWidth > 900) { measure(); window.scrollTo({ top: tops[cur], behavior: 'auto' }); } }, 250);
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
      default: break;
    }
  });
  // Tras un clic con ratón el botón suelta el foco: así Espacio sigue avanzando
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button');
    if (b && e.detail > 0 && !b.closest('.overlay')) setTimeout(() => b.blur(), 0);
  });
  ['pointermove', 'pointerdown'].forEach((ev) => document.addEventListener(ev, wake, { passive: true }));

  /* ---------- Arranque ---------- */
  function boot() {
    splitWords();
    buildNav();
    measure();
    slides[0].classList.add('is-active');
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting));
    }, { threshold: [0.2] });
    slides.forEach((s) => io.observe(s));

    R.init.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
    if (R.scene) R.scene.setSlides(ids);

    $('#b-prev').addEventListener('click', prev);
    $('#b-next').addEventListener('click', next);
    $('#b-menu').addEventListener('click', () => openOverlay(menu));
    $('#b-help').addEventListener('click', () => openOverlay(help));
    $('#b-fs').addEventListener('click', toggleFS);
    $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(Number(a.dataset.go), -1); }));
    const eb = $('#end-breath'), et = $('#end-top');
    if (eb) eb.addEventListener('click', () => R.breathing && R.breathing.begin('box'));
    if (et) et.addEventListener('click', () => goTo(0, -1));

    window.addEventListener('scroll', onScroll, { passive: true });
    let rz = null;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        measure(); update();
        if (window.innerWidth > 900 && navTarget == null) window.scrollTo({ top: tops[cur], behavior: 'auto' });
      }, 150);
    });
    window.addEventListener('hashchange', () => { const i = ids.indexOf(location.hash.slice(1)); if (i >= 0 && i !== cur) goTo(i, 1); });

    // ir directamente a #seccion
    const start = ids.indexOf(location.hash.slice(1));
    const place = () => {
      measure();
      if (start > 0) { window.scrollTo({ top: tops[start], behavior: 'auto' }); }
      update();
      if (start > 0) { setCurrent(start); }
    };
    place();
    window.addEventListener('load', () => { place(); });

    (function loop() {
      requestAnimationFrame(loop); refresh();
    })();

    // «inhala / exhala» de la portada, sincronizado con el árbol
    const cue = $('#breath-cue');
    setInterval(() => {
      if (!cue || R.t == null) return;
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
