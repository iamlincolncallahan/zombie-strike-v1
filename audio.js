// Freesound recordings and provenance are listed in assets/audio/CREDITS.md.
export class GameAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.buffers = new Map();
    this.voices = new Set();
    this.muted = false;
    this.paused = true;
    this.loading = null;
    this.failures = [];
    // Fetch early, but create/resume Web Audio only after a user gesture.
    this.files = ['footstep', 'gunshot', 'reload', 'zombie'].map(async name => {
      try {
        const response = await fetch(`assets/audio/${name}.mp3`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { name, data: await response.arrayBuffer() };
      } catch (error) {
        this.failures.push(name);
        console.warn(`Could not load ${name} audio`, error);
        return null;
      }
    });
  }

  async unlock() {
    try {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : .75;
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.value = -8;
        limiter.ratio.value = 8;
        this.master.connect(limiter).connect(this.context.destination);
      }
      const resumed = this.context.resume();
      this.loading ??= Promise.all(this.files.map(async file => {
        const result = await file;
        if (!result) return;
        try { this.buffers.set(result.name, await this.context.decodeAudioData(result.data)); }
        catch (error) { this.failures.push(result.name); console.warn(`Could not decode ${result.name}`, error); }
      }));
      await Promise.all([resumed, this.loading]);
    } catch (error) { console.warn('Audio unavailable', error); }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : .75;
    if (muted) this.stopAll();
  }

  setPaused(paused) {
    this.paused = paused;
    if (paused) this.stopAll();
  }

  stopAll() { for (const voice of [...this.voices]) voice.stop(); }

  play(name, { volume = 1, rate = 1, duration, position = null, listener = null } = {}) {
    const buffer = this.buffers.get(name);
    if (!buffer || this.muted || this.paused || this.context.state !== 'running') return null;
    if (name === 'zombie' && [...this.voices].filter(v => v.name === name).length >= 3) return null;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const pan = this.context.createStereoPanner();
    source.buffer = buffer;
    source.playbackRate.value = duration ? buffer.duration / duration : rate;
    gain.gain.value = volume;
    source.connect(gain).connect(pan).connect(this.master);
    const voice = { name, source, gain, pan, position, volume, stop: () => {
      if (!this.voices.delete(voice)) return;
      source.stop();
      source.disconnect(); gain.disconnect(); pan.disconnect();
    }};
    source.onended = () => {
      this.voices.delete(voice);
      source.disconnect(); gain.disconnect(); pan.disconnect();
    };
    this.voices.add(voice);
    if (listener) this.updateVoice(voice, listener);
    source.start();
    return voice;
  }

  updateVoice(voice, listener) {
    if (!voice.position) return;
    const dx = voice.position.x - listener.x, dz = voice.position.z - listener.z;
    const dy = voice.position.y - listener.y;
    const distance = Math.hypot(dx, dy, dz);
    const attenuation = Math.max(0, 1 - distance / 19) ** 2;
    voice.gain.gain.setTargetAtTime(voice.volume * attenuation * (Math.abs(dy) > 2 ? .35 : 1), this.context.currentTime, .04);
    const right = dx * Math.cos(listener.yaw) - dz * Math.sin(listener.yaw);
    voice.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, right / Math.max(1, Math.hypot(dx, dz)))), this.context.currentTime, .04);
  }

  update(listener) { for (const voice of this.voices) this.updateVoice(voice, listener); }

  tone(freq, duration = .1, type = 'sine', volume = .05) {
    if (!this.context || this.muted || this.paused || this.context.state !== 'running') return;
    const osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freq * .2, 20), this.context.currentTime + duration);
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration);
    osc.connect(gain).connect(this.master);
    const voice = { stop: () => { osc.stop(); this.voices.delete(voice); } };
    this.voices.add(voice);
    osc.onended = () => { this.voices.delete(voice); osc.disconnect(); gain.disconnect(); };
    osc.start(); osc.stop(this.context.currentTime + duration);
  }
}
