// Small, original SVG game objects. Their silhouettes and materials identify
// each world; challenge numbers live on a secondary sign, not on the object.
const question = '<path d="M27 24h16v4h4v12h-4v4h-8v6h-7V39h8v-4h4v-5H27zm1 30h8v7h-8z" fill="#fff0b4" stroke="#915125" stroke-width="2"/>';
const mark = (name, x=25, y=33, size=22) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;filter:none" viewBox="0 0 24 24"><use href="#icon-${name}"/></svg>`;
const shadow = '<ellipse class="object-shadow" cx="36" cy="76" rx="25" ry="6" fill="#221828" opacity=".28"/>';
const seal = '<g class="seal-chain" fill="none" stroke="#aca2a5" stroke-width="4"><path d="m14 27 43 35M58 27 13 62" stroke="#392e32" stroke-width="7"/><path d="m14 27 43 35M58 27 13 62" stroke-dasharray="5 3"/><rect x="28" y="36" width="16" height="17" rx="2" fill="#a88246" stroke="#513924" stroke-width="2"/><path d="M33 34v-4h7v4"/><path d="M36 42v6" stroke="#513924"/></g>';

function block(status, final) {
  if (final) return `<g class="object-shell"><path d="M14 69h45v8H10v-4h4z" fill="#b2723d" stroke="#694528" stroke-width="2"/><path d="M28 13h5v56h-5z" fill="#fff1c4" stroke="#674528" stroke-width="2"/><path class="object-banner" d="M34 15h28v8H51v10H34z" fill="${status === 'completed' ? '#6bbc77' : '#ea6350'}" stroke="#743c36" stroke-width="2"/><path d="M21 65h19v7H21z" fill="#e1aa57"/><path d="m27 8 4-4 4 4-4 5z" fill="#ffd85d"/></g>`;
  const used = status === 'completed';
  return `<g class="object-shell"><path d="m10 24 10-9h43l-9 9z" fill="${used?'#c5aa75':'#fff1a1'}" stroke="#6a3d22" stroke-width="2"/><path d="m54 24 9-9v43l-9 11z" fill="${used?'#957447':'#cc7b25'}" stroke="#6a3d22" stroke-width="2"/><path d="M10 24h44v45H10z" fill="${used?'#ba915a':status==='locked'?'#dc9c39':'#ffc94b'}" stroke="#6a3d22" stroke-width="3"/><path d="M14 28h35v4H18v31h-4z" fill="${used?'#debd81':'#ffe890'}"/><path d="M49 32v32H18v-4h27V32z" fill="#b46d28"/><path d="M16 29h3v3h-3zm29 0h3v3h-3zm-29 31h3v3h-3zm29 0h3v3h-3z" fill="#6a3d22"/>${used?`<g class="resolved-symbol" color="#fff6cf">${mark('check',24,36,21)}</g>`:question}</g>${status==='locked'?seal:''}`;
}
function barrel(status, final, recovery=false) {
  const used=status==='completed';
  return `<g class="object-shell"><path d="M18 24h36l5 9 3 22-7 17H17l-7-17 3-22z" fill="${recovery?'#727e39':'#ad7038'}" stroke="#4d3421" stroke-width="3"/><path d="M22 27 18 54l4 16m9-43-2 43m12-43 2 43m7-43 6 27-5 16" fill="none" stroke="#754421" stroke-width="2"/><path d="m16 33 4-6h5l-5 25 3 15h-5l-5-15z" fill="#dea954"/><path d="M13 34h46v8H13zM12 58h48v8H12z" fill="${final?'#e4bf53':'#a1a19a'}" stroke="#4c4c3d" stroke-width="2"/><path d="M15 35h41v2H15zm0 24h41v2H15z" fill="#e5d8b1"/><g class="object-lid" ${used?'transform="translate(2,-10) rotate(-15 36 26)"':''}><ellipse cx="36" cy="25" rx="20" ry="8" fill="#d59e55" stroke="#52371f" stroke-width="3"/><ellipse cx="36" cy="25" rx="14" ry="4" fill="${used?'#664729':'#b67d3e'}"/><path d="M24 23h25m-23 4h21" stroke="#80532a" stroke-width="2"/></g><g color="${recovery?'#fa8b8e':used?'#e5f6b1':'#ffdf70'}">${mark(recovery?'heart':used?'check':'bolt',27,43,18)}</g>${final?'<path d="m22 15-2-11 10 6 6-9 7 9 10-6-3 11z" fill="#ffd35c" stroke="#815526" stroke-width="2"/>':''}</g>${status==='locked'?seal:''}`;
}
function portal(status, final) {
  const used=status==='completed';
  return `<g class="object-shell"><path d="M9 72h54v7H9zM14 64h44v9H14z" fill="#8b7799" stroke="#33283f" stroke-width="2"/><path d="M14 65V24l7-7V9h10V4h10v5h10v8l7 7v41H47V27l-7-6h-8l-7 6v38z" fill="#64516f" stroke="#2b2438" stroke-width="3"/><path d="M18 25h5v35h-5zM48 25h6v35h-6zM25 13h7v5h-7zm15 0h7v5h-7z" fill="#b7a0bb"/><path d="M25 64V30l7-8h8l7 8v34z" fill="#20182e"/><g class="portal-core"><path d="M28 60V32l6-6h4l6 6v28z" fill="${used?'#419aaf':status==='locked'?'#633351':'#d94d88'}"/><path d="M32 57V35l4-5 4 5v22z" fill="${used?'#b0f4ef':status==='locked'?'#9d5978':'#ffabc8'}"/><path d="M35 37h3v16h-3z" fill="#fff1e4"/></g><path class="portal-runes" d="m17 32 4 4-4 4m35-8-4 4 4 4M18 51h4m-2-2v4m30-2h4m-2-2v4" fill="none" stroke="${used?'#92e7e0':'#e6b073'}" stroke-width="2"/>${final?'<path d="M10 31 3 19v-8l14 9m45 11 7-12v-8L55 20" fill="#8a7295" stroke="#322739" stroke-width="2"/>':''}${used?`<g color="#defdff">${mark('check',30,43,13)}</g>`:''}</g>${status==='locked'?seal:''}`;
}
function bonus(theme) {
  if(theme==='desert') return `<g class="object-shell bonus-object"><path d="M10 69h52v7H10z" fill="#a76d34"/><g color="#ffdc45">${mark('star',13,13,46)}</g><path d="M28 30v7m14-7v7" stroke="#6c471f" stroke-width="3"/></g>`;
  if(theme==='jungle') return `<g class="object-shell bonus-object"><path d="M37 9v13m0-8 10-8" stroke="#577b32" stroke-width="5"/><path d="M31 22q-17 30 18 38-19-13-12-35M39 22q-3 34 24 29-20-3-17-30M28 23Q5 40 17 57 14 39 32 29" fill="#ffd64a" stroke="#95712a" stroke-width="3"/><path d="M15 69h44v7H15z" fill="#705234"/></g>`;
  return `<g class="object-shell bonus-object"><path d="M12 69h48v8H12zM20 61h32v9H20z" fill="#83708e" stroke="#362b42" stroke-width="2"/><g class="portal-core"><path d="m36 12 17 15v22L36 61 19 49V27z" fill="#b779c9" stroke="#f4c680" stroke-width="3"/><path d="m36 17 7 13-7 25-7-25z" fill="#f3c8ff"/><path d="m21 29 15 26-7-25z" fill="#9562b4"/></g></g>`;
}
function recovery(theme,status) {
  if(theme==='jungle') return barrel(status,false,true);
  if(theme==='castle') return `<g class="object-shell"><path d="M10 72h52v6H10z" fill="#71647f"/><path d="M28 20h16v17l12 16v15H16V53l12-16z" fill="#b8d7d4" stroke="#343346" stroke-width="3"/><path d="M21 51h30v13H21z" fill="#db577f"/><path d="M23 52h24v4H23z" fill="#ffadbf"/><path d="M27 16h18v8H27z" fill="#c39d6d" stroke="#55422f" stroke-width="2"/><path d="M22 49v10" stroke="#f2ffff" stroke-width="3"/><g class="heart-float" color="#fa719c">${mark('heart',27,1,18)}</g></g>`;
  return `<g class="object-shell"><path d="M18 40h36v33H18z" fill="#27974e" stroke="#17482a" stroke-width="3"/><path d="M24 42h8v28h-8z" fill="#70df72"/><path d="M46 42h7v30h-7z" fill="#16613d"/><path d="M12 32h48v14H12z" fill="#40bf55" stroke="#17482a" stroke-width="3"/><path d="M15 35h40v4H15z" fill="#94ef83"/><g class="heart-float" color="#f35b76">${mark('heart',24,3,25)}</g></g>`;
}

export function nodeArt(theme, c, status, mainCount) {
  const art = c.recovery ? recovery(theme,status) : c.optional ? bonus(theme) : theme==='desert' ? block(status,c.id===mainCount) : theme==='jungle' ? barrel(status,c.id===mainCount) : portal(status,c.id===mainCount);
  const resolvedBonus = c.optional && status==='completed' ? `<g color="#f2ffe2"><circle cx="56" cy="66" r="11" fill="#3c845e" stroke="#d9eeb0" stroke-width="2"/>${mark('check',48,58,16)}</g>` : '';
  return `<svg class="node-art" viewBox="0 0 72 84" aria-hidden="true">${shadow}${art}${resolvedBonus}<path class="sprite-glint" d="M58 6v12m-6-6h12M8 35v8m-4-4h8" stroke="#fff1b1" stroke-width="2"/></svg>`;
}

export function nodeVerb(theme,status) {
  if(status==='completed') return 'RESUELTO';
  if(status==='locked') return theme==='castle' ? 'SELLADO' : 'CERRADO';
  return theme==='desert' ? '¡GOLPEA!' : theme==='jungle' ? '¡ABRE!' : '¡DESPIERTA!';
}
