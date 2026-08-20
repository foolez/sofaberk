import * as THREE from 'three';
import { buildWorld } from './world.js';
import { createCharacter } from './characters.js';
import { Sfx } from './audio.js';
import { createCinema } from './cinematic.js';
import { buildFeast, FEAST_ORIGIN } from './feast.js';

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = THREE.MathUtils.lerp;
const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt));

/* ============================ sahne ============================ */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const SKY = 0xa9c1d1;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 55, 210);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 600);

// gökkubbe (ucuz gradyan)
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(300, 16, 12),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(0x5f86ad) }, bot: { value: new THREE.Color(0xe4d6bb) } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying float h; void main(){ gl_FragColor = vec4(mix(bot, top, clamp(h*1.4+0.15,0.0,1.0)), 1.0); }',
  })
);
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xd8e8f5, 0x5e6647, 1.05);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0xfff2dd, 0.28));
const sun = new THREE.DirectionalLight(0xfff0d0, 1.45);
sun.position.set(48, 72, 46);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
sun.shadow.camera.far = 220;
sun.shadow.bias = -0.0008;
scene.add(sun, sun.target);

const world = buildWorld(scene);
const cine = createCinema(camera, { bars: $('#cine-bars'), cap: $('#cine-cap') });
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const F = (x, y, z) => FEAST_ORIGIN.clone().add(V3(x, y, z));
let feast = null;

/* ============================ oyuncu ============================ */
const player = createCharacter({
  cloth: 0x5c1f2a, cloth2: 0x2e2838, trim: 0xc9a227, skin: 0xd9ab80,
  cape: 0x7d1f26, hat: 0x2f2438, hatType: 'wide', feather: 0xf0e6cd,
  beard: 0x3b2a1b, hair: 0x2b1d12,
});
scene.add(player.group);

const P = {
  pos: new THREE.Vector3(0, 0, 48),
  facing: Math.PI,          // kuzeye bakar
  walkPhase: 0, speed: 0,
  act: null,                // {type, t, dur}
  cer: { hatOff: 0, kneel: 0, heart: 0, nod: 0 },
};

/* ============================ Akkale halkı ============================ */
const RANK = { HALK: 0, ERKAN: 1, BEY: 2 };
const NPC_DEF = [
  { n: 'Çoban Musa', t: 'Dağ Çobanı', r: 0, x: -8, z: 41, ry: 2.6,
    ok: '"Efendi başını eğdi bana! Koyunlarıma anlatacağım."',
    bad: '"Aman efendim, bu kadarı fazla! Ben sadece çobanım."',
    c: { cloth: 0x6b5a3a, cloth2: 0x4a3f2a, hat: 0x8a7444, hatType: 'cone', beard: 0x5a4a3a } },
  { n: 'Oduncu Bekir', t: 'Baltacı', r: 0, x: 8, z: 45, ry: 3.5,
    ok: '"Sağ olun efendim, yolunuz açık olsun."',
    bad: '"Efendim, odunumu düşürdüm! Bana eğilmeyin böyle."',
    c: { cloth: 0x54703f, cloth2: 0x3a4a2a, beard: 0x2b1d12 } },
  { n: 'Sarı Emine', t: 'Kapı Dilencisi', r: 0, x: -9, z: 31, ry: 1.4,
    ok: '"Bir baş selamı bile beni doyurdu, Allah artırsın."',
    bad: '"Efendim! Elin âlemi güldürmeyin, ben dilenciyim."',
    c: { cloth: 0x6a5b4a, cloth2: 0x554636, hair: 0x8a7a5a } },
  { n: 'Çırak Timur', t: 'Demirci Çırağı', r: 0, x: 8, z: 21, ry: 3.4,
    ok: '"Ustam görsün istedim! Efendi bana selam verdi."',
    bad: '"Ben çırağım efendim, ustam duyarsa kulağımı çeker."',
    c: { cloth: 0x7a4a2a, cloth2: 0x3a2a1c, skin: 0xc79a72 } },
  { n: 'Pazarcı Zeynep', t: 'Meyve Satıcısı', r: 0, x: -8, z: 6, ry: 0.3,
    ok: '"Buyurun efendim, en tatlı elmalar sizin olsun."',
    bad: '"Vah efendim, tezgâhın önünde bu ne haldir!"',
    c: { cloth: 0x8a5a20, cloth2: 0x5a3a15, hair: 0x3a2a1a } },
  { n: 'Hizmetkâr Ayla', t: 'Konak Hizmetkârı', r: 0, x: 3, z: 14, ry: 3.0,
    ok: '"Baş üstüne efendim, konağa haber vereyim."',
    bad: '"Efendim! Ben hizmetkârım, siz efendisiniz. Kaldırın başınızı."',
    c: { cloth: 0x4a6a6a, cloth2: 0x2e4444, hair: 0x4a3a2a } },

  { n: 'Usta Yusuf', t: 'Demirci Loncası Ustası', r: 1, x: 9, z: 28, ry: 3.5,
    ok: '"Temennanız yerini buldu efendim. Kılıcınız keskin olsun."',
    bad: '"Efendim, lonca ustasına baş selamı mı? Örsüm ağladı."',
    bad2: '"Diz mi çöküyorsunuz? Ben Bey değilim, demirciyim!"',
    c: { cloth: 0x3a3a44, cloth2: 0x2a2a30, beard: 0x2b1d12, skin: 0xc08a5f } },
  { n: 'Bezirgân Hâris', t: 'Kervan Tüccarı', r: 1, x: 8, z: 5, ry: 3.0,
    ok: '"Ah, ne zarif! Şam ipeği kadar yumuşak bir temenna."',
    bad: '"Baş selamı mı? Kervanım Bağdat\'a kadar bunu konuşur."',
    bad2: '"Efendim, diz çökmeyin! Alacağım varmış gibi oldu."',
    c: { cloth: 0x6d3f6a, cloth2: 0x46284a, trim: 0xc9a227, hat: 0x46284a, hatType: 'wide', beard: 0x2b1d12 } },
  { n: 'Çavuş Orhan', t: 'Kale Muhafızı', r: 1, x: -6, z: -6, ry: 0.6,
    ok: '"Selamınız alındı efendim. Kapı size hazırlanıyor."',
    bad: '"Nöbet tutan adama baş selamı olmaz efendim."',
    bad2: '"Kalkın efendim! Muhafıza diz çökülmez."',
    c: { cloth: 0x40506a, cloth2: 0x2a3444, hat: 0x8a8f96, hatType: 'helm', beard: 0x3a2a1b } },
  { n: 'Sör Aydın', t: 'Akkale Şövalyesi', r: 1, x: 6, z: -15, ry: 3.6,
    ok: '"Zarif bir temenna. Kılıcım hizmetinizde efendim."',
    bad: '"Şövalyeye baş selamı! Bu, mızrağa davetiye sayılır."',
    bad2: '"Diz çökmeyin efendim, halk yanlış anlar."',
    c: { cloth: 0x8a3030, cloth2: 0x5a5f68, trim: 0xc9a227, hat: 0x9aa0a8, hatType: 'helm', cape: 0x8a3030 } },
  { n: 'Müneccim Kutlu', t: 'Saray Müneccimi', r: 1, x: -8, z: -19, ry: 0.4,
    ok: '"Yıldızlar bugün terbiyeli bir konuk yazmış. Buyurun."',
    bad: '"Baş selamı mı? Yıldızlarım bunu hayra yormadı."',
    bad2: '"Diz çökmeyin! Gökler değil, ben duruyorum karşınızda."',
    c: { cloth: 0x2f3f6a, cloth2: 0x22304f, hat: 0x22304f, hatType: 'cone', beard: 0xcfcfcf, hair: 0xcfcfcf } },
  { n: 'Kâhya Selma', t: 'Bey\'in Kâhyası', r: 1, x: -4, z: -27, ry: 0.2,
    ok: '"Töreyi biliyorsunuz efendim. Bey\'e haberiniz gidecek."',
    bad: '"Kâhyaya baş selamı? Bunu deftere yazarım efendim."',
    bad2: '"Efendim kalkın; diz yalnız Bey içindir."',
    c: { cloth: 0x4a2f5a, cloth2: 0x33203f, trim: 0xc9a227, hair: 0x4a3a2a } },
];

const npcs = [];
for (const d of NPC_DEF) {
  const ch = createCharacter(d.c);
  ch.group.position.set(d.x, 0, d.z);
  ch.group.rotation.y = d.ry;
  scene.add(ch.group);
  npcs.push({ ...d, ch, done: false, retry: false, act: null, seed: Math.random() * 6.28, look: 0 });
}

// Bey ve muhafızları
const bey = createCharacter({
  cloth: 0x213a5c, cloth2: 0x18293f, trim: 0xc9a227, cape: 0x1d3350,
  hat: 0xc9a227, hatType: 'crown', beard: 0x8d8d8d, hair: 0x6a6a6a, scale: 1.06,
});
const BEY_POS = new THREE.Vector3(0, 0, world.daisZ + 0.6);
bey.group.position.copy(BEY_POS);
bey.group.position.y = 1.0;               // seki üstünde
bey.group.rotation.y = 0;
scene.add(bey.group);
const beyState = { act: null, pose: { bow: 0, nod: 0, heart: 0 } };

const guards = [];
for (const gx of [-4.5, 4.5]) {
  const g = createCharacter({ cloth: 0x40506a, cloth2: 0x2a3444, hat: 0x8a8f96, hatType: 'helm' });
  g.group.position.set(gx, 1.0, world.daisZ + 2.2);
  g.group.rotation.y = Math.PI;
  scene.add(g.group);
  guards.push(g);
  const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6),
    new THREE.MeshLambertMaterial({ color: 0x5a4028 }));
  spear.position.set(gx + (gx < 0 ? -0.45 : 0.45), 2.4, world.daisZ + 2.2);
  spear.castShadow = true;
  scene.add(spear);
}

/* ============================ oyun durumu ============================ */
const G = {
  started: false, over: false,
  rep: 0, goal: 60,
  correct: 0, wrong: 0, greeted: 0,
  selected: 1,
  quest: 'greet',            // greet -> gate -> throne -> ceremony -> end
  cerScore: 0,
  mode: 'town',        // town | feast
  toasts: 0,
  total: 0,
  feasted: false,
};

/* ============================ girdi ============================ */
const keys = {};
let yaw = 0, pitch = 0.40, camDist = 8.5;
const camPos = new THREE.Vector3(0, 3, 56);

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  const k = e.key.toLowerCase();
  if (!G.started || G.over) return;
  if (cine.active) {
    if (e.code === 'Space' || e.code === 'Escape') { e.preventDefault(); cine.skip(); }
    return;
  }
  if (k === 'h') { $('#tore').classList.toggle('hidden'); }
  if (cer.active) { cerKey(e); return; }
  if (k === '1' || k === '2' || k === '3') selectGreeting(+k);
  if (e.code === 'KeyE') tryInteract();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

renderer.domElement.addEventListener('click', () => {
  if (G.started && !cer.active && !G.over) renderer.domElement.requestPointerLock();
});
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * 0.0024;
  pitch = clamp(pitch + e.movementY * 0.0018, -0.25, 0.85);
});
addEventListener('wheel', (e) => { camDist = clamp(camDist + e.deltaY * 0.006, 4.0, 12.0); }, { passive: true });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

$('#btn-start').onclick = () => {
  $('#start').classList.add('hidden');
  G.started = true;
  Sfx.unlock(); Sfx.horn();
  playOpening();
};
$('#tore-close').onclick = () => $('#tore').classList.add('hidden');
$('#btn-again').onclick = () => location.reload();

function selectGreeting(n) {
  G.selected = n;
  document.querySelectorAll('.card').forEach((c) => c.classList.toggle('sel', +c.dataset.k === n));
}
selectGreeting(1);

/* ============================ sinematikler ============================ */
function playOpening() {
  cine.play([
    { dur: 5.4, from: V3(0, 32, 98), to: V3(0, 15, 64), look: V3(0, 9, 42), look2: V3(0, 5, 32),
      cap: 'Uzak diyarların efendisi, yolunu Akkale\'ye düşürdü.', onEnter: () => Sfx.horn() },
    { dur: 5.2, from: V3(-21, 7.5, 27), to: V3(19, 7.5, 21), look: V3(0, 2.6, 10),
      cap: 'Pazar yeri kalabalık; halk, yabancı efendiyi süzüyor.' },
    { dur: 4.8, from: V3(0, 5.5, -16), to: V3(0, 9, -25), look: V3(0, 6, -32), look2: V3(0, 8.5, -34),
      cap: 'Kale kapısı kapalı. Töre açıktır: önce halkın gönlü, sonra Bey\'in huzuru.' },
    { dur: 3.6, from: V3(7, 5, 53), to: V3(0, 3.6, 55.5), look: V3(0, 1.6, 48),
      cap: 'Halka baş selamı, erkâna temenna — diz yalnız şehrin sahibine.' },
  ], () => {
    renderer.domElement.requestPointerLock();
    toast('Akkale kapısındasın. Töreyi unutma!');
  });
}

function playGateCinematic() {
  cine.play([
    { dur: 4.4, from: V3(0, 4.6, -17), to: V3(0, 7.5, -25), look: V3(0, 5, -32), look2: V3(0, 6, -33),
      cap: 'Çavuş boru çaldı: "Efendi töreyi bildi — kapıyı açın!"',
      onEnter: () => { world.openGate(); Sfx.gate(); Sfx.horn(); } },
    { dur: 3.8, from: V3(-9, 4.5, -30), to: V3(-2.5, 3.2, -34), look: V3(0, 4, -40), look2: V3(0, 2.6, -46),
      cap: 'Akkale kalesi, yabancı efendiye açıldı.', onEnter: () => Sfx.bell() },
  ], () => {
    $('#rep-note').textContent = 'Kale kapısı açıldı.';
    toast('Kale kapısı açıldı. Bey Alparslan seni bekliyor.');
  });
}

function playThroneIntro(after) {
  cine.play([
    { dur: 4.0, from: V3(5.5, 3.4, world.daisZ + 10), to: V3(2.2, 2.7, world.daisZ + 6.4),
      look: V3(0, 2.3, world.daisZ + 0.9),
      cap: 'Bey Alparslan: "Yaklaş efendi. Divan seni izliyor — selamını göreyim."',
      onEnter: () => Sfx.horn() },
  ], after);
}

/* ============================ çarpışma ============================ */
const R = 0.55;
function collide(pos) {
  for (const c of world.colliders) {
    const cx = clamp(pos.x, c.x0, c.x1), cz = clamp(pos.z, c.z0, c.z1);
    let dx = pos.x - cx, dz = pos.z - cz;
    let d2 = dx * dx + dz * dz;
    if (d2 > R * R) continue;
    if (d2 < 1e-6) {                       // kutunun içindeysek en yakın kenardan çık
      const l = pos.x - c.x0, r = c.x1 - pos.x, b = pos.z - c.z0, t = c.z1 - pos.z;
      const m = Math.min(l, r, b, t);
      if (m === l) pos.x = c.x0 - R; else if (m === r) pos.x = c.x1 + R;
      else if (m === b) pos.z = c.z0 - R; else pos.z = c.z1 + R;
      continue;
    }
    const d = Math.sqrt(d2);
    pos.x = cx + (dx / d) * R;
    pos.z = cz + (dz / d) * R;
  }
  pos.x = clamp(pos.x, -34.5, 34.5);
  pos.z = clamp(pos.z, -59.5, 53.5);
}

/* ============================ selamlaşma ============================ */
const ACT_DUR = { 1: 1.5, 2: 1.9, 3: 2.6 };

function nearestNpc() {
  let best = null, bd = 4.2;
  for (const n of npcs) {
    const d = Math.hypot(P.pos.x - n.x, P.pos.z - n.z);
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}
function nearBey() {
  return P.pos.distanceTo(new THREE.Vector3(BEY_POS.x, 0, BEY_POS.z + 2.5)) < 6.5;
}

function tryInteract() {
  if (G.mode === 'feast') { doToast(); return; }
  if (P.act) return;
  if (G.quest === 'throne' && nearBey()) { startCeremony(); return; }
  const n = nearestNpc();
  if (!n) return;
  if (n.done) { toast(`${n.n} sana çoktan selam verdi.`); return; }
  greet(n, G.selected);
}

function greet(n, type) {
  P.act = { type, t: 0, dur: ACT_DUR[type] };
  P.facing = Math.atan2(n.x - P.pos.x, n.z - P.pos.z);
  Sfx.cloth();

  const want = n.r + 1;
  const first = !n.retry;
  let verdict, gain, line;

  if (type === want) {
    verdict = 'ok';
    gain = first ? 9 : 5;
    line = n.ok;
    n.done = true; n.ok = true; G.correct++; G.greeted++;
    n.act = { type: n.r === 0 ? 2 : 2, t: -0.55, dur: 1.9 };   // halk da erkân da karşılık verir
    if (n.r === 0) n.act.type = 3;                              // halk efendiye diz kırar
  } else {
    verdict = 'bad';
    gain = -5;
    line = (type > want && n.bad) ? n.bad : (n.bad2 || n.bad);
    if (type < want) line = n.bad;
    if (type > want && n.bad2 && n.r > 0) line = n.bad2;
    G.wrong++;
    if (first) { n.retry = true; } else { n.done = true; G.greeted++; }
    n.act = { type: 0, t: -0.4, dur: 1.2 };
  }

  G.rep = clamp(G.rep + gain, 0, 100);
  showDialogue(n, line, verdict, gain, first);
  verdict === 'ok' ? Sfx.good() : Sfx.bad();
  refreshHud();
  checkGate();
}

function showDialogue(n, line, verdict, gain, first) {
  const el = $('#dialogue');
  const tip = verdict === 'ok'
    ? (first ? 'Töreye uygun selam.' : 'Geç de olsa doğrusunu yaptın.')
    : (first ? 'Yanlış selam — bir şans daha var.' : 'Yine yanıldın; bu kapı kapandı.');
  el.innerHTML = `<div class="who">${n.n.toUpperCase()} — ${n.t}</div>${line}
    <span class="verdict ${verdict === 'ok' ? 'good' : 'bad'}">${tip} İtibar ${gain > 0 ? '+' : ''}${gain}</span>`;
  el.classList.add('on');
  clearTimeout(showDialogue._t);
  showDialogue._t = setTimeout(() => el.classList.remove('on'), 4600);
}

function toast(msg) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = msg;
  $('#toasts').appendChild(d);
  setTimeout(() => d.remove(), 5200);
}

function checkGate() {
  if (G.quest === 'greet' && G.rep >= G.goal) {
    G.quest = 'gate';
    document.exitPointerLock?.();
    playGateCinematic();
  }
}

function refreshHud() {
  $('#rep-val').textContent = Math.round(G.rep);
  $('#rep-fill').style.width = G.rep + '%';
  const q = $('#quest-txt');
  if (G.quest === 'greet') {
    q.innerHTML = `Akkale halkına töreye uygun selam ver.<br><b>${G.greeted}/${npcs.length}</b> kişi selamlandı · itibar hedefi <b>${G.goal}</b>`;
  } else if (G.quest === 'gate' || G.quest === 'throne') {
    q.innerHTML = 'Kale avlusuna gir ve <b>Bey Alparslan</b>\'ın huzuruna çık.<br>Sekiye yaklaşıp <b>E</b>\'ye bas.';
  } else if (G.quest === 'ceremony') {
    q.innerHTML = 'Selam töreni sürüyor: gösterilen tuşa <b>tam zamanında</b> bas.';
  }
}
refreshHud();

/* ============================ huzura çıkış töreni ============================ */
const CER_STEPS = [
  { key: 'KeyQ', label: 'ŞAPKANI ÇIKAR', hint: 'Q', sub: 'Bey\'in huzurunda baş açık durulur.', apply: () => (P.cer.hatOff = 1) },
  { key: 'Digit3', label: 'DİZ ÇÖK', hint: '3', sub: 'Sağ diz yere, baş öne.', apply: () => (P.cer.kneel = 1) },
  { key: 'KeyE', label: 'ELİNİ KALBİNE KOY', hint: 'E', sub: 'Sadakat böyle gösterilir.', apply: () => (P.cer.heart = 1) },
  { key: 'Space', label: 'SELAMINI SÖYLE', hint: 'BOŞLUK', sub: '"Akkale\'nin sahibine selam olsun."', apply: () => (P.cer.nod = 1) },
];
const cer = { active: false, i: 0, t: 0, dir: 1, done: false, wait: 0 };

function startCeremony() {
  document.exitPointerLock?.();
  P.pos.set(0, 0, world.daisZ + 5.2);
  P.facing = Math.PI;
  P.act = null;
  playThroneIntro(runCeremony);
}

function runCeremony() {
  cer.active = true; cer.i = 0; cer.t = 0; cer.dir = 1; cer.wait = 0;
  G.quest = 'ceremony';
  G.cerScore = 0;
  $('#ceremony').classList.remove('hidden');
  $('#cer-steps').innerHTML = CER_STEPS.map(() => '<div class="pip"></div>').join('');
  $('#cards').classList.remove('on');
  Sfx.horn();
  showCerStep();
  refreshHud();
  toast('Divan sessizliğe büründü…');
}

function showCerStep() {
  const s = CER_STEPS[cer.i];
  $('#cer-step').textContent = `${cer.i + 1}. ${s.label}  —  ${s.hint}`;
  $('#cer-sub').textContent = s.sub;
  $('#cer-log').innerHTML = '&nbsp;';
}

function cerKey(e) {
  if (cer.done || cer.wait > 0) return;
  const s = CER_STEPS[cer.i];
  if (e.code === 'Space') e.preventDefault();
  if (e.code !== s.key) {
    if (['KeyQ', 'KeyE', 'Space', 'Digit1', 'Digit2', 'Digit3'].includes(e.code)) gradeStep(-1);
    return;
  }
  gradeStep(Math.abs(markerPos() - 50));
}

function markerPos() { return 50 + Math.sin(cer.t * 2.2) * 50; }

function gradeStep(dist) {
  const s = CER_STEPS[cer.i];
  let pts, txt, cls;
  if (dist < 0) { pts = 0; txt = 'Yanlış hareket! Divan mırıldandı.'; cls = 'no'; Sfx.bad(); }
  else if (dist <= 7) { pts = 10; txt = 'KUSURSUZ — tam zamanında.'; cls = 'ok'; Sfx.perfect(); }
  else if (dist <= 22) { pts = 6; txt = 'İyi — kabul gördü.'; cls = 'mid'; Sfx.good(); }
  else { pts = 2; txt = 'Kaba ve aceleci bir hareket.'; cls = 'no'; Sfx.bad(); }

  G.cerScore += pts;
  s.apply();
  $('#cer-log').innerHTML = `<span class="${pts >= 6 ? 'good' : 'bad'}">${txt} (+${pts})</span>`;
  $('#cer-steps').children[cer.i].className = 'pip ' + cls;
  cer.wait = 0.9;
}

function finishCeremony() {
  cer.done = true;
  cer.active = false;
  $('#ceremony').classList.add('hidden');
  beyState.act = { t: 0, dur: 3.0 };
  Sfx.bell();

  const total = Math.round(G.rep + G.cerScore);
  G.total = total;

  if (total >= 95) { setTimeout(() => startFeast(), 1900); return; }

  let title, txt;
  if (total >= 70) {
    title = 'KABUL EDİLDİ';
    txt = 'Bey elini kaldırdı: "Kusurun vardı ama niyetin temizdi. Akkale seni misafir eder — ama soframa değil, hana."';
  } else if (total >= 45) {
    title = 'HOŞ GÖRÜLDÜ';
    txt = 'Bey kaşını çattı: "Töreyi yarım biliyorsun efendi. Bir gece kal, sabah yola çık."';
  } else {
    title = 'KAPI DIŞARI';
    txt = 'Bey ayağa kalktı: "Bu selam Akkale\'ye yakışmadı. Muhafızlar, efendiyi kapıya kadar geçirsin."';
  }
  setTimeout(() => showEnd(title, txt), 2800);
}

/* ============================ ziyafet ============================ */
const TOAST_LINES = [
  { who: 'BEY ALPARSLAN', t: '"İlk kadeh, töreyi bilen konuğa! Akkale\'de selam, kılıçtan keskindir."' },
  { who: 'SÖR AYDIN', t: '"İkinci kadeh, efendinin belini kıran temennaya! Şövalyeler bunu şarkı yapacak."' },
  { who: 'BEZİRGÂN HÂRİS', t: '"Üçüncü kadeh, bu sofraya! Kervanım bunu Bağdat\'a kadar anlatacak."' },
];

function startFeast() {
  G.mode = 'feast';
  G.feasted = true;
  G.toasts = 0;
  document.exitPointerLock?.();

  // konuklar: töreye uygun selam verdiğin kişiler
  let cfgs = npcs.filter((n) => n.ok);
  if (cfgs.length < 6) cfgs = cfgs.concat(npcs.filter((n) => !n.ok)).slice(0, 8);
  feast = buildFeast(scene, cfgs);

  // gece ve salon aydınlatması
  sun.intensity = 0.08;
  hemi.intensity = 0.5;
  hemi.color.set(0xffd9a8);
  hemi.groundColor.set(0x3b2a1e);
  scene.background = new THREE.Color(0x0d0a10);
  scene.fog.color.set(0x0d0a10);
  scene.fog.near = 18; scene.fog.far = 95;
  sky.visible = false;

  // oyuncuyu Bey'in sağına oturt
  player.group.position.set(FEAST_ORIGIN.x + feast.seat.x, 0.86, FEAST_ORIGIN.z + feast.seat.z);
  player.group.rotation.y = feast.seat.facing;
  P.pos.set(FEAST_ORIGIN.x + feast.seat.x, 0, FEAST_ORIGIN.z + feast.seat.z);

  document.body.classList.add('feast');
  $('#topbar').style.display = 'none';
  $('#cards').classList.remove('on');
  $('#target').classList.remove('on');
  $('#compass').textContent = '';

  cine.play([
    { dur: 4.8, from: F(0, 8.5, 17), to: F(0, 4.4, 11), look: F(-4, 2.4, 0), look2: F(-6, 2.0, 0),
      cap: 'Bey ayağa kalktı: "Bu selam bu şehirde çoktandır görülmemişti. Sofrayı kurun!"',
      onEnter: () => { Sfx.cheer(); Sfx.music(true); } },
    { dur: 4.6, from: F(10, 3.4, -6), to: F(-7, 3.0, -5.2), look: F(0, 1.9, 0),
      cap: 'Kuzular çevrildi, kazanlar kaynadı; def sustuğunda ud başladı.' },
    { dur: 4.0, from: F(-2.5, 4.8, -10.5), to: F(-1.6, 4.3, -9.2), look: F(-9.2, 1.8, -0.7),
      cap: 'Efendi, Bey\'in sağına oturtuldu — Akkale\'de en büyük ikram budur.' },
  ], () => {
    $('#feast-hud').classList.remove('hidden');
    $('#feast-txt').innerHTML = 'Bey\'in sağında oturuyorsun. <b>E</b> ile kadeh kaldır.';
  });
}

function doToast() {
  if (!feast || cine.active || G.toasts >= 3) return;
  const line = TOAST_LINES[G.toasts];
  G.toasts++;
  feast.toast();
  P.feastRaiseTarget = 1;
  setTimeout(() => { P.feastRaiseTarget = 0; }, 2500);
  Sfx.clink(); setTimeout(() => Sfx.cheer(), 220);
  $('#feast-txt').innerHTML = `<b>${line.who}</b> — ${line.t}`;
  if (G.toasts >= 3) setTimeout(endFeast, 3200);
}

function endFeast() {
  $('#feast-hud').classList.add('hidden');
  cine.play([
    { dur: 6.0, from: F(0, 3.2, -9), to: F(0, 11, 18), look: F(-4, 1.9, 0), look2: F(0, 2.6, 0),
      cap: 'O gece Akkale\'de bütün kadehler yabancı efendinin şerefine kalktı.',
      onEnter: () => Sfx.cheer() },
  ], () => {
    Sfx.music(false);
    const t = G.total;
    if (t >= 120) {
      showEnd('AKKALE\'NİN ONUR KONUĞU',
        'Bey Alparslan tahtından indi, seni elinle kaldırdı: "Böyle selam ancak töreyi bilen bir efendiden gelir. Bugünden sonra Akkale\'nin kapıları da sofrası da sana açıktır."');
    } else {
      showEnd('BEY\'İN DOSTU',
        'Bey kadehini senin kadehine dokundurdu: "Halkım seni övdü, selamın da yerini buldu efendi. Sofram sofrandır."');
    }
  });
}

function showEnd(title, txt) {
  G.over = true;
  $('#end-title').textContent = title;
  $('#end-txt').textContent = txt;
  $('#end-stats').innerHTML = `
    <div><b>İTİBAR</b></div><div>${Math.round(G.rep)} / 100</div>
    <div><b>DOĞRU SELAM</b></div><div>${G.correct}</div>
    <div><b>YANLIŞ SELAM</b></div><div>${G.wrong}</div>
    <div><b>TÖREN PUANI</b></div><div>${G.cerScore} / 40</div>
    <div><b>ŞÖLEN</b></div><div>${G.feasted ? 'Bey sofrasına aldı · ' + G.toasts + ' kadeh' : 'Sofraya davet edilmedin'}</div>
    <div><b>TOPLAM</b></div><div>${G.total} / 140</div>`;
  $('#end').classList.remove('hidden');
  document.exitPointerLock?.();
}

/* ============================ pusula ============================ */
function updateCompass() {
  const el = $('#compass');
  if (cer.active || G.over) { el.textContent = ''; return; }
  let tx, tz, name;
  if (G.quest === 'greet') {
    let best = null, bd = 1e9;
    for (const n of npcs) {
      if (n.done) continue;
      const d = Math.hypot(P.pos.x - n.x, P.pos.z - n.z);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) { el.textContent = ''; return; }
    tx = best.x; tz = best.z; name = best.n.toUpperCase();
  } else {
    tx = BEY_POS.x; tz = BEY_POS.z; name = 'BEY ALPARSLAN';
  }
  const d = Math.hypot(tx - P.pos.x, tz - P.pos.z);
  const ang = Math.atan2(tx - P.pos.x, tz - P.pos.z);
  let rel = ang - (yaw + Math.PI);
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  const arrow = Math.abs(rel) < 0.5 ? '▲' : (Math.abs(rel) > 2.6 ? '▼' : (rel > 0 ? '◄' : '►'));
  el.textContent = `${arrow}  ${name} · ${Math.round(d)} adım`;
}

/* ============================ döngü ============================ */
const clock = new THREE.Clock();
let stepTimer = 0;

function update(dt, t) {
  /* --- hareket --- */
  let moving = false;
  if (G.started && !cer.active && !G.over && !P.act && !cine.active && G.mode === 'town') {
    const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    if (f || s) {
      const run = keys.ShiftLeft || keys.ShiftRight;
      const spd = run ? 7.4 : 4.2;
      const dir = new THREE.Vector3(
        -Math.sin(yaw) * f + Math.cos(yaw) * s, 0,
        -Math.cos(yaw) * f - Math.sin(yaw) * s
      ).normalize();
      P.pos.addScaledVector(dir, spd * dt);
      collide(P.pos);
      P.facing = Math.atan2(dir.x, dir.z);
      P.speed = damp(P.speed, run ? 1.6 : 1.0, 12, dt);
      P.walkPhase += dt * (run ? 13 : 8.5);
      moving = true;
      stepTimer -= dt;
      if (stepTimer <= 0) { Sfx.step(run); stepTimer = run ? 0.27 : 0.42; }
    }
  }
  if (!moving) P.speed = damp(P.speed, 0, 10, dt);

  checkGate();
  // avluya girince görev ilerlesin
  if (G.quest === 'gate' && P.pos.z < -34) {
    G.quest = 'throne';
    toast('Kale avlusundasın. Sekiye yaklaş ve E ile huzura çık.');
  }

  /* --- oyuncu pozu --- */
  player.group.position.set(P.pos.x, 0, P.pos.z);
  let dAng = P.facing - player.group.rotation.y;
  while (dAng > Math.PI) dAng -= Math.PI * 2;
  while (dAng < -Math.PI) dAng += Math.PI * 2;
  player.group.rotation.y += dAng * (1 - Math.exp(-10 * dt));

  const pose = { walk: P.speed, walkPhase: P.walkPhase };
  if (P.act) {
    P.act.t += dt;
    const k = clamp(P.act.t / P.act.dur, 0, 1);
    const a = Math.sin(clamp(k, 0, 1) * Math.PI) ** 0.7;   // gir-çık eğrisi
    if (P.act.type === 1) { pose.nod = a; pose.heart = a * 0.15; }
    if (P.act.type === 2) { pose.bow = a * 0.8; pose.heart = a; }
    if (P.act.type === 3) { pose.kneel = a; pose.bow = a * 0.35; pose.heart = a; pose.hatOff = a * 0.8; }
    if (k >= 1) P.act = null;
  }
  if (G.mode === 'feast') {
    P.feastRaise = damp(P.feastRaise || 0, P.feastRaiseTarget || 0, 3.5, dt);
    pose.walk = 0; pose.sit = 1; pose.hatOff = 0.15;
    pose.raise = P.feastRaise;
    pose.nod = Math.sin(t * 1.1) * 0.08;
  } else if (cer.active || cer.done) {
    P.cerNow = P.cerNow || { hatOff: 0, kneel: 0, heart: 0 };
    P.cerNow.hatOff = damp(P.cerNow.hatOff, P.cer.hatOff, 5, dt);
    P.cerNow.kneel = damp(P.cerNow.kneel, P.cer.kneel, 4, dt);
    P.cerNow.heart = damp(P.cerNow.heart, P.cer.heart, 5, dt);
    pose.hatOff = P.cerNow.hatOff;
    pose.kneel = P.cerNow.kneel;
    pose.heart = P.cerNow.heart;
    pose.bow = P.cerNow.kneel * 0.4 + P.cerNow.heart * 0.15;
    pose.nod = P.cer.nod * (0.5 + 0.5 * Math.sin(t * 6));
    pose.walk = 0;
  }
  player.pose(pose);

  /* --- npc pozları --- */
  for (const n of npcs) {
    const p = { walk: 0, walkPhase: t * 1.6 + n.seed };
    const d = Math.hypot(P.pos.x - n.x, P.pos.z - n.z);
    if (n.act) {
      n.act.t += dt;
      if (n.act.t > 0) {
        const k = clamp(n.act.t / n.act.dur, 0, 1);
        const a = Math.sin(k * Math.PI) ** 0.7;
        if (n.act.type === 2) { p.bow = a * 0.75; p.heart = a; }
        else if (n.act.type === 3) { p.kneel = a * 0.9; p.bow = a * 0.3; p.heart = a; }
        else { p.nod = -a * 0.4; p.heart = a * 0.2; }         // kafa sallayıp söylenme
        if (k >= 1) n.act = null;
      }
      n.ch.group.rotation.y = damp(n.ch.group.rotation.y,
        Math.atan2(P.pos.x - n.x, P.pos.z - n.z), 6, dt);
    } else {
      p.nod = Math.sin(t * 0.9 + n.seed) * 0.06 + 0.04;
      if (n.done && d < 8) p.wave = clamp(1 - d / 8, 0, 1) * 0.9;
      if (d < 9) {
        n.ch.group.rotation.y = damp(n.ch.group.rotation.y,
          Math.atan2(P.pos.x - n.x, P.pos.z - n.z), 2.5, dt);
      } else {
        n.ch.group.rotation.y = damp(n.ch.group.rotation.y, n.ry, 1.5, dt);
      }
    }
    n.ch.group.position.y = Math.sin(t * 1.4 + n.seed) * 0.015;
    n.ch.pose(p);
  }

  /* --- Bey ve muhafızlar --- */
  const bp = { walk: 0, walkPhase: t };
  if (beyState.act) {
    beyState.act.t += dt;
    const k = clamp(beyState.act.t / beyState.act.dur, 0, 1);
    bp.nod = Math.sin(k * Math.PI) * 0.5;
    bp.heart = Math.sin(k * Math.PI) * 0.8;
    if (k >= 1) beyState.act = null;
  } else {
    bp.nod = Math.sin(t * 0.7) * 0.05;
  }
  bey.pose(bp);
  guards.forEach((g, i) => g.pose({ walk: 0, walkPhase: t, nod: Math.sin(t * 0.8 + i) * 0.04 }));

  /* --- tören zamanlaması --- */
  if (cer.active) {
    if (cer.wait > 0) {
      cer.wait -= dt;
      if (cer.wait <= 0) {
        cer.i++;
        cer.t = 0;
        if (cer.i >= CER_STEPS.length) finishCeremony();
        else showCerStep();
      }
    } else {
      cer.t += dt;
      if (cer.t > 6.2) gradeStep(999);            // çok beklediysen kaba sayılır
      $('#marker').style.left = markerPos() + '%';
    }
  }

  if (feast) feast.update(dt, t);

  /* --- kamera --- */
  if (cine.active) {
    cine.update(dt);
    camPos.copy(camera.position);
    $('#cine-skip').classList.add('on');
    sky.position.copy(camera.position);
    world.update(t, dt);
    updateHud();
    return;
  }
  $('#cine-skip').classList.remove('on');

  let camTarget, lookTarget;
  if (G.mode === 'feast') {
    const sway = Math.sin(t * 0.3) * 0.6;
    camTarget = F(-1.6 + sway, 4.3, -9.2);
    lookTarget = F(-9.2, 1.7, -0.7);
  } else if (cer.active || cer.done) {
    camTarget = new THREE.Vector3(4.6, 3.1, world.daisZ + 8.4);
    lookTarget = new THREE.Vector3(0, 1.9, world.daisZ + 1.6);
  } else {
    const off = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch) + 0.42, Math.cos(yaw) * Math.cos(pitch)
    ).multiplyScalar(camDist);
    camTarget = P.pos.clone().add(off);
    camTarget.y = Math.max(0.9, camTarget.y);
    lookTarget = P.pos.clone().add(new THREE.Vector3(0, 1.55, 0));
  }
  camPos.lerp(camTarget, 1 - Math.exp(-(cer.active || cer.done || G.mode === 'feast' ? 3 : 14) * dt));
  camera.position.copy(camPos);
  camera.lookAt(lookTarget);
  sky.position.copy(camera.position);
  sun.target.position.copy(P.pos);

  world.update(t, dt);

  updateHud();
}

function updateHud() {
  if (G.mode === 'feast') {
    const pr = $('#prompt');
    if (!cine.active && G.toasts < 3) {
      pr.classList.add('on');
      pr.textContent = `E — KADEH KALDIR (${G.toasts}/3)`;
    } else pr.classList.remove('on');
    return;
  }
  if (G.started && !G.over) {
    const n = nearestNpc();
    const beyReady = G.quest === 'throne' && nearBey();
    const tg = $('#target');
    if ((n || beyReady) && !cer.active) {
      tg.classList.add('on');
      tg.querySelector('.name').textContent = beyReady ? 'BEY ALPARSLAN' : n.n;
      tg.querySelector('.title').textContent = beyReady ? 'Akkale\'nin Sahibi' : n.t + (n.done ? ' · selamlandı' : (n.retry ? ' · bir şansın kaldı' : ''));
    } else tg.classList.remove('on');

    const pr = $('#prompt');
    if (beyReady) { pr.classList.add('on'); pr.textContent = 'E — HUZURA ÇIK'; }
    else if (n && !n.done && !P.act && !cer.active) {
      pr.classList.add('on');
      pr.textContent = `E — ${['BAŞ SELAMI', 'TEMENNA', 'DİZ SELAMI'][G.selected - 1]} VER`;
    } else pr.classList.remove('on');

    $('#cards').classList.toggle('on', !!n && !cer.active);
    updateCompass();
  }
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  update(dt, clock.elapsedTime);
  renderer.render(scene, camera);
}
loop();

// hata ayıklama kolaylığı
window.__akkale = { G, P, world, npcs, cer, THREE, camera, scene };
