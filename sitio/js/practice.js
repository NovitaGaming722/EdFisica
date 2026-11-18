/* ============================================================
   LA RELAJACIÓN · práctica: técnicas que se pueden probar
   y ejercicio de respiración guiada
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

  /* ============================================================
     06 · TÉCNICAS
     ============================================================ */
  const FAM = [
    { name: 'Técnicas corporales y físicas', ids: ['rmp', 'resp', 'maso'] },
    { name: 'Técnicas mentales y cognitivas', ids: ['auto', 'visu', 'mind'] },
    { name: 'Métodos pasivos y sensoriales', ids: ['musi', 'aroma', 'hidro'] }
  ];
  const TECH = {
    rmp: { chip: 'Relajación muscular progresiva', name: 'Relajación Muscular Progresiva de Jacobson',
      desc: 'Tensa 5–7 s · suelta 10–15 s · de pies a cara', demo: 'rmp' },
    resp: { chip: 'Respiración consciente', name: 'Respiración consciente', desc: 'Atención al aire',
      sub: [['Diafragmática', 'al vientre'], ['4-7-8', '4 · 7 · 8 s'], ['Cuadrada', '4 · 4 · 4 · 4 s']], demo: 'resp' },
    maso: { chip: 'Masoterapia y biofeedback', name: 'Masoterapia y biofeedback',
      desc: 'Masajes · pulso en tiempo real' },
    auto: { chip: 'Entrenamiento autógeno', name: 'Entrenamiento Autógeno de Schultz',
      desc: 'Fórmulas de autosugestión', demo: 'auto' },
    visu: { chip: 'Visualización guiada', name: 'Visualización guiada',
      desc: 'Escenarios pacíficos · todos los sentidos', demo: 'visu' },
    mind: { chip: 'Mindfulness', name: 'Mindfulness / Atención plena',
      desc: 'Observar sin juzgar · presente', demo: 'mind' },
    musi: { chip: 'Musicoterapia', name: 'Musicoterapia', desc: 'Baja frecuencia · música clásica', demo: 'musi' },
    aroma: { chip: 'Aromaterapia', name: 'Aromaterapia', desc: 'Lavanda · manzanilla' },
    hidro: { chip: 'Hidroterapia', name: 'Hidroterapia', desc: 'Baños tibios · flotación · sauna' }
  };
  const ORDER = FAM.reduce((a, f) => a.concat(f.ids), []);
  let cleanup = null;
  function runCleanup() { if (cleanup) { try { cleanup(); } catch (e) { /* noop */ } cleanup = null; } R.tension.tecnicas = 0; }

  /* ----- demos ----- */
  const DEMOS = {
    rmp(box) {
      const ZONES = ['Pies', 'Piernas', 'Manos', 'Hombros', 'Cara'];
      box.innerHTML = '<p class="demo-h">Pruébalo</p><div class="demo-row" id="rmp-z"></div>' +
        '<div class="rmp"><div class="rmp-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bgc" cx="50" cy="50" r="42"/><circle class="fg" id="rmp-fg" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="264"/></svg><b id="rmp-n">·</b></div>' +
        '<div class="rmp-txt"><strong id="rmp-t">Elige una zona</strong><span id="rmp-s">Tensa 6 s · suelta 12 s</span></div></div>';
      const zEl = $('#rmp-z', box), fg = $('#rmp-fg', box), nEl = $('#rmp-n', box), tEl = $('#rmp-t', box), sEl = $('#rmp-s', box);
      let timer = null, t0 = 0, zone = '';
      const TENSE = 6, FREE = 12;
      ZONES.forEach((z) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = z;
        b.addEventListener('click', () => start(z)); zEl.appendChild(b);
      });
      function stop() { if (timer) cancelAnimationFrame(timer); timer = null; }
      function start(z) {
        stop(); zone = z; t0 = performance.now();
        (function tick(now) {
          const e = (now - t0) / 1000;
          if (e < TENSE) {
            fg.style.stroke = 'var(--ember)'; fg.setAttribute('stroke-dashoffset', 264 * (1 - e / TENSE));
            nEl.textContent = Math.ceil(TENSE - e); tEl.textContent = 'Tensa: ' + zone.toLowerCase();
            sEl.textContent = 'Aprieta con fuerza, sin dolor.'; R.tension.tecnicas = 0.9;
          } else if (e < TENSE + FREE) {
            const f = (e - TENSE) / FREE;
            fg.style.stroke = 'var(--calm)'; fg.setAttribute('stroke-dashoffset', 264 * f);
            nEl.textContent = Math.ceil(TENSE + FREE - e); tEl.textContent = 'Suelta de golpe';
            sEl.textContent = 'Nota cómo cambia la sensación en ' + zone.toLowerCase() + '.'; R.tension.tecnicas = 0;
          } else {
            fg.setAttribute('stroke-dashoffset', 264); nEl.textContent = '✓'; tEl.textContent = 'Listo';
            sEl.textContent = 'Así se recorre el cuerpo, de los pies a la cara. Prueba otra zona.'; R.tension.tecnicas = 0; timer = null; return;
          }
          timer = requestAnimationFrame(tick);
        })(t0);
      }
      cleanup = stop;
    },

    resp(box) {
      box.innerHTML = '<p class="demo-h">Pruébalo</p><p>Practica la respiración cuadrada o la 4-7-8 con el árbol.</p>' +
        '<div class="demo-row"><button class="btn" type="button" data-p="box">Respiración cuadrada</button><button class="btn ghost" type="button" data-p="478">Técnica 4-7-8</button></div>';
      $$('[data-p]', box).forEach((b) => b.addEventListener('click', () => R.breathing && R.breathing.open(b.dataset.p)));
    },

    auto(box) {
      box.innerHTML = '<p class="demo-h">Pruébalo · repite mentalmente</p><div class="demo-row" id="au-p"></div>' +
        '<p class="phrase" id="au-t">Elige una fórmula y repítela despacio, sin forzarla.</p><p id="au-c"></p>';
      const F = ['Mi brazo derecho es pesado', 'Mi corazón late tranquilo y constante'];
      const t = $('#au-t', box), c = $('#au-c', box); let n = 0, to = null;
      F.forEach((f) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = '«' + f + '»';
        b.addEventListener('click', () => {
          n++; t.textContent = '«' + f + '»'; t.classList.remove('fade'); c.textContent = 'Repeticiones: ' + n;
          clearTimeout(to); to = setTimeout(() => t.classList.add('fade'), 1600);
        });
        $('#au-p', box).appendChild(b);
      });
      cleanup = () => clearTimeout(to);
    },

    visu(box) {
      box.innerHTML = '<p class="demo-h">Pruébalo · cierra los ojos un momento</p><p>Imagina un lugar tranquilo. Elige un sentido:</p><div class="demo-row" id="vi-p"></div><p class="senses" id="vi-t"></p>';
      const S = { 'Ver': '¿Qué <em>colores y formas</em> hay a tu alrededor?', 'Oler': '¿Qué <em>olores</em> reconoces en ese lugar?', 'Oír': '¿Qué <em>sonidos</em> llegan hasta ti?', 'Tocar': '¿Qué <em>texturas</em> sientes bajo las manos y los pies?' };
      const t = $('#vi-t', box);
      Object.keys(S).forEach((k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = k;
        b.addEventListener('click', () => { t.innerHTML = S[k]; swap(t); });
        $('#vi-p', box).appendChild(b);
      });
    },

    mind(box) {
      box.innerHTML = '<p class="demo-h">Pruébalo · observa sin juzgar</p><p>Aparecen pensamientos. Tócalos para verlos pasar.</p><div class="mind-field" id="mi-f"></div><button class="btn ghost stop-btn" type="button" id="mi-b">Detener</button>';
      const field = $('#mi-f', box), TH = ['¿Y si sale mal?', 'Tengo que acordarme de…', 'Qué hambre tengo', 'Me duele el cuello', 'Eso que dije ayer', 'Falta poco para terminar'];
      let i = 0, iv = null;
      function spawn() {
        const d = document.createElement('button'); d.type = 'button'; d.className = 'thought'; d.textContent = TH[i++ % TH.length];
        d.style.left = '100%'; d.style.top = (8 + Math.random() * 62) + '%'; d.style.setProperty('--dur', (12 + Math.random() * 4) + 's');
        d.addEventListener('click', () => { d.classList.add('gone'); setTimeout(() => d.remove(), 1300); });
        d.addEventListener('animationend', () => d.remove());
        field.appendChild(d);
      }
      function stop() { clearInterval(iv); iv = null; field.innerHTML = ''; }
      if (!R.reduced) { spawn(); iv = setInterval(spawn, 2100); }
      else { for (let k = 0; k < 3; k++) { spawn(); const l = field.lastChild; l.style.left = (10 + k * 30) + '%'; l.style.animation = 'none'; } }
      $('#mi-b', box).addEventListener('click', () => { stop(); });
      cleanup = stop;
    },

    musi(box) {
      box.innerHTML = '<p class="demo-h">Pruébalo · sonido grave generado por el navegador</p><p>Un tono de baja frecuencia con un vaivén lento. Baja el volumen si hace falta.</p><button class="btn" type="button" id="mu-b">Escuchar</button>';
      const btn = $('#mu-b', box); let ac = null, nodes = null;
      function stop() {
        if (!ac) return;
        try { const t = ac.currentTime; nodes.g.gain.cancelScheduledValues(t); nodes.g.gain.setTargetAtTime(0, t, 0.25); const a = ac; setTimeout(() => a.close(), 900); } catch (e) { /* noop */ }
        ac = null; nodes = null; btn.textContent = 'Escuchar';
      }
      btn.addEventListener('click', () => {
        if (ac) { stop(); return; }
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { btn.textContent = 'Sin audio disponible'; return; }
        ac = new AC();
        const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
        const o1 = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain();
        o1.frequency.value = 110; o2.frequency.value = 164.8; o1.type = o2.type = 'sine';
        lfo.frequency.value = 0.12; lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
        const m = ac.createGain(); m.gain.value = 0.6; o1.connect(g); o2.connect(m); m.connect(g);
        g.gain.setTargetAtTime(0.09, ac.currentTime, 0.8);
        o1.start(); o2.start(); lfo.start(); nodes = { g };
        btn.textContent = 'Detener';
      });
      cleanup = stop;
    }
  };

  function techniques() {
    const list = $('#tech-list'), det = $('#tech-detail');
    if (!list || !det) return;
    let cur = -1;
    FAM.forEach((f) => {
      const g = document.createElement('div'); g.className = 'tg-group';
      g.innerHTML = '<h3>' + f.name + '</h3><ul></ul>';
      f.ids.forEach((id) => {
        const li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.id = id; b.setAttribute('aria-pressed', 'false'); b.textContent = TECH[id].chip;
        b.addEventListener('click', () => show(ORDER.indexOf(id)));
        li.appendChild(b); $('ul', g).appendChild(li);
      });
      list.appendChild(g);
    });
    function show(i) {
      cur = (i + ORDER.length) % ORDER.length;
      const id = ORDER[cur], t = TECH[id];
      runCleanup();
      $$('.chip', list).forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'));
      const fam = FAM.find((f) => f.ids.indexOf(id) >= 0).name;
      det.innerHTML = '<p class="td-fam">' + fam + '</p><h3>' + t.name + '</h3><p class="td-desc">' + t.desc + '</p>' +
        (t.sub ? '<ul class="td-sub">' + t.sub.map((s) => '<li><b>' + s[0] + '.</b> ' + s[1] + '</li>').join('') + '</ul>' : '') +
        (t.demo ? '<div class="demo" id="demo-box"></div>' : '');
      if (t.demo) DEMOS[t.demo]($('#demo-box', det));
      swap(det);
      R.stepper.tecnicas.i = cur;
    }
    R.stepper.tecnicas = { n: ORDER.length, i: 0, set(i) { show(i); } };
    R.onLeave = R.onLeave || {};
    R.onLeave.tecnicas = runCleanup;
    show(0);
  }

  /* ============================================================
     07 · RESPIRACIÓN GUIADA
     ============================================================ */
  const PAT = {
    box: { phases: [['Inhala', 4, 'in'], ['Sostén', 4, 'hold1'], ['Exhala', 4, 'out'], ['Sostén', 4, 'hold0']],
      desc: '<b>Cuadrada</b> · 4 · 4 · 4 · 4' },
    '478': { phases: [['Inhala', 4, 'in'], ['Sostén', 7, 'hold1'], ['Exhala', 8, 'out']],
      desc: '<b>4-7-8</b> · inhala 4 · retén 7 · exhala 8' }
  };
  const ease = (t) => t * t * (3 - 2 * t);

  function breathing() {
    const seg = $('#br-seg'), desc = $('#br-desc'), btn = $('#br-start'), ring = $('#br-ring'), orb = $('#br-orb'),
      phaseEl = $('#br-phase'), numEl = $('#br-num'), cycEl = $('#br-cycles'), sr = $('#br-sr');
    if (!seg) return;
    let pat = 'box', running = false, t0 = 0, raf = null, lastPh = -1, arcs = [], total = 16, trav = null;
    const NS = 'http://www.w3.org/2000/svg';

    function buildRing() {
      ring.innerHTML = '';
      const P = PAT[pat].phases; total = P.reduce((a, p) => a + p[1], 0);
      arcs = []; let acc = 0;
      P.forEach((p) => {
        const c = document.createElementNS(NS, 'circle');
        const len = (p[1] / total) * 100;
        c.setAttribute('r', 100); c.setAttribute('pathLength', 100); c.setAttribute('class', 'seg-a');
        c.setAttribute('stroke-dasharray', Math.max(0.5, len - 1.2) + ' 200'); c.setAttribute('stroke-dashoffset', -acc - 0.6);
        ring.appendChild(c); arcs.push(c); acc += len;
      });
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'trav-g');
      const d = document.createElementNS(NS, 'circle'); d.setAttribute('r', 7); d.setAttribute('cy', -100); d.setAttribute('class', 'trav');
      g.appendChild(d); ring.appendChild(g); trav = g;
      setTrav(0);
    }
    function setTrav(f) { trav.style.transform = 'rotate(' + (f * 360) + 'deg)'; }

    function paintIdle() {
      desc.innerHTML = PAT[pat].desc;
      phaseEl.textContent = 'Listo'; numEl.textContent = '·';
      orb.style.transform = 'scale(' + (R.reduced ? 0.78 : 0.55) + ')';
      arcs.forEach((a) => a.setAttribute('class', 'seg-a'));
      setTrav(0); cycEl.textContent = '0'; lastPh = -1;
    }
    function setPattern(p) {
      pat = p;
      $$('button', seg).forEach((b) => b.setAttribute('aria-checked', b.dataset.p === p ? 'true' : 'false'));
      const was = running; if (running) stop();
      buildRing(); paintIdle(); if (was) start();
    }
    function stop() {
      running = false; if (raf) cancelAnimationFrame(raf); raf = null; R.breath = null;
      btn.innerHTML = 'Comenzar <kbd>B</kbd>'; paintIdle();
    }
    function start() {
      running = true; t0 = performance.now(); lastPh = -1;
      btn.innerHTML = 'Detener <kbd>B</kbd>';
      raf = requestAnimationFrame(tick);
    }
    function toggle() { running ? stop() : start(); }

    function tick(now) {
      if (!running) return;
      if (R.active !== 'respiracion') { stop(); return; }
      raf = requestAnimationFrame(tick);
      const e = (now - t0) / 1000, cyc = Math.floor(e / total), pos = e % total, P = PAT[pat].phases;
      let acc = 0, k = 0;
      while (k < P.length - 1 && pos >= acc + P[k][1]) { acc += P[k][1]; k++; }
      const dur = P[k][1], inP = pos - acc, f = inP / dur, kind = P[k][2];
      const v = kind === 'in' ? ease(f) : kind === 'out' ? 1 - ease(f) : kind === 'hold1' ? 1 : 0;
      if (R.reduced) { R.breath = (kind === 'in' || kind === 'hold1') ? 1 : 0; }
      else { R.breath = v; orb.style.transform = 'scale(' + (0.55 + 0.45 * v).toFixed(4) + ')'; }
      if (R.reduced) orb.style.transform = 'scale(' + ((kind === 'in' || kind === 'hold1') ? 1 : 0.6) + ')';
      numEl.textContent = Math.max(1, Math.ceil(dur - inP));
      setTrav((pos / total));
      if (k !== lastPh) {
        lastPh = k; phaseEl.textContent = P[k][0];
        arcs.forEach((a, i) => a.setAttribute('class', 'seg-a' + (i === k ? ' on' : i < k ? ' done' : '')));
        sr.textContent = P[k][0] + ' ' + dur + ' segundos';
      }
      cycEl.textContent = cyc;
    }

    $$('button', seg).forEach((b) => b.addEventListener('click', () => setPattern(b.dataset.p)));
    btn.addEventListener('click', toggle);
    R.hotkeys.respiracion = Object.assign(R.hotkeys.respiracion || {}, { b: toggle });
    R.breathing = {
      toggle, start, stop, isRunning: () => running,
      open(p) { if (p && p !== pat) setPattern(p); R.goToId('respiracion'); },
      begin(p) { if (p && p !== pat) setPattern(p); R.goToId('respiracion'); setTimeout(() => { if (!running) start(); }, R.reduced ? 100 : 1100); }
    };
    buildRing(); paintIdle();
  }

  R.init.push(techniques, breathing);
})();
