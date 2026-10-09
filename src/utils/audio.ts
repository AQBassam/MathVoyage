// Web Audio API Synthesizer for delightful, gentle educational sound effects
// Designed specifically for elementary math learners
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.8; // Default comfortable volume (0.0 to 1.0)
  private masterGain: GainNode | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // Setup unlock on first user interaction in browser
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock();
        window.removeEventListener('click', unlockHandler);
        window.removeEventListener('touchstart', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('click', unlockHandler, { once: true, passive: true });
      window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
      window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
    }
  }

  public unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (ctx) {
      this.isUnlocked = true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getMasterNode(ctx: AudioContext): GainNode {
    if (!this.masterGain || this.masterGain.context !== ctx) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }
    this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, ctx.currentTime);
    return this.masterGain;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  // Soft button tap
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.09 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(master);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // Cheerful, encouraging chime for correct answer (Major chord arpeggio with sweet overtone)
  playCorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      // Bright musical notes: C5, E5, G5, C6 (523Hz, 659Hz, 784Hz, 1046.5Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const startTime = ctx.currentTime;

      notes.forEach((freq, i) => {
        const noteTime = startTime + i * 0.065;

        // Primary bell tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.13 * this.volume, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.32);

        // High sparkle overtone on the final note
        if (i === notes.length - 1) {
          const sparkle = ctx.createOscillator();
          const sGain = ctx.createGain();
          sparkle.type = 'sine';
          sparkle.frequency.setValueAtTime(freq * 2, noteTime); // C7 octave harmonic
          sGain.gain.setValueAtTime(0, noteTime);
          sGain.gain.linearRampToValueAtTime(0.05 * this.volume, noteTime + 0.01);
          sGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);
          sparkle.connect(sGain);
          sGain.connect(master);
          sparkle.start(noteTime);
          sparkle.stop(noteTime + 0.25);
        }
      });
    } catch {}
  }

  // Gentle, calm, non-punishing sound for mistakes ("دعنا نتأمل ونحاول مرة أخرى بهدوء")
  // Soft warm two-tone marimba chime: peaceful descending 392Hz -> 330Hz (G4 -> E4)
  playTryAgain() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const startTime = ctx.currentTime;

      // Two warm soothing notes: G4 (392Hz) then E4 (329.6Hz)
      const calmNotes = [392.0, 329.63];

      calmNotes.forEach((freq, i) => {
        const noteTime = startTime + i * 0.12;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Warm rounded sine wave with soft lowpass filter for gentle warmth
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Lowpass filter removes any harsh high frequencies
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, noteTime);

        // Gentle envelope - soft attack, smooth soothing decay
        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.08 * this.volume, noteTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch {}
  }

  // Star ding (celestial sparkle)
  playStar() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(master);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Gentle reminder/hint sound (warm melodic chime)
  playHint() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const startTime = ctx.currentTime;
      // Gentle ascending 2-tone sparkle (F5 -> A5)
      const notes = [698.46, 880.0];
      notes.forEach((freq, idx) => {
        const noteTime = startTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.09 * this.volume, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch {}
  }

  // Triumphant badge unlock chime
  playBadgeUnlocked() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const notes = [440.0, 554.37, 659.25, 880.0]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const noteTime = ctx.currentTime + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    } catch {}
  }

  // Grand celebration fanfare (triumphant melody)
  playCelebration() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const master = this.getMasterNode(ctx);
      const melody = [523.25, 659.25, 783.99, 880.0, 1046.5]; // C5, E5, G5, A5, C6
      melody.forEach((freq, i) => {
        const noteTime = ctx.currentTime + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.13 * this.volume, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.38);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.38);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();

