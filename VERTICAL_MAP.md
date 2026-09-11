# Terreno del mapa vertical

Asset final: `mapa_desierto_tile_vertical.png`.
Referencia visual: `mapa_desierto_objetos.png`.
Generado con la herramienta integrada de generación de imágenes. El camino, los objetos interactivos, el avatar y el castillo se dibujan por separado en HTML, SVG y CSS.

## Prompt utilizado

Use case: stylized-concept. Asset: one seamless vertical-repeat game terrain background tile, landscape 4:3. Use the supplied image as STYLE REFERENCE only: same rich polished retro 16-bit pixel art, warm golden sand, tiny pixel details, dark earthy outlines, classic platform overworld oblique perspective. Create a repeatable TOP-DOWN DESERT FLOOR TILE, no horizon, no sky. Leftmost 23% and rightmost 23% contain attractive small scattered cacti, broken ancient columns, sandstone boulders, palms, a tiny blue oasis on one edge and a small pyramid on the other. Center 54% of the tile must remain EMPTY GOLDEN SAND, lightly textured, reserved for a separately rendered snaking pathway. Extremely important: ZERO roads, zero paths, zero START or GOAL, zero text, zero castle, zero characters, zero numbered markers, zero challenge objects, zero hearts, zero coins. No UI. Top and bottom edges should match seamlessly in sand color and density to tile vertically; keep the topmost and bottommost 8% free of large decorative objects. Colors and shadows consistent from top to bottom, no lighting gradients. This is reusable terrain material for a long continuous vertical game map, not a complete level or poster. Preserve pixel art richness and playful visual quality from the reference.

## Composición dinámica

- Ancho lógico: 1600 unidades; separación vertical variable entre 180 y 270 unidades por desafío. La ventana panorámica ocupa todo el ancho disponible, también en fullscreen.
- Altura: suma de las separaciones + 600, reservando espacio para la salida y el castillo.
- El terreno se repite verticalmente. El camino se genera como curvas conectadas sobre la arena.
- Una salida y un castillo final, independientemente de la cantidad de actividades.
- Curvas con tangentes compartidas y variación determinista de posiciones y distancias. Cruces amplios entre izquierda y derecha, con varios desafíos consecutivos sobre un mismo lado. Ramales propios para el bonus y la recuperación.
- Monedas, casita hongo, ladrillos, nubes y plantas en tuberías se generan como SVG decorativos independientes del fondo.
- Las posiciones se normalizan para adaptarse al ancho disponible. La cámara se desplaza sin deformar el mundo.
- Este terreno se usa en el mapa principal del desierto. La selva y la fortaleza usan el mismo motor panorámico con terrenos propios, descritos en WORLD_ASSETS.md.
