import * as THREE from 'three';

/* Küçük sinematik motoru: kamera anahtar kareleri, siyah bantlar ve
   alt yazılar. Boşluk/Esc ile geçilebilir. */

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export function createCinema(camera, dom) {
  const st = { active: false, shots: [], i: 0, t: 0, done: null };
  const pos = new THREE.Vector3(), look = new THREE.Vector3();

  function enterShot() {
    const s = st.shots[st.i];
    dom.cap.textContent = s.cap || '';
    dom.cap.classList.toggle('on', !!s.cap);
    if (s.onEnter) s.onEnter();
  }

  function finish() {
    st.active = false;
    dom.bars.classList.remove('on');
    dom.cap.classList.remove('on');
    const d = st.done; st.done = null;
    // atlanan çekimlerin yan etkileri (kapı açılması gibi) yine de çalışsın
    for (let i = st.i; i < st.shots.length; i++) if (st.shots[i].onEnter && !st.shots[i].__ran) st.shots[i].onEnter();
    if (d) d();
  }

  return {
    get active() { return st.active; },
    play(shots, done) {
      st.shots = shots.map((s) => ({ ...s, __ran: false }));
      st.shots.forEach((s) => {
        const orig = s.onEnter;
        s.onEnter = orig ? () => { if (!s.__ran) { s.__ran = true; orig(); } } : null;
      });
      st.i = 0; st.t = 0; st.active = true; st.done = done;
      dom.bars.classList.add('on');
      enterShot();
    },
    skip() { if (st.active) finish(); },
    update(dt) {
      if (!st.active) return;
      const s = st.shots[st.i];
      st.t += dt;
      const k = Math.min(1, st.t / s.dur);
      const e = (s.ease || easeInOut)(k);
      pos.lerpVectors(s.from, s.to || s.from, e);
      look.lerpVectors(s.look, s.look2 || s.look, e);
      camera.position.copy(pos);
      camera.lookAt(look);
      if (k >= 1) {
        st.i++; st.t = 0;
        if (st.i >= st.shots.length) finish();
        else enterShot();
      }
    },
  };
}

export { V };
