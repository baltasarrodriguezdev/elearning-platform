# ELearningPlatform · Tres mundos para aprender

Interfaz de curso con tres unidades panorámicas configurables. Cada unidad usa un único mapa principal, con su propio terreno, objetos, actividades y objetivo final.

## Ejecutar

Con Node.js, ejecutar `npm run dev` y abrir http://localhost:5173. No hay dependencias que instalar.

## Elegir la cantidad y entrar

Al abrir una unidad sin cantidad, primero se muestra su configuración. El campo es obligatorio y acepta enteros de 1 a 120; los accesos rápidos solo rellenan el campo. «Crear recorrido» abre el mundo. «Cambiar cantidad» vuelve a esta pantalla.

| Unidad | Configuración | Identidad | Contenido |
|---|---|---|---|
| 01 | /?unit=1 | Desierto: bloques, monedas, tubería y castillo | Fundamentos de programación |
| 02 | /?unit=2 | Selva: barriles, bananas, provisiones y templo | Bucles, listas y funciones |
| 03 | /?unit=3 | Fortaleza: portales, reliquias, alquimia y torre final | Objetos, errores y pruebas |

Un enlace con cantidad explícita abre directamente ese recorrido, por ejemplo `/?unit=2&count=24`. Los antiguos parámetros demo/layout se eliminan de la dirección y abren el mismo mapa principal; ya no existe un acceso a otra versión en la interfaz. Las referencias antiguas se conservan como archivos, sin usarse como mapas jugables.

## Recorrido y pantalla completa

- Mundo de 1600 unidades lógicas de ancho. Llena toda la pantalla en fullscreen y crece hacia arriba según la cantidad de actividades.
- Curvas deterministas que cruzan ambos lados y también mantienen varios desafíos en un mismo sector. Cada tema tiene su propio trazado.
- Una salida, un objetivo final, un bonus y un desafío de recuperación.
- Avance consecutivo: salida → 1 → 2 → … → meta. Seleccionar o explorar otro punto no teletransporta al personaje ni desbloquea ejercicios.
- Cámara que acompaña al explorador y controles para ver la meta, volver al inicio o encontrar al personaje.
- HUD flotante: vidas, racha, XP, avance principal y recuperación.
- Las actividades, sus resultados y la caminata posterior funcionan dentro de fullscreen. El diálogo de actividad pertenece al elemento ampliado. Si el navegador no habilita fullscreen nativo, se usa toda el área de su ventana.
- El repaso recupera una vida sin mover al personaje. Sus XP se otorgan una sola vez. Una respuesta incorrecta descuenta como máximo una vida por apertura de actividad.

## Contenidos y persistencia

Cada unidad utiliza su banco de preguntas temático. Si se eligen más actividades que las disponibles en ese banco, se reutilizan como prácticas numeradas; el proyecto final queda siempre al final. Esta selección de cantidad no incorpora todavía un editor docente de preguntas.

La aplicación sigue siendo frontend local: el progreso se guarda en localStorage, separado por unidad y cantidad. No hay backend, cuentas reales ni sincronización entre dispositivos. La racha de siete días conserva el dato de muestra existente. Los avances de las versiones anteriores quedan en sus claves originales y no se mezclan con los mundos principales.

## Código y validación

- `main.js` y `unit-routing.js`: entrada principal, normalización de enlaces y configuración obligatoria.
- `unit-setup.css`: selector y configuración inicial.
- `worlds.js`, `desert-lessons.js` y `unit-lessons.js`: bancos temáticos y creación de actividades.
- `vertical-world.js` y `vertical-world.css`: recorrido panorámico, ramales y cámara.
- `world-appearance.js` y `desert-scenery.js`: terreno, edificios y decoraciones por mundo.
- `app.js`: actividades, recompensas, HUD y fullscreen.
- `node-art.js` y `world-play.css`: objetos interactivos, estados y tarjetas sobre el mapa.
- `journey.js`: recorrido consecutivo e interpolación.

Ejecutar `npm run check` y `npm test`. Las pruebas cubren rutas, bloqueo por progreso, variación, cantidades inválidas, acceso inicial y separación de contenidos, assets y progreso entre los tres mundos.

## Imágenes

Se conservan las referencias originales y los assets de las exploraciones previas. Los tres mundos principales consumen terrenos modulares propios. Archivos finales, herramienta y prompts en [WORLD_ASSETS.md](WORLD_ASSETS.md). El avatar, objetos, caminos y edificios finales usan SVG/CSS; no requieren WebGL.
