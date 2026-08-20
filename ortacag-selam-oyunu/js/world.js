import * as THREE from 'three';

/* Akkale: güneyde kasaba kapısı, ortada pazar meydanı,
   kuzeyde Bey'in kalesi. Her şey kutu, silindir ve üçgen çatıdan. */

const C = {
  grass: 0x4f6134, dirt: 0x6b5b45, cobble: 0x6f6a63, cobbleDark: 0x5c5750,
  stone: 0x8d8577, stoneDark: 0x6a6459, plaster: [0xded0b2, 0xd6c6a6, 0xcbbb9c, 0xe3d8bd],
  beam: 0x4a3220, roof: [0x8c3b2a, 0x7c3626, 0x6d4b3a], thatch: 0xb0904e,
  wood: 0x6b4a2c, woodDark: 0x4a3220, wine: 0x7d1f26, gold: 0xc9a227,
  cloth: [0x3f5f7a, 0x6d3f6a, 0x2f6b4f, 0x8a5a20],
};

const matCache = new Map();
function mat(color, flat = false) {
  const key = color + ':' + flat;
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial({ color, flatShading: flat }));
  return matCache.get(key);
}
const pick = (arr, i) => arr[Math.abs(Math.floor(i)) % arr.length];

export function buildWorld(scene) {
  const colliders = [];   // {x0,x1,z0,z1}
  const torches = [];     // titreyen ışıklar
  const root = new THREE.Group();
  scene.add(root);

  const solid = (x, z, w, d) => colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

  function add(mesh, x, y, z, ry = 0) {
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    root.add(mesh);
    return mesh;
  }
  function bx(w, h, d, color, x, y, z, ry = 0, flat = false) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, flat));
    m.castShadow = true; m.receiveShadow = true;
    return add(m, x, y, z, ry);
  }
  function cy(rt, rb, h, seg, color, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, true));
    m.castShadow = true; m.receiveShadow = true;
    return add(m, x, y, z);
  }
  function roofPrism(w, h, d, color, x, y, z, ry = 0) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    const m = new THREE.Mesh(g, mat(color, true));
    m.castShadow = true; m.receiveShadow = true;
    return add(m, x, y, z, ry);
  }

  /* ---------------- zemin ---------------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(C.grass));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const street = new THREE.Mesh(new THREE.PlaneGeometry(14, 96), mat(C.cobble));
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, 0.02, 8);
  street.receiveShadow = true;
  root.add(street);

  const square = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), mat(C.cobbleDark));
  square.rotation.x = -Math.PI / 2;
  square.position.set(0, 0.03, 10);
  square.receiveShadow = true;
  root.add(square);

  const yard = new THREE.Mesh(new THREE.PlaneGeometry(58, 32), mat(C.cobble));
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, 0.02, -46);
  yard.receiveShadow = true;
  root.add(yard);

  // kaldırım taşı serpiştirmesi
  for (let i = 0; i < 70; i++) {
    const x = (Math.random() - 0.5) * 13, z = 8 + (Math.random() - 0.5) * 88;
    const s = 0.7 + Math.random() * 1.5;
    const t = new THREE.Mesh(new THREE.BoxGeometry(s, 0.06, s * 0.8), mat(i % 2 ? C.cobbleDark : C.cobble));
    t.receiveShadow = true;
    add(t, x, 0.05, z, Math.random() * 3);
  }

  /* ---------------- ev ---------------- */
  function house(x, z, ry, seed = 0) {
    const w = 7 + (seed % 3), d = 6 + (seed % 2) * 1.5, h = 3.2;
    const upper = 2.8;
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = ry;
    root.add(g);

    const put = (m, px, py, pz, pry = 0) => { m.position.set(px, py, pz); m.rotation.y = pry; g.add(m); return m; };
    const b = (bw, bh, bd, color, px, py, pz, flat = false) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat(color, flat));
      m.castShadow = true; m.receiveShadow = true;
      return put(m, px, py, pz);
    };

    b(w, 0.4, d, C.stoneDark, 0, 0.2, 0);                          // taş temel
    b(w - 0.2, h, d - 0.2, pick(C.plaster, seed), 0, 0.4 + h / 2, 0);
    b(w + 0.9, upper, d + 0.8, pick(C.plaster, seed + 1), 0, 0.4 + h + upper / 2, 0);  // çıkma kat

    // ahşap hatıllar
    for (const zz of [(d + 0.8) / 2 + 0.02, -(d + 0.8) / 2 - 0.02]) {
      b(w + 0.9, 0.22, 0.1, C.beam, 0, 0.4 + h + 0.12, zz);
      b(w + 0.9, 0.22, 0.1, C.beam, 0, 0.4 + h + upper - 0.12, zz);
      for (let i = -1; i <= 1; i++) b(0.2, upper - 0.4, 0.1, C.beam, i * (w / 3), 0.4 + h + upper / 2, zz);
      const diag = new THREE.Mesh(new THREE.BoxGeometry(0.18, upper - 0.5, 0.1), mat(C.beam));
      diag.castShadow = true;
      put(diag, w / 3 - 0.9, 0.4 + h + upper / 2, zz).rotation.z = 0.55;
    }
    for (const xx of [(w + 0.9) / 2 + 0.02, -(w + 0.9) / 2 - 0.02]) {
      b(0.1, 0.22, d + 0.8, C.beam, xx, 0.4 + h + 0.12, 0);
      b(0.1, 0.22, d + 0.8, C.beam, xx, 0.4 + h + upper - 0.12, 0);
    }

    // kapı + pencereler (ön yüz +z)
    const fz = d / 2 - 0.05;
    b(1.2, 2.1, 0.16, C.woodDark, -w / 4, 1.45, fz);
    b(1.4, 0.2, 0.3, C.beam, -w / 4, 2.6, fz);
    b(1.1, 1.0, 0.12, 0x2a2118, w / 4, 2.2, fz);
    b(1.2, 0.14, 0.2, C.beam, w / 4, 2.75, fz);
    const uz = (d + 0.8) / 2 - 0.05;
    for (const i of [-1, 1]) {
      b(1.0, 0.9, 0.12, 0x2a2118, i * w / 4, 0.4 + h + upper / 2, uz);
      b(1.1, 0.12, 0.2, C.beam, i * w / 4, 0.4 + h + upper / 2 + 0.5, uz);
    }

    // çatı
    const rh = 2.4 + (seed % 2) * 0.5;
    const thatched = seed % 4 === 3;
    const s = new THREE.Shape();
    s.moveTo(-(w + 1.8) / 2, 0); s.lineTo((w + 1.8) / 2, 0); s.lineTo(0, rh); s.closePath();
    const rg = new THREE.ExtrudeGeometry(s, { depth: d + 1.6, bevelEnabled: false });
    rg.translate(0, 0, -(d + 1.6) / 2);
    const rm = new THREE.Mesh(rg, mat(thatched ? C.thatch : pick(C.roof, seed), true));
    rm.castShadow = true; rm.receiveShadow = true;
    put(rm, 0, 0.4 + h + upper, 0);

    // baca
    b(0.8, 2.2, 0.8, C.stoneDark, w / 3, 0.4 + h + upper + rh * 0.55, -d / 4);

    const halfW = Math.abs(Math.cos(ry)) * (w + 0.9) / 2 + Math.abs(Math.sin(ry)) * (d + 0.8) / 2;
    const halfD = Math.abs(Math.sin(ry)) * (w + 0.9) / 2 + Math.abs(Math.cos(ry)) * (d + 0.8) / 2;
    colliders.push({ x0: x - halfW, x1: x + halfW, z0: z - halfD, z1: z + halfD });
    return g;
  }

  /* ---------------- meşale ---------------- */
  function torch(x, y, z, withLight = false) {
    cy(0.07, 0.09, 1.1, 6, C.woodDark, x, y + 0.55, z);
    const flame = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.17, 0),
      new THREE.MeshBasicMaterial({ color: 0xffb347 })
    );
    add(flame, x, y + 1.2, z);
    if (withLight) {
      const l = new THREE.PointLight(0xffa640, 1.6, 16, 2);
      l.position.set(x, y + 1.25, z);
      root.add(l);
      torches.push({ light: l, flame, base: 1.6, seed: Math.random() * 10 });
    } else {
      torches.push({ light: null, flame, base: 0, seed: Math.random() * 10 });
    }
  }

  function banner(x, y, z, ry, color = C.wine) {
    const g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.y = ry;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.0, 0.08), mat(color));
    cloth.castShadow = true;
    cloth.position.y = -1.5;
    const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.14), mat(C.gold));
    emblem.position.set(0, -1.2, 0.02);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 3), mat(color));
    tip.position.y = -3.2;
    g.add(cloth, emblem, tip);
    root.add(g);
  }

  function tree(x, z, s = 1) {
    cy(0.28 * s, 0.42 * s, 3.4 * s, 6, 0x4a3626, x, 1.7 * s, z);
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 * s - i * 0.25, 0), mat(i % 2 ? 0x3f5a2a : 0x4c6b33, true));
      b.castShadow = true; b.receiveShadow = true;
      add(b, x + (i - 1) * 0.6 * s, (3.3 + i * 0.9) * s, z + (i % 2 ? 0.5 : -0.4) * s);
    }
    colliders.push({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 });
  }

  function barrel(x, z) {
    cy(0.42, 0.36, 1.0, 8, C.wood, x, 0.5, z);
    cy(0.44, 0.44, 0.1, 8, 0x3a2a1c, x, 0.75, z);
    colliders.push({ x0: x - 0.42, x1: x + 0.42, z0: z - 0.42, z1: z + 0.42 });
  }
  function crate(x, z, ry = 0) {
    bx(0.9, 0.9, 0.9, C.wood, x, 0.45, z, ry);
    bx(0.95, 0.12, 0.95, C.woodDark, x, 0.45, z, ry);
    colliders.push({ x0: x - 0.6, x1: x + 0.6, z0: z - 0.6, z1: z + 0.6 });
  }

  function stall(x, z, ry, color) {
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    const put = (m, px, py, pz) => { m.position.set(px, py, pz); g.add(m); return m; };
    for (const sx of [-1.6, 1.6]) for (const sz of [-1.0, 1.0]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), mat(C.wood));
      p.castShadow = true; put(p, sx, 1.1, sz);
    }
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.2), mat(C.wood));
    table.castShadow = true; table.receiveShadow = true; put(table, 0, 1.0, 0);
    for (let i = 0; i < 5; i++) {                       // tezgâhtaki mallar
      const s = 0.18 + Math.random() * 0.16;
      const it = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mat(pick([0xc0392b, 0xd9a441, 0x7fb069, 0xa1673f], i), true));
      it.castShadow = true;
      put(it, -1.4 + i * 0.7, 1.1 + s, (Math.random() - 0.5) * 1.2);
    }
    const awn = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.12, 2.8), mat(color));
    awn.castShadow = true; put(awn, 0, 2.3, 0).rotation.x = 0.18;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.13, 0.5), mat(0xe8dcc0));
    put(stripe, 0, 2.33, 0.7).rotation.x = 0.18;
    colliders.push({ x0: x - 1.9, x1: x + 1.9, z0: z - 1.3, z1: z + 1.3 });
  }

  function well(x, z) {
    cy(1.3, 1.4, 1.1, 10, C.stone, x, 0.55, z);
    cy(1.05, 1.05, 0.2, 10, 0x1a2430, x, 1.05, z);
    for (const sx of [-1.1, 1.1]) cy(0.1, 0.1, 2.4, 6, C.wood, x + sx, 2.2, z);
    bx(2.6, 0.18, 0.18, C.wood, x, 3.35, z);
    roofPrism(3.0, 0.9, 2.2, C.roof[2], x, 3.4, z, Math.PI / 2);
    bx(0.5, 0.5, 0.5, C.wood, x, 2.8, z);
    colliders.push({ x0: x - 1.5, x1: x + 1.5, z0: z - 1.5, z1: z + 1.5 });
  }

  function cart(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 1.6), mat(C.wood));
    body.castShadow = true; body.position.y = 1.0; g.add(body);
    for (const sx of [-0.9, 0.9]) for (const sz of [-0.85, 0.85]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.14, 10), mat(C.woodDark));
      w.castShadow = true; w.rotation.z = Math.PI / 2; w.position.set(sx, 0.6, sz); g.add(w);
    }
    const hay = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.3), mat(C.thatch, true));
    hay.castShadow = true; hay.position.y = 1.6; g.add(hay);
    colliders.push({ x0: x - 1.8, x1: x + 1.8, z0: z - 1.2, z1: z + 1.2 });
  }

  /* ---------------- kasaba surları ---------------- */
  function wallRun(x, z, w, d, h, withBattlements = true) {
    bx(w, h, d, C.stone, x, h / 2, z);
    if (withBattlements) {
      const along = w > d;
      const len = along ? w : d;
      const n = Math.max(2, Math.floor(len / 1.6));
      for (let i = 0; i < n; i++) {
        const t = -len / 2 + 0.8 + i * (len - 1.6) / (n - 1);
        bx(along ? 0.8 : d + 0.1, 0.7, along ? d + 0.1 : 0.8,
           C.stoneDark, along ? x + t : x, h + 0.35, along ? z : z + t);
      }
    }
    solid(x, z, w, d);
  }

  function tower(x, z, r, h) {
    cy(r, r * 1.15, h, 10, C.stone, x, h / 2, z);
    cy(r * 1.25, r * 1.25, 0.5, 10, C.stoneDark, x, h + 0.25, z);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 1.35, r * 1.6, 10), mat(C.roof[1], true));
    cone.castShadow = true;
    add(cone, x, h + r * 0.9, z);
    colliders.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r });
  }

  // güney kasaba kapısı ve yan surlar
  wallRun(-24, 56, 26, 3, 6);
  wallRun(24, 56, 26, 3, 6);
  tower(-9, 56, 2.2, 8); tower(9, 56, 2.2, 8);
  bx(20, 2.0, 3.2, C.stone, 0, 7, 56);
  wallRun(-37, 16, 3, 84, 6);
  wallRun(37, 16, 3, 84, 6);

  /* ---------------- evler ---------------- */
  const rows = [
    [-15, 44, 0], [-15, 33, 0], [-15, 22, 0], [-15, -4, 0], [-15, -14, 0],
    [15, 44, Math.PI], [15, 33, Math.PI], [15, 22, Math.PI], [15, -4, Math.PI], [15, -14, Math.PI],
    [-26, 40, Math.PI / 2], [-26, 28, Math.PI / 2], [26, 40, -Math.PI / 2], [26, 26, -Math.PI / 2],
    [-24, -4, Math.PI / 2], [24, -6, -Math.PI / 2],
  ];
  rows.forEach((r, i) => house(r[0], r[1], r[2], i));

  // meydanı çevreleyen dükkânlar
  house(-19, 8, Math.PI / 2, 7);
  house(19, 6, -Math.PI / 2, 9);

  /* ---------------- pazar meydanı ---------------- */
  stall(-8, 4, 0.2, C.cloth[0]);
  stall(8, 3, -0.3, C.cloth[1]);
  stall(-7, 16, 3.0, C.cloth[2]);
  stall(7, 17, 3.4, C.cloth[3]);
  well(0, 11);
  cart(-12, 20, 0.6);
  barrel(4.5, 22); barrel(5.4, 21.2); crate(-4.5, 26, 0.3); crate(-5.2, 25.1, 0.9);
  crate(11, 12, 0.4); barrel(-11, 13);
  tree(-22, 16, 1.1); tree(22, 14, 0.9); tree(-28, -16, 1.2); tree(28, -18, 1.0);
  tree(-30, 48, 1.0); tree(30, 46, 1.1);
  torch(-6, 0, 30, true); torch(6, 0, 30, false);
  torch(-6, 0, -8, false); torch(6, 0, -8, false);

  /* ---------------- kale ---------------- */
  const gz = -32;                       // kale suru
  wallRun(-21, gz, 26, 4, 9);
  wallRun(21, gz, 26, 4, 9);
  tower(-6.5, gz, 3.0, 12); tower(6.5, gz, 3.0, 12);
  tower(-32, gz, 3.4, 12); tower(32, gz, 3.4, 12);
  bx(9, 3.2, 4.4, C.stone, 0, 10.4, gz);          // kapı üstü
  bx(9, 0.8, 4.6, C.stoneDark, 0, 12.3, gz);
  banner(-3.4, 9.6, gz + 2.4, 0); banner(3.4, 9.6, gz + 2.4, 0);
  torch(-4.6, 0, gz + 3.2, true); torch(4.6, 0, gz + 3.2, true);

  // kapı kanadı (itibar yetince yukarı çekilir)
  const gate = new THREE.Group();
  gate.position.set(0, 0, gz);
  root.add(gate);
  const gateSlab = new THREE.Mesh(new THREE.BoxGeometry(8.4, 8.6, 0.6), mat(C.woodDark));
  gateSlab.castShadow = true; gateSlab.receiveShadow = true;
  gateSlab.position.y = 4.3;
  gate.add(gateSlab);
  for (let i = -3; i <= 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 8.6, 0.75), mat(0x5b6068, true));
    bar.castShadow = true; bar.position.set(i * 1.2, 4.3, 0);
    gate.add(bar);
  }
  const gateCollider = { x0: -4.2, x1: 4.2, z0: gz - 0.5, z1: gz + 0.5 };
  colliders.push(gateCollider);
  // kapı boşluğunun yanları
  solid(-6.6, gz, 5.5, 4); solid(6.6, gz, 5.5, 4);

  // kale avlusu yan surları + arka sur
  wallRun(-32, -46, 3, 32, 8);
  wallRun(32, -46, 3, 32, 8);
  wallRun(0, -62, 66, 3, 8);
  tower(-32, -62, 3.4, 13); tower(32, -62, 3.4, 13);

  // iç kale (donjon)
  bx(16, 14, 12, C.stone, 0, 7, -56);
  bx(17.5, 1.0, 13.5, C.stoneDark, 0, 14.4, -56);
  for (let i = -4; i <= 4; i++) bx(1.0, 0.9, 13.6, C.stoneDark, i * 1.9, 15.3, -56);
  bx(4.0, 6.0, 0.6, C.woodDark, 0, 3.0, -49.8);
  solid(0, -56, 16, 12);
  tower(-9, -50, 2.6, 17); tower(9, -50, 2.6, 17);

  // taht sekisi
  const daisZ = -47;
  bx(14, 0.5, 8, C.stoneDark, 0, 0.25, daisZ);
  bx(11, 0.5, 6, C.stone, 0, 0.72, daisZ);
  const throne = new THREE.Group();
  throne.position.set(0, 0.97, daisZ - 1.2);
  root.add(throne);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.6), mat(C.wood));
  seat.castShadow = true; seat.position.y = 0.7; throne.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 0.3), mat(C.wood));
  back.castShadow = true; back.position.set(0, 2.0, -0.65); throne.add(back);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.36), mat(C.gold));
  crest.position.set(0, 3.3, -0.65); throne.add(crest);
  for (const sx of [-0.85, 0.85]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), mat(C.woodDark));
    leg.position.set(sx, 0.35, 0); throne.add(leg);
  }
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(5, 22), mat(C.wine));
  carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.06, daisZ + 13);
  carpet.receiveShadow = true; root.add(carpet);

  banner(-7, 8, -50, 0); banner(7, 8, -50, 0);
  banner(-13, 7, daisZ + 6, 0, 0x2f4f7a); banner(13, 7, daisZ + 6, 0, 0x2f4f7a);
  torch(-7, 0.5, daisZ + 1, true); torch(7, 0.5, daisZ + 1, true);
  crate(-20, -40, 0.2); barrel(-22, -42); crate(20, -38, 0.7); barrel(22, -41);
  tree(-25, -52, 1.0); tree(25, -52, 1.1);

  /* ---------------- kale dışı manzara ---------------- */
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 90;
    const x = Math.cos(a) * r, z = Math.sin(a) * r + 10;
    if (Math.abs(x) < 45 && z > -70 && z < 62) continue;
    cy(0.3, 0.45, 3, 5, 0x4a3626, x, 1.5, z);
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), mat(0x3f5a2a, true));
    b.castShadow = true; add(b, x, 4, z);
  }
  for (let i = 0; i < 7; i++) {          // ufuktaki tepeler
    const a = -0.4 + i * 0.42;
    const h = 14 + (i % 3) * 8;
    const m = new THREE.Mesh(new THREE.ConeGeometry(26 + i * 3, h, 5), mat(0x4a5a52, true));
    add(m, Math.sin(a) * 190, h / 2 - 3, -Math.cos(a) * 190 - 20);
  }

  return {
    root, colliders, torches, gate, gateCollider,
    daisZ,
    openGate() {
      gate.userData.opening = true;
      const idx = colliders.indexOf(gateCollider);
      if (idx >= 0) colliders.splice(idx, 1);
    },
    update(t, dt = 0.016) {
      for (const tr of torches) {
        const f = 0.75 + Math.sin(t * 9 + tr.seed) * 0.15 + Math.sin(t * 21 + tr.seed * 3) * 0.1;
        tr.flame.scale.setScalar(0.85 + f * 0.35);
        if (tr.light) tr.light.intensity = tr.base * f;
      }
      if (gate.userData.opening && gate.position.y < 8.4) {
        gate.position.y = Math.min(8.4, gate.position.y + 2.2 * dt);
      }
    }
  };
}
