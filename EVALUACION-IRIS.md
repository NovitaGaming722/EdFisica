# Evaluación de IRIS — encargo «La relajación» (2026-11-17)

## Datos de la tarea
- Tarea `t-20261117-160331-ae1d25`, del motor de tareas persistente.
- Paso 1: agente Claude, con escritura limitada a esta carpeta. Modelo real: **claude-sonnet-5-5**, esfuerzo `high`.
- Duración: 16:03:31 → 16:33:50, unos **30 min**. El plazo era de 90 min.
- Consumo medido por el proveedor:

  | Concepto | Tokens |
  | --- | --- |
  | Entrada | 9.802.098, de los que 9.497.884 vienen de caché (97 %) y 304.214 no |
  | Escritura de caché | 304.125 |
  | Salida | 178.105 |

  Sin importe: es una suscripción.
- Estado final: **fallida**, por un error del encargo y no de IRIS. El paso 2 de verificación usaba `/usr/bin/test`, que en
  macOS no existe (está en `/bin/test`). El sitio sí existe y no está vacío.

## Verificación independiente
Hecha por la sesión de Claude Code, no por IRIS:
- Servido en local: todas las peticiones dan 200 (HTML, 2 CSS, 6 JS, three.js local y 3 fuentes locales).
- Contenido frente al PDF: los 19 términos clave comprobados aparecen. Entre ellos Jacobson, Schultz, Benson,
  Kabat-Zinn, Savasana, ataraxia, Qigong, GABA, linfocitos, oxitocina, peristaltismo, las 9 técnicas y los ámbitos.
- Hay 11 secciones y la navegación con flechas actualiza el hash y el contador.
- El deslizador de fisiología cambia de verdad el contenido: tensión/simpático ⇄ relajación/parasimpático.
- Consola: un solo error, el registro del *service worker* en el panel embebido. `sw.js` responde 200, y parece una
  limitación de ese navegador, no del sitio. Hay que confirmarlo en Brave o Chrome normal.
- El árbol 3D no se pudo ver en el panel del navegador porque estaba oculto y el navegador frena las animaciones. Las
  capturas del agente (`capturas/`) sí lo muestran.

## Lo que queda por comprobar a mano
Pantalla completa (F), proyector real, Safari y Firefox, el sonido de musicoterapia, el modo sin conexión y las preguntas
del quiz, que conviene que revise el grupo.

## Hallazgos sobre IRIS
1. **Bien:**
   - el trabajo largo quedó dentro de la carpeta;
   - no publicó nada;
   - el informe final fue honesto: dijo qué no pudo comprobar y cuáles son las erratas del PDF;
   - hizo su propia verificación visual y de accesibilidad.
2. **El contador de archivos** de la vista Tareas marca 0: solo cuenta las herramientas de IRIS, no lo que escribe el agente.
3. **El contexto creció dentro del turno del agente** hasta unos 304 k tokens por petición. El control de contexto de la
   etapa 5 solo limita lo que IRIS envía al empezar, no lo que el agente acumula después.
4. **El motor no valida que exista el programa de un paso `comando`** al crear la tarea, y por eso falló al final en lugar
   de rechazarlo al principio.

## Correcciones (mismo día)
- **Hallazgo 4, corregido:** `tareas.crear` rechaza un paso `comando` si su programa no existe (ruta absoluta) o no está
  en el PATH (nombre suelto).
- **Hallazgo 2, corregido:**
  - Un paso `agente` con escritura fotografía la carpeta antes y después, y guarda en su evidencia `cambios`
    (creados, modificados, borrados y la lista).
  - La vista de Tareas enseña primero la respuesta y luego los archivos del agente, más «y N archivos más»
    (`archivos_total`).
- **Hallazgo 3, sin corregir:** sigue pendiente; necesita su propio diseño.
- **Pruebas:**
  - `test_tareas.py`: 22/22, con 2 pruebas nuevas y 2 casos de validación nuevos.
  - El resto de suites de Python: OK.
  - `verificar.sh`: ok.
  - App reinstalada.

# Encargo 2 — rediseño UX con scroll dinámico
- **Tarea:** `t-20261117-171647-16e994`, terminada como **completada** en 33 min. Ahora el paso de verificación sí pasa.
- **Consumo:**

  | Concepto | Tokens |
  | --- | --- |
  | Entrada | 20,0 M, de los que 19,67 M vienen de caché (98 %) |
  | Salida | 166 k |
  | Petición más grande | unos 348 k |

  El crecimiento de contexto (hallazgo 3) se repite y va a más.
- **Contador de archivos:** `archivos_total` = 45, así que la corrección del contador funciona en una tarea real.
- **Verificación independiente:**
  - no cambió nada fuera de `EdFisica-Relajacion/` (FrameBudget, VEXEL y demás intactos);
  - `versiones/` está intacta;
  - lo reutilizado de FrameBudget (web, cliente y app de Mac) está documentado archivo por archivo en `sitio/CREDITOS.md`;
  - las secuencias de capturas muestran que la composición sí cambia con el scroll: textos que se encienden, tarjetas
    escalonadas, historia horizontal y el árbol cambiando de encuadre.
- **Defectos visuales a revisar**, vistos en las capturas a mitad de scroll de Historia:
  - el texto «Sigue bajando» y una tarjeta pisan los botones inferiores;
  - el árbol tapa parte de la tarjeta de Schultz;
  - el año «1970» queda cortado a la izquierda y se superpone a la tarjeta de Benson.
- **Nuevo hallazgo sobre IRIS:** el agente ejecutó `pkill -f "http.server 8765"` y **mató un servidor que no era suyo**:
  el que la sesión de Claude Code tenía abierto para el usuario en el mismo puerto. No hubo daño, porque se volvió a
  arrancar, pero un trabajador de IRIS no debería terminar procesos que no lanzó. Conviene asignarle un puerto libre y
  decirle explícitamente en las reglas de tareas que solo puede detener los procesos que él mismo inició.

# Encargo 3 — corrección de solapamientos
- **Intento 1** (`t-20261117-175438-017e3e`):
  - agotó los 60 min y quedó en «esperando intervención», que es lo correcto;
  - gastó casi todo el tiempo en construir y depurar un arnés de solapamientos;
  - dejó un servidor huérfano en el 8792 (PPID 1), que el corte del motor no alcanzó;
  - el puerto 8790 que le asigné era el del servidor de IRIS: error del encargo.
- **Intento 2** (`t-20261117-185819-186594`):
  - reutilizó el arnés y corrigió todas las secciones;
  - escribió la tabla antes/después;
  - el usuario lo canceló a los ~22 min por lentitud. La cancelación funcionó, pero **otra vez quedó un servidor
    huérfano** en el 8811.
- **Verificación independiente:**
  - reposo + fijada: de ~99 a 1 (falso positivo) a 1920×1080, y de ~96 a 0 a 1280×720;
  - no tocó nada fuera de la carpeta, `versiones/` está intacta y esta vez no usó `pkill`.
- **Hallazgo nuevo (5):** al cancelar o agotar el tiempo, el motor no detiene los procesos que el agente lanza en
  segundo plano y que se separan de su grupo (`nohup`, `&` con PPID 1). Hace falta registrarlos o lanzar al agente en
  un grupo o sesión propios y matar su árbol completo.
- **Tiempos del encargo 3:** ~82 min de IRIS en total, frente a unos 15 min de verificación y cierre manual.

## Corrección del hallazgo 5 (procesos huérfanos)
- **Qué hace el motor ahora** (`tareas.py`):
  - Mientras corre un paso `agente` o `comando`, registra cada 0,3 s el árbol de procesos del paso: PID, grupo e inicio.
  - Al terminar el paso, por éxito, fallo, tiempo agotado o cancelación, detiene con SIGTERM y luego SIGKILL lo que
    siga vivo de su **sesión**, de los **grupos** vistos y los **procesos vistos** (mismo PID e inicio, para no
    confundir PIDs reutilizados).
  - Deja un evento `procesos_rezagados` con el número de procesos detenidos.
  - Lo mismo tras cada herramienta `ejecutar` y en la recuperación de un trabajador muerto.
- **No sirve marcar los procesos con una variable de entorno:** macOS ya no deja leer el entorno de otros procesos
  (comprobado con `sysctl KERN_PROCARGS2`).
- **Pruebas:**
  - `test_tareas.py` pasa 26/26. Las 4 nuevas cubren:
    - un hijo que cambia de grupo;
    - un hijo que crea su propia sesión y queda colgando de launchd;
    - un paso `comando` real;
    - que no se toquen procesos ajenos.
  - El resto de suites: OK.
- **Límite conocido:** un proceso que crea su propia sesión **y** cuyo padre muere antes de la primera foto (menos de
  0,3 s) no se reconoce. No se pudo probar con un agente Claude real: el clasificador de permisos bloqueó lanzar uno con
  permisos totales para la prueba.
