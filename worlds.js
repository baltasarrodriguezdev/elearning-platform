import { STOPS, ROADS } from './journey.js';

const jungleStops = [[10,89], [19,86.5], [36.6,84.4], [59.2,82.3], [91.2,74.2],
  [81,59], [63.3,54.7], [50,48.3], [29.6,39.2], [11.7,30.1], [27.5,21.5], [53.8,24], [89,28.7]];
const castleStops = [[16.8,87.8], [18.4,81], [9.2,65], [9,40.4], [27.8,42],
  [37.4,69.8], [46.5,84.3], [64.2,75.3], [82.8,69.5], [87.1,53], [75.8,39.7], [73.2,27.3], [87.7,23.8]];
const makeRoads = (stops, bends) => [[], ...stops.slice(1).map((stop, i) => [stops[i], ...bends[i], stop])];
const jungleRoads = makeRoads(jungleStops, [
  [[13,89.5],[15.7,88],[17,86.5]],
  [[23,86.6],[28,86.5],[30.5,85],[34,85]],
  [[40,83.5],[47,83.3],[52,82.4]],
  [[57.1,82.3],[57.1,69],[62,68.2],[67,69.2],[71,69.8],[76.2,68.4],[77.2,73],[82,75],[86.8,74.5]],
  [[92.4,72.2],[92.3,68.5],[90.1,66.5],[86.5,65.5],[85.8,62.4],[85.5,60]],
  [[78,59],[75.6,57],[73.5,56.5],[70,56.5],[67,56.4],[65,54.8]],
  [[58.8,54.7],[57.3,53.5],[57.1,50],[55.5,48.4]],
  [[48,47.5],[46.8,44.5],[43.4,43],[40,43],[35.2,42.2],[32,40.3]],
  [[25,39.5],[20,39.6],[14,37.5],[11,37],[11,32]],
  [[16,29.7],[20.1,27.8],[21.6,23.2],[23.3,21.5]],
  [[32,21.7],[36,23],[43,23.3],[47,24]],
  [[57.5,24.4],[59.5,26.7],[65,27],[70.5,28.8],[72.5,31.6],[74.7,33.2],[83.3,33.2],[85.8,32.3],[87.5,29.5]],
]);
const castleRoads = makeRoads(castleStops, [
  [[18.1,85.8],[18.4,83]],
  [[18.4,77],[17.5,74],[15.5,72.8],[15,70],[14,66.8],[10.5,65]],
  [[6.2,63.5],[3.8,62],[3.8,59],[4,55],[4.3,49],[5.3,44]],
  [[12,40.4],[16.8,39.4],[21.5,39.5],[23.8,41.5]],
  [[31.5,42],[33.5,45.5],[33.5,48],[33.5,54],[36,57],[36.5,62]],
  [[39.2,72.4],[43.5,72.5],[44.7,75],[44.7,82.2]],
  [[48.8,85],[55,84],[60,84],[60.3,80.8],[62.8,78]],
  [[66.5,74.5],[75.5,74.5],[77,73.2],[77.5,70.3],[79.5,69.5]],
  [[85,69.5],[86.5,67.5],[86.7,60]],
  [[86.7,50],[85,48.8],[82.7,48.8],[81.8,47.5],[81.2,43.3],[79.9,41.3]],
  [[71.5,38.2],[71.3,36.5],[73.2,36.5],[73.2,31]],
  [[77,28.3],[85.7,28.3],[87.7,26.5]],
]);

function lesson(id, title, description, type = 'Práctico') {
  return { id, title, description, type, difficulty: id < 5 ? 'Inicial' : id < 10 ? 'Intermedia' : 'Avanzada', minutes: id === 12 ? 20 : 5 + id, xp: id === 12 ? 300 : 50 + id * 15 };
}
function lessons(titles, descriptions, bonus, recovery) {
  return [...titles.map((title, i) => lesson(i + 1, title, descriptions[i], i === 11 ? 'Proyecto' : i % 3 === 0 ? 'Teórico' : 'Práctico')),
    { ...lesson(13, bonus.title, bonus.description, 'Bonus'), ...bonus, difficulty:'Intermedia', optional:true, minutes:5, xp:100 },
    { ...lesson(14, recovery.title, recovery.description, 'Recuperación'), ...recovery, difficulty:'Inicial', optional:true, recovery:true, minutes:3, xp:25 }];
}
const q = (text, answers, correct, explanation) => [text, answers, correct, explanation];

export const UNITS = {
  1: {
    id:1, theme:'desert', title:'El desierto del conocimiento', subtitle:'Fundamentos de programación', tagline:'Tu aventura comienza con las bases.', region:'TIERRAS DEL SOL', inspiration:'MARIO',
    image:'mapa_desierto_objetos.png', alt:'Mapa pixel art del desierto con pirámides, tuberías y un camino hasta el castillo.',
    stops:STOPS, roads:ROADS, mainCount:10, storageKey:'elp-desert-linear-v2',
    collectible:'Monedas', collectibleSingular:'moneda', symbol:'?', collectibleClass:'coin', rewardTitle:'¡MONEDA CONSEGUIDA!',
    feature:'Golpea el bloque, descubre tu recompensa.', finish:'¡Bandera arriba! El castillo es tuyo.',
    tip:'Busca la tubería con corazón y completa un repaso para recuperar una vida.',
  },
  2: {
    id:2, theme:'jungle', title:'La selva de los algoritmos', subtitle:'Bucles, listas y funciones', tagline:'Encuentra tu ritmo entre puentes y cascadas.', region:'ISLA DEL GRAN BARRIL', inspiration:'DONKEY KONG',
    image:'mapa_selva_unidad.png', alt:'Selva pixel art con barriles, bananas, puentes colgantes, minas y una fortaleza volcánica.',
    stops:jungleStops, roads:jungleRoads, mainCount:12, storageKey:'elp-jungle-v1',
    collectible:'Bananas', collectibleSingular:'banana', symbol:'DK', collectibleClass:'banana', rewardTitle:'¡BANANA CONSEGUIDA!',
    feature:'Rompe un barril y alimenta tu curiosidad.', finish:'¡La cima de la isla es tuya!',
    tip:'El barril de provisiones tiene un repaso corto para recuperar una vida sin salir de tu camino.',
    challenges:lessons([
      'Bienvenido a la jungla','Un salto, muchas veces','El ritmo del bucle','Cruza el puente','La entrada a la mina','La fila de vagonetas',
      'El templo de las listas','Entre lianas e índices','La casa de las funciones','El cañón de parámetros','La fábrica de resultados','La fortaleza de los algoritmos',
    ], [
      'Descubre cómo los bucles y las colecciones te ayudan a recorrer una selva de problemas.',
      'Repite una instrucción para saltar de plataforma en plataforma sin escribirla otra vez.',
      'Usa un contador para saber cuántas vueltas lleva tu recorrido.',
      'Aprende a detener una repetición antes de que termine el puente.',
      'Explora el while: avanza por la mina mientras se cumpla una condición.',
      'Guarda varios valores ordenados como una fila de vagonetas.',
      'Añade elementos a una lista y organiza las provisiones del templo.',
      'Accede a cada posición de una colección sin perderte entre las lianas.',
      'Agrupa instrucciones en funciones que puedes volver a utilizar.',
      'Envía parámetros a una función para cambiar la fuerza de cada lanzamiento.',
      'Recibe el resultado de una función y úsalo en tu siguiente paso.',
      'Combina listas, bucles y funciones para superar la fortaleza volcánica.',
    ], {x:51.2,y:66.7,title:'El barril dorado',description:'Resuelve un patrón escondido entre barriles y consigue una banana extra.'},
    {x:6,y:65.5,title:'Provisiones de la selva',description:'Recupera una vida con un repaso de bucles en el barril de provisiones.'}),
    questions:{
      1:q('¿Qué estructura permite repetir instrucciones?', ['Un bucle','Un color','Un comentario'],0,'Un bucle ejecuta instrucciones varias veces.'),
      2:q('Saltas 3 veces y ganas 2 bananas en cada salto. ¿Cuántas consigues?', ['3','5','6'],2,'3 repeticiones × 2 bananas = 6 bananas.'),
      3:q('Un contador empieza en 0 y aumenta 1 en cada una de 4 vueltas. ¿Cómo termina?', ['0','4','5'],1,'Tras cuatro incrementos, el contador vale 4.'),
      4:q('El puente tiene 5 tablas. ¿Qué cantidad de pasos evita superar el final?', ['5','6','10'],0,'Limitar la repetición a cinco pasos evita sobrepasar el puente.'),
      5:q('¿Cuándo continúa un bucle while?', ['Cuando su condición es verdadera','Siempre, aunque la condición sea falsa','Solo cuando hay una lista'],0,'while repite su cuerpo mientras la condición sea verdadera.'),
      6:q('¿Qué estructura guarda varios valores en orden?', ['Una lista','Una comparación','Un comentario'],0,'Una lista es una colección ordenada de elementos.'),
      7:q('La lista tiene 3 provisiones y añades una. ¿Cuántos elementos tiene?', ['2','3','4'],2,'Al añadir un elemento, la longitud pasa de 3 a 4.'),
      8:q('En una lista con índices desde 0, ¿cuál es el índice del segundo elemento?', ['0','1','2'],1,'Los índices empiezan en 0: primero 0, segundo 1.'),
      9:q('¿Para qué sirve una función?', ['Para agrupar y reutilizar instrucciones','Para borrar siempre los datos','Para repetir código a mano'],0,'Una función organiza una tarea que puedes invocar varias veces.'),
      10:q('¿Qué es un parámetro?', ['Un dato que recibe una función','El color de una variable','Una instrucción de salida'],0,'Los parámetros permiten que una función trabaje con distintos datos de entrada.'),
      11:q('¿Qué hace return dentro de una función?', ['Devuelve un resultado','Crea una lista vacía siempre','Repite la función'],0,'return entrega un resultado al lugar desde donde se llamó la función.'),
      12:q('La función total suma [2, 3, 5] mediante un bucle y devuelve la suma. ¿Qué retorna?', ['3','10','235'],1,'El bucle acumula 2 + 3 + 5 y la función devuelve 10.'),
      13:q('Los barriles contienen 1, 3, 5, 7 bananas. ¿Qué sigue?', ['8','9','14'],1,'La secuencia aumenta de dos en dos: después de 7 viene 9.'),
      14:q('¿Qué debes actualizar para que un while con contador pueda terminar?', ['El contador o la condición','El fondo de pantalla','El nombre del archivo'],0,'La condición debe poder cambiar; por ejemplo, incrementando un contador.'),
    },
  },
  3: {
    id:3, theme:'castle', title:'El castillo de la lógica', subtitle:'Objetos, errores y pruebas', tagline:'Ilumina cada secreto. Domina tu código.', region:'FORTALEZA DE LA NOCHE', inspiration:'CASTLEVANIA',
    image:'mapa_castillo_unidad.png', alt:'Fortaleza gótica pixel art bajo la luna, con cementerio, capilla, biblioteca, alquimia y una sala del trono.',
    stops:castleStops, roads:castleRoads, mainCount:12, storageKey:'elp-castle-v1',
    collectible:'Reliquias', collectibleSingular:'reliquia', symbol:'✦', collectibleClass:'relic', rewardTitle:'¡RELIQUIA DESCUBIERTA!',
    feature:'Enciende una vela. Revela un nuevo secreto.', finish:'¡La fortaleza ha sido liberada!',
    tip:'La fuente de alquimia te devuelve una vida al completar un repaso. Tu explorador conserva su posición.',
    challenges:lessons([
      'Las puertas del misterio','El cementerio de los datos','Secretos de la aldea','El puente de los objetos','La capilla de los métodos','Errores en las catacumbas',
      'El reloj de la depuración','La biblioteca de las pruebas','El laboratorio de los casos límite','Protege la muralla','Antes del trono','El guardián del código',
    ], [
      'Abre las puertas a una nueva forma de organizar y verificar tus programas.',
      'Descubre cómo reunir datos relacionados en un solo objeto.',
      'Reconoce las propiedades que describen a cada personaje y reliquia.',
      'Consulta una propiedad para atravesar el puente con la información correcta.',
      'Añade comportamientos a tus objetos mediante métodos.',
      'Distingue un error de sintaxis de un resultado lógico incorrecto.',
      'Sigue la ejecución paso a paso para encontrar dónde aparece un fallo.',
      'Escribe pruebas que comparan los resultados reales con los esperados.',
      'Prueba listas vacías y otros casos límite antes de dar el código por terminado.',
      'Valida los datos de entrada para proteger tu programa.',
      'Maneja los errores de forma clara antes del desafío final.',
      'Integra objetos, validaciones y pruebas para liberar la fortaleza.',
    ], {x:42,y:63,title:'La reliquia de la capilla',description:'Descifra una condición lógica y descubre una reliquia oculta.'},
    {x:95,y:59,title:'La fuente de alquimia',description:'Enciende de nuevo tu energía con un breve repaso de validaciones.'}),
    questions:{
      1:q('¿Qué ayuda a mantener un programa organizado?', ['Agrupar datos y comportamientos relacionados','Escribir todo en una sola línea','Evitar nombres descriptivos'],0,'Agrupar responsabilidades relacionadas facilita comprender y mantener el código.'),
      2:q('Un objeto jugador tiene nombre y vidas. ¿Qué representan?', ['Propiedades','Bucles','Comentarios'],0,'Las propiedades almacenan los datos de un objeto.'),
      3:q('¿Qué propiedad describe cuánta energía tiene un personaje?', ['vidas','colorDelCielo','anchoDelPuente'],0,'vidas representa un dato propio del personaje.'),
      4:q('Si jugador.vidas vale 3, ¿qué devuelve consultar jugador.vidas?', ['El número 3','El texto jugador','Toda la pantalla'],0,'La consulta obtiene el valor de esa propiedad: 3.'),
      5:q('¿Qué es un método?', ['Una función asociada a un objeto','Una imagen','Una variable que nunca cambia'],0,'Un método representa un comportamiento del objeto.'),
      6:q('El programa se ejecuta pero calcula mal el total. ¿Qué tipo de error puede tener?', ['Lógico','De color','Ninguno'],0,'Un error lógico produce un resultado incorrecto aunque el programa se ejecute.'),
      7:q('¿Qué permite hacer un punto de interrupción?', ['Pausar y examinar la ejecución','Borrar todas las variables','Corregir cualquier fallo automáticamente'],0,'Un punto de interrupción permite inspeccionar el estado del programa en un lugar concreto.'),
      8:q('Una prueba espera 5, pero la función devuelve 4. ¿Qué debe indicar?', ['Fallo','Éxito','Que hay que ignorar el resultado'],0,'La prueba falla porque el valor obtenido no coincide con el esperado.'),
      9:q('¿Cuál es un caso límite para una función que suma una lista?', ['Una lista vacía','Solo una lista de 100 elementos','El nombre del archivo'],0,'Una lista vacía prueba qué sucede cuando no hay elementos que procesar.'),
      10:q('Las vidas deben ser entre 0 y 5. ¿Qué dato debes rechazar?', ['3','5','-2'],2,'-2 está fuera del intervalo permitido.'),
      11:q('Cuando ocurre un error esperado, conviene…', ['Gestionarlo y mostrar una respuesta clara','Ocultarlo siempre','Dejar que se pierdan los datos'],0,'Gestionar errores permite responder de manera controlada y comprensible.'),
      12:q('Una función impide que las vidas bajen de 0. Con 0 vidas, pierdes una. ¿Qué debe verificar la prueba?', ['Que el resultado sigue siendo 0','Que el resultado es -1','Que el objeto desaparece'],0,'El caso límite debe conservar la regla: las vidas nunca son negativas.'),
      13:q('La puerta abre si hay llave Y energía. Tienes llave, pero no energía. ¿Abre?', ['Sí','No','Depende del color'],1,'Una condición Y requiere que ambas partes sean verdaderas.'),
      14:q('¿Para qué sirve validar un dato antes de usarlo?', ['Para comprobar que cumple las reglas esperadas','Para cambiarle siempre el valor','Para evitar todas las pruebas'],0,'La validación detecta entradas que no cumplen las reglas del programa.'),
    },
  },
};
