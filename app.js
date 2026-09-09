import { nextChallenge as nextInJourney, canAdvance as canAdvanceJourney, measureRoute, pointOnRoute } from './journey.js';
import { UNITS } from './worlds.js';
const unit = UNITS[Number(new URLSearchParams(location.search).get('unit'))] || UNITS[1];
const { stops: STOPS, roads: ROADS, mainCount } = unit;
const nextChallenge = completed => nextInJourney(completed, mainCount);
const canAdvance = (position, completed) => canAdvanceJourney(position, completed, mainCount);
const $ = (selector) => document.querySelector(selector);
const icon = (name, className = '') => `<svg class="${className}" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
const desertChallenges = [
  { id: 1, x: 16.45, y: 85.35, title: 'Tu primer paso', type: 'Teórico', difficulty: 'Inicial', minutes: 5, xp: 50, description: 'Descubre qué es programar y cómo dar instrucciones a una computadora.' },
  { id: 2, x: 19.9, y: 61.55, title: 'Piensa como un explorador', type: 'Teórico', difficulty: 'Inicial', minutes: 6, xp: 75, description: 'Divide un problema en pequeños pasos para encontrar una solución.' },
  { id: 3, x: 11.4, y: 43.15, title: 'Un camino, un algoritmo', type: 'Práctico', difficulty: 'Inicial', minutes: 8, xp: 100, description: 'Ordena instrucciones y construye tu primer algoritmo.' },
  { id: 4, x: 28.55, y: 20.7, title: 'Tesoros en variables', type: 'Teórico', difficulty: 'Inicial', minutes: 7, xp: 100, description: 'Aprende a guardar información y a darle un nombre a cada dato.' },
  { id: 5, x: 49.4, y: 21.65, title: 'Cada dato en su lugar', type: 'Práctico', difficulty: 'Inicial', minutes: 8, xp: 100, description: 'Reconoce números, textos y valores lógicos en tu aventura.' },
  { id: 6, x: 62.65, y: 29.65, title: 'Operaciones en el oasis', type: 'Práctico', difficulty: 'Intermedia', minutes: 10, xp: 125, description: 'Combina valores y resuelve expresiones para cruzar el oasis.' },
  { id: 7, x: 36.1, y: 62.4, title: 'Preguntas con dos respuestas', type: 'Teórico', difficulty: 'Intermedia', minutes: 8, xp: 125, description: 'Explora las comparaciones y descubre el poder de verdadero y falso.' },
  { id: 8, x: 64.2, y: 62.7, title: 'El poder de las decisiones', type: 'Práctico', difficulty: 'Intermedia', minutes: 10, xp: 150, description: 'No todos los caminos llevan al mismo lugar. Aprende a usar condicionales y elige tu próximo paso.' },
  { id: 9, x: 80.25, y: 62.7, title: 'Repetir para avanzar', type: 'Práctico', difficulty: 'Intermedia', minutes: 12, xp: 175, description: 'Domina los bucles y repite acciones para llegar más lejos con menos instrucciones.' },
  { id: 10, x: 93.55, y: 26.2, title: 'El castillo del conocimiento', type: 'Proyecto', difficulty: 'Avanzada', minutes: 20, xp: 300, description: 'Pon a prueba todo lo aprendido y abre las puertas del castillo con tu algoritmo final.' },
  { id: 11, x: 25.1, y: 51.4, title: 'El tesoro escondido', type: 'Bonus', difficulty: 'Intermedia', minutes: 5, xp: 100, optional: true, description: 'Sal del camino principal y resuelve un acertijo lógico. ¡Hay XP extra esperando por ti!' },
  { id: 12, x: 88.3, y: 69.5, title: 'Un corazón para seguir', type: 'Recuperación', difficulty: 'Inicial', minutes: 3, xp: 25, optional: true, recovery: true, description: 'Haz una pausa en la tubería de recuperación. Repasa lo aprendido y gana una vida para seguir explorando.' },
];
const challenges = unit.challenges || desertChallenges;
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
let moving = false;
let avatarPoint = [...STOPS[state.position]];
let toastTimer;
let audioContext;
function applyUnit() {
  document.body.dataset.theme = unit.theme;
  document.title = `${unit.title} · ELearningPlatform`;
  $('.world-image').src = unit.image;
  $('.world-image').alt = unit.alt;
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
  $('#unit-switcher').innerHTML = Object.values(UNITS).map(world => `<a class="unit-link ${world.id === unit.id ? 'active' : ''}" href="?unit=${world.id}" ${world.id === unit.id ? 'aria-current="page"' : ''}><img src="${world.image}" alt=""/><span><small>UNIDAD ${String(world.id).padStart(2,'0')} · ${world.inspiration}</small><strong>${world.title}</strong></span><span class="unit-link-arrow">↗</span></a>`).join('');
}

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
}

async function advanceExplorer() {
  if (moving || !canAdvance(state.position, state.completed)) return;
  const destination = state.position + 1;
  moving = true;
  selected = destination;
  render();
  $('#explorer').classList.add('walking');
  $('#explorer').dataset.destination = destination;
  $('.explorer-label').textContent = `RUMBO AL DESAFÍO ${destination}`;
  $('.map-hint-text').textContent = `Caminando hacia el desafío ${destination}…`;
  if (!$('.map-panel').classList.contains('expanded')) $('#map-world').scrollIntoView({ behavior: 'smooth', block: 'center' });
  const route = measureRoute(ROADS[destination]);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Constant ground speed, including bends. Frame deltas are capped so returning
  // from a background tab continues the walk instead of teleporting to the end.
  const duration = reducedMotion ? 0 : Math.max(1200, route.distance / 120 * 1000);
  await new Promise(resolve => {
    let elapsed = 0;
    let previousTime;
    function step(time) {
      if (previousTime !== undefined) elapsed += Math.min(64, time - previousTime);
      previousTime = time;
      const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      const point = pointOnRoute(route, progress);
      const dx = point[0] - avatarPoint[0];
      if (Math.abs(dx) > .001) $('#explorer').style.setProperty('--facing', dx < 0 ? -1 : 1);
      placeExplorer(point);
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
  toast(`Llegaste al desafío ${destination}. ¡Ya puedes iniciarlo!`);
}

function render() {
  $('#hearts').innerHTML = Array.from({ length: 5 }, (_, i) => icon('heart', i < state.lives ? '' : 'empty')).join('');
  $('#hearts').setAttribute('aria-label', `${state.lives} de 5 vidas`);
  $('#xp-count').textContent = state.xp.toLocaleString('es-AR');
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
  $('#map-nodes').innerHTML = challenges.map(c => {
    const status = getStatus(c);
    const symbol = status === 'completed' ? icon('check') : c.recovery ? icon('heart') : c.optional ? (unit.id === 1 ? icon('star') : `<span class="node-prize ${unit.collectibleClass}" aria-hidden="true"></span>`) : c.id;
    return `<button class="map-node ${status} ${selected === c.id ? 'selected' : ''}" style="--x:${c.x};--y:${c.y}" data-id="${c.id}" aria-label="Desafío ${c.id}: ${c.title}. ${statusLabels[status]}" aria-pressed="${selected === c.id}">${symbol}<span class="node-tooltip">${c.id}. ${c.title}</span></button>`;
  }).join('');
  placeExplorer(avatarPoint);
  $('#explorer').dataset.position = state.position;
  if (!moving) {
    $('.explorer-label').textContent = state.position === 0 ? 'TU AVENTURA EMPIEZA AQUÍ' : `DESAFÍO ${state.position}`;
    $('.map-hint-text').textContent = state.position === 0 ? 'Comienza tu aventura: salida → desafío 1' : 'Completa tu desafío para caminar al siguiente';
  }
  renderDetail();
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
  if (selected === state.position + 1 && canAdvance(state.position, state.completed)) { advanceExplorer(); return; }
  if ($('.map-panel').classList.contains('expanded')) {
    const c = challenges.find(c => c.id === selected);
    if (isLocked(c) || (!c.optional && c.id !== state.position)) { toast(`Desafío ${c.id}: sigue el recorrido en orden.`); return; }
    await leaveMap(); startActivity(c); return;
  }
  $(`[data-id="${selected}"]`).focus({ preventScroll: true });
  if (window.innerWidth <= 850) $('#challenge-card').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
});
$('#find-life').addEventListener('click', () => { if (moving) return; selected = recoveryId; render(); $('#challenge-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); $('#start-challenge').focus({ preventScroll: true }); });
$('#sound-button').addEventListener('click', () => { state.sound = !state.sound; persist(); render(); playTone(); });
function setMapExpanded(expanded) {
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
document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('.map-panel').classList.contains('expanded')) leaveMap(); });
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
const questions = {
  1: ['¿Qué es un programa?', ['Una lista de instrucciones que una computadora puede ejecutar', 'Solo una imagen en la pantalla', 'Una pieza física de la computadora'], 0, 'Un programa es un conjunto de instrucciones que indica a la computadora qué hacer.'],
  2: ['Para resolver un problema complejo, conviene…', ['Escribir código sin planificar', 'Dividirlo en problemas más pequeños', 'Evitar comprobar el resultado'], 1, 'Dividir un problema en partes pequeñas facilita entenderlo y resolverlo.'],
  3: ['¿Qué caracteriza a un algoritmo?', ['Pasos ordenados para resolver un problema', 'Instrucciones elegidas al azar', 'Una única operación matemática'], 0, 'Un algoritmo define pasos ordenados y precisos para llegar a un resultado.'],
  4: ['¿Para qué sirve una variable?', ['Para decorar un programa', 'Para almacenar un dato con un nombre', 'Para cerrar una aplicación'], 1, 'Una variable permite guardar un valor y utilizarlo mediante su nombre.'],
  5: ['¿Cuál de estos valores es booleano?', ['"desierto"', '42', 'verdadero'], 2, 'Un booleano representa uno de dos valores: verdadero o falso.'],
  6: ['Si tienes 3 monedas y consigues 4 más, ¿qué expresión calcula el total?', ['3 + 4', '3 > 4', '3 − 4'], 0, 'El operador + suma ambos valores. El total es 7 monedas.'],
  7: ['¿Qué resultado tiene la comparación 5 > 3?', ['Falso', 'Verdadero', '5'], 1, '5 es mayor que 3, por lo tanto la comparación produce verdadero.'],
  8: ['La puerta se abre si monedas ≥ 10. Tienes 12 monedas. ¿Qué sucede?', ['La puerta permanece cerrada', 'La puerta se abre', 'Pierdes todas tus monedas'], 1, '12 es mayor o igual que 10. La condición se cumple y se ejecuta la acción: abrir la puerta.'],
  9: ['Debes recoger una moneda 5 veces. ¿Qué estructura te ayuda a repetir la acción?', ['Una variable de texto', 'Un comentario', 'Un bucle'], 2, 'Un bucle repite un conjunto de instrucciones; aquí, recoger una moneda cinco veces.'],
  10: ['Tu algoritmo inicia con 0 monedas y suma 2 en cada una de 5 vueltas. Si el castillo abre con 10 monedas, ¿puedes entrar?', ['Sí, terminas con 10 monedas', 'No, terminas con 5 monedas', 'No, terminas con 2 monedas'], 0, 'El bucle suma 2 cinco veces: 2 × 5 = 10. La condición monedas ≥ 10 es verdadera. ¡El castillo se abre!'],
  11: ['El camino sigue la secuencia 2, 4, 8, 16… ¿Qué número viene después?', ['18', '24', '32'], 2, 'Cada número es el doble del anterior: 16 × 2 = 32. ¡Encontraste el patrón!'],
  12: ['Repaso rápido: ¿qué estructura permite elegir un camino según una condición?', ['Un condicional (si / si no)', 'Un color de fondo', 'Un comentario'], 0, 'Un condicional evalúa una condición y permite ejecutar instrucciones diferentes según el resultado.'],
};
function startActivity(c) {
  if (moving || isLocked(c) || (!c.optional && c.id !== state.position)) return;
  if (state.lives === 0 && !c.recovery && !state.completed.includes(c.id)) { toast('Necesitas una vida. Completa el desafío de recuperación.'); selected = recoveryId; render(); return; }
  const [question, options, correct, explanation] = (unit.questions || questions)[c.id];
  let answer = null;
  let resolved = false;
  let attempted = false;
  const previouslyCompleted = state.completed.includes(c.id);
  const review = previouslyCompleted && !(c.recovery && state.lives < 5);
  $('#activity-content').innerHTML = `<span class="modal-kicker">${review ? 'MODO REPASO' : `DESAFÍO ${String(c.id).padStart(2, '0')}`} · ACTIVIDAD DE DEMOSTRACIÓN</span><h2>${c.title}</h2><p>${question}</p><div class="answer-list" role="group" aria-label="Opciones de respuesta">${options.map((option, i) => `<button class="answer-option" data-answer="${i}" aria-pressed="false">${String.fromCharCode(65 + i)}. &nbsp;${option}</button>`).join('')}</div><div id="answer-feedback" aria-live="polite"></div><button id="check-answer" class="primary-button" disabled>Comprobar respuesta →</button><p class="button-caption">${review ? 'Este repaso no modifica tus recompensas.' : c.recovery ? 'Este desafío no consume vidas.' : 'Una respuesta incorrecta consume 1 vida por intento de actividad.'}</p>`;
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
        $('#check-answer').addEventListener('click', () => { $('#activity-dialog').close(); selected = recoveryId; render(); }, { once: true });
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
  $('#activity-dialog').showModal();
}
$('#course-button').addEventListener('click', () => {
  $('#info-content').innerHTML = `<span class="modal-kicker">MI CURSO · 3 MUNDOS</span><h2>Introducción a la programación</h2><p>Del desierto a la selva y hasta la fortaleza. Cada unidad tiene su propia aventura.</p>${Object.values(UNITS).map(world => `<a class="course-unit" href="?unit=${world.id}"><strong>${String(world.id).padStart(2,'0')}</strong><div><b>${world.title}</b><p>${world.subtitle}${world.id === unit.id ? ` · ${state.completed.length} / ${totalChallenges} completados` : ''}</p></div></a>`).join('')}<button class="primary-button" id="continue-unit">Continuar mi aventura →</button>`;
  $('#continue-unit').addEventListener('click', () => $('#info-dialog').close()); $('#info-dialog').showModal();
});
$('#profile-button').addEventListener('click', () => {
  $('#info-content').innerHTML = `<span class="modal-kicker">TU PERFIL DE EXPLORADOR</span><h2>¡La aventura sigue!</h2><p>Estás explorando ${unit.title.toLowerCase()}, un desafío a la vez.</p><div class="profile-data"><div><strong>${state.lives}/5</strong><span>vidas</span></div><div><strong>7</strong><span>días de racha</span></div><div><strong>${state.xp.toLocaleString('es-AR')}</strong><span>XP de esta unidad</span></div></div><p>Perfil de demostración. Cada unidad conserva su avance y sus recompensas en este navegador.</p>`;
  $('#info-dialog').showModal();
});
// Every dismissal of a completed activity (button, close icon, Escape or
// backdrop) uses the same sequential transition. Selection never moves us.
$('#activity-dialog').addEventListener('close', () => {
  if (state.position > 0 && canAdvance(state.position, state.completed)) advanceExplorer();
  else { if (!(selected === recoveryId && state.lives === 0)) selected = state.position || 1; render(); }
});
applyUnit();
render();
if (state.position > 0 && canAdvance(state.position, state.completed)) advanceExplorer();
if (!storageAvailable) persist();

