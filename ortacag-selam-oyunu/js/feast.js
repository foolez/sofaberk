import * as THREE from 'three';
import { createCharacter } from './characters.js';

/* Ziyafet salonu. Şehrin dışında, uzak bir köşeye kurulur; final
   sinematiğinde kamera ve oyuncu buraya taşınır. */

export const FEAST_ORIGIN = new THREE.Vector3(300, 0, 300);

const M = {
  stone: 0x6f6a63, stoneDark: 0x4e4a45, wood: 0x5d4028, woodDark: 0x3c2818,
  cloth: 0xd8cbb0, wine: 0x7d1f26, gold: 0xc9a227, fire: 0xffab4a,
};

export function buildFeast(scene, guestCfgs) {
  const g = new THREE.Group();
  g.position.copy(FEAST_ORIGIN);
  scene.add(g);

  const mat = (c, flat = false) => new THREE.MeshLambertMaterial({ color: c, flatShading: flat });
  const box = (w, h, d, c, x, y, z, ry = 0, flat = false) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, flat));
    m.castShadow = true; m.receiveShadow = true;
    m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m;
  };
  const cyl = (rt, rb, h, seg, c, x, y, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c, true));
    m.castShadow = true; m.position.set(x, y, z); g.add(m); return m;
  };

  /* --- salon --- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), mat(M.stone));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(8, 20), mat(M.wine));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 0); rug.receiveShadow = true; g.add(rug);

  box(34, 9, 0.8, M.stone, 0, 4.5, -12);         // arka duvar
  box(34, 9, 0.8, M.stone, 0, 4.5, 12);
  box(0.8, 9, 24, M.stoneDark, -17, 4.5, 0);
  box(0.8, 9, 24, M.stoneDark, 17, 4.5, 0);
  box(34, 0.6, 24, 0x2a2018, 0, 9.2, 0);          // tavan
  for (let i = -3; i <= 3; i++) box(34, 0.5, 0.6, M.woodDark, 0, 8.7, i * 3);  // ahşap kirişler

  // duvar sancakları
  for (const x of [-11, -4, 4, 11]) {
    box(2.0, 4.2, 0.14, x < 0 ? M.wine : 0x2f4f7a, x, 5.6, -11.5);
    box(0.7, 0.7, 0.2, M.gold, x, 5.4, -11.4);
  }

  // ocak
  box(5, 5, 1.4, M.stoneDark, -15.6, 2.5, -6.5, Math.PI / 2);
  const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: M.fire }));
  fire.position.set(-15.0, 0.85, -6.5); g.add(fire);
  const fireLight = new THREE.PointLight(0xff8c3a, 3.2, 30, 2);
  fireLight.position.set(-14.2, 1.7, -6.0); g.add(fireLight);

  /* --- avize --- */
  const chand = new THREE.Group();
  chand.position.set(0, 6.4, 0); g.add(chand);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.12, 6, 16), mat(M.woodDark));
  ring.rotation.x = Math.PI / 2; chand.add(ring);
  const candleFlames = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 6), mat(M.cloth));
    c.position.set(Math.cos(a) * 1.9, 0.3, Math.sin(a) * 1.9); chand.add(c);
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
    f.position.set(Math.cos(a) * 1.9, 0.66, Math.sin(a) * 1.9); chand.add(f);
    candleFlames.push(f);
  }
  const chandLight = new THREE.PointLight(0xffcf95, 3.6, 34, 2);
  chandLight.position.set(0, 6.0, 0); g.add(chandLight);
  const hallLight = new THREE.PointLight(0xffc188, 2.2, 40, 2);
  hallLight.position.set(7, 5.2, 3); g.add(hallLight);
  const headLight = new THREE.PointLight(0xffd3a0, 2.0, 22, 2);   // baş köşeyi aydınlatır
  headLight.position.set(-9.5, 3.6, -1.2); g.add(headLight);

  /* --- uzun sofra --- */
  const T = { len: 20, w: 3.2, h: 1.05 };
  box(T.len, 0.22, T.w, M.wood, 0, T.h, 0);
  const cloth = box(T.len - 0.4, 0.5, T.w + 0.5, M.cloth, 0, T.h - 0.28, 0);
  cloth.castShadow = false;
  for (const x of [-8.5, -3, 3, 8.5]) for (const z of [-1.1, 1.1]) box(0.35, T.h - 0.1, 0.35, M.woodDark, x, (T.h - 0.1) / 2, z);
  for (const z of [-2.6, 2.6]) {                 // sıralar
    box(T.len - 2, 0.24, 0.9, M.wood, 0, 0.62, z);
    for (const x of [-7.5, 0, 7.5]) box(0.3, 0.62, 0.8, M.woodDark, x, 0.31, z);
  }

  // sofra donanımı
  const platters = [];
  for (let i = 0; i < 7; i++) {
    const x = -8.4 + i * 2.8;
    cyl(0.62, 0.55, 0.12, 12, 0xb9a888, x, T.h + 0.17, 0);
    const roast = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mat(0x8b5a2b, true));
    roast.castShadow = true; roast.position.set(x, T.h + 0.42, 0); g.add(roast);
    platters.push(roast);
    for (let j = 0; j < 3; j++) {
      const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0),
        mat([0xc0392b, 0xd9a441, 0x7fb069][j], true));
      fruit.castShadow = true;
      fruit.position.set(x + (j - 1) * 0.34, T.h + 0.28, (j % 2 ? 0.55 : -0.55));
      g.add(fruit);
    }
  }
  for (let i = 0; i < 6; i++) {                  // mumlar
    const x = -7 + i * 2.8;
    cyl(0.07, 0.09, 0.5, 6, M.cloth, x, T.h + 0.36, 0.95 * (i % 2 ? 1 : -1));
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
    f.position.set(x, T.h + 0.66, 0.95 * (i % 2 ? 1 : -1)); g.add(f);
    candleFlames.push(f);
  }

  /* --- Bey'in baş köşesi --- */
  const headX = -11.4;
  box(2.2, 0.4, 1.8, M.wood, headX - 0.6, 1.0, 0);
  box(0.3, 3.4, 1.8, M.wood, headX - 1.5, 2.2, 0);
  box(0.9, 0.9, 0.36, M.gold, headX - 1.45, 3.7, 0);

  /* --- konuklar --- */
  const guests = [];
  const seatsZ = [-2.55, 2.55];
  guestCfgs.slice(0, 10).forEach((cfg, i) => {
    const side = i % 2, idx = Math.floor(i / 2);
    const ch = createCharacter(cfg.c);
    const x = -5.5 + idx * 2.9;
    ch.group.position.set(x, 0.86, seatsZ[side]);
    ch.group.rotation.y = side ? Math.PI : 0;
    g.add(ch.group);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.28, 8), mat(M.gold));
    cup.position.y = -0.62;
    ch.parts.arms[1].add(cup);
    guests.push({ ch, seed: Math.random() * 6.28, name: cfg.n });
  });

  const bey = createCharacter({
    cloth: 0x213a5c, cloth2: 0x18293f, trim: 0xc9a227, cape: 0x1d3350,
    hat: 0xc9a227, hatType: 'crown', beard: 0x8d8d8d, hair: 0x6a6a6a, scale: 1.06,
  });
  bey.group.position.set(headX - 0.6, 0.9, 0);
  bey.group.rotation.y = Math.PI / 2;
  g.add(bey.group);
  const beyCup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.32, 8), mat(M.gold));
  beyCup.position.y = -0.62;
  bey.parts.arms[1].add(beyCup);

  // müzisyenler
  const players = [];
  for (const [i, px] of [[0, 12.5], [1, 14.2]]) {
    const mus = createCharacter({ cloth: i ? 0x4a6a3a : 0x6a4a3a, cloth2: 0x2f3a24, hat: 0x8a5a20, hatType: 'cone' });
    mus.group.position.set(px, 0, -4 + i * 2.2);
    mus.group.rotation.y = -Math.PI / 2;
    g.add(mus.group);
    const lute = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(M.wood));
    lute.scale.set(1, 0.7, 0.6);
    lute.position.set(0, 1.1, 0.42);
    mus.group.add(lute);
    players.push({ ch: mus, seed: i * 2 });
  }

  // oyuncunun yeri: Bey'in sağ yanı
  const seat = { x: headX + 1.9, z: -2.55, facing: 0 };

  const state = { raise: 0, target: 0 };

  return {
    group: g, origin: FEAST_ORIGIN, seat, bey, guests,
    lights: [fireLight, chandLight, hallLight, headLight],
    toast() { state.target = 1; setTimeout(() => { state.target = 0; }, 2600); },
    update(dt, t) {
      state.raise += (state.target - state.raise) * Math.min(1, dt * 3.5);
      const fl = 0.8 + Math.sin(t * 8) * 0.12 + Math.sin(t * 17.3) * 0.08;
      fireLight.intensity = 3.2 * fl;
      chandLight.intensity = 3.6 * (0.92 + Math.sin(t * 5.5) * 0.06);
      fire.scale.setScalar(0.9 + fl * 0.3);
      candleFlames.forEach((f, i) => f.scale.setScalar(0.85 + Math.sin(t * 9 + i) * 0.18));
      guests.forEach((gu, i) => {
        gu.ch.pose({
          sit: 1, walkPhase: t + gu.seed,
          nod: Math.sin(t * 1.3 + gu.seed) * 0.12 + 0.05,
          raise: state.raise * (0.75 + 0.25 * Math.sin(gu.seed)),
        });
      });
      bey.pose({
        sit: 1, walkPhase: t,
        nod: Math.sin(t * 0.9) * 0.08,
        raise: state.raise,
      });
      players.forEach((p, i) => p.ch.pose({
        walkPhase: t * 6 + p.seed, nod: Math.sin(t * 2 + i) * 0.15,
        wave: 0.35 + Math.sin(t * 7 + i) * 0.15,
      }));
    },
  };
}
