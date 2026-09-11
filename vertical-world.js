import { createUnitLessons } from './unit-lessons.js';
import { WORLD_APPEARANCE,renderWorldScenery,templeArt,fortressArt } from './world-appearance.js';

export const WORLD_WIDTH=1600;
export const CHALLENGE_STEP=180;
const variation=(id,salt=0)=>{let n=Math.imul(id+salt,0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0;};
export const challengeSpacing=id=>CHALLENGE_STEP+[0,45,15,70,30,90][variation(id,7)%6];
const clampX=x=>Math.max(12,Math.min(88,x));
// Stable, varied bends and distances: no random layout changes on reload.
export function makeVerticalUnit(base,count=12) {
  const appearance=WORLD_APPEARANCE[base.theme];
  const unit={...base,...createUnitLessons(base,count)};
  const ascent=[0];
  for(let id=1;id<=count;id++)ascent.push(ascent[id-1]+challengeSpacing(id));
  const worldHeight=ascent[count]+600;
  const groundY=id=>worldHeight-150-ascent[id];
  const stops=[[50,groundY(0)/worldHeight*100]];
  const lanes=appearance.lanes;
  for(let id=1;id<=count;id++) {
    const zone=Math.floor((id-1)/lanes.length);
    const lane=lanes[(id-1)%lanes.length];
    const x=clampX((zone%2?100-lane:lane)+variation(id,13)%7-3);
    stops.push([id===count?50:x,groundY(id)/worldHeight*100]);
  }
  const roads=[[],...stops.slice(1).map((to,i)=>{
    const from=stops[i],dy=to[1]-from[1];
    const bend=variation(i+1,29)%4;
    const slope=id=>id===0||id===count?0:(stops[id+1][0]-stops[id-1][0])/(stops[id+1][1]-stops[id-1][1]);
    const y1=[.48,.28,.4,.3][bend],y2=[.7,.75,.6,.8][bend];
    // Shared tangents make neighboring bends meet smoothly at each challenge.
    const cx1=clampX(from[0]+slope(i)*dy*y1);
    const cx2=clampX(to[0]-slope(i+1)*dy*(1-y2));
    return Array.from({length:33},(_,step)=>{
      const t=step/32,u=1-t;
      return [u*u*u*from[0]+3*u*u*t*cx1+3*u*t*t*cx2+t*t*t*to[0],
        u*u*u*from[1]+3*u*u*t*(from[1]+dy*y1)+3*u*t*t*(from[1]+dy*y2)+t*t*t*to[1]];
    });
  })];
  const challenges=unit.challenges.map(c=>({...c}));
  challenges.filter(c=>!c.optional).forEach(c=>{
    c.description+=` Completa la actividad para avanzar hacia ${appearance.goal==='fortaleza'?'la':'el'} ${appearance.goal}.`;
  });
  const bonus=challenges.find(c=>c.optional&&!c.recovery);
  const recovery=challenges.find(c=>c.recovery);
  const support=(c,id)=>{
    const origin=roads[id][17];
    Object.assign(c,{x:origin[0]>50?92:8,y:origin[1],branchFrom:origin});
  };
  support(bonus,Math.max(1,Math.ceil(count*.6)));
  support(recovery,Math.min(2,count));
  if(count<=3){bonus.x=recovery.x===8?92:8;bonus.y=groundY(count)/worldHeight*100;bonus.branchFrom=stops[count];}
  return {...unit,vertical:true,segmented:false,singleMap:false,longDemo:false,worldWidth:WORLD_WIDTH,worldHeight,
    modules:Math.ceil(count/4),stops,roads,challenges,
    storageKey:`elp-world-${base.id}-count-${count}-v1`,
    goal:appearance.goal,
    tagline:`${count} desafíos · ${appearance.setting}`,
    tile:appearance.tile,image:appearance.tile,
    alt:`${appearance.setting}. Un recorrido panorámico hasta ${appearance.goal==='fortaleza'?'la':'el'} ${appearance.goal}.`,
  };
}

// Original code-native end cap: it appears once, independently of the terrain.
export const castleArt=`<svg viewBox="0 0 240 200" aria-hidden="true" shape-rendering="crispEdges">
  <ellipse cx="120" cy="180" rx="110" ry="13" fill="#775028" opacity=".24"/>
  <path d="M12 170h216v12H12zM24 158h192v14H24z" fill="#b8884d" stroke="#6d462a" stroke-width="3"/>
  <path d="M28 68h44v94H28zM168 68h44v94h-44zM70 93h100v69H70zM94 42h52v62H94z" fill="#dcb679" stroke="#63452d" stroke-width="4"/>
  <path d="M30 72h10v86H30zM96 47h10v54H96zM170 72h10v86h-10zM74 100h8v58h-8z" fill="#ffe2a5"/>
  <path d="M60 72h10v86H60zM136 47h8v51h-8zM200 72h10v86h-10zM158 100h10v58h-10z" fill="#ae7a49"/>
  <path d="m24 68 26-35 26 35zm65-25 31-42 31 42zm75 25 26-35 26 35z" fill="#d95c45" stroke="#773b2d" stroke-width="4"/>
  <path d="m33 58 17-22 5 9-12 13zm68-25 19-27 5 9-13 18zm72 25 17-22 5 9-12 13z" fill="#ff9260"/>
  <path d="M74 86h13v10h13V86h13v10h14V86h13v10h13V86h13v22H74z" fill="#f3d096" stroke="#755434" stroke-width="3"/>
  <path d="M102 165v-31l8-12h20l8 12v31z" fill="#563524" stroke="#9e7040" stroke-width="5"/>
  <path d="M110 164v-28l6-8h9l6 8v28z" fill="#2e2529"/>
  <path d="M43 88h12v22H43zM183 88h12v22h-12zM114 57h12v22h-12z" fill="#5f4430" stroke="#b78b55" stroke-width="3"/>
  <path d="M32 119h34m-34 16h34m-34 16h34m106-32h36m-36 16h36m-36 16h36M80 117h20m40 0h21" stroke="#b28550" stroke-width="3"/>
  <path d="M96 166h48v7H96zM89 174h62v8H89zM80 183h80v8H80z" fill="#ffe1a1" stroke="#a57948" stroke-width="3"/>
  <path d="M50 34V8m140 26V8" stroke="#68432e" stroke-width="3"/>
  <path d="M52 8h24l-6 7 6 7H52zM192 8h24l-6 7 6 7h-24z" fill="#e25c45" stroke="#8f442b" stroke-width="2"/>
</svg>`;

export function renderVerticalTerrain(unit) {
  const points=unit.roads.slice(1).flatMap((road,i)=>i?road.slice(1):road);
  const d=points.map(([x,y],i)=>`${i?'L':'M'}${x/100*unit.worldWidth},${y/100*unit.worldHeight}`).join(' ');
  const last=unit.stops.at(-1);
  const branches=unit.challenges.filter(c=>c.optional).map(c=>{
    const [x,y]=c.branchFrom;
    const d=`M${x/100*unit.worldWidth},${y/100*unit.worldHeight} Q${(x+c.x)/200*unit.worldWidth},${y/100*unit.worldHeight+24} ${c.x/100*unit.worldWidth},${c.y/100*unit.worldHeight}`;
    return `<path class="support-road-edge" d="${d}"/><path class="support-road" d="${d}"/>`;
  }).join('');
  const signs=unit.challenges.filter(c=>c.optional).map(c=>`<div class="support-sign ${c.recovery?'life-sign':'bonus-sign'}" style="left:${c.x}%;top:calc(${c.y}% + 32px)">${c.recovery?'♥ RECUPERAR VIDA':'★ BONUS'}<small>${c.recovery?'Repaso · +1 corazón':'Desafío opcional'}</small></div>`).join('');
  const castleTop=(last[1]/100*unit.worldHeight-355)/unit.worldHeight*100;
  const milestones=Array.from({length:Math.floor((unit.mainCount-1)/4)},(_,i)=>{
    const id=(i+1)*4;
    return `<div class="ascent-milestone" style="top:${unit.stops[id][1]}%"><span>↑</span> SECTOR ${String(i+1).padStart(2,'0')}</div>`;
  }).join('');
  return `<svg class="vertical-road" viewBox="0 0 ${unit.worldWidth} ${unit.worldHeight}" preserveAspectRatio="none" aria-hidden="true">${branches}<path d="${d}" class="road-shadow"/><path d="${d}" class="road-edge"/><path d="${d}" class="road-sand"/><path d="${d}" class="road-center"/></svg>${renderWorldScenery(unit)}${signs}
    <div class="vertical-castle" style="top:${castleTop}%">${unit.theme==='jungle'?templeArt:unit.theme==='castle'?fortressArt:castleArt}<span>LA META DE TU AVENTURA</span></div>
    <div class="vertical-start" style="top:${(unit.worldHeight-95)/unit.worldHeight*100}%"><span>START</span><small>Tu aventura empieza aquí</small></div>${milestones}`;
}
