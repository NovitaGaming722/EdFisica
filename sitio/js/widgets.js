/* ============================================================
   LA RELAJACIÓN · widgets: tarjetas, línea de tiempo,
   bucle cuerpo–mente y ámbitos
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  R.init = R.init || [];
  R.hotkeys = R.hotkeys || {};
  R.stepper = R.stepper || {};
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const swap = (el) => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };

  /* ---------- 02 · Tarjetas que se voltean ---------- */
  function flips() {
    const cards = $$('.flip');
    if (!cards.length) return;
    function set(b, on) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('.front', b).setAttribute('aria-hidden', on ? 'true' : 'false');
      $('.back', b).setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    cards.forEach((b) => b.addEventListener('click', () => set(b, b.getAttribute('aria-pressed') !== 'true')));
    // Con las flechas: cada paso voltea una tarjeta
    R.stepper.diferencias = {
      n: cards.length + 1, i: 0,
      set(i) { this.i = i; cards.forEach((b, k) => set(b, k < i)); }
    };
  }

  /* ---------- 03 · Línea de tiempo ---------- */
  const EVENTS = [
    { node: 'Antigua', year: 'Hace más de 3.000 años', txt: true, who: 'Yoga y Qigong / Tai Chi', what: 'Antigüedad y tradiciones orientales',
      p: 'India y China · Savasana · respiración y postura' },
    { node: 'Clásica', year: 'Grecia y Roma clásicas', txt: true, who: 'Termas, masajes y filosofía', what: 'Estoicismo y epicureísmo',
      p: 'Ataraxia: un alma imperturbable' },
    { node: '1929', year: '1929', who: 'Edmund Jacobson', what: 'Relajación Muscular Progresiva (RMP)',
      p: 'Tensión muscular = ansiedad mental' },
    { node: '1932', year: '1932', who: 'Johannes Heinrich Schultz', what: 'Entrenamiento Autógeno',
      p: 'Autohipnosis · pesadez y calor' },
    { node: '1970', year: '1970', who: 'Herbert Benson', what: 'La «Respuesta de Relajación»',
      p: 'Harvard · lo mide en laboratorio' },
    { node: '70–80', year: 'Años 70–80', txt: true, who: 'Jon Kabat-Zinn', what: 'Programa MBSR',
      p: 'Meditación + medicina occidental' }
  ];

  /* La línea de tiempo es una pista horizontal. Con pins (escritorio) el scroll vertical la desplaza
     (motion.js: data-h); en modo plano (móvil o movimiento reducido) es un carril con scroll-snap horizontal. */
  function timeline() {
    const track = $('#tl-track'), rail = $('#tl-rail'), fill = $('#tl-fill'), view = $('#tl-view'), cnt = $('#tl-count');
    const bPrev = $('#tl-prev'), bNext = $('#tl-next');
    if (!track || !rail) return;
    const N = EVENTS.length;
    let cur = 0;
    const panels = [], nodes = [];
    EVENTS.forEach((e, i) => {
      const art = document.createElement('article');
      art.className = 'tl-ev';
      art.innerHTML =
        '<div class="tl-year' + (e.txt ? ' txt' : '') + '" data-hp="0.28">' + e.year + '</div>' +
        '<div class="tl-body"><h3>' + e.who + '</h3><p class="tl-what">' + e.what + '</p><p>' + e.p + '</p></div>';
      track.appendChild(art); panels.push(art);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tl-node';
      b.setAttribute('aria-label', e.year + ' · ' + e.who);
      b.innerHTML = '<i></i><span>' + e.node + '</span>';
      b.addEventListener('click', () => set(i));
      rail.appendChild(b); nodes.push(b);
    });
    const tail = document.createElement('div'); tail.className = 'tl-end'; tail.setAttribute('aria-hidden', 'true'); track.appendChild(tail);

    let cx = [], dist = 0, vw = 1;      // centros de panel y recorrido (se miden en motion.measure)
    function cache() {
      cx = panels.map((p) => p.offsetLeft + p.offsetWidth / 2);
      dist = Math.max(0, track.scrollWidth - view.clientWidth); vw = view.clientWidth;
    }
    const qOf = (i) => (dist > 0 ? clamp((cx[i] - vw / 2) / dist, 0, 1) : 0);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const sec = () => R.motion.secs.find((x) => x.id === 'historia');
    const sOfQ = (q) => { const h = sec().h; return h.a + q * (h.b - h.a); };

    function paint() {
      nodes.forEach((n, i) => { n.classList.toggle('on', i === cur); n.classList.toggle('past', i < cur); });
      panels.forEach((p, i) => p.classList.toggle('on', i === cur));
      if (cnt) cnt.textContent = (cur + 1) + ' / ' + N;
      if (bPrev) bPrev.disabled = cur === 0;
      if (bNext) bNext.disabled = cur === N - 1;
      if (R.stepper.historia) R.stepper.historia.i = cur;
    }
    function nearest(center, positions) {
      let k = 0, best = 1e9;
      positions.forEach((c, i) => { const d = Math.abs(c - center); if (d < best) { best = d; k = i; } });
      return k;
    }
    function setFill(f) { fill.style.transform = 'scaleX(' + clamp(f, 0, 1).toFixed(4) + ')'; }

    // Con pins: lo llama motion.js en cada fotograma con el avance q (0–1) de la pista
    R.onHScroll = (id, q) => {
      if (id !== 'historia') return;
      const q0 = qOf(0), q1 = qOf(N - 1);
      setFill(q1 > q0 ? (q - q0) / (q1 - q0) : 0);
      if (R.motion.tween) return;                       // durante un salto manda el paso elegido
      const i = nearest(vw / 2, cx.map((c) => c - q * dist));
      if (i !== cur) { cur = i; paint(); }
    };
    // Sin pins: carril horizontal nativo
    let tick = null;
    view.addEventListener('scroll', () => {
      if (R.motion.pins) return;
      if (tick) return;
      tick = requestAnimationFrame(() => {
        tick = null;
        const center = view.scrollLeft + view.clientWidth / 2;
        const i = nearest(center, cx);
        const max = view.scrollWidth - view.clientWidth;
        setFill(max > 0 ? view.scrollLeft / max : 0);
        if (i !== cur) { cur = i; paint(); }
      });
    }, { passive: true });

    function set(i, noScroll) {
      cur = clamp(i, 0, N - 1); paint();
      if (noScroll) return;
      if (R.motion.pins) {
        const k = R.motion.secs.indexOf(sec());
        R.motion.scrollToY(R.motion.yOfS(k, sOfQ(qOf(cur))));
      } else {
        const p = panels[cur];
        view.scrollTo({ left: p.offsetLeft - (view.clientWidth - p.offsetWidth) / 2, behavior: R.reduced ? 'auto' : 'smooth' });
      }
    }
    if (bPrev) bPrev.addEventListener('click', () => set(cur - 1));
    if (bNext) bNext.addEventListener('click', () => set(cur + 1));

    R.stepper.historia = {
      n: N, i: 0,
      set(i, noScroll) { set(i, noScroll); },
      // posición de scroll de cada paso (la usa app.js al entrar en la sección)
      pos(i) { const k = R.motion.secs.indexOf(sec()); return R.motion.yOfS(k, sOfQ(qOf(clamp(i, 0, N - 1)))); }
    };
    const prevMeasure = R.onMeasure;
    R.onMeasure = () => { if (prevMeasure) prevMeasure(); cache(); setFill(0); };
    cache(); paint();
    // el paso 0 de la línea (primer hito centrado) es donde se detiene la navegación con flechas
    R.timelineStop = () => { const q = qOf(0); return sOfQ(q); };
  }

  /* ---------- 05 · Bucle cuerpo–mente ---------- */
  function loop() {
    const root = $('#loop');
    if (!root) return;
    const bBtn = $('#lc-body'), mBtn = $('#lc-mind'), msg = $('#loop-msg');
    const pa = $('#lp-a'), pb = $('#lp-b'), sa = $('#sp-a'), sb = $('#sp-b'), svg = $('#loop-svg');
    const MSG = {
      '11': 'Tensión ⇄ preocupación: el bucle se sostiene.',
      '01': 'Cuerpo suelto, mente en alerta: no basta.',
      '10': 'Mente anclada, cuerpo tenso: no basta.',
      '00': 'Suelto ⇄ presente: el bucle juega a favor.'
    };
    let b = 1, m = 1;
    // puntas de flecha
    const heads = [pa, pb].map((p) => {
      const h = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      h.setAttribute('d', 'M-9 -7 L5 0 L-9 7 Z'); h.setAttribute('class', 'ah ' + (p === pa ? 'ah-a' : 'ah-b'));
      svg.appendChild(h); return h;
    });
    function place(path, el, f) {
      const L = path.getTotalLength(), p = path.getPointAtLength(L * f);
      el.setAttribute('cx', p.x); el.setAttribute('cy', p.y);
    }
    function head(path, h, f) {
      const L = path.getTotalLength(), p = path.getPointAtLength(L * f), q = path.getPointAtLength(L * (f + 0.01));
      h.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI) + ')');
    }
    head(pa, heads[0], 0.8); head(pb, heads[1], 0.8);
    function paint() {
      root.dataset.b = b; root.dataset.m = m;
      bBtn.setAttribute('aria-pressed', b ? 'true' : 'false');
      mBtn.setAttribute('aria-pressed', m ? 'true' : 'false');
      $('b', bBtn).textContent = b ? 'Tenso' : 'Suelto';
      $('b', mBtn).textContent = m ? 'Con preocupaciones' : 'Anclada al presente';
      msg.textContent = MSG['' + b + m];
      R.tension.cuerpomente = (b + m) / 2;
    }
    bBtn.addEventListener('click', () => { b = 1 - b; paint(); });
    mBtn.addEventListener('click', () => { m = 1 - m; paint(); });
    paint();
    let t0 = performance.now();
    (function tick(now) {
      requestAnimationFrame(tick);
      if (R.active !== 'cuerpomente') return;
      const t = R.reduced ? 0.35 : (now - t0) / 1000;
      // body→mind va con el estado del cuerpo; mind→body con el de la mente
      const fa = (t * (b ? 0.55 : 0.16)) % 1, fb = (t * (m ? 0.55 : 0.16) + 0.5) % 1;
      place(pa, sa, fa); place(pb, sb, fb);
    })(t0);
  }

  /* ---------- 08 · Ámbitos ---------- */
  const ICONS = {
    dep: '<circle cx="15" cy="5" r="2"/><path d="M12 9l-3 4 3 2v5M12 9l4 2 3-1M9 13l-4 1"/>',
    lab: '<path d="M4 5h7a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-7a2 2 0 00-2 2v12a2 2 0 012-2h7z"/>',
    cli: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    soc: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>'
  };
  const AMB = [
    { id: 'dep', name: 'Deportivo',
      html: '<div class="amb-cols"><div class="amb-box"><h4>Pre-competición</h4><p>Regular el arousal · punto óptimo</p></div>' +
        '<div class="amb-box"><h4>Post-competición</h4><p>Homeostasis · recuperación</p></div></div>' },
    { id: 'lab', name: 'Laboral y escolar',
      html: '<ul class="amb-list"><li><b>Prevenir el burnout</b></li><li>Pausas activas · atención</li></ul>' },
    { id: 'cli', name: 'Clínico y psicológico',
      html: '<ul class="amb-list"><li>Ansiedad · pánico · insomnio · hipertensión</li><li><b>Desensibilización sistemática</b></li></ul>' },
    { id: 'soc', name: 'Social y cotidiano',
      html: '<ul class="amb-list"><li>Menos impulsividad · mejores relaciones</li></ul>' }
  ];

  function ambitos() {
    const tabs = $('#amb-tabs'), panel = $('#amb-panel');
    if (!tabs || !panel) return;
    let cur = 0;
    AMB.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab');
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[a.id] + '</svg>' + a.name;
      b.addEventListener('click', () => show(i));
      tabs.appendChild(b);
    });
    function show(i) {
      cur = (i + AMB.length) % AMB.length;
      const a = AMB[cur];
      $$('button', tabs).forEach((b, k) => b.setAttribute('aria-selected', k === cur ? 'true' : 'false'));
      panel.innerHTML = '<h3>' + a.name + '</h3>' + a.html + (a.id === 'dep' ? arousalHTML() : '');
      if (a.id === 'dep') arousalInit();
      swap(panel);
      R.stepper.ambitos.i = cur;
    }
    R.stepper.ambitos = { n: AMB.length, i: 0, set(i) { show(i); } };
    show(0);
  }

  function arousalHTML() {
    const pts = [];
    for (let i = 0; i <= 60; i++) { const x = i / 60; pts.push((10 + x * 280).toFixed(1) + ',' + (70 - 62 * Math.exp(-Math.pow((x - 0.5) / 0.22, 2))).toFixed(1)); }
    return '<div class="arousal"><svg viewBox="0 0 300 84" role="img" aria-label="Esquema ilustrativo, sin escala numérica: rendimiento según el nivel de activación"><polyline class="curve" points="' + pts.join(' ') + '"/>' +
      '<line class="peak" x1="150" y1="6" x2="150" y2="72"/><circle class="pt" id="ar-pt" r="7" cx="150" cy="8"/>' +
      '<text x="10" y="82">menos activación</text><text x="290" y="82" text-anchor="end">más activación</text><text x="156" y="14">punto óptimo</text></svg>' +
      '<div class="arousal-row"><label for="ar-range">Nivel de activación</label><input type="range" id="ar-range" min="0" max="100" value="50"></div>' +
      '<p class="arousal-msg" id="ar-msg" aria-live="polite"></p></div>';
  }
  function arousalInit() {
    const r = $('#ar-range'), pt = $('#ar-pt'), msg = $('#ar-msg');
    if (!r) return;
    function upd() {
      const x = r.value / 100, y = 70 - 62 * Math.exp(-Math.pow((x - 0.5) / 0.22, 2));
      pt.setAttribute('cx', 10 + x * 280); pt.setAttribute('cy', y);
      msg.textContent = x > 0.72 ? 'Demasiada activación: errores.'
        : x < 0.28 ? 'Activación baja.'
        : 'Punto óptimo.';
    }
    r.addEventListener('input', upd); upd();
  }

  R.init.push(flips, timeline, loop, ambitos);
})();
