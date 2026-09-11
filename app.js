import { nextChallenge as nextInJourney, canAdvance as canAdvanceJourney, measureRoute, pointOnRoute } from './journey.js';
import { UNITS } from './worlds.js';
import { WORLD_APPEARANCE } from './world-appearance.js';
import { nodeArt, nodeVerb } from './node-art.js';
import { makeVerticalUnit, renderVerticalTerrain } from './vertical-world.js';
const params = new URLSearchParams(location.search);
const baseUnit = UNITS[Number(params.get('unit'))] || UNITS[1];
const unit = makeVerticalUnit(baseUnit,Number(params.get('count')));
const chapterFor=id=>unit.chapterFor?unit.chapterFor(id):0;
const { stops: STOPS, roads: ROADS, mainCount } = unit;
const nextChallenge = completed => nextInJourney(completed, mainCount);
const canAdvance = (position, completed) => canAdvanceJourney(position, completed, mainCount);
const $ = (selector) => document.querySelector(selector);
const icon = (name, className = '') => `<svg class="${className}" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
const challenges = unit.challenges;
const totalChallenges = challenges.length;
const recoveryId = challenges.find(c => c.recovery).id;
challenges.filter(c => !c.optional).forEach(c => { [c.x, c.y] = STOPS[c.id]; });
const STORAGE_KEY = unit.storageKey;
const defaultState = { completed: [], xp: 0, lives: 5, sound: false, position: 0 };
let state = { ...defaultState, completed: [...defaultState.completed] };
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && Array.isArray(saved.completed) && saved.completed.every(n => Number.isInteger(n) && n >= 1 && n <= totalChallenges) && Number.isFinite(saved.xp) && saved.xp >= 0 && Number.isInteger(saved.lives) && saved.lives >= 0 && saved.lives <= 5 && Number.isInteger(saved.position) && saved.position >= 0 && saved.position <= mainCount) {
    const firstPending = nextChallenge(saved.completed);
    // Reject non-contiguous main progress and impossible player checkpoints.
    if (saved.completed.filter(id => id <= mainCount).every(id => id <= firstPending) && saved.position <= firstPending) {
      state = { completed: [...new Set(saved.completed)], xp: saved.xp, lives: saved.lives, sound: !!saved.sound, position: saved.position };
    }
  }
} catch { storageAvailable = false; }
let selected = nextChallenge(state.completed);
let visibleChapter = chapterFor(state.position);
let overview=!!unit.segmented;
let cameraFollowing=true;
let moving = false;
let avatarPoint = [...STOPS[state.position]];
let toastTimer;
let audioContext;
function applyUnit() {
  document.body.dataset.theme = unit.theme;
  document.body.classList.toggle('vertical-world',!!unit.vertical);
  $('#unit-configuration').innerHTML=`<div><strong>UNIDAD CONFIGURADA</strong><span>${mainCount} desafíos principales · 1 bonus · 1 recuperación de vida</span></div><a href="?unit=${unit.id}">Cambiar cantidad</a>`;
  document.title = `${unit.title} · ELearningPlatform`;
  $('.world-image').src = unit.image;
  $('#map-world').style.setProperty('--terrain-image',`url('${unit.tile}')`);
  $('.world-image').alt = unit.alt;
  $('.map-hud-heading>span').textContent=`EXPLORADOR · U${String(unit.id).padStart(2,'0')}`;
  if(unit.vertical) setupVerticalWorld();
  $('.breadcrumbs strong').textContent = `Unidad ${String(unit.id).padStart(2,'0')}`;
  $('.world-badge strong').textContent = String(unit.id).padStart(2,'0');
  $('#unit-title').innerHTML = `${unit.title}<span>.</span>`;
  $('.unit-heading p').innerHTML = `${unit.subtitle} <span>·</span> ${unit.tagline}`;
  $('.map-toolbar > div > span:nth-child(2)').textContent = `MUNDO ${String(unit.id).padStart(2,'0')}`;
  $('.map-subtitle').textContent = unit.region;
  $('.unit-progress .muted').textContent = `/ ${totalChallenges} desafíos`;
  $('.progress-track').setAttribute('aria-valuemax', totalChallenges);
  $('.tip-card p').textContent = unit.tip;
  $('.tip-heading .question-block').textContent = unit.symbol;
  $('#unit-switcher').innerHTML = Object.values(UNITS).map(world => `<a class="unit-link ${world.id === unit.id ? 'active' : ''}" href="?unit=${world.id}" ${world.id === unit.id ? 'aria-current="page"' : ''}><img src="${WORLD_APPEARANCE[world.theme].tile}" alt=""/><span><small>UNIDAD ${String(world.id).padStart(2,'0')} · ${world.inspiration}</small><strong>${world.title}</strong></span><span class="unit-link-arrow">↗</span></a>`).join('');
  const motePositions = [[18,22],[35,55],[51,17],[69,38],[82,72],[30,80],[58,68],[91,44]];
  $('#world-atmosphere').innerHTML = motePositions.map(([x,y],i) => `<i class="world-mote" style="--mx:${x}%;--my:${y}%;--md:${4+i%3}s;--delay:-${i*.8}s"></i>`).join('') + (unit.theme === 'castle' ? Array.from({length:3},()=>'<span class="world-bat"><svg viewBox="0 0 32 20"><path d="M0 2 9 6 12 0l4 7 4-7 3 6 9-4-4 13-6-4-6 9-6-9-6 4z" fill="currentColor"/></svg></span>').join('') : '');
  $('.map-legend').innerHTML = ['completed','available','locked','bonus','recovery'].map((status,i) => `<span><i class="legend-object" aria-hidden="true">${nodeArt(unit.theme,{id:1,optional:status==='bonus',recovery:status==='recovery'},status,mainCount)}</i>${['Resuelto','Disponible','Bloqueado','Bonus','Recuperar vida'][i]}</span>`).join('');
}

function closeEncounter() {
  $('#encounter').hidden = true;
  $('#map-world').classList.remove('encounter-open');
}
function focusCamera(point=avatarPoint,behavior='auto') {
  if(!unit.vertical)return;
  const viewport=$('#map-viewport'),world=$('#map-world');
  const top=Math.max(0,Math.min(world.clientHeight-viewport.clientHeight,point[1]/100*world.clientHeight-viewport.clientHeight*.62));
  viewport.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':behavior});
}
function setupVerticalWorld() {
  const world=$('#map-world');
  const viewport=document.createElement('div');
  viewport.id='map-viewport';viewport.className='map-viewport';viewport.tabIndex=0;
  viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Mapa vertical. Desplázate hacia arriba para explorar el recorrido.');
  world.before(viewport);viewport.append(world);
  world.style.aspectRatio=`${unit.worldWidth} / ${unit.worldHeight}`;
  world.style.setProperty('--world-height',unit.worldHeight);
  const terrain=document.createElement('div');terrain.className='vertical-terrain';terrain.setAttribute('aria-hidden','true');
  terrain.innerHTML=renderVerticalTerrain(unit);world.prepend(terrain);
  const navigation=document.createElement('div');navigation.className='vertical-navigation';
  navigation.innerHTML=`<span class="vertical-direction">↑ RUMBO ${unit.goal==='fortaleza'?'A LA':'AL'} ${unit.goal.toUpperCase()}</span><div><button id="look-goal">Ver ${unit.goal} ↑</button><button id="follow-player" aria-pressed="true">Mi personaje</button><button id="look-start">Inicio ↓</button></div>`;
  viewport.before(navigation);
  function setFollow(value) {cameraFollowing=value;$('#follow-player').setAttribute('aria-pressed',value);}
  $('#look-goal').addEventListener('click',()=>{closeEncounter();setFollow(false);focusCamera([50,0],'smooth');});
  $('#look-start').addEventListener('click',()=>{closeEncounter();setFollow(false);focusCamera([50,100],'smooth');});
  $('#follow-player').addEventListener('click',()=>{closeEncounter();setFollow(true);focusCamera(avatarPoint,'smooth');});
  ['wheel','touchstart','pointerdown','keydown'].forEach(type=>viewport.addEventListener(type,()=>{if(!moving)setFollow(false);},{passive:true}));
  new ResizeObserver(()=>{closeEncounter();if(cameraFollowing)focusCamera();}).observe(viewport);
  requestAnimationFrame(()=>focusCamera());
}
function renderChapters() {
  if(!unit.segmented) return;
  const playerChapter = chapterFor(moving ? state.position+1 : state.position);
  const page=unit.pages[visibleChapter];
  $('#map-world').classList.toggle('world-overview',overview);
  $('#world-overview').hidden=!overview;
  $('#world-overview').innerHTML=unit.zones.map((zone,i)=>`<button class="zone-marker zone-${i}" data-zone="${i}" ${!zone.count||moving?'disabled':''}><img src="${zone.image}" alt=""/><span><small>ZONA ${i+1}</small><strong>${zone.name}</strong><em>${zone.count?`${zone.count} desafíos · ${zone.pageCount} ${zone.pageCount===1?'página':'páginas'}`:'Sin desafíos con esta cantidad'}</em><b>${zone.count?'Explorar zona →':'Zona sin actividades'}</b></span></button>`).join('');
  $('#chapter-nav').hidden=false;
  $('#chapter-nav').innerHTML=unit.chapters.map((name,i)=> {
    const p=unit.pages[i],size=p.end-p.start+1;
    const solved=state.completed.filter(id=>id<=mainCount&&chapterFor(id)===i).length;
    return `<button data-chapter="${i}" ${moving?'disabled':''} aria-pressed="${!overview&&visibleChapter===i}"><span class="chapter-number">${String(p.zone+1).padStart(2,'0')}</span><span><strong>${name}</strong><small>${p.start}–${p.end} · ${solved}/${size} resueltos${playerChapter===i?' · Estás aquí':''}</small></span><span class="chapter-arrow">${solved===size?'✓':'→'}</span></button>`;
  }).join('');
  $('#chapter-context').hidden=false;
  $('#chapter-context').innerHTML=`<span><b>${overview?'VISTA GENERAL':`ZONA ${page.zone+1} · PÁGINA ${page.part}`}</b> · ${overview?`${mainCount} principales + 2 de apoyo`:`Desafíos ${page.start}–${page.end}`}</span><div><button id="show-overview" ${overview?'hidden':''}>Mapa general</button><button id="back-to-player" ${!overview&&visibleChapter===playerChapter?'hidden':''}>Ir a mi desafío ↩</button></div>`;
  $('#back-to-player').addEventListener('click',()=>{overview=false;visibleChapter=playerChapter;selected=state.position||1;render();});
  $('#show-overview').addEventListener('click',()=>{overview=true;render();});
  $('#explorer').style.visibility=!overview&&visibleChapter===playerChapter?'visible':'hidden';
  $('.map-subtitle').textContent=overview?'VISTA GENERAL DEL MUNDO':unit.chapters[visibleChapter].toUpperCase();
  const worldImage=$('.world-image');
  const nextImage=overview?unit.generalImage:unit.chapterImages[visibleChapter];
  if(!worldImage.src.endsWith(nextImage)) {
    worldImage.src=nextImage;
  }
  worldImage.alt=overview?'Vista general del mundo desértico. Elige una de sus tres zonas.':`Zona ${page.zone+1}: ${unit.chapters[visibleChapter]}, mapa pixel art del desierto.`;
}
$('#world-overview').addEventListener('click',event=>{
  const zone=event.target.closest('[data-zone]');
  if(!zone||moving)return;
  overview=false;visibleChapter=unit.zones[Number(zone.dataset.zone)].firstPage;selected=unit.pages[visibleChapter].start;render();
});
$('#chapter-nav').addEventListener('click',event=>{
  const button=event.target.closest('[data-chapter]');
  if(!button||moving) return;
  overview=false;
  visibleChapter=Number(button.dataset.chapter);
  selected=visibleChapter===chapterFor(state.position)?state.position||1:unit.pages[visibleChapter].start;
  render();
});
function reactNode(id, reaction='hit') {
  const node = $(`[data-id="${id}"]`);
  if (!node) return;
  node.classList.add(reaction);
  setTimeout(() => node.classList.remove(reaction), 600);
}
function drawRoute() {
  const destination = moving ? state.position + 1 : Math.max(1,state.position);
  if(unit.segmented && chapterFor(destination)!==visibleChapter) { $('#route-layer').innerHTML=''; return; }
  const d = ROADS[destination].map(([x,y],i) => `${i?'L':'M'}${x},${y}`).join(' ');
  $('#route-layer').innerHTML = `<path class="route-bed" d="${d}"/><path class="route-light" d="${d}"/>`;
  $('#route-layer').classList.toggle('is-walking',moving);
}
function leaveFootstep(point) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const puff = document.createElement('i');
  puff.className = 'walk-puff';
  puff.style.left = `${point[0]}%`; puff.style.top = `${point[1]}%`;
  $('#walk-effects').append(puff);
  setTimeout(() => puff.remove(),700);
}
function showEncounter(c, focus=false) {
  const status = getStatus(c);
  const past = !c.optional && c.id < state.position;
  const locked = isLocked(c);
  const walkingNext = !c.optional && c.id === state.position + 1 && canAdvance(state.position,state.completed);
  const action = locked ? `Completa el desafío ${c.id - 1}` : past ? 'Desafío completado' : walkingNext ? 'Caminar hasta aquí →' : c.recovery ? 'Recuperar una vida →' : c.optional ? 'Jugar bonus →' : 'Entrar al desafío →';
  const panel = $('#encounter');
  panel.innerHTML = `<button class="encounter-close" aria-label="Cerrar detalle del mapa">×</button><span class="encounter-kicker">${statusLabels[status].toUpperCase()} · DESAFÍO ${String(c.id).padStart(2,'0')}</span><h3>${c.title}</h3><div class="encounter-meta">${c.type} · ${c.minutes} min · +${c.xp} XP</div><button class="encounter-action" ${locked||past?'disabled':''}>${action}</button>`;
  panel.style.setProperty('--encounter-x',`${c.x}%`);
  panel.hidden = false;
  const mapHeight = $('#map-world').clientHeight;
  const nodeTop = c.y / 100 * mapHeight;
  const viewportTop=unit.vertical?$('#map-viewport').scrollTop:0;
  const aboveTop = nodeTop - (unit.vertical?65:mapHeight*.09) - panel.offsetHeight;
  const below = aboveTop < viewportTop+8;
  const preferredTop = below ? nodeTop + (unit.vertical?25:mapHeight*.05) : aboveTop;
  const bottomLimit=unit.vertical?Math.min(mapHeight,viewportTop+$('#map-viewport').clientHeight):mapHeight;
  panel.classList.toggle('below',below);
  panel.style.top = `${Math.max(viewportTop+8,Math.min(bottomLimit-panel.offsetHeight-8,preferredTop))}px`;
  panel.style.translate = '-50% 0';
  $('#map-world').classList.add('encounter-open');
  $('.encounter-close').addEventListener('click', () => { closeEncounter(); $(`[data-id="${c.id}"]`).focus({preventScroll:true}); });
  $('.encounter-action').addEventListener('click', async () => {
    closeEncounter();
    if (walkingNext) return advanceExplorer();
    startActivity(c);
  });
  if (focus) (locked||past ? $('.encounter-close') : $('.encounter-action')).focus({preventScroll:true});
}
$('#map-world').addEventListener('click', event => {
  if (!event.target.closest('.map-node, .encounter')) closeEncounter();
});
window.addEventListener('resize', closeEncounter);

function rewardEffect(c) {
  const effect = document.createElement('span');
  effect.className = `map-reward ${unit.collectibleClass}`;
  effect.style.left = `${c.x}%`; effect.style.top = `${c.y}%`;
  effect.setAttribute('aria-hidden','true');
  $('#world-effects').append(effect);
  effect.addEventListener('animationend', () => effect.remove(), {once:true});
  setTimeout(() => effect.remove(), 1800);
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { storageAvailable = false; }
  if (!storageAvailable) $('.save-status').innerHTML = '<span></span> Progreso disponible durante esta sesión';
}
function isLocked(c) { return !c.optional && c.id > nextChallenge(state.completed); }
function getStatus(c) { return c.recovery && state.lives < 5 ? 'recovery' : state.completed.includes(c.id) ? 'completed' : isLocked(c) ? 'locked' : c.recovery ? 'recovery' : c.optional ? 'bonus' : 'available'; }
const statusLabels = { completed: 'Completado', locked: 'Bloqueado', recovery: 'Recuperar vida', bonus: 'Bonus disponible', available: 'Disponible' };
function playTone(success = false) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    (success ? [523, 659, 784, 1047] : [660]).forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'square'; oscillator.frequency.value = frequency;
      oscillator.connect(gain); gain.connect(audioContext.destination);
      const start = audioContext.currentTime + i * .1;
      gain.gain.setValueAtTime(.035, start); gain.gain.exponentialRampToValueAtTime(.001, start + .13);
      oscillator.start(start); oscillator.stop(start + .14);
    });
  } catch { /* Los efectos de sonido son opcionales. */ }
}
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show'); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000); }
function placeExplorer(point) {
  avatarPoint = point;
  $('#explorer').style.left = `${point[0]}%`;
  $('#explorer').style.top = `${point[1]}%`;
  if(unit.vertical&&moving&&cameraFollowing)focusCamera(point);
}

async function advanceExplorer() {
  if (moving || !canAdvance(state.position, state.completed)) return;
  closeEncounter();
  const destination = state.position + 1;
  moving = true;
  selected = destination;
  if(unit.vertical){cameraFollowing=true;$('#follow-player').setAttribute('aria-pressed','true');}
  if(unit.segmented) {
    overview=false;
    const crossing=chapterFor(destination)!==chapterFor(state.position);
    visibleChapter=chapterFor(destination);
    if(crossing) {
      $('#chapter-transition').hidden=false;
      $('#chapter-transition').innerHTML=`<span>${unit.pages[visibleChapter].zone===unit.pages[chapterFor(state.position)].zone?'SIGUIENTE PÁGINA DE LA ZONA':'ZONA COMPLETADA'}</span><strong>${unit.chapters[visibleChapter]}</strong><small>Continuamos con el desafío ${destination}</small>`;
      await new Promise(resolve=>setTimeout(resolve,1100));
      $('#chapter-transition').hidden=true;
      placeExplorer(ROADS[destination][0]);
    }
  }
  render();
  $('#explorer').classList.add('walking');
  $('#explorer').dataset.destination = destination;
  $('.explorer-label').textContent = `RUMBO AL DESAFÍO ${destination}`;
  $('.map-hint-text').textContent = `Caminando hacia el desafío ${destination}…`;
  if (!$('.map-panel').classList.contains('expanded')) (unit.vertical?$('#map-viewport'):$('#map-world')).scrollIntoView({ behavior: 'smooth', block: 'center' });
  const route = measureRoute(ROADS[destination],unit.worldWidth,unit.worldHeight);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Constant ground speed, including bends. Frame deltas are capped so returning
  // from a background tab continues the walk instead of teleporting to the end.
  const duration = reducedMotion ? 0 : Math.max(1200, route.distance / 120 * 1000);
  await new Promise(resolve => {
    let elapsed = 0;
    let previousTime;
    let lastFootstep = -200;
    function step(time) {
      if (previousTime !== undefined) elapsed += Math.min(64, time - previousTime);
      previousTime = time;
      const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      const point = pointOnRoute(route, progress);
      const dx = point[0] - avatarPoint[0];
      if (Math.abs(dx) > .001) $('#explorer').style.setProperty('--facing', dx < 0 ? -1 : 1);
      placeExplorer(point);
      if (elapsed-lastFootstep > 180) { leaveFootstep(point); lastFootstep=elapsed; }
      if (progress < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
  state.position = destination;
  moving = false;
  $('#explorer').classList.remove('walking');
  delete $('#explorer').dataset.destination;
  persist();
  render();
  $('#explorer').classList.add('arrived');
  setTimeout(() => $('#explorer').classList.remove('arrived'),550);
  reactNode(destination,'arrival');
  if (!$('.map-panel').classList.contains('expanded')) showEncounter(challenges.find(c=>c.id===destination));
  toast(`Llegaste al desafío ${destination}. ¡Ya puedes iniciarlo!`);
}

function render() {
  closeEncounter();
  $('#hearts').innerHTML = Array.from({ length: 5 }, (_, i) => icon('heart', i < state.lives ? '' : 'empty')).join('');
  $('#hearts').setAttribute('aria-label', `${state.lives} de 5 vidas`);
  $('#xp-count').textContent = state.xp.toLocaleString('es-AR');
  $('#activity-lives').textContent = `♥ ${state.lives} / 5`;
  $('#activity-lives').setAttribute('aria-label',`${state.lives} de 5 vidas`);
  $('#activity-xp').textContent = `${state.xp.toLocaleString('es-AR')} XP`;
  $('#map-life-count').innerHTML=Array.from({length:5},(_,i)=>icon('heart',i<state.lives?'':'empty')).join('');
  $('#map-life-count').setAttribute('aria-label',`${state.lives} de 5 vidas`);
  $('#map-xp-count').textContent=`${state.xp.toLocaleString('es-AR')} XP`;
  $('#map-hud-progress').textContent=`${state.completed.filter(id=>id<=mainCount).length} / ${mainCount} desafíos`;
  $('#map-recovery').disabled = moving;
  $('#progress-count').textContent = state.completed.length;
  $('#progress-fill').style.width = `${state.completed.length / totalChallenges * 100}%`;
  $('.progress-track').setAttribute('aria-valuenow', state.completed.length);
  $('#progress-caption').textContent = state.completed.length === totalChallenges ? '¡Mundo completado! La aventura es tuya.' : state.completed.length ? '¡Vas muy bien! Cada paso cuenta.' : 'Tu primer paso te está esperando.';
  const collectionCount = state.completed.filter(id => id !== recoveryId).length;
  $('#collection-count').textContent = `${collectionCount} / ${totalChallenges - 1}`;
  $('#collection-label').textContent = unit.collectible;
  $('#collection-icon').className = `collectible ${unit.collectibleClass}`;
  $('#collection-note').textContent = unit.feature;
  $('#sound-button').setAttribute('aria-pressed', state.sound);
  $('#sound-button').setAttribute('aria-label', state.sound ? 'Desactivar efectos de sonido' : 'Activar efectos de sonido');
  $('#sound-button').title = $('#sound-button').getAttribute('aria-label');
  $('.sound-slash').hidden = state.sound;
  $('#map-nodes').innerHTML = challenges.filter(c=>!unit.segmented||c.optional||c.chapter===visibleChapter).map(c => {
    const status = getStatus(c);
    const available = status==='available';
    return `<button class="map-node ${status} ${!c.optional && c.id === state.position && !moving ? 'player-here' : ''} ${selected === c.id ? 'selected' : ''}" style="--x:${c.x};--y:${c.y}" data-id="${c.id}" aria-label="Desafío ${c.id}: ${c.title}. ${statusLabels[status]}" aria-pressed="${selected === c.id}" aria-controls="encounter"><span class="object-ground" aria-hidden="true"></span>${nodeArt(unit.theme,c,status,mainCount)}<span class="node-sign" aria-hidden="true">${c.recovery?'♥':c.optional?'★':String(c.id).padStart(2,'0')}</span>${available&&!moving?`<span class="node-invitation" aria-hidden="true">${nodeVerb(unit.theme,status)}</span>`:''}</button>`;
  }).join('');
  placeExplorer(avatarPoint);
  $('#explorer').dataset.position = state.position;
  if (!moving) {
    $('.explorer-label').textContent = state.position === 0 ? 'TU AVENTURA EMPIEZA AQUÍ' : `DESAFÍO ${state.position}`;
    $('.map-hint-text').textContent = state.position === 0 ? 'Comienza tu aventura: salida → desafío 1' : 'Completa tu desafío para caminar al siguiente';
  }
  renderDetail();
  drawRoute();
  renderChapters();
  if(unit.segmented && visibleChapter!==chapterFor(moving?state.position+1:state.position)) $('.map-hint-text').textContent='Explorando otro tramo · Tu personaje conserva su posición';
  if(overview) $('.map-hint-text').textContent='Un mismo mundo · Elige una zona para ver sus desafíos';
}
function renderDetail() {
  const c = challenges.find(c => c.id === selected);
  const status = getStatus(c);
  const locked = status === 'locked';
  const pastChallenge = !c.optional && c.id < state.position;
  const awaitingWalk = !c.optional && c.id === state.position + 1 && canAdvance(state.position, state.completed);
  const actionDisabled = moving || locked || pastChallenge;
  const actionLabel = moving ? 'Caminando…' : locked ? 'Desafío bloqueado' : pastChallenge ? 'Desafío ya recorrido' : awaitingWalk ? (state.position === 0 ? 'Comenzar aventura' : `Caminar al desafío ${c.id}`) : status === 'completed' ? 'Repasar desafío' : 'Iniciar desafío';
  $('#challenge-card').innerHTML = `<div class="challenge-topline"><span>DESAFÍO ${String(c.id).padStart(2, '0')}</span><span class="status-tag" ${locked ? 'style="color:#89818b;background:#eeebed"' : ''}>${statusLabels[status]}</span></div>
    <div class="challenge-art"><button class="pixel-block theme-treasure" id="treasure-block" aria-label="${unit.theme === 'desert' ? 'Golpear bloque sorpresa' : unit.theme === 'jungle' ? 'Golpear barril' : 'Encender vela'}"><span>${c.recovery ? '♥' : c.optional ? '★' : unit.symbol}</span></button><span class="treasure-particle ${unit.collectibleClass}" aria-hidden="true"></span></div>
    <div class="challenge-body"><div class="challenge-kicker">${c.recovery ? 'UNA NUEVA OPORTUNIDAD' : c.optional ? 'FUERA DEL CAMINO' : unit.subtitle.toUpperCase()}</div><h2>${c.title}</h2><p class="challenge-description">${c.description}</p>
    <div class="challenge-meta"><div class="meta-item"><span>Tipo de desafío</span><strong>⌘ &nbsp;${c.type}</strong></div><div class="meta-item"><span>Dificultad</span><strong><span class="difficulty-bars" aria-hidden="true"><i></i><i></i><i></i></span>${c.difficulty}</strong></div><div class="meta-item"><span>Duración estimada</span><strong>◷ &nbsp;${c.minutes} minutos</strong></div><div class="meta-item"><span>En esta unidad</span><strong>${c.optional ? '☆ &nbsp;Opcional' : '⚑ &nbsp;Obligatorio'}</strong></div></div>
    <div class="reward-row"><span>Tu recompensa</span><strong>${icon(c.recovery ? 'heart' : 'star')} ${c.recovery ? (state.lives < 5 ? '+1 VIDA' : 'VIDAS COMPLETAS') : ''}${c.recovery && state.completed.includes(c.id) ? '' : `${c.recovery ? ' · ' : ''}+${c.xp} XP`}</strong></div>
    <button class="primary-button" id="start-challenge" ${actionDisabled ? 'disabled' : ''}>${actionLabel} <span aria-hidden="true">${locked ? '▣' : '→'}</span></button><p class="button-caption">${moving ? 'Sigue a tu explorador por el camino.' : locked ? `Completa el desafío ${c.id - 1} para desbloquearlo` : pastChallenge ? 'Tu explorador continúa hacia adelante.' : c.optional ? 'Actividad de apoyo: conservas tu lugar en el camino.' : awaitingWalk ? 'Un solo camino. Un desafío a la vez.' : 'Completa este desafío para dar el próximo paso.'}</p></div>`;
  $('#start-challenge').addEventListener('click', () => awaitingWalk ? advanceExplorer() : startActivity(c));
  $('#treasure-block').addEventListener('click', () => {
    const art = $('.challenge-art');
    if (art.classList.contains('bumped')) return;
    art.classList.add('bumped'); playTone();
    toast(`Completa este desafío para conseguir ${unit.collectibleSingular === 'reliquia' ? 'una reliquia' : unit.collectibleSingular === 'banana' ? 'una banana' : 'una moneda'}.`);
    setTimeout(() => art.classList.remove('bumped'), 800);
  });
}
$('#map-nodes').addEventListener('click', async event => {
  const node = event.target.closest('[data-id]');
  if (!node) return;
  if (moving) { toast('Tu explorador está caminando. Espera a que llegue.'); return; }
  selected = Number(node.dataset.id); playTone(); render();
  const c = challenges.find(c=>c.id===selected);
  reactNode(c.id,isLocked(c)?'denied':'hit');
  showEncounter(c,true);
});
$('#find-life').addEventListener('click', () => { if (moving) return; selected = recoveryId; render(); if(unit.vertical){cameraFollowing=false;$('#follow-player').setAttribute('aria-pressed','false');const c=challenges.find(c=>c.recovery);focusCamera([c.x,c.y],'smooth');} else $('#challenge-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); $('#start-challenge').focus({ preventScroll: true }); });
$('#sound-button').addEventListener('click', () => { state.sound = !state.sound; persist(); render(); playTone(); });
function openRecovery() {
  if(moving)return;
  if($('#activity-dialog').open){$('#activity-dialog').close('recovery');return;}
  selected=recoveryId;render();startActivity(challenges.find(c=>c.recovery));
}
$('#map-recovery').addEventListener('click',openRecovery);
function setMapExpanded(expanded) {
  closeEncounter();
  $('.map-panel').classList.toggle('expanded', expanded);
  document.body.classList.toggle('map-only', expanded);
  $('#expand-button').setAttribute('aria-label', expanded ? 'Reducir mapa' : 'Ampliar mapa');
  $('#expand-button').title = expanded ? 'Reducir mapa' : 'Ampliar mapa';
  $('#expand-button').textContent = expanded ? '×' : '⛶';
  document.body.style.overflow = expanded ? 'hidden' : '';
}
async function leaveMap() {
  if (document.fullscreenElement) await document.exitFullscreen();
  setMapExpanded(false);
  $('#expand-button').focus({preventScroll:true});
}
async function toggleMap() {
  if ($('.map-panel').classList.contains('expanded')) return leaveMap();
  setMapExpanded(true);
  try {
    await $('.map-panel').requestFullscreen({navigationUI:'hide'});
    $('.map-panel').dataset.displayMode = 'native-fullscreen';
  } catch {
    // Embedded browsers may allow viewport expansion only.
    $('.map-panel').dataset.displayMode = 'viewport-fullscreen';
  }
  $('#exit-map').focus({preventScroll:true});
}
$('#expand-button').addEventListener('click', toggleMap);
$('#exit-map').addEventListener('click', leaveMap);
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) setMapExpanded(false); });
document.addEventListener('keydown', event => {
  if(event.key!=='Escape') return;
  // Let the modal handle Escape without dismissing the map underneath it.
  if(document.querySelector('dialog[open]')) return;
  if(!$('#encounter').hidden) { closeEncounter(); $(`[data-id="${selected}"]`).focus({preventScroll:true}); }
  else if($('.map-panel').classList.contains('expanded')) leaveMap();
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
function startActivity(c) {
  if (moving || isLocked(c) || (!c.optional && c.id !== state.position)) return;
  closeEncounter();
  if (state.lives === 0 && !c.recovery && !state.completed.includes(c.id)) { openRecovery(); return; }
  const [question, options, correct, explanation] = unit.questions[c.id];
  let answer = null;
  let resolved = false;
  let attempted = false;
  const previouslyCompleted = state.completed.includes(c.id);
  const review = previouslyCompleted && !(c.recovery && state.lives < 5);
  $('#activity-content').innerHTML = `<span class="modal-kicker">${review ? 'MODO REPASO' : `DESAFÍO ${String(c.id).padStart(2, '0')}`} · ACTIVIDAD</span><h2>${c.title}</h2><p>${question}</p><div class="answer-list" role="group" aria-label="Opciones de respuesta">${options.map((option, i) => `<button class="answer-option" data-answer="${i}" aria-pressed="false">${String.fromCharCode(65 + i)}. &nbsp;${option}</button>`).join('')}</div><div id="answer-feedback" aria-live="polite"></div><button id="check-answer" class="primary-button" disabled>Comprobar respuesta →</button><p class="button-caption">${review ? 'Este repaso no modifica tus recompensas.' : c.recovery ? 'Este desafío no consume vidas.' : 'Una respuesta incorrecta consume 1 vida por intento de actividad.'}</p>`;
  $('#activity-content').querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
    if (resolved) return;
    answer = Number(button.dataset.answer);
    $('#activity-content').querySelectorAll('[data-answer]').forEach(b => b.setAttribute('aria-pressed', b === button));
    $('#check-answer').disabled = false;
  }));
  $('#check-answer').addEventListener('click', () => {
    if (answer === null || resolved) return;
    if (answer !== correct) {
      if (!attempted && !review && !c.recovery) { state.lives = Math.max(0, state.lives - 1); persist(); render(); }
      attempted = true;
      $('#answer-feedback').innerHTML = `<div class="answer-feedback error">Todavía no. ${state.lives === 0 && !c.recovery && !review ? 'Te quedaste sin vidas. Completa el repaso de recuperación para continuar.' : 'Vuelve a leer la consigna y prueba otra respuesta.'}</div>`;
      if (state.lives === 0 && !c.recovery && !review) {
        resolved = true; $('#check-answer').textContent = 'Ir a recuperar una vida →';
        $('#check-answer').addEventListener('click', openRecovery, { once: true });
      }
      return;
    }
    resolved = true;
    const recoveredLife = !review && c.recovery && state.lives < 5;
    if (!review) { if (!previouslyCompleted) { state.completed.push(c.id); state.xp += c.xp; } if (c.recovery) state.lives = Math.min(5, state.lives + 1); persist(); render(); }
    playTone(true);
    $('#activity-content').innerHTML = `<div class="reward-scene" aria-hidden="true"><span class="${c.recovery ? 'reward-heart' : `collectible ${unit.collectibleClass}`}">${c.recovery ? '♥' : ''}</span><span class="reward-spark">✧</span><span class="reward-spark">✧</span></div><span class="modal-kicker">${review ? '¡CONOCIMIENTO REFORZADO!' : c.recovery ? '¡DESAFÍO COMPLETADO!' : unit.rewardTitle}</span><h2>${c.id === mainCount ? unit.finish : c.recovery ? 'Un impulso para seguir.' : 'Un paso más en tu aventura.'}</h2><p>${explanation}</p>${!review && !c.recovery ? `<p class="collection-award">+1 ${unit.collectibleSingular} para tu colección</p>` : ''}${review ? '' : `<div class="reward-row"><span>Recompensa obtenida</span><strong>${previouslyCompleted ? '' : `+${c.xp} XP`}${recoveredLife ? `${previouslyCompleted ? '' : ' · '}+1 VIDA` : ''}</strong></div>`}<button id="back-map" class="primary-button">Volver al mapa →</button>`;
    $('#back-map').textContent = !c.optional && c.id < mainCount ? `Continuar al desafío ${c.id + 1} →` : 'Volver al camino →';
    $('#back-map').addEventListener('click', () => { $('#activity-dialog').close(); if (!review) rewardEffect(c); });
    $('#back-map').focus();
  });
  $('#activity-dialog').returnValue='';
  $('#activity-dialog').showModal();
}
$('#course-button').addEventListener('click', () => {
  $('#info-content').innerHTML = `<span class="modal-kicker">MI CURSO · 3 MUNDOS</span><h2>Introducción a la programación</h2><p>Del desierto a la selva y hasta la fortaleza. Cada unidad tiene su propia aventura.</p>${Object.values(UNITS).map(world => `<a class="course-unit" href="?unit=${world.id}"><strong>${String(world.id).padStart(2,'0')}</strong><div><b>${world.title}</b><p>${world.subtitle}${world.id === unit.id ? ` · ${state.completed.length} / ${totalChallenges} completados` : ''}</p></div></a>`).join('')}<button class="primary-button" id="continue-unit">Continuar mi aventura →</button>`;
  $('#continue-unit').addEventListener('click', () => $('#info-dialog').close()); $('#info-dialog').showModal();
});
$('#profile-button').addEventListener('click', () => {
  $('#info-content').innerHTML = `<span class="modal-kicker">TU PERFIL DE EXPLORADOR</span><h2>¡La aventura sigue!</h2><p>Estás explorando ${unit.title.toLowerCase()}, un desafío a la vez.</p><div class="profile-data"><div><strong>${state.lives}/5</strong><span>vidas</span></div><div><strong>7</strong><span>días de racha</span></div><div><strong>${state.xp.toLocaleString('es-AR')}</strong><span>XP de esta unidad</span></div></div><p>Cada unidad conserva su avance y sus recompensas en este navegador.</p>`;
  $('#info-dialog').showModal();
});
// Every dismissal of a completed activity (button, close icon, Escape or
// backdrop) uses the same sequential transition. Selection never moves us.
$('#activity-dialog').addEventListener('close', () => {
  if($('#activity-dialog').returnValue==='recovery'){openRecovery();return;}
  if (state.position > 0 && canAdvance(state.position, state.completed)) advanceExplorer();
  else { if (!(selected === recoveryId && state.lives === 0)) selected = state.position || 1; render(); }
});
applyUnit();
render();
if (state.position > 0 && canAdvance(state.position, state.completed)) advanceExplorer();
if (!storageAvailable) persist();

