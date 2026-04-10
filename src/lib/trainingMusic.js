// Chiptune music engine for training screens
const bgMusic = (() => {
  let actx = null, masterGain = null, timerId = null;
  let currentTrack = null, currentStep = 0, muted = false;

  const ctx = () => {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = actx.createGain();
      masterGain.gain.value = 0.13;
      masterGain.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  };

  const osc = (freq, type, dur, vol) => {
    if (muted) return;
    const c = ctx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + dur);
  };

  const kick = () => {
    if (muted) return;
    const c = ctx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.11);
    g.gain.setValueAtTime(0.75, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g); g.connect(masterGain); o.start(t); o.stop(t + 0.14);
  };

  const snare = () => {
    if (muted) return;
    const c = ctx();
    const size = Math.floor(c.sampleRate * 0.07);
    const buf = c.createBuffer(1, size, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < size; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 3200;
    const g = c.createGain(); const t = c.currentTime;
    g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    src.connect(flt); flt.connect(g); g.connect(masterGain); src.start(t);
  };

  const N = {
    C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,
  };

  const TRACKS = {
    sport: {
      bpm: 138,
      pat: (s) => {
        if (s % 4 === 0) kick();
        if (s % 4 === 2) snare();
        if (s % 2 === 1) osc(N.A5, 'square', 0.03, 0.05);
        const mel = [N.G4,0,N.A4,N.C5,N.D5,0,N.C5,N.A4,N.G4,N.E4,N.G4,0,N.A4,0,N.D5,0,
                     N.E5,0,N.D5,N.C5,N.A4,0,N.G4,N.E4,N.D4,N.E4,N.G4,0,N.A4,N.C5,N.D5,0][s];
        if (mel) osc(mel, 'square', 0.14, 0.22);
        const bas = [N.G3,0,0,0,N.C4,0,0,0,N.A3,0,0,0,N.D4,0,0,0,
                     164.81,0,0,0,N.C4,0,0,0,N.G3,0,0,0,N.D4,0,0,0][s];
        if (bas) osc(bas, 'sawtooth', 0.17, 0.28);
      },
    },
    match: {
      bpm: 160,
      pat: (s) => {
        if (s % 4 === 0) kick();
        if (s % 4 === 2) snare();
        if (s % 2 === 1) osc(N.A5 * 1.5, 'square', 0.025, 0.07);
        const mel = [N.C5,0,N.E5,0,N.G5,N.E5,N.C5,0,N.D5,0,N.A4,N.D5,N.E5,0,N.G5,N.E5,
                     N.C5,N.E5,N.G5,0,N.A5,0,N.G5,N.E5,N.D5,N.C5,N.D5,0,N.E5,0,N.C5,0][s];
        if (mel) osc(mel, 'square', 0.11, 0.21);
        const bas = [N.C4,0,0,N.C4,N.G3,0,0,0,N.A3,0,0,N.A3,N.G3,0,N.C4,0,
                     N.C4,0,N.G3,0,N.A3,0,N.F3,0,N.G3,0,0,N.G3,N.C4,0,0,0][s];
        if (bas) osc(bas, 'sawtooth', 0.14, 0.3);
      },
    },
    english: {
      bpm: 112,
      pat: (s) => {
        if (s % 8 === 0) kick();
        if (s % 8 === 4) snare();
        if (s % 4 === 2) osc(N.A5, 'triangle', 0.04, 0.06);
        const mel = [N.C4,0,N.E4,0,N.G4,0,N.E4,N.C4,N.D4,0,N.F4,0,N.E4,0,0,0,
                     N.G4,0,N.A4,0,N.G4,N.E4,N.C4,0,N.D4,N.E4,N.F4,0,N.E4,0,N.C4,0][s];
        if (mel) osc(mel, 'triangle', 0.2, 0.17);
        const bas = [N.C3,0,0,0,N.G3,0,0,0,N.F3,0,0,0,N.G3,0,0,0,
                     N.C3,0,0,0,N.A3,0,0,0,N.F3,0,0,0,N.G3,0,0,0][s];
        if (bas) osc(bas, 'sine', 0.22, 0.24);
      },
    },
  };

  const stop = () => { clearInterval(timerId); timerId = null; currentTrack = null; currentStep = 0; };
  const tick = () => {
    if (!currentTrack) return;
    const tr = TRACKS[currentTrack];
    if (!tr) return;
    tr.pat(currentStep);
    currentStep = (currentStep + 1) % 32;
  };

  return {
    play(trackName) {
      if (currentTrack === trackName) return;
      stop();
      currentTrack = trackName;
      currentStep = 0;
      const bpm = TRACKS[trackName]?.bpm || 130;
      const ms = (60000 / bpm) / 2;
      timerId = setInterval(tick, ms);
    },
    stop,
    toggleMute() {
      muted = !muted;
      if (masterGain && actx) masterGain.gain.setTargetAtTime(muted ? 0 : 0.13, actx.currentTime, 0.1);
      return muted;
    },
    isMuted: () => muted,
    isPlaying: () => !!timerId,
  };
})();

function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  utter.onend = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) { const c = new AudioContext(); if (c.state === 'suspended') c.resume(); c.close(); }
    } catch (_) {}
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export { bgMusic, speak };