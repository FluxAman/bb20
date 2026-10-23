/* ============================================================================
   BIGG BOSS FIGHT : PRO AUDIO & VOICE SYNTHESIZER ENGINE
   ============================================================================ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.lastVoiceTime = 0;
    this.distortionCurve = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // Generates distortion curve for heavy rockstar electric guitars
  getDistortionCurve(amount = 50) {
    if (this.distortionCurve) return this.distortionCurve;
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.distortionCurve = curve;
    return curve;
  }

  // High-Impact Hit FX (Light, Heavy, Block, Throw)
  playImpact(heavy = false, blocked = false) {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Transient Impact Slap (High frequency burst)
      const bufferSize = Math.floor(this.ctx.sampleRate * (heavy ? 0.16 : 0.08));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = blocked ? 'bandpass' : 'lowpass';
      filter.frequency.value = blocked ? 1200 : (heavy ? 420 : 750);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(heavy ? 0.6 : 0.38, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + (heavy ? 0.16 : 0.08));

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);

      // 2. Heavy Sub-Bass 808 Thud for heavy bone-crushing impacts
      if (heavy && !blocked) {
        const osc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);

        bassGain.gain.setValueAtTime(0.7, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

        osc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      }

      // 3. Metallic clang if blocked
      if (blocked) {
        const clang = this.ctx.createOscillator();
        const clangGain = this.ctx.createGain();
        clang.type = 'triangle';
        clang.frequency.setValueAtTime(980, t);
        clang.frequency.exponentialRampToValueAtTime(320, t + 0.12);
        clangGain.gain.setValueAtTime(0.35, t);
        clangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        clang.connect(clangGain);
        clangGain.connect(this.ctx.destination);
        clang.start(t);
        clang.stop(t + 0.14);
      }
    } catch (e) {}
  }

  // Electric Wind God Fist Zap
  playElectricZap() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(120, t + 0.18);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.19);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  // Flying Kick / Air Whoosh
  playWhoosh() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(680, t + 0.12);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    } catch (e) {}
  }

  // Realistic Sword Unsheathe Metallic Chime ("Chiiing!")
  playSwordDraw() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, t);
      osc.frequency.exponentialRampToValueAtTime(3400, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(2800, t + 0.35);

      gain.gain.setValueAtTime(0.26, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.39);
    } catch (e) {}
  }

  // High Velocity Blade Swing / Air Slice
  playSwordSwing() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.13);
      filter.Q.value = 3.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch (e) {}
  }

  // Heavy Sword Blade Slice Impact (Steel on Target)
  playSwordSlice() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Sharp cutting noise slice
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1400;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);

      // 2. Heavy flesh impact sub-bass thud
      const osc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      bassGain.gain.setValueAtTime(0.65, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.21);
    } catch (e) {}
  }

  // Vampiric Life-Steal Harmonic Shimmer
  playLifeHeal() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.03);
        gain.gain.setValueAtTime(0.08, t + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.03);
        osc.stop(t + idx * 0.03 + 0.22);
      });
    } catch (e) {}
  }

  // Crowd Reaction (Gasp / Roar)
  playCrowdRoar() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t);
      filter.Q.value = 1.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch (e) {}
  }

  // Distinct OP Character Synthesizer
  playOPSynth(isAttack = true) {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isAttack ? 340 : 520, t);
      osc.frequency.exponentialRampToValueAtTime(isAttack ? 780 : 180, t + 0.16);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
    } catch (e) {}
  }

  // Distinct Rockstar Heavy Guitar Distortion Chord
  playRockstarGuitar(isAttack = true) {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const baseFreq = isAttack ? 146.83 : 110.0; // D3 or A2 heavy rock chord
      const distortion = this.ctx.createWaveShaper();
      distortion.curve = this.getDistortionCurve(60);
      distortion.oversample = '4x';

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.24, t);
      masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      [1, 1.498, 2.0].forEach(multiplier => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq * multiplier, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * multiplier * (isAttack ? 1.05 : 0.94), t + 0.36);
        osc.connect(distortion);
        osc.start(t);
        osc.stop(t + 0.38);
      });

      distortion.connect(masterGain);
      masterGain.connect(this.ctx.destination);
    } catch (e) {}
  }

  // Character Voice Callout
  triggerCharacterVoice(fighterData, eventType = 'attack') {
    this.init();

    if (fighterData.voiceType === 'OP') {
      this.playOPSynth(eventType === 'attack');
    } else {
      this.playRockstarGuitar(eventType === 'attack');
    }

    const now = performance.now();
    if (now - this.lastVoiceTime < 260) return;
    this.lastVoiceTime = now;

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        let quote = '';
        if (fighterData.voiceType === 'OP') {
          const quotes = ['O P!', 'O P Bhai O P!', 'Full O P!', 'System Hang O P!'];
          quote = quotes[Math.floor(Math.random() * quotes.length)];
        } else {
          const quotes = ['Rockstar!', 'I am a Rockstar!', 'Rockstar Energy!', 'Dil se Rockstar!'];
          quote = quotes[Math.floor(Math.random() * quotes.length)];
        }

        const utter = new SpeechSynthesisUtterance(quote);
        utter.pitch = eventType === 'hit' ? fighterData.voicePitch * 1.2 : fighterData.voicePitch;
        utter.rate = fighterData.voiceRate || 1.1;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}
  }

  // Dynamic Announcer
  announce(text) {
    this.init();
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 0.72;
        utter.rate = 1.02;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
