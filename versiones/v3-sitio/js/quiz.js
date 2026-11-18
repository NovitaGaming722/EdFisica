/* ============================================================
   LA RELAJACIÓN · pregunta al público (quiz)
   Todas las preguntas salen del trabajo escrito.
   Con las flechas: paso 1 muestra la respuesta, paso 2 pasa a la siguiente.
   ============================================================ */
(function () {
  'use strict';
  const R = (window.Relax = window.Relax || {});
  R.init = R.init || [];
  R.hotkeys = R.hotkeys || {};
  R.stepper = R.stepper || {};

  const Q = [
    { q: '¿Cuál de estas frases define a la relajación (frente al descanso y al sueño)?',
      o: ['Una pausa en la actividad física o mental', 'Un estado inconsciente de restauración biológica', 'Un estado voluntario y consciente de reducción del tono muscular y la hiperactividad mental', 'La ausencia total de estrés'], a: 2,
      e: 'El descanso es una pausa (puedes descansar estando tenso) y el sueño es inconsciente. La relajación es voluntaria y consciente.' },
    { q: '¿Quién desarrolló la Relajación Muscular Progresiva, y cuándo?',
      o: ['Johannes H. Schultz, 1932', 'Edmund Jacobson, 1929', 'Herbert Benson, 1970', 'Jon Kabat-Zinn, años 70–80'], a: 1,
      e: 'Jacobson, en 1929, descubrió que la tensión muscular está directamente vinculada a la ansiedad mental.' },
    { q: 'Con el sistema parasimpático activo, ¿qué ondas baja el cerebro?',
      o: ['Ondas beta (alerta, estrés)', 'Ondas alfa y theta', 'Ondas de hipervigilancia', 'Ninguna: el cerebro se apaga'], a: 1,
      e: 'Alfa (calma alerta) y theta (relajación profunda). La corteza prefrontal toma el mando.' },
    { q: 'En la técnica 4-7-8, ¿cómo se reparten los segundos?',
      o: ['Inhalar 7, mantener 4, exhalar 8', 'Inhalar 4, mantener 7, exhalar 8', 'Inhalar 4, retener 4, exhalar 4, retener 4', 'Inhalar 8, mantener 7, exhalar 4'], a: 1,
      e: 'Inhalar en 4 s, mantener 7 s y exhalar en 8 s. La opción 3 es la respiración cuadrada.' },
    { q: '¿Qué hormona se describe como «la hormona de la calma y la seguridad»?',
      o: ['Cortisol', 'Adrenalina', 'Oxitocina', 'Noradrenalina'], a: 2,
      e: 'La oxitocina, junto con endorfinas, serotonina y GABA, aparece en el estado de relajación.' },
    { q: 'El «bucle cuerpo–mente» significa que…',
      o: ['El cuerpo se relaja solo, sin la mente', 'Cuerpo y mente se retroalimentan de forma continua', 'La mente controla al cuerpo, nunca al revés', 'Solo importa la relajación muscular'], a: 1,
      e: 'La mente no se calma si el cuerpo percibe amenaza, y el cuerpo no se relaja si la mente percibe peligro.' },
    { q: '¿En qué ámbito es técnica clave la Desensibilización Sistemática?',
      o: ['Deportivo', 'Laboral y escolar', 'Clínico y psicológico', 'Social y cotidiano'], a: 2,
      e: 'Es una terapia cognitivo-conductual para fobias, dentro del ámbito clínico y psicológico.' }
  ];

  function init() {
    const root = document.getElementById('quiz-box');
    if (!root) return;
    const N = Q.length;
    let answers = new Array(N).fill(null);
    let step = 0; // 0 = P1 · 1 = P1 con respuesta · … · 2N = resultados

    function dots(cur) {
      return '<div class="q-dots" aria-hidden="true">' + Q.map((_, i) => {
        const a = answers[i];
        const cls = a != null ? (a === Q[i].a ? 'ok' : 'no') : i === cur ? 'cur' : '';
        return '<i class="' + cls + '"></i>';
      }).join('') + '</div>';
    }

    function render() {
      if (step >= 2 * N) return results();
      const qi = Math.floor(step / 2), revealed = step % 2 === 1, q = Q[qi], chosen = answers[qi];
      const L = ['1', '2', '3', '4'];
      root.innerHTML =
        '<div class="q-top"><span>Pregunta ' + (qi + 1) + ' de ' + N + '</span>' + dots(qi) + '</div>' +
        '<h2 class="q-text">' + q.q + '</h2>' +
        '<div class="q-opts" role="group" aria-label="Respuestas">' + q.o.map((t, i) => {
          let cls = 'q-opt';
          if (revealed) { if (i === q.a) cls += ' right'; else if (i === chosen) cls += ' wrong'; else cls += ' dim'; }
          return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (revealed ? ' disabled' : '') + '><kbd>' + L[i] + '</kbd><span>' + t + '</span></button>';
        }).join('') + '</div>' +
        '<p class="q-fb" aria-live="polite">' + (revealed ? '<b class="' + (chosen != null && chosen !== q.a ? 'bad' : 'good') + '">' + (chosen == null ? 'Respuesta: ' : chosen === q.a ? '¡Correcto! ' : 'Casi. ') + '</b>' + q.e : 'Levanten la mano por la opción que crean correcta, o elige una.') + '</p>' +
        '<div class="q-bar"><button type="button" class="btn' + (revealed ? '' : ' ghost') + '" id="q-next">' + (revealed ? (qi === N - 1 ? 'Ver resultado' : 'Siguiente pregunta') : 'Mostrar respuesta') + ' <kbd>N</kbd></button></div>';
      root.querySelectorAll('.q-opt').forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.i))));
      root.querySelector('#q-next').addEventListener('click', advance);
    }

    function results() {
      const score = answers.reduce((s, a, i) => s + (a === Q[i].a ? 1 : 0), 0);
      const msg = score >= N - 1 ? 'Muy bien: ya sabes cómo se suelta.' : score >= Math.ceil(N / 2) ? 'Buen trabajo. Repasa lo que falló y vuelve a intentarlo.' : 'La calma también se entrena: vuelve a las secciones y repite.';
      root.innerHTML =
        '<div class="q-top"><span>Resultado</span>' + dots(-1) + '</div>' +
        '<div class="q-end"><p class="q-score">' + score + ' / ' + N + '</p><p>' + msg + '</p>' +
        '<div class="q-bar"><button class="btn" type="button" id="q-again">Repetir el quiz</button><button class="btn ghost" type="button" id="q-go">Continuar <kbd>→</kbd></button></div></div>';
      root.querySelector('#q-again').addEventListener('click', () => { answers = new Array(N).fill(null); setStep(0); });
      root.querySelector('#q-go').addEventListener('click', () => R.next && R.next());
    }

    function setStep(i) { step = Math.max(0, Math.min(2 * N, i)); R.stepper.quiz.i = step; render(); }
    function choose(i) {
      if (step >= 2 * N || step % 2 === 1) return;
      answers[Math.floor(step / 2)] = i; setStep(step + 1);
    }
    function advance() { setStep(step + 1); }

    R.stepper.quiz = { n: 2 * N + 1, i: 0, quiet: true, set(i) { setStep(i); } };
    R.hotkeys.quiz = { 1: () => choose(0), 2: () => choose(1), 3: () => choose(2), 4: () => choose(3), n: advance };
    render();
  }

  R.init.push(init);
})();
