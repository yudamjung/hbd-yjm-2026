// "생일 축하합니다" 멜로디를 Web Audio로 합성 (피아노풍).
// 1회차는 또렷하게, 이후에는 부드럽게 무한 루프 (기획 3.3 "피아노 버전 루프").
const N = {
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

// [주파수, 박자] — 클래식 Happy Birthday (3/4박, 당김음 "Ha-ppy")
const MELODY = [
  [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
  [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
  [N.G4, 0.75], [N.G4, 0.25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.B4, 1], [N.A4, 1],
  [N.F5, 0.75], [N.F5, 0.25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2],
];
const BEAT = 0.42; // 초/박

export function createBirthdaySong() {
  let ctx = null;
  let master = null;
  let timers = [];
  let started = false;

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
  }

  // 피아노풍 한 음: triangle(기본) + 옥타브 sine(배음), 빠른 어택 + 지수 감쇠
  function playNote(freq, start, dur, vel) {
    const g = ctx.createGain();
    g.connect(master);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vel, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, start + dur * 0.95);

    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;
    o1.connect(g);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.22;
    o2.connect(g2);
    g2.connect(g);

    o1.start(start); o2.start(start);
    o1.stop(start + dur); o2.stop(start + dur);
  }

  function scheduleMelody(at, vel) {
    let t = at;
    for (const [freq, beats] of MELODY) {
      const dur = beats * BEAT;
      playNote(freq, t, dur * 0.95, vel);
      t += dur;
    }
    return t; // 멜로디 종료 시각
  }

  function loopFrom(at, vel) {
    const end = scheduleMelody(at, vel);
    const ms = (end - ctx.currentTime - 0.05) * 1000;
    timers.push(setTimeout(() => loopFrom(ctx.currentTime + 0.05, vel), Math.max(50, ms)));
  }

  return {
    // 재생 시도. 자동재생이 막혀 있으면 false 반환(이후 사용자 제스처로 재시도).
    async start() {
      ensure();
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /* 자동재생 차단 */ }
      }
      if (ctx.state !== 'running') return false;
      if (started) {
        master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.2);
        return true;
      }
      started = true;
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 0.3);
      const end = scheduleMelody(ctx.currentTime + 0.15, 0.85); // 1회차
      const ms = (end - ctx.currentTime + 0.1) * 1000;
      timers.push(setTimeout(() => loopFrom(ctx.currentTime + 0.1, 0.45), ms)); // 이후 루프
      return true;
    },
    setMuted(m) {
      if (!ctx || !master) return;
      master.gain.linearRampToValueAtTime(m ? 0.0001 : 0.7, ctx.currentTime + 0.2);
    },
    stop() {
      timers.forEach(clearTimeout);
      timers = [];
      if (ctx) { ctx.close(); ctx = null; master = null; started = false; }
    },
    get running() { return !!ctx && ctx.state === 'running' && started; },
  };
}
