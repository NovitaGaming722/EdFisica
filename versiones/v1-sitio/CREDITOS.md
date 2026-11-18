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
No se copió código, texto ni recursos de esa página.

## Audio
El único sonido (Musicoterapia, en «Técnicas») se genera en el navegador con Web Audio (dos osciladores sinusoidales). No hay archivos de audio.
