# ELearningPlatform · Tres mundos para aprender

Prototipo frontend navegable con tres unidades de programación basadas en las referencias suministradas.

## Ejecutar

Con Node.js instalado, ejecutar `npm run dev` y abrir http://localhost:5173. No hay dependencias que instalar. Usar el servidor local para cargar los módulos JavaScript.

| Unidad | Dirección | Tema | Contenido | Coleccionable |
|---|---|---|---|---|
| 01 | /?unit=1 | Mario · Tierras del Sol | Fundamentos de programación | Monedas y bloque «?» |
| 02 | /?unit=2 | Donkey Kong · Isla del Gran Barril | Bucles, listas y funciones | Bananas y barriles |
| 03 | /?unit=3 | Castlevania · Fortaleza de la Noche | Objetos, errores y pruebas | Reliquias y velas |

La unidad 1 tiene 10 desafíos principales, bonus y recuperación (12 en total). Cada nueva unidad tiene 12 desafíos principales, bonus y recuperación (14 en total). El selector superior y «Mi curso» permiten cambiar de unidad. Cada URL puede guardarse como marcador.

## Recorrido y progreso

- Solo aparece nuestro explorador; se retiraron los jugadores dibujados en las referencias de Mario y Donkey Kong.
- Estado inicial por unidad: salida, ningún desafío completado, cinco vidas y cero XP. Se conserva el progreso anterior de la unidad 1.
- Recorrido estricto: salida → 1 → 2 → … → objetivo final. Los puntos intermedios siguen curvas, puentes y escaleras de cada mapa.
- Al completar una actividad y cerrar su resultado, el personaje camina al siguiente desafío. Durante el desplazamiento no se pueden iniciar otras actividades.
- Seleccionar un nodo distante muestra su detalle; no teletransporta al personaje ni permite saltarse ejercicios.
- Cada desafío es un objeto SVG interactivo: bloques sorpresa y bandera final en Mario, barriles en Donkey Kong y portales de piedra en Castlevania. Los bonus son una estrella, bananas o un cristal; la recuperación tiene tubería, barril con corazón o poción según el mundo.
- Al tocar un objeto, reacciona y abre una tarjeta anclada al mapa para entrar a su actividad. Los objetos cerrados sacuden sus cadenas y muestran el requisito de avance. Los resueltos cambian de aspecto; los números quedan como pequeñas etiquetas secundarias.
- Una guía luminosa acompaña el tramo del recorrido y el explorador deja partículas al caminar. Cada mundo tiene efectos ambientales discretos. El objeto actual se eleva para mantener visible al personaje.
- Bonus y recuperación mantienen al personaje en su posición del recorrido principal.
- Cada desafío principal y bonus otorga un coleccionable una sola vez. Golpear el bloque/barril o encender la vela es una interacción visual; no permite obtener recompensas sin completar una actividad.
- Una respuesta incorrecta resta una vida por apertura de actividad. Recuperación y repaso no consumen vidas.
- La recuperación se puede repetir hasta llegar a cinco vidas. Sus XP y progreso se otorgan una sola vez.
- Cada unidad guarda vidas, XP, desafíos y posición en una clave independiente de localStorage. Al recargar se restaura el último desafío alcanzado y se retoma el tramo pendiente si corresponde.
- La racha de siete días es un dato de demostración. Las actividades son ejemplos de una pregunta, incluso los proyectos finales. Para producción falta conectar usuarios, contenidos completos y persistencia a un backend.

## Pantalla completa

El botón de ampliar usa requestFullscreen() con el mapa como elemento de pantalla completa. Oculta HUD, título, selector, leyenda y panel lateral. Se ve la ilustración completa conservando su proporción 4:3, sin recortar ni deformar; las pantallas de otra proporción muestran bandas negras. Escape o la cruz permiten salir.

Si el navegador incrustado bloquea la API, la alternativa ocupa toda su área disponible. Tocar un objeto abre su tarjeta dentro del mapa. Su botón de entrada sale de pantalla completa para abrir la actividad; «Caminar hasta aquí» inicia el siguiente tramo disponible dentro del mapa.

## Archivos y verificaciones

- index.html: estructura semántica, selector y avatar SVG original.
- styles.css: interfaz base y diseño adaptable.
- journey.css: posición del explorador y animación de sus pasos.
- worlds.css: identidad de cada unidad, coleccionables y pantalla completa.
- node-art.js: objetos SVG originales de cada mundo y sus estados.
- world-play.css: interacción de objetos, tarjetas ancladas, atmósfera y guía del camino.
- app.js: selección, actividades, recompensas, guardado y pantalla completa.
- journey.js: interpolación de rutas y reglas de avance consecutivo.
- worlds.js: rutas, títulos, preguntas y configuración de las tres unidades.
- journey.test.js: pruebas de continuidad, restricciones de avance, interpolación, assets y datos de actividades.
- server.mjs: servidor local sin dependencias.

Ejecutar `npm run check` y `npm test`. La verificación manual cubre escritorio, móvil, pantalla completa, respuestas, recompensas y cambio de unidad.

## Mapas y edición de imágenes

Se conservan las referencias imagen_referencia.png, DonkeyKong_mapa.png y Castlevania_mapa.png. Las ediciones se realizaron con la herramienta integrada de generación de imágenes, sin CLI ni claves externas.

Assets finales y especificaciones de edición utilizadas:

- mapa_desierto_sin_mario.png: retirar a Mario junto a START y los antiguos marcadores 7, 8 y 9; reconstruir arena y caminos conservando estilo, paisaje y composición. Los nodos 7–9 se reubicaron sobre el camino hacia el castillo.
- mapa_desierto_objetos.png: segunda edición del desierto, actualmente utilizada. Retirar los círculos restantes 1–6 y 10 y la estrella morada dibujada; reconstruir caminos y arena sin cambiar el paisaje ni su composición. Todos los desafíos pasan a ser objetos interactivos superpuestos.
- mapa_selva_unidad.png: retirar al gorila junto a START y todas las banderas numeradas y círculos del camino; reconstruir los fondos y conservar selva, cascadas, puentes, escaleras, edificios, barriles, bananas, START y GOAL. Los marcadores ahora son controles HTML. Se añadió el desafío 6 que faltaba en la referencia.
- mapa_castillo_unidad.png: retirar los doce carteles de nombres/números y sus círculos rojos; reconstruir fondos y añadir escaleras de piedra entre cementerio → aldea y puente → capilla para caminar de forma continua. Conservar luna, fortaleza, edificios, paleta, START y GOAL. Las coordenadas de las rutas se ajustaron al resultado.

El avatar usa SVG y CSS; no requiere WebGL. Las tipografías Barlow y Silkscreen se cargan desde Google Fonts, con alternativas locales. Las coordenadas proporcionales mantienen la alineación al cambiar de tamaño. Con movimiento reducido se omiten las animaciones de caminata y recompensa.
