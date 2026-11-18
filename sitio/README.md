# La relajación · exposición interactiva (v2, scroll dinámico)

Página de exposición de Educación Física del grupo de **Daniel Urrego y Juan Rengifo**.
Sitio estático (HTML + CSS + JS), sin compilación ni dependencias externas: funciona sin conexión.

La composición **cambia al hacer scroll**: las secciones se fijan y se transforman, la disposición alterna
(izquierda, derecha, centrada, a sangre, cuadrícula), hay capas con parallax, los títulos entran con máscara,
el árbol 3D cambia de sitio, escala y encuadre de cámara, y la historia se recorre en **horizontal**.

## Cómo abrirlo
- **Recomendado (servidor local):**
  ```bash
  cd sitio
  python3 -m http.server 8000
  # abre http://localhost:8000
  ```
  Con servidor además se activa la caché sin conexión (`sw.js`, versión `relajacion-v3`): tras la primera carga se puede recargar sin internet.
- También se puede abrir `index.html` con doble clic (`file://`); todo funciona salvo la caché del service worker.
- Enlace directo a una sección: `index.html#fisiologia` (ids: `portada`, `concepto`, `diferencias`, `historia`, `fisiologia`, `cuerpomente`, `tecnicas`, `respiracion`, `ambitos`, `cierre`).
- Necesita un navegador con WebGL. Si no lo hay, la página sigue funcionando sin el árbol 3D.

## Controles del modo exposición
| Tecla / acción | Qué hace |
|---|---|
| `→` · `Espacio` · `Re Pág` | Siguiente. Primero completa la transformación de la sección, luego avanza por sus pasos y después pasa a la siguiente |
| `←` · `Mayús+Espacio` · `Av Pág` | Anterior |
| `Inicio` · `Fin` | Primera / última sección |
| Rueda del ratón · trackpad · `↑` `↓` | Recorre el scroll a mano: se ve cómo cambia la composición. Interrumpe cualquier desplazamiento automático |
| `F` | Pantalla completa (los controles se ocultan tras 3,5 s sin mover el ratón) |
| `M` | Índice de secciones |
| `?` o `H` | Ayuda con los atajos |
| `T` | Fisiología: alternar tensión ⇄ relajación |
| `B` | Respiración: ir al ejercicio / comenzar o detener |
| `Tab` | Recorre los controles; si el foco entra en otra sección, la página se desplaza hasta ella |
| `Esc` | Cerrar paneles |
| Clic | Botones, puntos laterales (secciones), barra superior (progreso) |

Pasos dentro de una sección (se avanzan con `→`/`Espacio`): Descanso/Sueño/Relajación (voltea una tarjeta por paso),
Historia (6 hitos: la pista avanza en horizontal), Fisiología (7 sistemas), Técnicas (9) y Ámbitos (4).
El indicador inferior («paso 3/7») y la barra de progreso superior (continua con el scroll) los reflejan.

**Móvil** (≤ 900 px) y **prefers-reduced-motion**: sin secciones fijadas ni parallax; todo el contenido visible y en
su estado final, con un fundido suave al entrar (solo en móvil). La línea de tiempo pasa a ser un carril horizontal
que se desliza con el dedo, el teclado o los botones.

## Mapa de secciones: composición, scroll y parte del PDF
| # | Sección | Composición | Qué pasa al hacer scroll | Parte del PDF |
|---|---|---|---|---|
| 00 | Portada | Izquierda · árbol a la derecha | El título se aleja y se desvanece; el árbol se centra y crece hacia la cámara | Encabezado («Grupo: Daniel Urrego, Juan Rengifo» y título) |
| 01 | Concepto | Izquierda · árbol sangrado a la derecha | Las palabras del enunciado se encienden una a una; luego entran los tres sistemas (escalonados) y la nota «proceso activo» | «Concepto» |
| — | *Respiro* | Banda a todo ancho | Dos líneas de texto se deslizan en sentidos opuestos | (decorativa, con términos del PDF) |
| 02 | Descanso, sueño y relajación | Centrada · tres tarjetas escalonadas | Las tarjetas convergen desde distintas profundidades y giros | «Diferencia entre descanso, sueño y relajación» |
| 03 | Historia | **A sangre · scroll horizontal** | El scroll vertical desplaza la línea de tiempo; el año se mueve más rápido que su tarjeta (parallax); el árbol crece de brote a árbol | «Historia y evolución de la relajación» |
| 04 | Fisiología | A sangre por la izquierda · texto a la derecha | La ilustración entra desde el borde izquierdo y el texto por la derecha; el árbol, en picado, se tiñe con la tensión | «Fisiología» (7 sistemas) |
| 05 | Cuerpo y mente | Centrada · tres columnas | El cuerpo entra por la izquierda, la mente por la derecha y el bucle crece en el centro | «Relajación física vs. mental» y «El bucle cuerpo–mente» |
| — | *Respiro* | Banda a todo ancho | Texto deslizante | (decorativa) |
| 06 | Técnicas | Detalle grande a la izquierda · menú a la derecha | El detalle entra desde la izquierda y las familias de técnicas desde la derecha | «Formas, técnicas y herramientas» |
| 07 | Respiración guiada | Centrada · el orbe flanqueado | El orbe crece desde pequeño; los controles entran por los lados; el árbol respira detrás | Respiración consciente (cuadrada y 4-7-8) |
| 08 | Ámbitos | Cuadrícula · fila de 4 + panel ancho | Los ámbitos caen desde arriba y el panel sube | «La relajación en diferentes ámbitos» |
| — | *Respiro* | Banda a todo ancho | Texto deslizante | (decorativa) |
| 10 | Cierre | Izquierda + cuadrícula escalonada | El árbol se aleja y se centra; la síntesis entra escalonada | Síntesis (el PDF **no trae** conclusiones ni bibliografía) |

## Cómo funciona el scroll (para modificarlo)
Cada sección con `class="pin"` y `data-pin="N"` mide `(1 + N) × 100svh`. Su `.stage` queda fija (`position: sticky`)
durante `N` pantallas. `js/motion.js` convierte el scroll en una coordenada `s` por sección
(`s = (scrollY − top) / alto de ventana`: −1 asoma por abajo · 0 se fija · N termina el pin · N+1 sale) y escribe
solo `transform` y `opacity`. Se declara en el HTML:

```html
<div data-fx="rise @-.8,-.3">                 <!-- preajuste + tramo [desde, hasta] en unidades s -->
<div data-fx="x:-20vw>0 o:0>1 @0,1">          <!-- propiedades x y s r o  (px, vw, vh, rem, %) -->
<div data-fx="rise @-.8,-.3 | shrink @e,e+.9"> <!-- entrada | salida (e = fin del pin) -->
<ul data-stagger="rise @-.8,-.3 step.1">       <!-- escalonado entre hijos -->
<h2 data-lines="@-.85,-.35 step.12">           <!-- máscara por línea (.ln > span) -->
<p class="split" data-words="@-.5,1">          <!-- palabras que se encienden -->
<span data-par="x:.1 y:-.3">                   <!-- parallax: factor · s · alto de ventana -->
<div data-h="@.1,e-.25">                       <!-- pista horizontal -->
```
Preajustes: `rise fall left right zoom pop fade mask up shrink away sink` (en `PRESETS`, `js/motion.js`).
`data-stop` fija el punto del scroll donde se detienen las flechas (por defecto, el fin de la coreografía).
La pose del árbol por sección está en `PRESETS` de `js/scene.js` (`from` al entrar y `to` al terminar el pin).

## Accesibilidad y calidad
- **`prefers-reduced-motion`:** sin pins, parallax, escalonados ni bandas en movimiento; todo visible. El árbol se dibuja solo cuando cambia algo. Si se cambia la preferencia con la página abierta, se recarga.
- **Contraste y ARIA:** revisado con axe-core 4 (WCAG 2 A/AA + buenas prácticas) en las secciones, en escritorio con pins, en móvil y con movimiento reducido: 0 infracciones.
- **Teclado completo:** flechas, espacio, F, M, T, B, 1–4, N, Tab (con salto automático a la sección del foco). Foco visible.
- **Rendimiento:** solo `transform`/`opacity`; las lecturas de layout se hacen al medir (carga, resize), nunca en el bucle de scroll; `will-change` solo en la sección visible; la escena 3D se pausa con la pestaña oculta.
- **Pantallas:** el contenido de cada paso de cada sección cabe sin recortes en 1280×720, 1366×768, 1024×768, 1600×900 y 1920×1080 (revisado automáticamente paso a paso). El tamaño de letra escala con la pantalla (≈16 px en 1280×720, ≈24 px en 1920×1080).

## Estructura
```
sitio/
├─ index.html
├─ css/        base.css (marco, tipografía, controles) · slides.css (componentes de cada sección)
│              compose.css (composición, pins, bandas, modo plano/móvil)
├─ js/         motion.js (director del scroll) · scene.js (árbol 3D y sus poses) · physio.js (fisiología)
│              widgets.js (tarjetas, línea de tiempo horizontal, bucle, ámbitos) · practice.js (técnicas y respiración)
│              hoja.js · app.js (modo exposición: navegación, atajos, progreso)
├─ vendor/     three.min.js (r158, MIT)
├─ assets/     favicon.svg · fonts/ (Fraunces, Inter)
├─ sw.js       caché sin conexión
├─ CREDITOS.md
└─ README.md
```

## Publicar en GitHub Pages
1. Sube el contenido de `sitio/` a un repositorio (en la raíz, o en una carpeta `docs/`).
2. En *Settings → Pages*, elige la rama y la carpeta (`/` o `/docs`).
3. Espera unos minutos y abre `https://<usuario>.github.io/<repositorio>/`.

Las rutas son relativas, así que funciona en subcarpetas. Si ya se publicó una versión anterior, el navegador puede
tardar en pedir la nueva: `sw.js` usa la caché `relajacion-v3` y borra las anteriores al activarse.


## v4 — menos texto, sin quiz y hoja guía
- **Quiz retirado.** La sección «Pregunta al público» y `js/quiz.js` ya no están; quedan 10 secciones.
- **Palabras clave.** Los textos en pantalla se redujeron a titulares y palabras clave, al estilo de oryzo.ai. El detalle
  lo cuenta quien expone; la fuente sigue siendo el trabajo escrito.
- **Hoja guía** (`js/hoja.js`, estilos al final de `css/compose.css`): una hoja en SVG con giro 3D se desprende del árbol
  en la portada y acompaña todo el recorrido.
  - En cada sección se posa en una zona libre.
  - Entre secciones vuela en arco y gira con el scroll.
  - En reposo flota con un leve aleteo.
  - Con movimiento reducido queda quieta.
