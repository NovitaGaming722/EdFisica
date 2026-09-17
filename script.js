// =============================================================
// LA RELAJACIÓN — El árbol de la calma
// Contenido, navegación entre ramas y animaciones de apoyo
// =============================================================

(function () {
  "use strict";

  /* -----------------------------------------------------------
     1. Contenido de cada nodo del árbol
  ----------------------------------------------------------- */
  const CONTENT = {

    concepto: {
      eyebrow: "raíces · fundamento",
      title: "¿Qué es relajarse?",
      lead: "Un estado de baja tensión física y mental en el que los sistemas muscular, respiratorio y neurológico bajan su nivel de actividad. No es la ausencia de estrés ni \"no hacer nada\": es un proceso activo de autorregulación.",
      body: `
        <div class="def-grid">
          <div class="def-item"><b>Descanso</b><span>Pausa en la actividad física o mental. Puedes descansar y seguir tenso.</span></div>
          <div class="def-item"><b>Sueño</b><span>Estado inconsciente de restauración biológica.</span></div>
          <div class="def-item"><b>Relajación</b><span>Estado voluntario y consciente de reducción del tono muscular y la hiperactividad mental.</span></div>
        </div>
      `
    },

    fisiologia: {
      eyebrow: "tronco · el cuerpo por dentro",
      title: "Fisiología de la calma",
      lead: "El sistema nervioso simpático activa al cuerpo ante una amenaza; el parasimpático lo devuelve a la calma. Así responde cada sistema:",
      body: `
        <div class="panel-scroll">
        <table class="phys-table">
          <thead><tr><th>Sistema</th><th>En tensión</th><th>En relajación</th></tr></thead>
          <tbody>
            <tr><td class="sys">Cerebro</td><td class="tense">Ondas beta (alerta, estrés)</td><td class="relax">Ondas alfa y theta (calma, relajación profunda)</td></tr>
            <tr><td class="sys">Corazón y presión</td><td class="tense">Frecuencia alta, vasoconstricción, presión alta</td><td class="relax">Vasodilatación, baja la presión y el ritmo cardíaco</td></tr>
            <tr><td class="sys">Músculos</td><td class="tense">Hipertonía: rigidez y contracción constante</td><td class="relax">Hipotonía: liberación de la tensión muscular</td></tr>
            <tr><td class="sys">Digestión</td><td class="tense">Se inhibe o ralentiza</td><td class="relax">Se reactiva la digestión y el peristaltismo</td></tr>
            <tr><td class="sys">Bioquímica</td><td class="tense">Cortisol, adrenalina, noradrenalina</td><td class="relax">Endorfinas, serotonina, GABA, oxitocina</td></tr>
            <tr><td class="sys">Sist. inmune</td><td class="tense">Suprimido por exceso de cortisol</td><td class="relax">Fortalecido: más producción de linfocitos T</td></tr>
          </tbody>
        </table>
        </div>
      `
    },

    historia: {
      eyebrow: "rama · historia y evolución",
      title: "De los templos a los laboratorios",
      lead: "La relajación pasó de práctica espiritual a objeto de estudio científico.",
      body: `
        <ul class="timeline panel-scroll">
          <li><span class="t-when">Hace más de 3.000 años</span><p class="t-who">Yoga y Qigong / Tai Chi</p><p>En India y China, el control respiratorio y la postura —como el Savasana— equilibraban la energía y calmaban la mente.</p></li>
          <li><span class="t-when">Grecia y Roma clásicas</span><p class="t-who">Termas, masajes y filosofía</p><p>El estoicismo y el epicureísmo buscaban la ataraxia: la imperturbabilidad del alma.</p></li>
          <li><span class="t-when">1929</span><p class="t-who">Edmund Jacobson</p><p>Crea la Relajación Muscular Progresiva al vincular la tensión muscular con la ansiedad mental.</p></li>
          <li><span class="t-when">1932</span><p class="t-who">Johannes H. Schultz</p><p>Desarrolla el Entrenamiento Autógeno, basado en la autosugestión para inducir pesadez y calor.</p></li>
          <li><span class="t-when">1970</span><p class="t-who">Herbert Benson</p><p>Introduce en Harvard la "Respuesta de Relajación", midiendo en laboratorio técnicas de origen oriental.</p></li>
          <li><span class="t-when">Años 70–80</span><p class="t-who">Jon Kabat-Zinn</p><p>Integra meditación y medicina occidental en el programa MBSR.</p></li>
        </ul>
      `
    },

    cuerpomente: {
      eyebrow: "rama · cuerpo y mente",
      title: "El bucle cuerpo–mente",
      lead: "",
      body: `
        <div class="bm-block">
          <span class="bm-tag">física · somática</span>
          <p class="bm-title">Relajar el cuerpo</p>
          <p class="bm-text">Reduce el tono muscular, libera contracturas y disminuye el dolor somático.</p>
          <p class="bm-example">Al soltar hombros y cuello, envías al cerebro la señal de que no hay peligro.</p>
        </div>
        <div class="bm-block">
          <span class="bm-tag">mental · cognitiva y emocional</span>
          <p class="bm-title">Relajar la mente</p>
          <p class="bm-text">Reduce el diálogo interno intrusivo, la rumiación y la sobrecarga sensorial.</p>
          <p class="bm-example">Apagar las preocupaciones sobre el futuro o el pasado para anclarse en el presente.</p>
        </div>
        <div class="loop-note">La mente no se calma si el cuerpo percibe una amenaza física, y el cuerpo no se relaja si la mente percibe peligro: ambos se retroalimentan de forma continua.</div>
      `
    },

    tecnicas: {
      eyebrow: "rama · técnicas y herramientas",
      title: "Formas de llegar a la calma",
      lead: "",
      body: `
        <div class="card-grid panel-scroll">
          <div class="card">
            <h4>Corporales y físicas</h4>
            <ul>
              <li>Relajación Muscular Progresiva: tensar 5–7 s y soltar bruscamente 10–15 s, de los pies a la cara.</li>
              <li>Respiración diafragmática, técnica 4-7-8 y respiración cuadrada (4-4-4-4).</li>
              <li>Masoterapia y biofeedback para liberar nudos y monitorear el ritmo cardíaco.</li>
            </ul>
          </div>
          <div class="card">
            <h4>Mentales y cognitivas</h4>
            <ul>
              <li>Entrenamiento Autógeno: frases de autosugestión como "mi brazo es pesado".</li>
              <li>Visualización guiada de escenarios pacíficos, con todos los sentidos.</li>
              <li>Mindfulness: observar pensamientos y sensaciones sin juzgar.</li>
            </ul>
          </div>
          <div class="card">
            <h4>Pasivas y sensoriales</h4>
            <ul>
              <li>Musicoterapia con sonidos de baja frecuencia o música clásica.</li>
              <li>Aromaterapia: lavanda para relajar, manzanilla para calmar.</li>
              <li>Hidroterapia: baños tibios, tanques de flotación o sauna.</li>
            </ul>
          </div>
        </div>
      `
    },

    ambitos: {
      eyebrow: "rama · ámbitos de aplicación",
      title: "Dónde florece la calma",
      lead: "",
      body: `
        <div class="card-grid panel-scroll">
          <div class="card">
            <h4>Deportivo</h4>
            <p>Antes de competir, regula el nivel de activación para no cometer errores por exceso de ansiedad; después, acelera la vuelta a la homeostasis y la recuperación de tejidos.</p>
          </div>
          <div class="card">
            <h4>Laboral y escolar</h4>
            <p>Previene el burnout y usa pausas activas y micro-relajaciones para restaurar la atención y la toma de decisiones.</p>
          </div>
          <div class="card">
            <h4>Clínico y psicológico</h4>
            <p>Apoya el tratamiento de ansiedad, ataques de pánico, insomnio, hipertensión e intestino irritable; es clave en la desensibilización sistemática para fobias.</p>
          </div>
          <div class="card">
            <h4>Social y cotidiano</h4>
            <p>Mejora las relaciones interpersonales al reducir la reactividad impulsiva y la irritabilidad.</p>
          </div>
        </div>
      `
    }
  };

  const ORDER = ["concepto", "fisiologia", "historia", "cuerpomente", "tecnicas", "ambitos"];

  /* -----------------------------------------------------------
     2. Referencias al DOM
  ----------------------------------------------------------- */
  const panelInner   = document.getElementById("panelInner");
  const progressDots = document.getElementById("progressDots");
  const prevBtn      = document.getElementById("prevBtn");
  const nextBtn      = document.getElementById("nextBtn");
  const navLinks     = Array.from(document.querySelectorAll(".nav-link"));
  const nodeBtns     = Array.from(document.querySelectorAll(".node-btn"));
  const nodeGroups   = Array.from(document.querySelectorAll(".node-group"));

  let current = null;

  /* -----------------------------------------------------------
     3. Construcción de los puntos de progreso
  ----------------------------------------------------------- */
  ORDER.forEach((id) => {
    const dot = document.createElement("span");
    dot.dataset.branch = id;
    progressDots.appendChild(dot);
  });
  const dotEls = Array.from(progressDots.children);

  /* -----------------------------------------------------------
     4. Render del contenido con transición suave
  ----------------------------------------------------------- */
  function renderPanel(id) {
    const data = CONTENT[id];
    if (!data) return;

    panelInner.classList.add("is-leaving");

    window.setTimeout(() => {
      panelInner.innerHTML = `
        <p class="panel-eyebrow">${data.eyebrow}</p>
        <h2 class="panel-title">${data.title}</h2>
        ${data.lead ? `<p class="panel-lead">${data.lead}</p>` : ""}
        ${data.body}
      `;
      panelInner.classList.remove("is-leaving");
    }, 180);
  }

  function setActive(id, { scroll = false } = {}) {
    if (!CONTENT[id] || id === current) {
      current = id;
    } else {
      current = id;
      renderPanel(id);
    }

    navLinks.forEach((btn) => btn.classList.toggle("active", btn.dataset.branch === id));
    nodeBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.branch === id));
    nodeGroups.forEach((g) => g.classList.toggle("is-active", g.dataset.branch === id));
    dotEls.forEach((dot) => dot.classList.toggle("active", dot.dataset.branch === id));

    if (scroll) {
      document.getElementById("panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function step(delta) {
    const idx = ORDER.indexOf(current);
    const next = ORDER[(idx + delta + ORDER.length) % ORDER.length];
    setActive(next);
  }

  /* -----------------------------------------------------------
     5. Listeners
  ----------------------------------------------------------- */
  [...navLinks, ...nodeBtns].forEach((el) => {
    el.addEventListener("click", () => setActive(el.dataset.branch));
  });
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  /* -----------------------------------------------------------
     6. Partículas ambientales (motas de calma flotando)
  ----------------------------------------------------------- */
  function spawnParticles() {
    const container = document.getElementById("particles");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const COUNT = window.innerWidth < 600 ? 12 : 22;
    for (let i = 0; i < COUNT; i++) {
      const mote = document.createElement("span");
      mote.className = "mote";
      const size = (Math.random() * 3 + 2).toFixed(1);
      const left = (Math.random() * 100).toFixed(1);
      const dur = (Math.random() * 10 + 14).toFixed(1);
      const delay = (Math.random() * 16).toFixed(1);
      const drift = (Math.random() * 120 - 60).toFixed(0);
      mote.style.setProperty("--s", `${size}px`);
      mote.style.setProperty("--l", `${left}%`);
      mote.style.setProperty("--dur", `${dur}s`);
      mote.style.setProperty("--delay", `${delay}s`);
      mote.style.setProperty("--drift", `${drift}px`);
      container.appendChild(mote);
    }
  }

  /* -----------------------------------------------------------
     7. Arranque: espera a que crezca el árbol y muestra "concepto"
  ----------------------------------------------------------- */
  function init() {
    spawnParticles();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introDelay = reduceMotion ? 0 : 1900;

    window.setTimeout(() => {
      current = null;
      setActive("concepto");
    }, introDelay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
