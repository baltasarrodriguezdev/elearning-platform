// Original pixel silhouettes. Scenery never awards XP or acts as a challenge.
const house=`<ellipse cx="0" cy="38" rx="57" ry="10" fill="#754a30" opacity=".25"/>
<path d="M-36-4h72v39h-72z" fill="#ffe5a0" stroke="#6b422c" stroke-width="4"/>
<path d="M-32 0h8v31h-8zM24 0h9v31h-9z" fill="#d4a467"/>
<path d="M-54-5v-16h9v-16h14v-12h17v-7h28v7h17v12h14v16h9v16z" fill="#ec6849" stroke="#703e2b" stroke-width="4"/>
<path d="M-39-24h14v-15h-14zM-9-44h18v18H-9zM24-17h18v-16H24z" fill="#fff1c6"/>
<path d="M-10 35V14h5V8H7v6h5v21z" fill="#62412e" stroke="#bd844e" stroke-width="3"/>
<path d="M-29 9h10v11h-10zm47 0h10v11H18z" fill="#70bdac" stroke="#8c633c" stroke-width="2"/>
<path d="M-17 36h34v5h-34z" fill="#b9804e"/>`;
const flower=`<ellipse cx="0" cy="37" rx="32" ry="7" fill="#654531" opacity=".22"/>
<path d="M-21 7h42v29h-42z" fill="#29a353" stroke="#245d32" stroke-width="3"/><path d="M-15 8h9v25h-9z" fill="#8ae477"/>
<path d="M-27 0h54v12h-54z" fill="#4ec467" stroke="#245d32" stroke-width="3"/>
<g class="desert-flower"><path d="M0 0v-30m0 16-15-9m15 2 15-9" fill="none" stroke="#30884a" stroke-width="6"/>
<path d="M-20-51h30v6h10v23H10v6h-25v-7h-8v-19h3z" fill="#e75c4b" stroke="#793e2d" stroke-width="3"/>
<path d="M5-41h17v12H5z" fill="#fff0c1"/><path d="M10-36h12" stroke="#70402d" stroke-width="3"/>
<path d="M-15-45h6v6h-6zm-2 16h6v6h-6zm16-18h5v5h-5z" fill="#ffe7bf"/></g>`;
const bricks=`<ellipse cx="0" cy="31" rx="48" ry="8" fill="#76502f" opacity=".2"/>
<path d="M-45-10h90v36h-90zM-15-45h30v35h-30z" fill="#c9783b" stroke="#794729" stroke-width="3"/>
<path d="M-42-7h84M-42 9h84M-42 24h84M-12-42h24M-12-26h24M-15-8V9M15-8V9M-30 10v14M0 10v14M30 10v14M0-42v16" stroke="#f0b766" stroke-width="3"/>
<path d="M-17-63v-10h7v-7h20v7h7v10H7v9H-7v-9z" fill="#ef7354" stroke="#75432a" stroke-width="2"/><path d="M-6-77h10v9H-6z" fill="#ffedc0"/>`;
const cloud=`<path d="M-42 4v-13h13v-12h20v-8h23v9h16v11h13V8h-85z" fill="#fff5d9" stroke="#deb978" stroke-width="3"/><path d="M-32 7h66v5h-66z" fill="#dcab69" opacity=".35"/>`;
const coin=`<path d="M-6-14H6v4h4v20H6v4H-6v-4h-4v-20h4z" fill="#ffd950" stroke="#a86627" stroke-width="2"/><path d="M-4-10h5v20h-5z" fill="#fff4a5"/><path d="M5-8v16" stroke="#d9992f" stroke-width="2"/>`;

export function renderDesertScenery(unit) {
  const px=([x,y])=>[x*unit.worldWidth/100,y*unit.worldHeight/100];
  const items=[];
  for(let id=1;id<=unit.mainCount;id+=2) {
    [7,13,20].forEach((index,j)=>{
      const [x,y]=px(unit.roads[id][index]);
      items.push(`<g class="trail-coin" style="--delay:-${j*.4}s" transform="translate(${x} ${y})"><g>${coin}</g></g>`);
    });
  }
  const recovery=unit.challenges.find(c=>c.recovery);
  const [hx,hy]=px([recovery.x,recovery.y]);
  items.push(`<g class="mushroom-house" transform="translate(${hx} ${hy-133})">${house}</g>`);
  for(let id=3;id<=unit.mainCount;id+=3) {
    const [x,y]=px(unit.roads[id][16]);
    const decorX=unit.worldWidth*(x>unit.worldWidth/2?.30:.70);
    const nearSupport=unit.challenges.filter(c=>c.optional).some(c=>{const [sx,sy]=px([c.x,c.y]);return Math.hypot(sx-decorX,sy-y)<145;});
    if(!nearSupport)items.push(`<g transform="translate(${decorX} ${y})">${id%2?bricks:flower}</g>`);
    if(id%6===3)items.push(`<g class="desert-cloud" transform="translate(${unit.worldWidth*(x>unit.worldWidth/2?.80:.20)} ${y-110})"><g>${cloud}</g></g>`);
  }
  return `<svg class="desert-scenery" viewBox="0 0 ${unit.worldWidth} ${unit.worldHeight}" preserveAspectRatio="none" aria-hidden="true">${items.join('')}</svg>`;
}
