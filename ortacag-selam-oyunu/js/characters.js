import * as THREE from 'three';

/* Ortaçağ halkı: kutulardan yontulmuş, düşük poligonlu bedenler.
   Her karakter "poz" nesnesiyle sürülür; oyun döngüsü her karede
   ch.pose({...}) çağırır, iskelet o pozu uygular. */

const box = (w, h, d, color, opts = {}) => {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color, ...opts })
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

const cyl = (rt, rb, h, seg, color) => {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, seg),
    new THREE.MeshLambertMaterial({ color })
  );
  m.castShadow = true;
  return m;
};

export function createCharacter(cfg = {}) {
  const c = {
    skin: 0xd7a678, cloth: 0x6b4a2f, cloth2: 0x4a3320, trim: 0x8a6a3a,
    hat: null, cape: null, beard: null, hair: 0x2b1d12, scale: 1,
    hatType: 'cap', ...cfg
  };

  const group = new THREE.Group();
  const root = new THREE.Group();           // diz çökerken alçalan gövde kökü
  group.add(root);

  // --- bacaklar (kalçadan sallanır) ---
  const legs = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(0.16 * side, 0.78, 0);
    const th = box(0.22, 0.5, 0.24, c.cloth2);
    th.position.y = -0.25;
    const boot = box(0.24, 0.3, 0.3, 0x3a2a1c);
    boot.position.set(0, -0.62, 0.03);
    g.add(th, boot);
    root.add(g);
    legs.push(g);
  }

  // --- gövde (belden kırılır) ---
  const torso = new THREE.Group();
  torso.position.y = 0.78;
  root.add(torso);

  const chest = box(0.62, 0.7, 0.36, c.cloth);
  chest.position.y = 0.35;
  torso.add(chest);

  const belt = box(0.66, 0.1, 0.4, 0x3a2a1c);
  belt.position.y = 0.06;
  torso.add(belt);

  const collar = box(0.5, 0.1, 0.42, c.trim);
  collar.position.y = 0.7;
  torso.add(collar);

  // pelerin
  let cape = null;
  if (c.cape !== null && c.cape !== undefined) {
    cape = new THREE.Group();
    cape.position.set(0, 0.68, -0.18);
    const cloth = box(0.66, 0.95, 0.06, c.cape);
    cloth.position.y = -0.45;
    cape.add(cloth);
    torso.add(cape);
  }

  // --- kollar ---
  const arms = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(0.39 * side, 0.62, 0);
    const upper = box(0.18, 0.42, 0.2, c.cloth);
    upper.position.y = -0.21;
    const hand = box(0.17, 0.18, 0.18, c.skin);
    hand.position.y = -0.5;
    g.add(upper, hand);
    torso.add(g);
    arms.push(g);
  }

  // --- baş ---
  const head = new THREE.Group();
  head.position.y = 0.78;
  torso.add(head);

  const skull = box(0.36, 0.36, 0.34, c.skin);
  skull.position.y = 0.18;
  head.add(skull);

  const hair = box(0.38, 0.12, 0.36, c.hair);
  hair.position.y = 0.36;
  head.add(hair);

  for (const side of [-1, 1]) {
    const eye = box(0.06, 0.06, 0.03, 0x241a12);
    eye.position.set(0.08 * side, 0.2, 0.18);
    eye.castShadow = false;
    head.add(eye);
  }

  if (c.beard !== null && c.beard !== undefined) {
    const b = box(0.28, 0.18, 0.1, c.beard);
    b.position.set(0, 0.06, 0.15);
    head.add(b);
  }

  // --- şapka / başlık ---
  let hat = null;
  if (c.hat !== null && c.hat !== undefined) {
    hat = new THREE.Group();
    hat.position.y = 0.4;
    if (c.hatType === 'cone') {          // sivri külah
      const cone = cyl(0.02, 0.24, 0.5, 8, c.hat);
      cone.position.y = 0.25;
      hat.add(cone);
    } else if (c.hatType === 'crown') {  // taç
      const band = cyl(0.23, 0.23, 0.14, 10, c.hat);
      band.position.y = 0.07;
      hat.add(band);
      for (let i = 0; i < 6; i++) {
        const s = box(0.06, 0.14, 0.06, c.hat);
        const a = (i / 6) * Math.PI * 2;
        s.position.set(Math.cos(a) * 0.2, 0.19, Math.sin(a) * 0.2);
        hat.add(s);
      }
    } else if (c.hatType === 'helm') {   // miğfer
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: c.hat })
      );
      dome.castShadow = true;
      dome.position.y = 0.04;
      const nasal = box(0.06, 0.26, 0.06, c.hat);
      nasal.position.set(0, -0.06, 0.19);
      hat.add(dome, nasal);
    } else {                              // geniş kenarlı efendi şapkası
      const brim = cyl(0.34, 0.34, 0.05, 12, c.hat);
      brim.position.y = 0.02;
      const top = cyl(0.2, 0.22, 0.22, 12, c.hat);
      top.position.y = 0.14;
      hat.add(brim, top);
      if (c.feather !== undefined) {
        const f = box(0.05, 0.34, 0.05, c.feather);
        f.position.set(0.16, 0.26, -0.04);
        f.rotation.z = -0.5;
        hat.add(f);
      }
    }
    head.add(hat);
  }

  group.scale.setScalar(c.scale);

  const parts = { root, torso, head, arms, legs, hat, cape, chest };
  const base = { hatY: hat ? hat.position.y : 0 };

  /* poz: {walkPhase, walk, bow, kneel, nod, wave, hatOff, heart, turn} */
  function pose(p = {}) {
    const walk = p.walk || 0, ph = p.walkPhase || 0;
    const bow = p.bow || 0, kneel = p.kneel || 0;
    const nod = p.nod || 0, wave = p.wave || 0;
    const heart = p.heart || 0, hatOff = p.hatOff || 0;

    root.position.y = -0.42 * kneel;

    const swing = Math.sin(ph) * 0.62 * walk;
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;
    legs[0].rotation.z = 0;
    legs[1].rotation.z = 0;

    if (kneel > 0) {                     // sağ diz yerde, sol diz havada
      legs[0].rotation.x = THREE.MathUtils.lerp(legs[0].rotation.x, -1.35, kneel);
      legs[1].rotation.x = THREE.MathUtils.lerp(legs[1].rotation.x, 0.55, kneel);
      legs[1].rotation.z = -0.25 * kneel;
    }

    torso.rotation.x = 0.95 * bow + 0.4 * kneel;
    torso.position.z = -0.12 * bow;
    head.rotation.x = 0.5 * nod + 0.2 * bow + 0.25 * kneel;

    const armSwing = -Math.sin(ph) * 0.5 * walk;
    arms[0].rotation.set(armSwing, 0, 0.08);
    arms[1].rotation.set(-armSwing, 0, -0.08);

    const h = Math.max(heart, bow * 0.9, kneel * 0.8);
    if (h > 0.01) {                      // el kalbe
      arms[1].rotation.x = THREE.MathUtils.lerp(arms[1].rotation.x, -1.35, h);
      arms[1].rotation.z = THREE.MathUtils.lerp(arms[1].rotation.z, 0.95, h);
    }
    if (wave > 0.01) {
      arms[1].rotation.x = THREE.MathUtils.lerp(arms[1].rotation.x, -2.3, wave);
      arms[1].rotation.z = THREE.MathUtils.lerp(arms[1].rotation.z, Math.sin(ph * 2.4) * 0.45, wave);
    }
    if (hat) {                            // şapkayı çıkarma
      hat.position.y = base.hatY + 0.55 * hatOff;
      hat.rotation.z = -0.9 * hatOff;
      if (hatOff > 0.01) {
        arms[0].rotation.x = THREE.MathUtils.lerp(arms[0].rotation.x, -1.9, hatOff);
        arms[0].rotation.z = THREE.MathUtils.lerp(arms[0].rotation.z, -0.35, hatOff);
      }
    }
    if (cape) cape.rotation.x = -0.12 * walk * Math.abs(Math.sin(ph)) - 0.2 * bow;
  }

  pose({});
  return { group, parts, pose, cfg: c };
}
