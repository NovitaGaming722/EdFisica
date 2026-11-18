/* ============================================================
   LA RELAJACIÓN · Fisiología interactiva (tensión ⇄ relajación)
   Contenido: sección «Fisiología» del trabajo escrito.
   Las ilustraciones son esquemas generados con Canvas 2D.
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  R.init = R.init || [];

  const SYS = [
    {
      id: 'cerebro', name: 'Cerebro', cap: 'Actividad cerebral · esquema',
      t: { kw: 'Ondas beta · alerta y estrés', desc: 'Amígdala en alerta · hipervigilancia' },
      r: { kw: 'Ondas alfa y theta · calma despierta', desc: 'Manda la corteza prefrontal' },
      fx: 'Claridad · mente despejada'
    },
    {
      id: 'cardio', name: 'Sistema cardiovascular', short: 'Corazón', cap: 'Pulso y vasos · esquema',
      t: { kw: 'Frecuencia alta · vasoconstricción · presión alta', desc: 'Corazón desbocado · vasos cerrados' },
      r: { kw: 'Vasodilatación · baja la presión y el ritmo', desc: 'Nervio vago · acetilcolina' },
      fx: 'Pecho suelto · manos tibias'
    },
    {
      id: 'resp', name: 'Sistema respiratorio', short: 'Respiración', cap: 'Pecho y vientre · esquema',
      t: { kw: 'Respiración corta, rápida y torácica', desc: 'Solo el pecho' },
      r: { kw: 'Respiración diafragmática, profunda y pausada', desc: 'Respira el vientre' },
      fx: 'Sin hiperventilar · aire de verdad'
    },
    {
      id: 'musculos', name: 'Músculos', cap: 'Fibras musculares · esquema',
      t: { kw: 'Hipertonía · rigidez y contracción constante', desc: 'Cuello, hombros y mandíbula duros' },
      r: { kw: 'Hipotonía · liberación de la tensión muscular', desc: 'Las fibras sueltan' },
      fx: null
    },
    {
      id: 'digestivo', name: 'Sistema digestivo', short: 'Digestión', cap: 'Peristaltismo · esquema',
      t: { kw: 'Se inhibe o ralentiza', desc: 'Boca seca · estómago parado' },
      r: { kw: 'Se reactiva la digestión y el peristaltismo', desc: 'Vuelve la saliva · sangre al abdomen' },
      fx: 'Adiós al nudo en el estómago'
    },
    {
      id: 'bioq', name: 'Bioquímica', cap: 'Mensajeros químicos · esquema',
      t: { kw: 'Cortisol, adrenalina y noradrenalina', desc: 'Hormonas del estrés' },
      r: { kw: 'Endorfinas, serotonina, GABA y oxitocina', desc: 'Analgésicos y calmantes naturales' },
      fx: 'Menos dolor · autorreparación'
    },
    {
      id: 'inmune', name: 'Sistema inmune', short: 'Inmunidad', cap: 'Defensas · esquema',
      t: { kw: 'Suprimido por exceso de cortisol', desc: 'Menos glóbulos blancos' },
      r: { kw: 'Fortalecido · más linfocitos T', desc: 'Vuelven los anticuerpos' },
      fx: 'Repara · desinflama · defiende'
    }
  ];

  /* ---------- utilidades de dibujo ---------- */
  const EMBER = [255, 138, 99], CALM = [143, 217, 179], INK = [242, 236, 221];
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const ease = (t) => t * t * (3 - 2 * t);

  let K = 1; // escala del texto del lienzo (proyector)
  function pill(c, x, y, text, col, a) {
    c.font = '600 ' + (15 * K).toFixed(1) + 'px Inter, system-ui, sans-serif';
    const w = c.measureText(text).width + 26 * K, h = 30 * K;
    c.beginPath();
    const r = h / 2, x0 = x - w / 2, y0 = y - h / 2;
    c.moveTo(x0 + r, y0); c.arcTo(x0 + w, y0, x0 + w, y0 + h, r); c.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
    c.arcTo(x0, y0 + h, x0, y0, r); c.arcTo(x0, y0, x0 + w, y0, r); c.closePath();
    c.fillStyle = rgba(col, 0.16 * a); c.fill();
    c.strokeStyle = rgba(col, 0.9 * a); c.lineWidth = 1.5; c.stroke();
    c.fillStyle = rgba(INK, a); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, x, y + 1);
  }
  function label(c, x, y, text, a, align) {
    c.font = '500 ' + (13 * K).toFixed(1) + 'px Inter, system-ui, sans-serif';
    c.textAlign = align || 'center'; c.textBaseline = 'middle';
    c.fillStyle = rgba(INK, a); c.fillText(text.toUpperCase(), x, y);
  }
  function glowCircle(c, x, y, rad, col, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
  }

  /* ---------- 7 ilustraciones (r: 0 tensión → 1 relajación) ---------- */
  const DRAW = {
    cerebro(c, w, h, t, r) {
      const col = mix(EMBER, CALM, r);
      const y1 = h * 0.24;
      // amígdala (izq) · corteza prefrontal (der)
      const pulse = 1 + 0.18 * Math.sin(t * 9) * (1 - r);
      glowCircle(c, w * 0.28, y1, 46 * pulse, EMBER, 0.55 * (1 - r) + 0.08);
      c.fillStyle = rgba(EMBER, 0.35 + 0.65 * (1 - r)); c.beginPath(); c.arc(w * 0.28, y1, 11 * pulse, 0, 7); c.fill();
      label(c, w * 0.28, y1 + 36, 'amígdala', 0.5 + 0.5 * (1 - r));
      glowCircle(c, w * 0.72, y1, 46, CALM, 0.5 * r + 0.06);
      c.fillStyle = rgba(CALM, 0.3 + 0.7 * r); c.beginPath(); c.arc(w * 0.72, y1, 11 + 3 * r, 0, 7); c.fill();
      label(c, w * 0.72, y1 + 36, 'corteza prefrontal', 0.5 + 0.5 * r);
      // EEG
      const cy = h * 0.66, freq = lerp(0.115, 0.02, r), amp = lerp(17, 30, r), jag = lerp(9, 0, r), sp = lerp(70, 22, r);
      c.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const ph = x * freq - t * sp * freq;
        let y = Math.sin(ph) + 0.45 * Math.sin(ph * 2.3 + 1.3) + 0.2 * Math.sin(ph * 4.1);
        y = y * amp + (hash(Math.floor((x - t * sp) / 2)) - 0.5) * jag * 2;
        x === 0 ? c.moveTo(x, cy + y) : c.lineTo(x, cy + y);
      }
      c.strokeStyle = rgba(col, 1); c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
      c.strokeStyle = rgba(col, 0.18); c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();
    },

    cardio(c, w, h, t, r) {
      const col = mix(EMBER, CALM, r);
      const P = lerp(0.55, 1.55, r);
      const beat = (ph) => { // 0..1 → mV esquemático
        const g = (m, s) => Math.exp(-Math.pow((ph - m) / s, 2));
        return 0.12 * g(0.18, 0.05) - 0.12 * g(0.4, 0.012) + 1.0 * g(0.43, 0.012) - 0.22 * g(0.46, 0.012) + 0.2 * g(0.7, 0.07);
      };
      const cy = h * 0.68, sc = h * 0.2, spd = 150;
      c.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const tt = t - (w - x) / spd;
        const ph = ((tt % P) + P) % P / P;
        const y = cy - beat(ph) * sc;
        x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.strokeStyle = rgba(col, 1); c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
      // corazón
      const ph0 = (t % P) / P;
      const k = 1 + 0.22 * Math.exp(-Math.pow((ph0 - 0.43) / 0.07, 2));
      glowCircle(c, w * 0.2, h * 0.27, 62 * k, col, 0.35);
      c.fillStyle = rgba(col, 0.95); c.beginPath(); c.arc(w * 0.2, h * 0.27, 21 * k, 0, 7); c.fill();
      label(c, w * 0.2, h * 0.27 + 54, 'corazón', 0.8);
      // vaso de la piel
      const thick = lerp(6, 24, r), vy = h * 0.27, x0 = w * 0.42, x1 = w * 0.92;
      c.strokeStyle = rgba(col, 0.28); c.lineWidth = thick + 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, vy); c.lineTo(x1, vy); c.stroke();
      c.strokeStyle = rgba(col, 0.9); c.lineWidth = thick; c.beginPath(); c.moveTo(x0, vy); c.lineTo(x1, vy); c.stroke();
      const flow = lerp(2.6, 0.9, r);
      for (let i = 0; i < 7; i++) {
        const f = ((t / flow + i / 7) % 1);
        c.fillStyle = rgba(INK, 0.9); c.beginPath(); c.arc(lerp(x0, x1, f), vy, Math.max(2, thick * 0.22), 0, 7); c.fill();
      }
      label(c, (x0 + x1) / 2, vy + thick / 2 + 22, 'vaso de la piel', 0.75);
      c.lineCap = 'butt';
    },

    resp(c, w, h, t, r) {
      const cx = w * 0.5;
      const chest = 1 + 0.1 * Math.sin((t * Math.PI * 2) / 1.2) * (1 - r);
      const belly = 1 + 0.2 * Math.sin((t * Math.PI * 2) / 5.0 - 1.2) * r;
      c.strokeStyle = rgba(INK, 0.22); c.lineWidth = 2;
      c.beginPath(); c.ellipse(cx, h * 0.5, w * 0.26, h * 0.43, 0, 0, 7); c.stroke();
      // pecho
      const ccy = h * 0.34;
      c.fillStyle = rgba(EMBER, 0.12 + 0.5 * (1 - r)); c.strokeStyle = rgba(EMBER, 0.4 + 0.6 * (1 - r)); c.lineWidth = 3;
      c.beginPath(); c.ellipse(cx, ccy, w * 0.19 * chest, h * 0.14 * chest, 0, 0, 7); c.fill(); c.stroke();
      label(c, cx, ccy, 'pecho', 0.5 + 0.5 * (1 - r));
      // vientre
      const bcy = h * 0.68;
      c.fillStyle = rgba(CALM, 0.1 + 0.5 * r); c.strokeStyle = rgba(CALM, 0.35 + 0.65 * r); c.lineWidth = 3;
      c.beginPath(); c.ellipse(cx, bcy, w * 0.17 * belly, h * 0.14 * belly, 0, 0, 7); c.fill(); c.stroke();
      label(c, cx, bcy, 'vientre', 0.5 + 0.5 * r);
    },

    musculos(c, w, h, t, r) {
      const col = mix(EMBER, CALM, r);
      const n = 9, shrink = (1 - r) * w * 0.05;
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        const y0 = h * (0.16 + 0.62 * (i / (n - 1)));
        c.beginPath();
        for (let x = w * 0.07 + shrink; x <= w * 0.82 - shrink; x += 5) {
          const trem = (hash(Math.floor(x / 5) + i * 31 + Math.floor(t * 28)) - 0.5) * 3.4 * (1 - r);
          const wave = Math.sin(x * 0.026 + t * 1.1 + i * 0.7) * 7 * r;
          const y = y0 + trem + wave;
          x <= w * 0.07 + shrink + 0.1 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = rgba(col, 0.9); c.lineWidth = lerp(6, 2.4, r); c.stroke();
      }
      // medidor de tono
      const mx = w * 0.92, top = h * 0.14, hh = h * 0.66;
      c.strokeStyle = rgba(INK, 0.3); c.lineWidth = 2; c.strokeRect(mx - 9, top, 18, hh);
      c.fillStyle = rgba(col, 0.95); const fh = hh * (0.08 + 0.9 * (1 - r)); c.fillRect(mx - 9, top + hh - fh, 18, fh);
      label(c, mx, top + hh + 20, 'tono', 0.85);
      c.lineCap = 'butt';
    },

    digestivo(c, w, h, t, r) {
      const col = mix(EMBER, CALM, r);
      const base = 20, A = 15 * r;
      const yAt = (x) => h * 0.58 + Math.sin(x * 0.014 + 0.6) * h * 0.1;
      c.lineCap = 'round';
      for (let x = w * 0.06; x < w * 0.94; x += 3) {
        const wv = Math.sin(x * 0.05 - t * 3.2);
        const th = base + A * wv * wv + 6 * r;
        c.strokeStyle = rgba(col, 0.2 + 0.55 * (0.4 + 0.6 * r)); c.lineWidth = th;
        c.beginPath(); c.moveTo(x, yAt(x)); c.lineTo(x + 3.4, yAt(x + 3)); c.stroke();
      }
      if (r > 0.12) {
        const fx = w * 0.06 + ((t * 70 * r) % (w * 0.88));
        c.fillStyle = rgba(INK, Math.min(1, r * 1.4)); c.beginPath(); c.arc(fx, yAt(fx), 7, 0, 7); c.fill();
      }
      // boca y saliva
      c.fillStyle = rgba(INK, 0.9);
      label(c, w * 0.14, h * 0.2, 'boca', 0.8);
      for (let i = 0; i < 5; i++) {
        const f = ((t * 0.55 + i / 5) % 1);
        const a = Math.max(0, (r - 0.25) / 0.75);
        c.fillStyle = rgba(CALM, a * (1 - f)); c.beginPath(); c.arc(w * 0.14 + (i - 2) * 9, h * 0.26 + f * 60, 4.2, 0, 7); c.fill();
      }
      if (r < 0.4) {
        c.setLineDash([4, 6]); c.strokeStyle = rgba(EMBER, 0.7 * (1 - r * 2)); c.lineWidth = 2;
        c.beginPath(); c.arc(w * 0.14, h * 0.28, 18, 0, 7); c.stroke(); c.setLineDash([]);
      }
      label(c, w * 0.5, h * 0.88, r < 0.5 ? 'sin movimiento' : 'ondas de peristaltismo', 0.8);
      c.lineCap = 'butt';
    },

    bioq(c, w, h, t, r) {
      const T = [['cortisol', 0.22, 0.3], ['adrenalina', 0.58, 0.46], ['noradrenalina', 0.3, 0.72]];
      const C = [['endorfinas', 0.28, 0.26], ['serotonina', 0.66, 0.3], ['GABA', 0.36, 0.52], ['oxitocina', 0.62, 0.74]];
      T.forEach(([n, x, y], i) => {
        const a = Math.max(0, 1 - r * 1.25); if (a <= 0.01) return;
        const j = (1 - r) * 5;
        pill(c, w * x + Math.sin(t * 17 + i * 3) * j, h * y + Math.cos(t * 19 + i) * j, n, EMBER, a);
      });
      C.forEach(([n, x, y], i) => {
        const a = Math.max(0, r * 1.25 - 0.25); if (a <= 0.01) return;
        pill(c, w * x + Math.sin(t * 0.7 + i * 2) * 14, h * y + Math.cos(t * 0.6 + i * 1.7) * 10, n, CALM, Math.min(1, a));
      });
    },

    inmune(c, w, h, t, r) {
      const cx = w * 0.5, cy = h * 0.5, R0 = Math.min(w, h) * 0.2;
      glowCircle(c, cx, cy, R0 * 2.1, mix(EMBER, CALM, r), 0.18);
      // «organismo»
      c.fillStyle = rgba(INK, 0.12); c.beginPath(); c.arc(cx, cy, R0, 0, 7); c.fill();
      // escudo
      c.strokeStyle = rgba(CALM, 0.25 + 0.75 * r); c.lineWidth = lerp(1.5, 6, r);
      c.beginPath(); c.arc(cx, cy, R0 + 14, 0, 7); c.stroke();
      // cortisol (neblina)
      for (let i = 0; i < 5; i++) {
        const a = t * 0.5 + i * 1.3;
        glowCircle(c, cx + Math.cos(a) * R0 * 0.5, cy + Math.sin(a * 1.2) * R0 * 0.4, R0 * 0.75, EMBER, 0.2 * (1 - r));
      }
      // linfocitos T
      const N = Math.round(lerp(4, 26, r));
      for (let i = 0; i < N; i++) {
        const ring = i % 2, rad = R0 + 30 + ring * 20, ang = (i / N) * Math.PI * 2 + t * (0.5 + ring * 0.25) * (ring ? -1 : 1);
        c.fillStyle = rgba(CALM, 0.95); c.beginPath(); c.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 5.5, 0, 7); c.fill();
      }
      // amenazas
      for (let i = 0; i < 6; i++) {
        const cyc = (t * 0.22 + i / 6) % 1, ang = i * 1.05 + 0.4;
        const outer = Math.min(w, h) * 0.46;
        const blocked = r > 0.5;
        const inner = blocked ? R0 + 56 : R0 * 0.2;
        const rad = lerp(outer, inner, ease(Math.min(1, cyc / 0.8)));
        const a = blocked ? 1 - Math.max(0, (cyc - 0.72) / 0.28) : 1;
        c.fillStyle = rgba(EMBER, a); c.save(); c.translate(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad); c.rotate(t + i);
        c.beginPath(); for (let k = 0; k < 6; k++) { const aa = (k / 6) * Math.PI * 2, rr = k % 2 ? 4 : 8; c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); c.fill(); c.restore();
      }
      label(c, cx, cy, 'organismo', 0.8);
    }
  };

  /* ---------- Interfaz ---------- */
  function init() {
    const tabsEl = document.getElementById('sys-tabs');
    const range = document.getElementById('phys-range');
    const toggle = document.getElementById('phys-toggle');
    const canvas = document.getElementById('phys-canvas');
    const panel = document.getElementById('phys-panel');
    const cap = document.getElementById('phys-cap');
    if (!tabsEl || !range || !canvas) return;
    const ctx = canvas.getContext('2d');
    const elState = document.getElementById('ph-state'), elTitle = document.getElementById('ph-title'),
      elKw = document.getElementById('ph-kw'), elDesc = document.getElementById('ph-desc'), elFx = document.getElementById('ph-fx');

    let idx = 0, target = 0, shown = 0, cw = 300, ch = 200, dpr = 1, anim = null, lastMode = null, needDraw = true;

    SYS.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + s.id;
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.setAttribute('aria-controls', 'phys-panel');
      b.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b>' + (s.short || s.name);
      b.addEventListener('click', () => select(i));
      tabsEl.appendChild(b);
    });

    function swap(el) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }

    function renderText(force) {
      const s = SYS[idx];
      const calm = target >= 0.5;
      const mode = idx + ':' + calm;
      if (!force && mode === lastMode) return;
      const sysChanged = !lastMode || lastMode.split(':')[0] !== String(idx);
      lastMode = mode;
      panel.classList.toggle('is-calm', calm);
      panel.classList.toggle('is-tense', !calm);
      const d = calm ? s.r : s.t;
      elState.textContent = calm ? 'En relajación · parasimpático' : 'En tensión · simpático';
      elTitle.textContent = s.name;
      elKw.textContent = d.kw;
      elDesc.textContent = d.desc;
      if (calm && s.fx) elFx.innerHTML = '<b>¿Qué le pasa a tu cuerpo?</b> ' + s.fx;
      else if (!calm) elFx.textContent = 'Desliza → relajación';
      else elFx.textContent = '';
      elFx.style.display = elFx.textContent ? '' : 'none';
      cap.textContent = s.cap;
      swap(panel);
      if (sysChanged) needDraw = true;
    }

    function select(i) {
      idx = (i + SYS.length) % SYS.length;
      [...tabsEl.children].forEach((b, k) => b.setAttribute('aria-selected', k === idx ? 'true' : 'false'));
      lastMode = null; renderText(true); needDraw = true;
      if (R.stepper.fisiologia) R.stepper.fisiologia.i = idx;
    }

    function setTarget(v) {
      target = v;
      range.value = Math.round(v * 100);
      renderText();
    }
    range.addEventListener('input', () => { target = range.value / 100; renderText(); needDraw = true; });
    function animateTo(v) {
      if (anim) cancelAnimationFrame(anim);
      const from = target, t0 = performance.now(), dur = R.reduced ? 1 : 900;
      (function step(now) {
        const k = Math.min(1, (now - t0) / dur);
        setTarget(from + (v - from) * ease(k));
        if (k < 1) anim = requestAnimationFrame(step);
      })(t0);
    }
    const flip = () => animateTo(target < 0.5 ? 1 : 0);
    toggle.addEventListener('click', flip);

    R.hotkeys = R.hotkeys || {};
    R.hotkeys.fisiologia = Object.assign(R.hotkeys.fisiologia || {}, { t: flip });
    R.stepper = R.stepper || {};
    R.stepper.fisiologia = { n: SYS.length, i: 0, set(i) { select(i); } };

    function resize() {
      // clientWidth/Height no cambian con los transform del scroll (a diferencia de getBoundingClientRect)
      const pe = canvas.parentElement;
      cw = Math.max(200, pe.clientWidth); ch = Math.max(140, pe.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      needDraw = true;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    resize();

    let t0 = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      const active = R.active === 'fisiologia';
      // la escena 3D sigue al control: 0 calma · 1 tensión
      shown += (target - shown) * (R.reduced ? 1 : 0.1);
      R.tension.fisiologia = 1 - shown;
      if (!active) return;
      if (R.reduced && !needDraw) return;
      needDraw = false;
      const t = R.reduced ? 2.2 : (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      K = Math.max(1, Math.min(1.7, cw / 560));
      ctx.clearRect(0, 0, cw, ch);
      DRAW[SYS[idx].id](ctx, cw, ch, t, shown);
    }
    requestAnimationFrame(loop);
    select(0); renderText(true);
  }

  R.init.push(init);
})();
