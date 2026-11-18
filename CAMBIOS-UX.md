# CAMBIOS-UX — encargo 2: scroll dinámico

Versión 2 del sitio (`sitio/`). La v1 sigue intacta en `versiones/v1-sitio/` y `versiones/v1-capturas/` (no se tocó).

## Resumen del cambio
- **Antes:** 11 «diapositivas» de 100vh con el texto a la izquierda y el mismo fondo. Al avanzar solo cambiaba el contenido.
  El árbol cambiaba de sitio, pero con una interpolación lineal por sección y sin cambiar de encuadre.
- **Ahora:** cada sección se **fija** (sticky) durante 1,2–5,2 pantallas y se transforma con el scroll. Cada una tiene
  una disposición distinta, hay tres bandas de respiro entre las secciones densas, la historia se recorre en
  **horizontal** y el quiz invierte el fondo. El árbol 3D se mueve **dentro** de cada sección y cambia de cámara.
- **Motor propio** (`js/motion.js`, 381 líneas, sin librerías): el scroll se convierte en una coordenada `s` por sección
  y un atributo declarativo `data-fx` describe cada movimiento. Las flechas, el espacio, F y M siguen funcionando.

## Qué cambió en cada sección (antes → después)
| Sección | Antes | Después |
|---|---|---|
| **00 Portada** | Texto a la izquierda, árbol a la derecha. Quieta. | Igual al cargar. Al bajar, el título se aleja y se desvanece (escala 1→1,1, sube 12vh) y el árbol **se centra y crece hacia la cámara** (escala 1,05→1,75, cámara 11→9,4 mirando a la copa). |
| **01 Concepto** | Enunciado + 3 tarjetas + nota, todo entrando a la vez. | Enunciado a la izquierda con **palabras que se encienden una a una** con el scroll; luego el enunciado se reduce, los 3 sistemas entran **escalonados** y la nota entra por la derecha. Árbol **a sangre** por la derecha, recortado. Numeral «01» fantasma con parallax. |
| *Respiro 1* (nuevo) | — | Banda a todo ancho: dos líneas de texto (contorno y sólido) deslizándose en sentidos opuestos. |
| **02 Descanso/sueño/relajación** | 3 tarjetas en fila, izquierda. | **Centrada**: título con máscara; 3 tarjetas **escalonadas en altura** que convergen desde distintas profundidades y giros opuestos (−7°/+7°). Árbol bajo y centrado, asomando entre ellas. |
| **03 Historia** | Nodos + una tarjeta que cambia. | **Scroll horizontal** (5,2 pantallas de scroll vertical): título a sangre → 6 hitos como paneles grandes que alternan arriba/abajo; el año se mueve **más rápido que su tarjeta** (parallax); el panel activo se resalta; la regla inferior se rellena. El árbol **crece de brote a árbol** mientras se recorre. En móvil y movimiento reducido es un carril horizontal nativo con imán. |
| **04 Fisiología** | Ilustración y texto en dos columnas, centradas. | La ilustración **sangra por el borde izquierdo** y entra desde fuera; el texto entra por la derecha, los 7 sistemas caen desde arriba y el control sube. Árbol en **picado** (cámara baja mirando la copa), que se tiñe con la tensión. |
| **05 Cuerpo y mente** | Dos tarjetas a la izquierda y el bucle a la derecha. | **Centrada en tres columnas**: el cuerpo entra por la izquierda, la mente por la derecha y el bucle **crece desde el centro**. Cámara alejada. |
| *Respiro 2* (nuevo) | — | Banda con las tres familias de técnicas del PDF. |
| **06 Técnicas** | Menú a la izquierda, detalle a la derecha. | **Invertida**: detalle grande a la izquierda (entra desde fuera) y el menú de técnicas a la derecha (familias escalonadas). Árbol recortado en el borde derecho. |
| **07 Respiración** | Controles a la izquierda y orbe a la derecha. | **Centrada**: el orbe es el centro y crece desde pequeño; los controles y la nota lo **flanquean** desde los lados. El árbol, detrás, respira con el orbe. |
| **08 Ámbitos** | Pestañas a la izquierda y panel a la derecha. | **Cuadrícula**: cuatro ámbitos en fila (caen desde arriba) y un panel ancho debajo (sube). |
| *Respiro 3* (nuevo) | — | Banda con los cuatro ámbitos. |
| **09 Quiz** | Pregunta sobre el mismo fondo oscuro. | **Fondo invertido**: un «papel» crema sube desde abajo y crece hasta casi a sangre. Tinta oscura con contraste AA. La escena 3D **se pausa** mientras lo tapa. |
| **10 Cierre** | Título, 4 ideas en 2×2 y pregunta, todo a la izquierda. | Título y pregunta a la izquierda; las 4 ideas en **cuadrícula escalonada** a la derecha que entran una a una. El árbol **se aleja y se centra** como plano final. |

Cambios transversales:
- **Luces de fondo con parallax global** (dos manchas de luz que se desplazan con el avance total) y numerales grandes por sección.
- **Títulos con máscara**: cada línea sube dentro de su caja, escalonada.
- **Transiciones con continuidad:** cada sección sale con escala y fundido mientras la siguiente asoma por abajo con su propia entrada, y la pose del árbol se mezcla en el mismo tramo. No hay cortes.
- **Navegación por «paradas»:** `→`/`Espacio` completan primero la transformación de la sección (se ve el scroll recorrerla), luego avanzan por sus pasos y luego pasan a la siguiente. Se quitó el `scroll-snap` de la v1, que estorbaba al scroll continuo. El desplazamiento es propio (curva de FrameBudget, 0,65–1,7 s) y se interrumpe con la rueda o el dedo.
- **Progreso continuo** con el scroll (antes saltaba por sección). **Tab** lleva la página a la sección que recibe el foco.
- Se quitó el desenfoque (`filter`) de la aparición de palabras para cumplir «solo `transform` y `opacity`».

## Contenido
Sin cambios de contenido. Comprobado automáticamente frente a la v1: los textos de `index.html` coinciden (salvo la frase de
ayuda del scroll y «o gira la rueda» en la portada, añadidas), los textos de los 6 hitos, los 4 ámbitos y los 4 mensajes del bucle
son idénticos, y `practice.js` (técnicas y respiración) y `quiz.js` son idénticos byte a byte. `physio.js` cambió una sola
instrucción (mide su lienzo con `clientWidth/Height` en vez de `getBoundingClientRect`, para que no le afecten las escalas del scroll).
Las bandas de respiro repiten solo términos que ya estaban en el trabajo escrito (aria-hidden, decorativas).

## Qué se reutilizó y de dónde
Detalle completo en `sitio/CREDITOS.md`. Resumen (todo leído, nada modificado fuera de esta carpeta):
- **FrameBudget web** (`public/script.js`, `public/styles.css`): el patrón de sección alta + sticky + progreso por scroll
  (`initOrbit`, `initWorks`, `initCase`), el limitador por fotograma (`perFrame`), la pausa fuera de pantalla (`.is-live`) y las
  curvas de movimiento (`--ease-out`, `--sx-ease-mask`, `--sx-ease-x`, `--reel-ease`).
- **FrameBudget cliente** (`client/src/hooks/useReducedMotion.js`): suscripción a `prefers-reduced-motion` y reacción al cambio.
- **FrameBudget Mac** (`Estilo/Animaciones.swift`): la entrada corta sin rebote (`Ritmo.entrada`, `EntradaSuave`), el escalonado
  creciente (`Escalonado`) y la idea de fondo con luces radiales (`FondoAurora`). Se tradujeron a curvas y retrasos CSS/JS.
  **No** se usaron la píldora (`pildoraCabeza/Cola`) ni `ArcoProgreso`.
- **VEXEL, NEXFORM, Portafolio, cleanyourtv:** buscados GSAP, ScrollTrigger, Lenis, `animation-timeline` y `position: sticky`:
  sin coincidencias, nada que reutilizar. **`IRIS/.../Inicio` no se consultó.**
- **Librerías de internet:** no se añadió ninguna (ni GSAP/ScrollTrigger ni Lenis). Un motor propio de ~380 líneas da el control
  que se necesitaba (paradas de navegación, pasos, sticky nativo) y evita licencias y peso; `vendor/` solo tiene three.js.
- **oryzo.ai:** la lectura con WebFetch devolvió solo su texto (sin código ni comportamiento real), así que de esa página se tomaron
  ideas de ritmo y composición, no técnicas concretas.

## FPS medidos durante el scroll
Equipo: Apple M5 (GPU «ANGLE Metal»), Brave (Chromium) sin interfaz controlado con puppeteer-core, `deviceScaleFactor` 1.
Prueba: scroll continuo de arriba abajo a 1.500 px/s (más rápido que un trackpad normal) con el árbol 3D activo; fotogramas medidos con
`requestAnimationFrame`, sin los 3 primeros.

| Ventana | CPU | FPS medios | Fotograma p95 | Peor fotograma | Fotogramas > 25 ms |
|---|---|---|---|---|---|
| 1280×720 | normal | **59,9** | 16,8 ms | 33 ms | 0,1 % |
| 1920×1080 | normal | **60,0** | 16,7 ms | 17 ms | 0 % |
| 1280×720 | frenada ×4 | **59,3** | 16,8 ms | 167 ms | 0,4 % |
| 1920×1080 | frenada ×4 | **59,7** | 16,7 ms | 67 ms | 0,3 % |

El techo de 60 FPS es la sincronía vertical de la pantalla, no el límite del sitio. La sección más lenta con la CPU frenada ×4
fue «Cuerpo y mente» a 1280×720 (54 FPS de media).
El árbol se pausa con la pestaña oculta y bajo el «papel» del quiz (comprobado: `sceneCovered` pasa a `true` en el quiz).

## Comprobaciones realizadas
- Servidor local (`python3 -m http.server`): todas las peticiones 200; **0 errores y 0 avisos en la consola** en escritorio, móvil y movimiento reducido.
- **Teclado:** recorrido completo con `→` (portada → cierre, todos los pasos), `←`, `Inicio`, `Fin`, `M`, y `Tab` por todas las secciones.
- **Enlaces directos** (`#fisiologia`) y **redimensionar** (1280→1920, y a móvil y vuelta) conservan la sección y el paso.
- **Encaje:** el contenido de cada paso de cada sección (incluidas las 15 pantallas del quiz) cabe sin recortes en 1280×720, 1366×768, 1024×768, 1600×900 y 1920×1080. Se detectó y corrigió un roce de «Cuerpo y mente» con el marco inferior (7 px) y se repitió la medición en los cinco tamaños.
- **Accesibilidad:** axe-core 4, 0 infracciones en las 11 secciones en escritorio, móvil y movimiento reducido (se corrigieron el contraste de los paneles inactivos de la historia y un carril horizontal sin foco).
- **Sin conexión:** con el service worker activo (`relajacion-v2`, 17 archivos) se recargó la página en modo avión y funcionó con árbol 3D.
- **Móvil 390×844** y **movimiento reducido** (1280×720): capturas revisadas; sin pins, todo visible, sin desbordamiento horizontal.

## Entrega
- `capturas/`: 11 secciones a 1920×1080 y 11 a 390×844 (sustituyen a las antiguas, que siguen en `versiones/v1-capturas/`), más
  dos secuencias de scroll a 1920×1080 de 4 capturas cada una: `1920x1080-secuencia-concepto-1…4.png` (palabras que se encienden → tarjetas
  escalonadas → nota) y `1920x1080-secuencia-historia-1…4.png` (título → hitos de la línea de tiempo con el árbol creciendo).
- `sitio/README.md` actualizado: controles, mapa de secciones con su composición y su parte del PDF, y cómo funciona el motor.
- `sitio/CREDITOS.md` actualizado con lo reutilizado.

## Qué no pude comprobar
- **Pantalla completa (`F`)**: el navegador sin interfaz no la concede. La lógica no cambió respecto a la v1; al entrar y salir la página
  remide y conserva el punto de la sección (probado con redimensionados equivalentes), pero no con la pantalla completa real.
- **Un proyector real**, su resolución y la latencia de la sala. Probados 1280×720, 1366×768, 1920×1080 en ventana.
- **Safari y Firefox** (solo Brave/Chromium). Lo más sensible ahí: `position: sticky` con `overflow: hidden`, `100svh` y `scroll-snap` horizontal del carril móvil.
- **Un móvil físico**: la emulación de 390×844 no reproduce el inercial del dedo ni la barra de direcciones que cambia el alto de la ventana.
- **Rendimiento en equipos más modestos o con GPU integrada antigua**: la prueba fue en un chip Apple M5 (la CPU frenada ×4 simula CPU, no GPU).
- **Fluidez con rueda de ratón real** frente al scroll programático de la prueba (el suavizado del motor reacciona igual, pero el tacto no se mide).
- **Gusto estético y legibilidad desde el fondo de una clase**: lo juzga el grupo. Los puntos que más conviene revisar a ojo: el árbol detrás de las
  listas de «Técnicas» (se recortó a un borde para no estorbar los rótulos) y los numerales fantasma (muy tenues a propósito).
- **Sonido** de Musicoterapia, **audio** y el contenido de las preguntas del quiz: no cambiaron; siguen pendientes de revisión del grupo (ver `EVALUACION-IRIS.md`).
- No se midió el *layout thrashing* con un perfilador: se garantiza por construcción (las medidas se cachean al cargar y al redimensionar, y el bucle solo escribe) y por los FPS.


---

# v3 — correcciones (encargo 3: solapamientos)

## Defectos de la revisión y cómo se resolvieron
Los tres defectos de Historia (capturas `versiones/v2-capturas/1920x1080-secuencia-historia-1…4.png`) tenían una causa común: la pista horizontal ocupaba
todo el ancho de la pantalla, así que a mitad de scroll los hitos vecinos asomaban cortados y todo (texto, tarjetas, años) cruzaba la zona de los
controles y del árbol.

| Defecto | Solución |
|---|---|
| **1. Paso 1:** «Sigue bajando…» y la tarjeta de Yoga/Qigong pisan los botones y el contador `04/11`; la tarjeta queda cortada por la derecha. | La línea de tiempo corre ahora dentro de una **«ventana»** (`.tl-view`, de `--tl-x0` = borde derecho del carril de puntos a `--tl-x1` = 71 vw) con fundido en los bordes. La tarjeta mide `min(44vw, 41rem)` y la separación entre hitos es mayor que el hueco que sobra a cada lado del hito activo, de modo que **en reposo solo se ve el hito activo, nunca un vecino cortado**. El pie (`.tl-foot`) con el contador «n / 6» y Anterior/Siguiente queda dentro de esa misma ventana y por encima de la barra inferior. |
| **2. Paso 3:** el árbol 3D tapa la tarjeta de Schultz. | El árbol de Historia se coloca **a la derecha de la ventana** (`xf 0.9`, escala 0.2→0.62; `scene.js`, preset `historia`), fuera del rectángulo de las tarjetas, y las tarjetas (`.tl-body`) son opacas (`rgba(7,17,14,.96)`). |
| **3 a. Paso 6:** el año «1970» se corta por la izquierda y se superpone a la tarjeta de Benson. | El año y la tarjeta van dentro de la ventana; el parallax de los años se mantiene, pero su recorrido no saca el número del hito activo de la ventana ni lo monta sobre la tarjeta. |
| **3 b.** La tarjeta del paso siguiente asoma cortada por la derecha en el paso 2. | Mismo criterio de separación entre hitos (ver 1). En móvil/«sin pins» el carril nativo usa imán centrado con el mismo reparto. |

**Otras correcciones que encontró la prueba automática en el resto de secciones:**
- **Cabecera y barra inferior:** velo degradado (`.chrome::before`, solo escritorio) para que el contenido que entra o sale de la pantalla se apague antes de leerse encima de la marca, el contador o los botones.
- **Fisiología:** el visor sangra hasta el carril de puntos pero no por debajo de él; pestañas, visor y tarjeta con fondo opaco (`--panel`, 94 %).
- **Diferencias, Cuerpo y mente, Respiración, Ámbitos, Técnicas:** chips, pestañas, paneles laterales y tarjetas con fondo opaco (`rgba(7,17,14,.92–.94)`) para que el árbol no se vea detrás de texto. El contenido de las secciones y su interactividad no cambian.
- **Cierre (corrección de este intento):** el árbol terminaba centrado y quedaba detrás de «Suelta hombros y mandíbula…» y de la línea «Fuente…» (34–51 % de hojas detrás). Ahora termina a la derecha (`xf 0.62`), detrás de las tarjetas opacas; el texto de la izquierda queda sobre fondo limpio.
- `sw.js` sube a la caché `relajacion-v3`.

## Prueba de solapamientos
Arnés en `pruebas/` (`solapes.js`, `lib-analisis.js`, `analiza.js`, `resumen.js`, `capturas.js`; Playwright + Brave sin interfaz, con WebGL).
Para cada sección mide, en 23–37 puntos del scroll por tamaño, los rectángulos de **cada línea de texto y de cada tarjeta** frente a: la cabecera, el contador y la barra de botones, el carril de puntos, la barra de progreso; los **bordes** (de la ventana y de cualquier ancestro con `overflow`); el **árbol 3D** (fracción de píxeles del lienzo WebGL, capturado aparte, que quedan detrás del rectángulo; umbral 12 % sobre fondo no opaco); y otros textos/tarjetas. Cada punto se clasifica:
- **reposo**: el scroll está en una parada (parada de la sección o paso de un stepper) → debe estar limpio;
- **fijada**: sección pegada y en movimiento entre paradas → debe estar limpia salvo entradas/salidas por un borde con fundido;
- **transición**: la sección entra o sale (contenido en vuelo) → solo informativo.

Tamaños: 1920×1080, 1280×720 y 390×844 (móvil: inicio/final de cada sección y cada hito del carril). Cifras = **puntos con algún defecto en reposo + fijada (transición aparte)**, antes (v2, `pruebas/antes/`) → después (`pruebas/despues-v3/`), con el mismo criterio de análisis en ambas columnas:

| Sección | 1920x1080 antes → después | 1280x720 antes → después | 390x844 antes → después |
|---|---|---|---|
| portada | 1 → 0 · trans. 0 → 0 | 1 → 0 · trans. 0 → 0 | 0 → 0 · trans. 0 → 0 |
| concepto | 0 → 0 · trans. 1 → 1 | 0 → 0 · trans. 1 → 1 | 0 → 0 · trans. 0 → 0 |
| diferencias | 15 → 0 · trans. 5 → 4 | 15 → 0 · trans. 5 → 4 | 0 → 0 · trans. 0 → 0 |
| historia | 42 → 0 · trans. 10 → 9 | 42 → 0 · trans. 10 → 9 | 9 → 0 · trans. 0 → 0 |
| fisiologia | 21 → 0 · trans. 4 → 4 | 21 → 0 · trans. 4 → 4 | 0 → 0 · trans. 0 → 0 |
| cuerpomente | 7 → 0 · trans. 6 → 5 | 3 → 0 · trans. 6 → 5 | 0 → 0 · trans. 0 → 0 |
| tecnicas | 0 → 0 · trans. 5 → 5 | 1 → 0 · trans. 4 → 4 | 0 → 0 · trans. 0 → 0 |
| respiracion | 0 → 0 · trans. 4 → 4 | 0 → 0 · trans. 4 → 3 | 0 → 0 · trans. 0 → 0 |
| ambitos | 0 → 0 · trans. 3 → 3 | 0 → 0 · trans. 4 → 4 | 0 → 0 · trans. 0 → 0 |
| quiz | 0 → 0 · trans. 3 → 3 | 0 → 0 · trans. 3 → 3 | 0 → 0 · trans. 0 → 0 |
| cierre | 13 → 0 · trans. 11 → 5 | 13 → 0 · trans. 11 → 5 | 0 → 0 · trans. 0 → 0 |
| (página) | — | — | 0 → 0 · trans. 0 → 0 |
| **Total** | **99 → 0** · trans. 52 → 43 (de 345 puntos) | **96 → 0** · trans. 52 → 42 (de 345 puntos) | **9 → 0** · trans. 0 → 0 (de 33 puntos) |

- **Reposo + fijada: 99 → 0 (1920×1080), 96 → 0 (1280×720), 9 → 0 (390×844).** En Historia a 1920×1080: 42 → 0 puntos (en la v2 eran 239 solapes con el borde, 167 con controles y 89 con el árbol, en total).
- **Transición: 52 → 43 (1920×1080) y 52 → 42 (1280×720), no a cero.** Quedan sobre todo contenido que **sube desde debajo de la ventana** al entrar la sección (pasa por la zona del contador y los botones antes de asentarse) y salidas por el borde. Con el velo de las barras se ve oscurecido, pero la prueba lo sigue contando. Es entrada/salida en vuelo, nunca un estado de reposo. No se intentó reducirlo más.
- Consola: 0 errores; solo el aviso esperado de que Playwright bloquea el service worker.

**Ajuste del arnés en este intento** (`lib-analisis.js`; se re-analizaron «antes» y «después» con la misma regla, por eso las cifras de «antes» son algo menores que las del primer informe): una tarjeta que solo tiene `border-top` o un fondo tenue (p. ej. `.fx`, `.aside`, `.amb-box` al 5 %) se considera sostenida por el fondo opaco de su ancestro, y el texto del orbe de respiración (`#br-num`, `#br-phase`) se considera sobre el orbe (opaco). Antes se contaban como «árbol detrás de texto» (falsos positivos: ~36 puntos de Fisiología, Respiración y Ámbitos). Los datos crudos están en los JSON de `pruebas/`.

## Entrega
- `sitio/` corregido (`css/base.css`, `css/slides.css`, `css/compose.css`, `js/scene.js`, `index.html`, `sw.js`, `README.md`). `versiones/` intacta.
- `capturas/`: 11 secciones a 1920×1080 y a 390×844, secuencias `1920x1080-secuencia-concepto-1…4.png` y `1920x1080-secuencia-historia-1…4.png`, y además un reposo por hito de Historia `1920x1080-historia-paso-1…6.png`.

## Lo no comprobado de la v3
- **Las transiciones no están a cero** (ver arriba): el contenido que entra desde abajo aún cruza brevemente la zona de controles.
- En la captura del paso 1 de Historia, la etiqueta inferior «70–80» de la línea de tiempo queda a ras del botón «Siguiente» (la prueba lo da por limpio con su tolerancia de 3 px, pero a simple vista casi se tocan). Candidato a un margen de ~0,4 rem; no se tocó para no repetir la medición completa.
- **Un proyector real, Safari/Firefox y un móvil físico**: solo Brave/Chromium con emulación de 390×844. La «ventana» de Historia usa unidades `vw`/`rem` y `mask-image`; no se probó en otros motores.
- **Relaciones de aspecto distintas de 16:9 y 390×844** (4:3, 1366×768, ultraanchas): la prueba de solapamientos solo corrió en los tres tamaños indicados. Los de la v2 (1024×768, 1366×768, 1600×900) no se repitieron con el arnés nuevo.
- **El umbral del árbol (12 %) es un criterio propio**: un 5–10 % de hojas sueltas detrás de un texto no se cuenta. Las capturas de Concepto y Cierre se revisaron a ojo; el resto de secciones se juzgó por la prueba, no una a una.
- **Texto sobre el árbol en transición** (p. ej. «relajarse» en Diferencias al entrar) sigue contándose en la columna «transición».
- Rendimiento (FPS): no se repitió tras los cambios de la v3; los valores de la sección anterior son de la v2.

## Cierre de la v3: verificación de Claude Code, tras cancelar la tarea de IRIS
- **Por qué se canceló:** la tarea de IRIS (intento 2, `t-20261117-185819-186594`) se canceló a petición del usuario a
  los ~22 min, cuando ya había hecho las correcciones y esta sección.
- **Medición independiente** del `sitio/` final con el mismo arnés (`pruebas/final/`):

  | Tamaño | Reposo | Fijada | Transición |
  | --- | --- | --- | --- |
  | 1920×1080 | 1 | 0 | 43 |
  | 1280×720 | 0 | 0 | 42 |

  El único punto en reposo es Técnicas → Mindfulness, paso 6: un «pensamiento» que sale flotando por el borde de su
  caja. Es intencional (la animación `drift`), así que es un falso positivo.
- **Ajuste final:** `.tl-nav` pasa a `margin-top:.9rem`, para separar «70–80» del botón «Siguiente». Historia se volvió a
  medir en los dos tamaños: 0 / 0.
- **Caché:** `sw.js` pasa a `relajacion-v3b`, para que el navegador no sirva CSS antiguo.
- **Capturas:** las de `capturas/` se rehicieron con `pruebas/capturas.js` sobre esta versión. Las hojas resumen están
  en `capturas/hojas/`.
