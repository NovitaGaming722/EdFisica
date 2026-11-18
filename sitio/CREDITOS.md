# Créditos

## Contenido
- Trabajo escrito «La relajación» (Educación Física). **Grupo: Daniel Urrego y Juan Rengifo.**
  Todo el texto académico de la página sale de ese documento, resumido para poder exponerlo.
- Dos erratas del PDF se corrigieron al pasarlas a la página: «Bucle Cuyo-Mente» → «bucle cuerpo–mente» y «bostear» → «bostezar».
  En el apartado de respiración, la viñeta del estado de tensión repite por error el texto de cardiovascular; se usó la descripción que sí corresponde (respiración corta, rápida y torácica).

## Código y librerías
| Recurso | Uso | Licencia | Origen |
|---|---|---|---|
| [three.js r158](https://threejs.org/) (`vendor/three.min.js`) | Árbol 3D generativo | MIT | https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js. Copia local; solo se cambió la primera línea (un `console.warn` de obsolescencia) por un `!` para que la consola quede limpia. |

Todo lo demás (`js/`, `css/`) está escrito para este encargo, sin dependencias ni paso de compilación.
No se incluyó GSAP/ScrollTrigger ni Lenis: el scroll dinámico (`js/motion.js`, ~400 líneas) es propio, así que no hay
licencias adicionales que anotar ni archivos en `vendor/` aparte de three.js.

## Movimiento y scroll: qué se reutilizó y de dónde
Proyectos propios del autor, solo **leídos**; lo de abajo está reescrito o traducido en esta carpeta, no enlazado.
| Pieza aquí | Procede de | Qué se tomó |
|---|---|---|
| `js/motion.js` · coordenada `s` y secciones fijadas | FrameBudget web, `public/script.js` (`initOrbit`, `initWorks`, `initCase`) | El patrón «sección alta + `position: sticky` + progreso = `clamp(−rect.top / (alto − ventana))`» y que solo se escriban `transform`/`opacity`. En lugar de `--p` por CSS, el progreso se aplica por JS a cada elemento. |
| `js/motion.js` · `perFrame`, pausa fuera de pantalla | FrameBudget web, `public/script.js` (`perFrame`, `.is-live`) | Una sola escritura por fotograma; `will-change` y trabajo solo en las secciones cercanas (`.live`). |
| `js/motion.js` · detección de movimiento reducido | FrameBudget cliente, `client/src/hooks/useReducedMotion.js` y `public/script.js` (`animated`) | Leer `prefers-reduced-motion` y reaccionar si cambia; con movimiento reducido todo queda visible y estático. |
| `js/motion.js` · `EASE` | FrameBudget web, `public/styles.css` (`--ease-out`, `--sx-ease-mask`, `--sx-ease-x`, `--reel-ease`) | Las cuatro curvas cubic-bezier: (.2,.7,.2,1), (.65,0,.25,1), (.55,0,.15,1), (.16,1,.3,1). |
| Preajuste `rise`, entradas escalonadas | FrameBudget Mac, `Estilo/Animaciones.swift` (`Ritmo.entrada`, `EntradaSuave`, `Escalonado`) | Entrada corta y sin rebote (resorte 0,55 s, bounce 0,12 → curva (.2,.7,.2,1)), un leve ascenso con escala, y escalonado creciente entre hermanas (50 ms por hijo en FrameBudget; aquí `step` en unidades de scroll y 80 ms en modo plano). El desenfoque de `EntradaSuave` se **omitió**: el encargo limita la animación a `transform` y `opacity`. |
| `.bg-glow` (luces de fondo) | FrameBudget Mac, `FondoAurora` | La idea de una base profunda con luces radiales difusas, aquí con parallax global. |
| Máscaras de línea (`.ln`) y palabras (`.split .w`) | Ya existían en la v1; la versión por palabras de FrameBudget (`data-text-in`, `.tw`) inspira que las palabras suban/se enciendan una a una | |

Revisados sin reutilizar nada: `VEXEL/`, `NEXFORM/`, `Portafolio/` y `cleanyourtv/` (búsqueda de GSAP, ScrollTrigger, Lenis,
`animation-timeline` y `position: sticky`: sin coincidencias). No se consultó `IRIS/Sources/IRIS/Inicio/`.

## Tipografías (copiadas a `assets/fonts/`)
| Fuente | Licencia | Origen |
|---|---|---|
| Fraunces (normal y cursiva, subconjunto latino) | SIL Open Font License 1.1 | Google Fonts / Undercase Type |
| Inter (subconjunto latino) | SIL Open Font License 1.1 | Google Fonts / Rasmus Andersson |

## Imágenes
No hay imágenes de terceros. El árbol, las ondas, las ilustraciones de fisiología, los iconos y el favicon
(`assets/favicon.svg`) están generados con código (WebGL, Canvas 2D y SVG).
El ruido de fondo es un SVG `feTurbulence` incrustado en el CSS.

## Referencia de diseño
La dirección (narrativa con scroll, tipografía editorial, escena 3D protagonista) se inspira en https://oryzo.ai/.
En la v2 (scroll dinámico) se tomaron de ella solo ideas de ritmo y composición: secciones fijadas que se transforman,
disposición alterna, momentos de respiro entre secciones densas y objeto 3D que cambia de encuadre. La lectura de esa
página fue solo de su texto (sin ver su código ni su scroll real). No se copió código, texto ni recursos.

## Audio
El único sonido (Musicoterapia, en «Técnicas») se genera en el navegador con Web Audio (dos osciladores sinusoidales). No hay archivos de audio.
