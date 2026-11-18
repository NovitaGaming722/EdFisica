/* ============================================================
   LA RELAJACIÓN · escena 3D generativa (Three.js)
   Un árbol procedural que respira. Su estado depende de:
   · el scroll (cada sección coloca el árbol en un sitio distinto)
   · Relax.tension[id]  → 0 calma … 1 tensión (color, temblor, hojas)
   · Relax.breath       → null (respiración propia) o 0…1 (ejercicio guiado)
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  R.init = R.init || [];
  R.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  R.tension = R.tension || {};
  R.breath = null;

  const IDLE_PERIOD = 9.5; // segundos por respiración en reposo
  R.idleBreath = (t) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / IDLE_PERIOD);
  R.idleInhaling = (t) => Math.sin((2 * Math.PI * t) / IDLE_PERIOD) > 0;

  // Pose del árbol en cada sección. `from` al entrar y, si existe, `to` al terminar el pin
  // (el árbol se mueve MIENTRAS se recorre la sección y se encadena con la siguiente).
  //  xf  posición horizontal (−1 izq … 1 der, fracción de medio ancho; |xf|>1 = sangrado fuera de pantalla)
  //  base altura de la base del tronco (fracción de la altura visible, −0.5 = borde inferior)
  //  s escala · ry giro extra · cz distancia de cámara (11 = neutra; menos = más cerca)
  //  cy altura de la cámara · ly punto al que mira (cy<0, ly>0 → picado inverso, mirando la copa)
  const P = (xf, base, s, ry, cz, cy, ly) => ({ xf, base, s, ry, cz: cz == null ? 11 : cz, cy: cy || 0, ly: ly || 0 });
  const PRESETS = {
    portada:     { from: P(0.46, -0.47, 1.05, 0.0), to: P(0.05, -0.55, 1.75, 0.9, 9.4, 0.4, 1.2) },
    concepto:    { from: P(1.12, -0.5, 1.5, 0.5, 11, 0, 0.8), to: P(1.0, -0.5, 1.35, 0.9, 11, 0, 0.4) },
    diferencias: { from: P(0.0, -0.62, 0.9, 1.0, 12.5, 0.8, 0), to: P(0.0, -0.62, 1.05, 1.5, 12.5, 0.8, 0) },
    historia:    { from: P(0.9, -0.3, 0.2, 1.5, 11, 0, 0), to: P(0.9, -0.3, 0.62, 2.2, 11, 0, 0.6) },   // v3: a la derecha de la ventana de la línea de tiempo (x > 71 vw)
    fisiologia:  { from: P(0.78, -0.42, 0.85, 2.0, 8.6, -1.4, 2.2), to: P(0.78, -0.42, 0.85, 2.6, 8.6, -1.4, 2.2) },
    cuerpomente: { from: P(0.0, -0.62, 1.3, 2.5, 13, 0.6, 0), to: P(0.0, -0.62, 1.5, 3.0, 13, 0.6, 0) },
    tecnicas:    { from: P(1.45, -0.5, 1.05, 3.0, 11, 0, 0.5), to: P(1.4, -0.5, 1.15, 3.4, 11, 0, 0.5) },
    respiracion: { from: P(0.0, -0.62, 0.8, 3.4, 10.5, 0, 0.8), to: P(0.0, -0.6, 0.95, 3.8, 10.5, 0, 0.8) },
    ambitos:     { from: P(0.86, -0.4, 0.62, 3.8, 11, 0, 0.3), to: P(0.86, -0.4, 0.62, 4.2, 11, 0, 0.3) },
    quiz:        { from: P(0.0, -0.46, 0.9, 4.2), to: P(0.0, -0.46, 0.9, 4.2) },
    cierre:      { from: P(0.55, -0.47, 1.1, 4.4, 12.5, 0.2, 0), to: P(0.62, -0.5, 0.95, 5.2, 15, 0.5, 0.4) }   // v3: a la derecha, tras las tarjetas; el texto de la izquierda queda libre
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ---------- GLSL compartido ---------- */
  const DISPLACE = `
    uniform float uTime, uBreath, uTension;
    vec3 displace(vec3 p){
      float h = clamp(p.y / 6.0, 0.0, 1.0);
      float hh = h * h;
      vec3 q = p;
      q.xz += p.xz * (uBreath * 0.085 * h);
      q.y  += uBreath * 0.14 * h;
      float calm = 1.0 - uTension;
      q.x += sin(uTime * 0.55 + p.x * 0.9 + p.y * 0.4) * 0.09 * hh * calm;
      q.z += cos(uTime * 0.45 + p.z * 0.9 + p.y * 0.5) * 0.07 * hh * calm;
      q.xz *= 1.0 - uTension * 0.10 * h;
      q.y  -= uTension * 0.22 * hh;
      q.x += sin(uTime * 41.0 + p.x * 7.0 + p.y * 5.0) * 0.018 * uTension * h;
      q.z += cos(uTime * 37.0 + p.z * 6.0 + p.y * 4.0) * 0.015 * uTension * h;
      return q;
    }`;

  const BARK_VS = DISPLACE + `
    varying vec3 vN; varying float vH;
    void main(){
      vec3 p = displace(position);
      vN = normalize(normalMatrix * normal);
      vH = clamp(position.y / 6.0, 0.0, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const BARK_FS = `
    uniform float uTension, uBreath;
    varying vec3 vN; varying float vH;
    void main(){
      vec3 base = mix(vec3(0.42, 0.35, 0.27), vec3(0.34, 0.16, 0.11), uTension);
      float l = dot(vN, normalize(vec3(0.35, 0.8, 0.55))) * 0.5 + 0.5;
      float rim = pow(1.0 - abs(vN.z), 2.2);
      vec3 glow = mix(vec3(0.26, 0.62, 0.48), vec3(0.85, 0.30, 0.14), uTension);
      vec3 col = base * (0.3 + 0.95 * l) + rim * glow * (0.4 + 0.5 * uBreath);
      col *= mix(0.7, 1.05, vH);
      gl_FragColor = vec4(col, 1.0);
    }`;

  const LEAF_VS = DISPLACE + `
    attribute float aSeed; attribute float aSize;
    uniform float uPx, uS;
    varying float vSeed; varying float vA;
    void main(){
      vec3 p = displace(position);
      float fl = sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 40.0);
      p += vec3(fl * 0.035, fl * 0.02, fl * 0.035) * (1.0 - uTension);
      p += vec3(sin(uTime * 47.0 + aSeed * 90.0), cos(uTime * 53.0 + aSeed * 70.0), 0.0) * 0.03 * uTension;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      float jit = 1.0 + uTension * 0.45 * sin(uTime * 30.0 + aSeed * 100.0);
      float shrink = 1.0 - 0.45 * smoothstep(0.3, 1.0, uTension);
      gl_PointSize = aSize * uPx * uS * (1.0 + uBreath * 0.25) * jit * shrink / -mv.z;
      vSeed = aSeed;
      vA = 1.0 - 0.7 * smoothstep(0.55, 1.0, uTension) * step(0.58, aSeed);
      gl_Position = projectionMatrix * mv;
    }`;
  const LEAF_FS = `
    uniform float uTension, uBreath;
    varying float vSeed; varying float vA;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.0, d); a *= a;
      vec3 calmC = mix(vec3(0.20, 0.66, 0.46), vec3(0.62, 0.90, 0.52), vSeed);
      vec3 tenseC = mix(vec3(1.0, 0.34, 0.18), vec3(0.98, 0.66, 0.26), vSeed);
      float tm = smoothstep(vSeed * 0.5, vSeed * 0.5 + 0.5, uTension * 1.15);
      gl_FragColor = vec4(mix(calmC, tenseC, tm), a * vA * (0.26 + 0.2 * uBreath));
    }`;

  const DUST_VS = `
    attribute float aSeed;
    uniform float uTime, uPxD, uTension;
    varying float vA;
    void main(){
      vec3 p = position;
      float rise = mod(p.y + 6.0 + uTime * (0.12 + aSeed * 0.18 + uTension * 0.5), 12.0) - 6.0;
      p.y = rise;
      p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.4 + sin(uTime * 25.0 + aSeed * 50.0) * 0.04 * uTension;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (1.2 + aSeed * 2.4) * uPxD / -mv.z;
      vA = 0.18 + 0.4 * aSeed;
      gl_Position = projectionMatrix * mv;
    }`;
  const DUST_FS = `
    uniform float uTension; varying float vA;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      vec3 col = mix(vec3(0.85, 1.0, 0.92), vec3(1.0, 0.7, 0.5), uTension);
      gl_FragColor = vec4(col, vA * smoothstep(0.5, 0.0, d));
    }`;

  const GROUND_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const GROUND_FS = `
    uniform float uPhase, uBreath, uTension;
    varying vec2 vUv;
    void main(){
      vec2 p = vUv * 2.0 - 1.0;
      float r = length(p);
      float rings = 0.0;
      for (int i = 0; i < 4; i++){
        float ph = fract(uPhase + float(i) * 0.25);
        rings += smoothstep(0.035, 0.0, abs(r - ph)) * (1.0 - ph);
      }
      float glow = exp(-r * 3.2) * (0.35 + 0.35 * uBreath);
      float edge = 1.0 - smoothstep(0.82, 1.0, r);
      vec3 col = mix(vec3(0.45, 0.95, 0.72), vec3(1.0, 0.45, 0.25), uTension);
      gl_FragColor = vec4(col, (rings * 0.55 + glow) * edge);
    }`;

  /* ---------- Árbol procedural ---------- */
  function buildTree(THREE, seed, density) {
    const rnd = mulberry32(seed);
    const segs = [];
    const tips = [];
    const MAXD = 6;
    const V3 = THREE.Vector3;

    function perp(d) {
      const t = Math.abs(d.y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0);
      const u = new V3().crossVectors(d, t).normalize();
      const v = new V3().crossVectors(d, u).normalize();
      return [u, v];
    }
    function grow(p, dir, len, r, depth) {
      let pos = p.clone();
      const d = dir.clone();
      const n = depth < 2 ? 4 : 3;
      let rr = r;
      for (let i = 0; i < n; i++) {
        d.x += (rnd() - 0.5) * 0.2; d.z += (rnd() - 0.5) * 0.2; d.y += 0.07;
        d.normalize();
        const end = pos.clone().addScaledVector(d, len / n);
        const r1 = rr * 0.9;
        segs.push({ a: pos.clone(), b: end.clone(), r0: rr, r1 });
        pos = end; rr = r1;
      }
      if (depth >= MAXD) { tips.push({ p: pos.clone(), w: 1 }); return; }
      if (depth >= MAXD - 1) tips.push({ p: pos.clone(), w: 0.35 });
      const count = depth === 0 ? 3 : rnd() < 0.34 ? 3 : 2;
      const [u, v] = perp(d);
      const az0 = rnd() * Math.PI * 2;
      for (let i = 0; i < count; i++) {
        const th = 0.42 + rnd() * 0.42;
        const ph = az0 + (i * Math.PI * 2) / count + (rnd() - 0.5) * 0.6;
        const cd = d.clone().multiplyScalar(Math.cos(th))
          .addScaledVector(u, Math.cos(ph) * Math.sin(th))
          .addScaledVector(v, Math.sin(ph) * Math.sin(th)).normalize();
        grow(pos, cd, len * (0.7 + rnd() * 0.1), rr * 0.74, depth + 1);
      }
    }
    grow(new V3(0, 0, 0), new V3(0.02, 1, 0.01).normalize(), 1.55, 0.2, 0);

    // Geometría de ramas (prismas pentagonales)
    const SIDES = 5;
    const pos = [], nor = [], idx = [];
    segs.forEach((s) => {
      const axis = new V3().subVectors(s.b, s.a).normalize();
      const [u, v] = perp(axis);
      const base = pos.length / 3;
      for (let k = 0; k < SIDES; k++) {
        const ang = (k / SIDES) * Math.PI * 2;
        const n = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v, Math.sin(ang));
        const a = s.a.clone().addScaledVector(n, s.r0);
        const b = s.b.clone().addScaledVector(n, s.r1);
        pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        nor.push(n.x, n.y, n.z, n.x, n.y, n.z);
      }
      for (let k = 0; k < SIDES; k++) {
        const k2 = (k + 1) % SIDES;
        const a0 = base + k * 2, b0 = a0 + 1, a1 = base + k2 * 2, b1 = a1 + 1;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
    });
    const branchGeo = new THREE.BufferGeometry();
    branchGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    branchGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    branchGeo.setIndex(idx);

    // Hojas: nubes de puntos alrededor de las puntas
    const lp = [], seeds = [], sizes = [];
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) * 0.9;
    tips.forEach((t) => {
      const n = Math.round(26 * t.w * density);
      for (let i = 0; i < n; i++) {
        lp.push(t.p.x + gauss() * 0.5, t.p.y + gauss() * 0.42, t.p.z + gauss() * 0.5);
        seeds.push(rnd());
        sizes.push(0.55 + rnd() * 0.9);
      }
    });
    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    leafGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    leafGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    return { branchGeo, leafGeo };
  }

  /* ---------- Escena ---------- */
  function start() {
    const canvas = document.getElementById('scene');
    if (!canvas || !window.THREE) { document.documentElement.classList.add('no-webgl'); return; }
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      document.documentElement.classList.add('no-webgl');
      return;
    }
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    renderer.setClearColor(0x000000, 0);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0, 11);
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    scene.add(group);

    const U = {
      uTime: { value: 0 }, uBreath: { value: 0.5 }, uTension: { value: 0 }, uPx: { value: 600 }, uPxD: { value: 16 }, uS: { value: 1 }, uPhase: { value: 0 }
    };
    const { branchGeo, leafGeo } = buildTree(THREE, 20261117, small ? 0.6 : 1);
    const barkMat = new THREE.ShaderMaterial({ vertexShader: BARK_VS, fragmentShader: BARK_FS, uniforms: U });
    const leafMat = new THREE.ShaderMaterial({
      vertexShader: LEAF_VS, fragmentShader: LEAF_FS, uniforms: U,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(branchGeo, barkMat));
    group.add(new THREE.Points(leafGeo, leafMat));

    // Suelo con ondas
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 11),
      new THREE.ShaderMaterial({ vertexShader: GROUND_VS, fragmentShader: GROUND_FS, uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    ground.rotation.x = -Math.PI / 2 + 0.0;
    ground.position.y = 0.02;
    group.add(ground);

    // Polvo / luciérnagas
    const rd = mulberry32(7);
    const dp = [], ds = [];
    const DN = small ? 120 : 260;
    for (let i = 0; i < DN; i++) { dp.push((rd() - 0.5) * 11, (rd() - 0.5) * 12, (rd() - 0.5) * 6); ds.push(rd()); }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dustGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(ds, 1));
    const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
      vertexShader: DUST_VS, fragmentShader: DUST_FS, uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    dust.position.y = 2;
    scene.add(dust);

    /* Estado animado */
        const st = { xf: PRESETS.portada.from.xf, base: PRESETS.portada.from.base, s: PRESETS.portada.from.s, ry: 0, cz: 11, cy: 0, ly: 0, tension: 0, breathMix: 0, breath: 0.5 };
    let poseReq = { a: 'portada', qa: 0, b: 'portada', t: 0 };
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    let width = 1, height = 1, aspect = 1, dpr = 1;
    let last = performance.now(), time = 0, phase = 0, dirty = true, lastSig = '', paused = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      width = window.innerWidth; height = window.innerHeight; aspect = width / height;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = aspect; camera.updateProjectionMatrix();
      const ppu = (height * dpr) / (2 * Math.tan((38 * Math.PI) / 360));
      U.uPx.value = ppu * 0.14; U.uPxD.value = ppu * 0.0105;
      dirty = true;
    }
    window.addEventListener('resize', resize);
    resize();
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / width - 0.5) * 2; pointer.y = (e.clientY / height - 0.5) * 2;
      if (R.reduced) return; dirty = true;
    }, { passive: true });

    const tensionOf = (id) => (R.tension[id] != null ? R.tension[id] : 0);

    const poseAt = (id, q) => {
      const d = PRESETS[id] || PRESETS.portada, A = d.from, B = d.to || d.from, t = smooth(clamp(q, 0, 1));
      const o = {};
      for (const k in A) o[k] = lerp(A[k], B[k], t);
      return o;
    };
    function target() {
      const A = poseAt(poseReq.a, poseReq.qa), B = poseAt(poseReq.b, 0), t = poseReq.t;
      const L = {};
      for (const k in A) L[k] = lerp(A[k], B[k], t);
      const vh = 2 * 11 * Math.tan((19 * Math.PI) / 180);
      const vw = vh * aspect;
      const narrow = aspect < 0.95;
      const fit = Math.min(1, vw / 6.2);
      const comp = L.cz / 11;              // compensa la distancia: la posición en pantalla no depende de la cámara
      return {
        x: narrow ? 0 : L.xf * (vw / 2) * comp,
        y: (L.base * vh * (narrow ? 0.9 : 1) + (narrow ? -0.4 : 0)) * comp,
        s: L.s * fit * (narrow ? 1.1 : 1),
        ry: L.ry, cz: L.cz, cy: L.cy, ly: L.ly,
        tension: lerp(tensionOf(poseReq.a), tensionOf(poseReq.b), t)
      };
    }

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1); last = now;
      // Pausa: pestaña oculta o sección que tapa por completo la escena (el quiz)
      if (document.hidden || R.sceneCovered) { paused = true; return; }
      if (paused) { paused = false; dirty = true; }
      const reduced = R.reduced;
      if (!reduced) { time += dt; phase += dt * (0.07 + 0.42 * st.tension); }
      else { time = 3.0; }
      const T = target();
      const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
      st.xf = T.x; st.base = T.y; st.s += (T.s - st.s) * k; st.ry += (T.ry - st.ry) * k;
      st.cz += (T.cz - st.cz) * k; st.cy += (T.cy - st.cy) * k; st.ly += (T.ly - st.ly) * k;
      st.tension += (T.tension - st.tension) * k;
      pointer.sx += (pointer.x - pointer.sx) * (reduced ? 1 : 1 - Math.exp(-dt * 2));
      pointer.sy += (pointer.y - pointer.sy) * (reduced ? 1 : 1 - Math.exp(-dt * 2));
      const hasOv = R.breath != null;
      st.breathMix += ((hasOv ? 1 : 0) - st.breathMix) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
      const idle = R.idleBreath(time);
      st.breath = lerp(idle, hasOv ? R.breath : idle, st.breathMix);
      if (reduced) st.breath = hasOv ? R.breath : 0.5;

      // posición con suavizado horizontal
      group.position.x += (st.xf - group.position.x) * k;
      group.position.y += (st.base - group.position.y) * k;
      group.scale.setScalar(st.s);
      group.rotation.y = (reduced ? 0.4 : time * 0.07) + pointer.sx * 0.28 + st.ry * 0.35;
      camera.position.set(0, st.cy - pointer.sy * 0.25, st.cz);
      camera.lookAt(0, st.ly, 0);

      R.t = time;
      U.uS.value = Math.max(0.5, Math.min(1.1, 0.35 + st.s * 0.7));
      U.uTime.value = time; U.uBreath.value = st.breath; U.uTension.value = st.tension; U.uPhase.value = phase;
      document.documentElement.style.setProperty('--tension', st.tension.toFixed(3));

      const sig = [group.position.x.toFixed(2), group.position.y.toFixed(2), st.cz.toFixed(2), st.cy.toFixed(2), st.s.toFixed(3), st.ry.toFixed(3), st.tension.toFixed(3), st.breath.toFixed(3), pointer.sx.toFixed(2), width, height].join('|');
      if (reduced && sig === lastSig && !dirty) return;
      lastSig = sig; dirty = false;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    R.scene = {
      setPose(a, qa, b, t) { poseReq.a = a; poseReq.qa = qa; poseReq.b = b; poseReq.t = t; },
      invalidate() { dirty = true; },
      ok: true
    };
  }

  R.init.push(start);
})();
