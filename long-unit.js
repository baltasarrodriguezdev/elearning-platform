import { measureRoute, pointOnRoute } from './journey.js';

// Split the existing illustrated road by travelled distance, preserving bends.
export function divideRoad(roads, count) {
  const points = roads.slice(1).flatMap((road, i) => i ? road.slice(1) : road);
  const route = measureRoute(points);
  const cumulative = [0];
  route.lengths.forEach(length => cumulative.push(cumulative.at(-1) + length));
  const stops = Array.from({length:count+1}, (_,i) => pointOnRoute(route,i/count));
  const segments = [[], ...stops.slice(1).map((end,i) => [stops[i],
    ...points.filter((_,j) => cumulative[j] > route.distance*i/count && cumulative[j] < route.distance*(i+1)/count), end])];
  return {stops, roads:segments};
}
const chapterPaths = [
  [[6,86],[19,86],[20,76],[28,70],[28,57],[27,43],[28,31],[41,31],[43,24],[57,24],[61,31],[73,40],[86,43],[91,34],[92,24]],
  [[4,87],[18,87],[29,82],[43,82],[44,71],[57,67],[67,67],[67,57],[72,48],[87,48],[88,37],[92,30],[94,18]],
  [[4,87],[18,87],[29,82],[43,76],[55,68],[65,60],[76,57],[87,49],[81,41],[74,38],[76,31],[85,28],[91,20]],
];
export function makeLongUnit(base,count=36) {
  if(!Number.isInteger(count)||count<1||count>120) throw new RangeError('Usa un entero entre 1 y 120.');
  const names=['Ruinas del desierto','Oasis y pirámides','Montañas y castillo'];
  const images=['mapa_desierto_tramo_1_ruinas.png','mapa_desierto_tramo_2_oasis.png','mapa_desierto_tramo_3_castillo.png'];
  const zones=names.map((name,i)=>({name,image:images[i],count:Math.floor(count/3)+(i>=3-count%3?1:0)}));
  const pages=[],stops=[],roads=[[]],placement=[];
  let next=1;
  zones.forEach((zone,zoneIndex)=>{
    zone.start=next;
    zone.firstPage=pages.length;
    zone.pageCount=Math.ceil(zone.count/12);
    if(!zone.count) return;
    const route=divideRoad([[],chapterPaths[zoneIndex]],zone.count);
    if(!stops.length) stops.push(route.stops[0]);
    for(let j=0;j<zone.count;j++) {
      if(j%12===0) pages.push({zone:zoneIndex,start:next+j,end:Math.min(next+j+11,next+zone.count-1),entry:route.stops[j],part:Math.floor(j/12)+1});
      stops.push(route.stops[j+1]);roads.push(route.roads[j+1]);placement.push({chapter:pages.length-1,zone:zoneIndex});
    }
    next+=zone.count;
  });
  const chapters=pages.map(p=>`${names[p.zone]}${zones[p.zone].pageCount>1?` · ${p.part}/${zones[p.zone].pageCount}`:''}`);
  const topics = ['Primeras instrucciones','Ordenar los pasos','Leer un resultado','Guardar un dato','Nombres y valores','Operar con números','Comparar resultados','Elegir un camino','Contar repeticiones','Encontrar el error','Combinar instrucciones','La prueba del castillo'];
  const challenges = Array.from({length:count},(_,i) => ({
    id:i+1,...placement[i], title:i===count-1?'La prueba del castillo':`${topics[i%12]} · ${i+1}`,
    description:`Actividad de muestra ${i+1} de ${count}. ${names[placement[i].zone]}.`,
    type:i===count-1?'Proyecto':i%3===0?'Teórico':'Práctico', difficulty:['Inicial','Intermedia','Avanzada'][placement[i].zone],
    minutes:5+i%6, xp:50+placement[i].zone*25,
  }));
  challenges.push({id:count+1,optional:true,x:35,y:52,title:'El tesoro extra',type:'Bonus',difficulty:'Inicial',minutes:3,xp:100,description:'Una parada opcional para encontrar un patrón.'},
    {id:count+2,optional:true,recovery:true,x:88.3,y:69.5,title:'Un corazón para el viaje',type:'Recuperación',difficulty:'Inicial',minutes:3,xp:25,description:'Repasa una operación y recupera una vida. Conservas tu lugar en el recorrido.'});
  const questions = Object.fromEntries(challenges.map(c => {
    const a=2+(c.id%7), b=1+(c.id%4);
    return [c.id,[`Guardas ${a} monedas y después sumas ${b}. ¿Qué valor queda guardado?`,[String(a+b),String(a+b+1),String(a*b+10)],0,`${a} + ${b} = ${a+b}. Las instrucciones se ejecutan en orden.`]];
  }));
  return {...base, longDemo:true, segmented:true, singleMap:false, zones,pages,chapters,mainCount:count,challenges,questions,
    title:'El desierto del conocimiento',tagline:`${count} desafíos principales · 3 zonas del mismo mundo`,
    storageKey:`elp-template-v3-count-${count}`,
    chapterFor:id=>placement[Math.max(0,Math.min(count-1,id-1))].chapter,
    chapterImages:pages.map(p=>images[p.zone]),chapterStarts:pages.map(p=>p.entry),
    generalImage:base.image,image:base.image,stops,roads,
  };
}
