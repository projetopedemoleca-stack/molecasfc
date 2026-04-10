// Audio Engine - uses Web Audio API to generate sounds synthetically (no files needed)
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.crowdNode = null;
    this.crowdGain = null;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _playTone({ freq = 440, type = 'sine', duration = 0.15, volume = 0.3, delay = 0, ramp = true }) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration + 0.05);
  }

  // Action sounds
  playPass() {
    this._playTone({ freq: 520, type: 'sine', duration: 0.12, volume: 0.25 });
    this._playTone({ freq: 700, type: 'sine', duration: 0.1, volume: 0.2, delay: 0.08 });
  }

  playDribble() {
    [0, 0.07, 0.14].forEach((d, i) => {
      this._playTone({ freq: 300 + i * 40, type: 'triangle', duration: 0.06, volume: 0.2, delay: d });
    });
  }

  playShoot() {
    this._playTone({ freq: 180, type: 'sawtooth', duration: 0.08, volume: 0.4 });
    this._playTone({ freq: 120, type: 'sine', duration: 0.2, volume: 0.3, delay: 0.06 });
  }

  playWin() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => this._playTone({ freq, type: 'sine', duration: 0.18, volume: 0.35, delay: i * 0.15 }));
  }

  playLose() {
    const melody = [400, 350, 280];
    melody.forEach((freq, i) => this._playTone({ freq, type: 'triangle', duration: 0.2, volume: 0.25, delay: i * 0.18 }));
  }

  playDraw() {
    this._playTone({ freq: 440, type: 'sine', duration: 0.25, volume: 0.2 });
    this._playTone({ freq: 440, type: 'sine', duration: 0.25, volume: 0.2, delay: 0.3 });
  }

  playGoal() {
    const melody = [523, 659, 784, 880, 1047, 880, 1047];
    melody.forEach((freq, i) => this._playTone({ freq, type: 'sine', duration: 0.2, volume: 0.4, delay: i * 0.12 }));
  }

  playSuspense() {
    // Low pulsing drum roll before reveal
    [0, 0.15, 0.28, 0.38, 0.46, 0.53, 0.59, 0.64].forEach((d) => {
      this._playTone({ freq: 80, type: 'sawtooth', duration: 0.08, volume: 0.15, delay: d });
    });
  }

  playSelect() {
    this._playTone({ freq: 660, type: 'sine', duration: 0.08, volume: 0.2 });
  }

  // Crowd ambience - looping noise
  startCrowd() {
    if (!this.enabled || !this.ctx || this.crowdNode) return;
    this._resume();
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.015;

      this.crowdNode = this.ctx.createBufferSource();
      this.crowdNode.buffer = buffer;
      this.crowdNode.loop = true;

      // Bandpass filter for "crowd murmur" feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.value = 0;

      this.crowdNode.connect(filter);
      filter.connect(this.crowdGain);
      this.crowdGain.connect(this.ctx.destination);
      this.crowdNode.start();

      // Fade in crowd
      this.crowdGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);
    } catch (e) {
      // silently fail
    }
  }

  stopCrowd() {
    if (!this.crowdNode || !this.crowdGain) return;
    try {
      this.crowdGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      setTimeout(() => {
        try { this.crowdNode?.stop(); } catch (e) {}
        this.crowdNode = null;
        this.crowdGain = null;
      }, 1100);
    } catch (e) {}
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) this.stopCrowd();
  }
}

export const audio = new AudioEngine();