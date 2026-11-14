// The kid's recording, playing quietly under the share screen.
// Pass the real recording's URL (or a File/Blob URL). Without one, a soft placeholder piano melody plays
// (Twinkle Twinkle Little Star, public domain) so the screen can be reviewed with sound.
// Browsers only allow audio after a tap: call start() from a user gesture (e.g. the tap that opens the share screen).
export function createRecording({ src = null, volume = 0.22 } = {}) {
  let audio = null, ctx = null, gain = null, timer = null, playing = false, url = src;

  const MELODY = [[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
                  [67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2]];
  const BEAT = 0.42;
  function note(midi, t, dur) { // simple felt-piano tone: two partials, quick attack, long decay
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    for (const [mult, amp, type] of [[1, .7, 'triangle'], [2, .18, 'sine']]) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f * mult;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + dur * BEAT + .9);
      o.connect(g).connect(gain); o.start(t); o.stop(t + dur * BEAT + 1);
    }
  }
  function schedule() { let t = ctx.currentTime + .05; for (const [m, d] of MELODY) { note(m, t, d); t += d * BEAT; } return (t - ctx.currentTime) * 1000; }

  return {
    get playing() { return playing; },
    get hasRealRecording() { return !!url; },
    setSource(newUrl) { const was = playing; this.stop(); url = newUrl; audio = null; if (was) this.start(); },
    start() {
      if (playing) return; playing = true;
      if (url) { audio = audio || Object.assign(new Audio(url), { loop: true, volume }); audio.currentTime = 0; audio.play().catch(() => { playing = false; }); return; }
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume(); gain = ctx.createGain(); gain.gain.value = volume; gain.connect(ctx.destination);
      const loop = () => { if (!playing) return; const ms = schedule(); timer = setTimeout(loop, ms + 300); }; loop();
    },
    stop() {
      playing = false; clearTimeout(timer);
      if (audio) audio.pause();
      if (gain) { const g = gain; g.gain.setTargetAtTime(0, ctx.currentTime, .08); setTimeout(() => g.disconnect(), 400); gain = null; }
    },
  };
}
