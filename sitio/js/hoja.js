/* =============================================================
   La hoja guía — se desprende del árbol en la portada y acompaña todo el recorrido
   (como el objeto protagonista de oryzo.ai): en cada sección se posa en una zona libre,
   y entre secciones vuela en arco, girando, mientras se hace scroll.
   Solo escribe transform/opacity. Con movimiento reducido queda quieta en una esquina.
   ============================================================= */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* Pose por sección: x, y (en % de la ventana, centro de la hoja), escala, giro en el plano (z),
     inclinación 3D (rx, ry). Colocada en zonas libres de texto, comprobado con la prueba de solapamientos. */
  const POSE = {
    portada:     { x: 70, y: 30, s: 0.85, z: -28, rx: 18, ry: -24 },
    concepto:    { x: 86, y: 58, s: 0.95, z: 18, rx: 34, ry: 20 },
    diferencias: { x: 85, y: 18, s: 0.75, z: -52, rx: 12, ry: -30 },
    historia:    { x: 86, y: 52, s: 0.8, z: 36, rx: 28, ry: 26 },
    fisiologia:  { x: 86, y: 14, s: 0.62, z: -12, rx: 40, ry: -18 },
    cuerpomente: { x: 13, y: 20, s: 0.7, z: 62, rx: 22, ry: 34 },
    tecnicas:    { x: 85, y: 15, s: 0.66, z: -38, rx: 30, ry: -26 },
    respiracion: { x: 86, y: 24, s: 0.78, z: 24, rx: 16, ry: 18 },
    ambitos:     { x: 86, y: 14, s: 0.62, z: -20, rx: 36, ry: -22 },
    cierre:      { x: 60, y: 86, s: 0.9, z: 84, rx: 62, ry: 6 }
  };
  const FIRST = POSE.portada;

  let el, inner, last = '', poses = [], anchors = [], leaves = [];

  function build() {
    el = document.createElement('div');
    el.className = 'hoja';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="hoja-in"><svg viewBox="-60 -110 120 220" class="hoja-svg">' +
      '<defs>' +
      '<linearGradient id="hj-g" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stop-color="#b7e8a8"/><stop offset=".45" stop-color="#5fae6c"/><stop offset="1" stop-color="#2c6b45"/></linearGradient>' +
      '<linearGradient id="hj-l" x1="-1" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient>' +
      '<radialGradient id="hj-h" cx=".38" cy=".3" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<path class="hj-body" d="M0 -100 C 34 -78 52 -36 50 4 C 48 44 26 78 0 96 C -26 78 -48 44 -50 4 C -52 -36 -34 -78 0 -100 Z" fill="url(#hj-g)"/>' +
      '<path d="M0 -100 C 34 -78 52 -36 50 4 C 48 44 26 78 0 96 C -26 78 -48 44 -50 4 C -52 -36 -34 -78 0 -100 Z" fill="url(#hj-l)"/>' +
      '<path d="M0 -100 C 34 -78 52 -36 50 4 C 48 44 26 78 0 96 C -26 78 -48 44 -50 4 C -52 -36 -34 -78 0 -100 Z" fill="url(#hj-h)"/>' +
      '<g class="hj-vein" fill="none" stroke-linecap="round">' +
      '<path d="M0 -92 C 2 -40 2 30 0 104" stroke-width="2.4"/>' +
      '<path d="M1 -58 C 14 -62 26 -66 36 -76M1 -30 C 18 -34 34 -40 46 -50M1 0 C 20 -4 36 -10 48 -20M1 30 C 18 26 32 20 42 12M1 58 C 12 56 22 50 30 42" stroke-width="1.3"/>' +
      '<path d="M-1 -58 C -14 -62 -26 -66 -36 -76M-1 -30 C -18 -34 -34 -40 -46 -50M-1 0 C -20 -4 -36 -10 -48 -20M-1 30 C -18 26 -32 20 -42 12M-1 58 C -12 56 -22 50 -30 42" stroke-width="1.3"/>' +
      '</g>' +
      '<path class="hj-stem" d="M0 96 C 1 104 4 110 9 114" fill="none" stroke-width="3" stroke-linecap="round"/>' +
      '</svg></div>';
    document.body.insertBefore(el, document.querySelector('main'));
    inner = el.firstChild;
  }

  /* Anclas: una por sección (sin bandas), en el punto de scroll donde la sección está «en reposo». */
  function measure() {
    const M = R.motion;
    poses = []; anchors = []; leaves = [];
    const secs = M && M.secs ? M.secs.filter((s) => !s.band && POSE[s.id]) : [];
    secs.forEach((s) => {
      const k = M.secs.indexOf(s);
      let y, z;
      if (M.pins) {
        const st = typeof s.stopFn === 'function' ? s.stopFn() : s.stop;
        y = M.yOfS(k, st);
        z = M.yOfS(k, Math.max(st, s.E));        // se queda posada todo el recorrido fijado de la sección
      } else {
        y = z = s.el.offsetTop - innerHeight * 0.2;
      }
      anchors.push(y); leaves.push(Math.max(y, z)); poses.push(POSE[s.id]);
    });
  }

  function poseAt(y, t) {
    if (!anchors.length) return FIRST;
    if (y <= anchors[0]) return poses[0];
    const n = anchors.length - 1;
    if (y >= anchors[n]) return poses[n];
    let i = 0;
    while (i < n && y > anchors[i + 1]) i++;
    if (y <= leaves[i]) return poses[i];                 // posada mientras su sección está fijada
    const a = poses[i], b = poses[i + 1];
    const u = clamp((y - leaves[i]) / Math.max(1, anchors[i + 1] - leaves[i]), 0, 1);
    // vuela solo en el paso entre secciones, con un pequeño margen posada a cada lado
    const w = ease(clamp((u - 0.08) / 0.84, 0, 1));
    const arc = Math.sin(Math.PI * w);                     // arco: sube y baja entre dos poses
    const dir = b.x >= a.x ? 1 : -1;
    return {
      x: lerp(a.x, b.x, w),
      y: lerp(a.y, b.y, w) - arc * 14,
      s: lerp(a.s, b.s, w) * (1 + arc * 0.18),
      z: lerp(a.z, b.z, w) + arc * 160 * dir,             // da una vuelta mientras vuela
      rx: lerp(a.rx, b.rx, w) + arc * 30,
      ry: lerp(a.ry, b.ry, w) - arc * 40 * dir
    };
  }

  function apply(p, now) {
    const t = now / 1000;
    // aleteo en reposo: balanceo suave, como una hoja que flota
    const fx = Math.sin(t * 0.9) * 0.9, fy = Math.sin(t * 1.3 + 1) * 1.1, fr = Math.sin(t * 1.1) * 7, ft = Math.sin(t * 0.7) * 10;
    const tf = 'translate3d(' + (p.x + fx).toFixed(2) + 'vw,' + (p.y + fy).toFixed(2) + 'vh,0) translate(-50%,-50%) scale(' + p.s.toFixed(3) + ')';
    const ti = 'rotateZ(' + (p.z + fr).toFixed(1) + 'deg) rotateX(' + (p.rx + ft).toFixed(1) + 'deg) rotateY(' + (p.ry - ft * 0.6).toFixed(1) + 'deg)';
    const k = tf + '|' + ti;
    if (k !== last) { last = k; el.style.transform = tf; inner.style.transform = ti; }
  }

  function start() {
    build();
    if (R.reduced) { apply(FIRST, 0); el.classList.add('quieta'); return; }
    let ready = false;
    const prev = R.onMeasure;
    R.onMeasure = () => { if (prev) prev(); measure(); ready = true; };
    measure(); ready = anchors.length > 0;
    addEventListener('resize', () => requestAnimationFrame(measure));
    (function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      if (!ready) { measure(); ready = anchors.length > 0; }
      apply(poseAt(window.scrollY), now);
    })(performance.now());
    requestAnimationFrame(() => el.classList.add('on'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0));
  else setTimeout(start, 0);
})();
