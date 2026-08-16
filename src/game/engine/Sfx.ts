type Note = [frequency: number, durationMs: number];

/**
 * Chiptune blips generated with the Web Audio API. No audio files, and the
 * context is created lazily on the first user gesture so browsers never block
 * it as autoplay.
 */
export class Sfx {
  private context: AudioContext | null = null;
  muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as never as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  private play(notes: Note[], type: OscillatorType = 'square', volume = 0.06) {
    const context = this.ensureContext();
    if (!context) return;

    let at = context.currentTime;
    for (const [frequency, duration] of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const seconds = duration / 1000;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(volume, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + seconds);
      at += seconds;
    }
  }

  start() {
    this.play([[523, 90], [659, 90], [784, 90], [1047, 180]]);
  }

  open() {
    this.play([[660, 60], [880, 90]]);
  }

  close() {
    this.play([[440, 60], [330, 80]]);
  }

  /** Played the first time a station is discovered. */
  discover() {
    this.play([[784, 70], [988, 70], [1319, 160]], 'triangle', 0.07);
  }

  jump() {
    this.play([[420, 55], [700, 70]], 'square', 0.045);
  }

  bump() {
    this.play([[180, 60]], 'square', 0.04);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted && this.context) void this.context.suspend();
    if (!this.muted && this.context) void this.context.resume();
    return this.muted;
  }

  dispose() {
    void this.context?.close();
    this.context = null;
  }
}
