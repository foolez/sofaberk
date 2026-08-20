/* Küçük prosedürel ses mutfağı: dosya yok, hepsi WebAudio ile üretiliyor. */
let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', gain = 0.15, slide = 0) {
  const a = ac(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

function noise(dur, freq, q, gain = 0.2) {
  const a = ac(), t = a.currentTime;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const Sfx = {
  unlock() { try { ac(); } catch (e) { /* ses yoksa oyun yine de oynanır */ } },
  step(run) { try { noise(run ? 0.09 : 0.12, 220 + Math.random() * 120, 1.2, run ? 0.09 : 0.05); } catch (e) {} },
  good() { try { tone(523, 0.18, 'sine', 0.12); setTimeout(() => tone(784, 0.28, 'sine', 0.1), 90); } catch (e) {} },
  perfect() { try { tone(659, 0.16, 'triangle', 0.12); setTimeout(() => tone(988, 0.16, 'triangle', 0.11), 80); setTimeout(() => tone(1318, 0.4, 'sine', 0.09), 170); } catch (e) {} },
  bad() { try { tone(180, 0.35, 'sawtooth', 0.09, -80); } catch (e) {} },
  cloth() { try { noise(0.22, 900, 0.7, 0.06); } catch (e) {} },
  bell() {
    try {
      [392, 523.25, 659.25].forEach((f, i) =>
        setTimeout(() => { tone(f, 2.2, 'sine', 0.09); tone(f * 2.01, 1.4, 'sine', 0.035); }, i * 60));
    } catch (e) {}
  },
  gate() { try { noise(1.4, 90, 0.6, 0.25); tone(70, 1.6, 'sawtooth', 0.06, 20); } catch (e) {} },
  horn() {
    try { tone(196, 0.9, 'sawtooth', 0.07); setTimeout(() => tone(262, 1.2, 'sawtooth', 0.07), 260); } catch (e) {}
  },
  clink() {
    try { tone(1760, 0.3, 'triangle', 0.06); setTimeout(() => tone(2340, 0.25, 'triangle', 0.04), 40); } catch (e) {}
  },
  cheer() {                       // kalabalık sevinci
    try {
      noise(1.1, 700, 0.5, 0.16);
      noise(1.4, 1500, 0.4, 0.08);
      for (let i = 0; i < 7; i++) {
        setTimeout(() => tone(300 + Math.random() * 420, 0.5 + Math.random() * 0.4,
          'triangle', 0.035, 60), i * 70);
      }
    } catch (e) {}
  },

  /* --- ziyafet müziği: ud benzeri mızrap + def --- */
  _music: null,
  music(on) {
    try {
      if (!on) {
        if (this._music) { clearInterval(this._music); this._music = null; }
        return;
      }
      if (this._music) return;
      // Hicaz benzeri bir dizi
      const scale = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 554.37, 587.33];
      let step = 0;
      const bar = () => {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const n = scale[(step * 3 + i * 2 + (i === 3 ? 1 : 0)) % scale.length];
            tone(n, 0.42, 'triangle', 0.05);
            tone(n / 2, 0.5, 'sine', 0.022);
            if (i % 2 === 0) noise(0.14, 130, 1.4, 0.07);   // def
            else noise(0.08, 420, 1.8, 0.03);
          }, i * 300);
        }
        step++;
      };
      bar();
      this._music = setInterval(bar, 1200);
    } catch (e) {}
  },
};
