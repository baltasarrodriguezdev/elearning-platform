import { renderDesertScenery } from './desert-scenery.js';
export const WORLD_APPEARANCE={
  desert:{tile:'mapa_desierto_tile_vertical.png',goal:'castillo',setting:'Desierto, oasis y ruinas',support:'Tubería de recuperación',lanes:[24,64,81,73,42,18,30,62,82,68,36,21]},
  jungle:{tile:'mapa_selva_tile.png',goal:'templo',setting:'Selva, cascadas y templos',support:'Barril de provisiones',lanes:[70,84,62,24,18,32,68,81,55,28,16,42]},
  castle:{tile:'mapa_castillo_tile.png',goal:'fortaleza',setting:'Murallas, criptas y alquimia',support:'Fuente de alquimia',lanes:[28,18,44,78,82,65,40,16,25,60,83,67]},
};
const svg=content=>`<svg viewBox="0 0 240 200" aria-hidden="true" shape-rendering="crispEdges">${content}</svg>`;
export const templeArt=svg(`<ellipse cx="120" cy="184" rx="111" ry="12" fill="#153629" opacity=".4"/><path d="M12 162h216v23H12zM30 139h180v23H30zM49 115h142v24H49zM65 89h110v26H65zM77 43h86v47H77z" fill="#938958" stroke="#384d32" stroke-width="4"/><path d="M15 164h210M33 142h174M53 118h134M69 93h102M81 47h77" stroke="#d2c38b" stroke-width="6"/><path d="M100 183V91h40v92z" fill="#b2a577"/><path d="M99 112h42m-42 16h42m-42 16h42m-42 16h42m-42 16h42" stroke="#635e3b" stroke-width="4"/><path d="M104 88V62h32v26z" fill="#263729"/><path d="M73 44V29h93v15zM89 28V15h60v13z" fill="#78824b" stroke="#34472e" stroke-width="4"/><path d="M30 164v-21h14m18-28h15v-21m85-9v21h19m18 38h14v27" fill="none" stroke="#4f8e43" stroke-width="8"/><path d="M82 54h9v15h-9zm67 0h8v15h-8z" fill="#ddb65e"/>`);
export const fortressArt=svg(`<ellipse cx="120" cy="184" rx="111" ry="12" fill="#100f20" opacity=".6"/><path d="M14 164h212v23H14zM25 70h42v94H25zM173 70h42v94h-42zM65 104h110v60H65zM94 42h52v76H94z" fill="#4b506f" stroke="#1b213a" stroke-width="4"/><path d="m20 70 26-48 26 48zm69-28 31-42 31 42zm79 28 26-48 26 48z" fill="#773453" stroke="#211c38" stroke-width="4"/><path d="M32 77h7v83h-7zm70-31h7v63h-7zm79 31h7v83h-7z" fill="#8484a1"/><path d="M103 164v-31l17-19 17 19v31z" fill="#ae4265" stroke="#27233e" stroke-width="5"/><path d="M112 164v-27l8-11 8 11v27z" fill="#251a32"/><path d="M41 91h9v20h-9zm149 0h9v20h-9zm-74-34h8v23h-8z" fill="#ec7181"/><path d="M68 95h12v12h15V95h13v12h24V95h13v12h15V95h12v25H68z" fill="#6e6b88" stroke="#262b44" stroke-width="3"/><path d="M98 166h44v8H98zM89 175h62v9H89zM79 185h82v8H79z" fill="#a07e91" stroke="#3a334f" stroke-width="3"/><path d="M46 20V4m148 16V4" stroke="#9991a8" stroke-width="2"/>`);
const banana='<path d="M-12-20Q-26 15 9 24L23 14Q-1 18 0-17z" fill="#ffdc54" stroke="#95702c" stroke-width="3"/><path d="M-11-18Q-16 9 8 17" fill="none" stroke="#fff194" stroke-width="4"/><path d="M-13-20h13" stroke="#546a31" stroke-width="5"/>';
const crystal='<path d="m0-22 13 13v24L0 26-13 15V-9z" fill="#a776d4" stroke="#e1b594" stroke-width="2"/><path d="m0-19 6 11L0 22-6-8z" fill="#ecc1ff"/>';
const totem='<path d="M-34 39h68v9h-68zM-24-37h48v76h-48z" fill="#8c9560" stroke="#30442e" stroke-width="4"/><path d="M-19-30h38v12h-38z" fill="#c3c084"/><path d="M-15-9h10v10h-10zM5-9h10v10H5zM-11 16h22v7h-22z" fill="#36472d"/><path d="M-20 28h8v10h-8zm26-64h10v14H6z" fill="#53a04e"/>';
const torch='<path d="M-22 42h44v8h-44zM-10-7h20v48h-20z" fill="#74718a" stroke="#292c43" stroke-width="3"/><path d="M-18-11h36v9h-36z" fill="#ab9070"/><g class="torch-flame"><path d="M-15-14v-17l9-14 5 9 6-22 11 27v17z" fill="#ed8653" stroke="#a74744" stroke-width="2"/><path d="M-7-15v-15l7-12 7 22v5z" fill="#ffe396"/></g>';
export function renderWorldScenery(unit){
  if(unit.theme==='desert')return renderDesertScenery(unit);
  const items=[];
  for(let id=1;id<=unit.mainCount;id+=2){
    [8,16,23].forEach((step,j)=>{const [x,y]=unit.roads[id][step];items.push(`<g class="trail-coin" style="--delay:-${j*.4}s" transform="translate(${x/100*unit.worldWidth} ${y/100*unit.worldHeight})"><g>${unit.theme==='jungle'?banana:crystal}</g></g>`);});
  }
  for(let id=2;id<=unit.mainCount;id+=3){const [x,y]=unit.roads[id][16];const side=x>50?30:70;items.push(`<g transform="translate(${side/100*unit.worldWidth} ${y/100*unit.worldHeight})">${unit.theme==='jungle'?totem:torch}</g>`);}
  return `<svg class="desert-scenery" viewBox="0 0 ${unit.worldWidth} ${unit.worldHeight}" preserveAspectRatio="none" aria-hidden="true">${items.join('')}</svg>`;
}
