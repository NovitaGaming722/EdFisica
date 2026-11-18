# Encargo 3: corrección de defectos visuales del rediseño (v2)

La v2 de `sitio/` (encargo 2) funciona, pero la revisión independiente encontró superposiciones **a mitad de scroll** en
**Historia**. Se ven en `versiones/v2-capturas/1920x1080-secuencia-historia-1…4.png`:
1. **Paso 1:** el texto «Sigue bajando: la línea de tiempo avanza» y la tarjeta de Yoga/Qigong pisan los botones
   inferiores (‹ › ≡ ⛶ ?) y el contador `04/11`. La tarjeta además queda cortada por el borde derecho.
2. **Paso 3:** el árbol 3D tapa la tarjeta de Johannes Heinrich Schultz (texto ilegible tras las hojas).
3. **Paso 6:** el año «1970» se corta por la izquierda («70») y se superpone a la tarjeta de Herbert Benson. La tarjeta
   del paso siguiente asoma cortada por la derecha en el paso 2.

## Qué hacer
- Corrige esos tres defectos sin perder el efecto horizontal ni el parallax de los años.
- **Regla general:**
  - ningún texto ni tarjeta puede superponerse a la barra de controles inferior, al contador, a la cabecera ni al
    árbol 3D cuando el árbol queda detrás de texto;
  - un número o tarjeta cortado por el borde solo es aceptable si está claramente entrando o saliendo, nunca en
    reposo en un paso.
- **Revisa todas las secciones** con una prueba automática de solapamientos: rectángulos de textos y tarjetas frente a
  controles, cabecera y bordes. Hazlo en varios puntos del scroll de cada sección, no solo en reposo, a 1280×720,
  1920×1080 y 390×844. Corrige lo que encuentre.
- No cambies el contenido ni quites interactividad. No toques `versiones/`.

## Reglas de esta tarea
- **Servidor local:** usa el puerto **8790**. El 8765 lo usa el usuario.
- **Procesos:** detén solo los procesos que tú mismo lanzaste, con el PID que guardaste. Nunca uses `pkill`/`killall`
  por patrón.
- Escribe solo dentro de `EdFisica-Relajacion/`. No publiques, ni hagas push ni commits.

## Entrega
- `sitio/` corregido.
- Capturas nuevas en `capturas/`, incluidas las secuencias de Historia (1…4) y de Concepto.
- Al final de `CAMBIOS-UX.md`, una sección «v3 — correcciones» con:
  - cada defecto y cómo se resolvió;
  - el resultado de la prueba de solapamientos (antes y después);
  - lo no comprobado.
- Resumen final breve.

---
## Relanzamiento (intento 2): termina el encargo 3
El primer intento agotó sus 60 min. Dejó:
- correcciones de CSS/JS sin verificar en `sitio/`: la Historia con una «ventana» de línea de tiempo, tarjetas más opacas
  y Fisiología, entre otras;
- un arnés de solapamientos que funciona en `pruebas/` (`solapes.js`, `lib-analisis.js`, `resumen.js`, `analiza.js`,
  `capturas.js`);
- la medición «antes» de la v2 en `pruebas/antes/`. Encontró defectos en casi todas las secciones, no solo en Historia
  (unos 200 puntos a 1920×1080).

**Qué hacer ahora, en este orden:**
1. **No rehagas el arnés ni la medición «antes»:** reutilízalos tal cual.
2. **Mide el estado actual** de `sitio/` («después») en los tres tamaños.
3. **Corrige** lo que quede, por orden de impacto en la exposición:
   - primero los defectos **en reposo** y **fijada**;
   - después los de transición, si aún hay tiempo.
   - Repite la medición tras cada tanda.
4. **Al final**, haz las capturas (incluidas las secuencias de Historia y Concepto) y la sección «v3 — correcciones» en
   `CAMBIOS-UX.md`, con la tabla antes/después por sección y tamaño.
5. **Si el tiempo aprieta**, prioriza dejar el sitio en un estado coherente y documentado frente a corregir el último
   detalle. Reserva los últimos 15 min para capturas y documentación.

**Puertos:** usa **8811** (y 8812 si necesitas un segundo servidor). No uses 8765 (el del usuario) ni 8790 (el servidor
de IRIS).

**Procesos:** lanza tus servidores de forma que puedas detenerlos, guardando su PID, y **detenlos tú antes de terminar**.
Nunca uses `pkill`/`killall`.
