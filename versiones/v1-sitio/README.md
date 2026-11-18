# La relajación · exposición interactiva

Página de exposición de Educación Física del grupo de **Daniel Urrego y Juan Rengifo**.
Sitio estático (HTML + CSS + JS), sin compilación ni dependencias externas: funciona sin conexión.

## Cómo abrirlo
- **Recomendado (servidor local):**
  ```bash
  cd sitio
  python3 -m http.server 8000
  # abre http://localhost:8000
  ```
  Con servidor además se activa la caché sin conexión (`sw.js`): tras la primera carga se puede recargar sin internet.
- También se puede abrir `index.html` con doble clic (`file://`); todo funciona salvo la caché del service worker.
- Enlace directo a una sección: `index.html#fisiologia` (ids: `portada`, `concepto`, `diferencias`, `historia`, `fisiologia`, `cuerpomente`, `tecnicas`, `respiracion`, `ambitos`, `quiz`, `cierre`).
- Necesita un navegador con WebGL. Si no lo hay, la página sigue funcionando sin el árbol 3D.

## Controles del modo exposición
| Tecla / acción | Qué hace |
|---|---|
| `→` · `Espacio` · `Re Pág` | Siguiente. Dentro de una sección con pasos avanza paso a paso (ver abajo) |
| `←` · `Mayús+Espacio` · `Av Pág` | Anterior |
| `Inicio` · `Fin` | Primera / última sección |
| `F` | Pantalla completa (en pantalla completa los controles se ocultan tras 3,5 s sin mover el ratón) |
| `M` | Índice de secciones |
| `?` o `H` | Ayuda con los atajos |
| `T` | Fisiología: alternar tensión ⇄ relajación |
| `B` | Respiración: ir al ejercicio / comenzar o detener |
| `1`–`4` · `N` | Quiz: elegir respuesta · siguiente pregunta |
| `Esc` | Cerrar paneles |
| Clic | Botones, puntos laterales (secciones), barra superior (progreso) |

Pasos dentro de una sección (se avanza con `→`/`Espacio`): Descanso/Sueño/Relajación (voltea una tarjeta por paso), Historia (6 hitos), Fisiología (7 sistemas), Técnicas (9 técnicas), Ámbitos (4 ámbitos) y Quiz (mostrar respuesta → siguiente pregunta).
El indicador inferior («paso 3/7») y la barra de progreso superior cuentan también estos pasos.

En móvil se recorre con el dedo (scroll vertical normal).

Tamaño de letra: la página escala con la pantalla (≈16 px de base en 1280×720 y ≈24 px en 1920×1080); el contenido de cada sección cabe sin scroll en 1280×720, 1366×768, 1024×768 y 1920×1080.

## Correspondencia con el trabajo escrito (PDF)
| Sección de la página | Parte del PDF |
|---|---|
| Portada | Encabezado («Grupo: Daniel Urrego, Juan Rengifo» y título) |
| 01 Concepto | «Concepto» |
| 02 Descanso, sueño y relajación | «Diferencia entre descanso, sueño y relajación» |
| 03 Historia | «Historia y evolución de la relajación» (Antigüedad y tradiciones orientales · Grecia y Roma · Siglo XX: Jacobson 1929, Schultz 1932, Benson 1970, Kabat-Zinn años 70-80) |
| 04 Fisiología | «Fisiología»: cerebro, cardiovascular, respiratorio, músculos, digestivo, bioquímica e inmune, con su «¿Qué le pasa a tu cuerpo?» |
| 05 Cuerpo y mente | «Relajación física vs. relajación mental» y «El bucle cuerpo–mente» |
| 06 Técnicas | «Formas, técnicas y herramientas»: corporales y físicas, mentales y cognitivas, pasivas y sensoriales |
| 07 Respiración guiada | Respiración consciente: diafragmática, 4-7-8 y cuadrada (ejercicio interactivo) |
| 08 Ámbitos | «La relajación en diferentes ámbitos»: deportivo, laboral y escolar, clínico y psicológico, social y cotidiano |
| 09 Pregunta al público | Quiz de 7 preguntas, todas respondibles con el PDF |
| 10 Cierre | Síntesis de lo anterior (el PDF **no trae** conclusiones ni bibliografía) |

## Interactividad
- **Respiración guiada** (07): cuadrada 4-4-4-4 o 4-7-8; el orbe, el anillo de fases y el árbol 3D respiran sincronizados.
- **Tensión ⇄ relajación** (04): un control continuo cambia a la vez la ilustración de cada sistema, el texto y el árbol (color, temblor, hojas).
- **Línea de tiempo** (03): nodos, botones y flechas.
- **Técnicas** (06): se pueden probar la relajación muscular progresiva (tensar 6 s / soltar 12 s por zona), el entrenamiento autógeno, la visualización guiada, el mindfulness (pensamientos que se dejan pasar) y la musicoterapia (tono grave generado por el navegador).
- **Bucle cuerpo–mente** (05) y **curva de activación** del ámbito deportivo (esquema ilustrativo, sin cifras).
- **Quiz** (09) con puntuación.

## Accesibilidad y calidad
- `prefers-reduced-motion`: sin transiciones ni animaciones continuas; el árbol se dibuja solo cuando cambia algo y la respiración marca las fases con texto y cambios de tamaño sin interpolar.
- Contraste revisado con axe-core (color-contrast, ARIA, etiquetas) en las 11 secciones a 1280×720, sin infracciones.
- Navegable con teclado; los botones tienen foco visible. Tras un clic con ratón el botón suelta el foco para que `Espacio` siga avanzando.

## Estructura
```
sitio/
├─ index.html
├─ css/        base.css (marco, tipografía, controles) · slides.css (secciones)
├─ js/         scene.js (árbol 3D) · physio.js (fisiología) · widgets.js (tarjetas, línea de tiempo,
│              bucle, ámbitos) · practice.js (técnicas y respiración) · quiz.js · app.js (exposición)
├─ vendor/     three.min.js (r158, MIT)
├─ assets/     favicon.svg · fonts/ (Fraunces, Inter)
├─ sw.js       caché sin conexión
├─ CREDITOS.md
└─ README.md
```

## Publicar en GitHub Pages
1. Crea un repositorio (o usa el existente) y sube **el contenido de `sitio/`** a la raíz de la rama `main` (o a una carpeta `docs/`).
2. En GitHub: *Settings → Pages → Build and deployment → Source: Deploy from a branch*, elige la rama (`main`) y la carpeta (`/ (root)` o `/docs`).
3. Espera un minuto: el sitio quedará en `https://<usuario>.github.io/<repositorio>/`.
- Todas las rutas son relativas, así que funciona en la subcarpeta del repositorio. No hace falta compilar ni activar Jekyll.
- Si cambias archivos y ya habías visitado la página, recarga con `Ctrl/Cmd+Shift+R` (el service worker usa «red primero», así que normalmente se actualiza solo).
