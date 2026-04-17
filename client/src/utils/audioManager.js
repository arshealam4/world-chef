/**
 * audioManager — Web Audio API sound engine (module singleton).
 * Procedural sounds: no audio files needed.
 * Call audioManager.unlock() on first user tap to resume AudioContext.
 */

class AudioManager {
  constructor() {
    this._ctx          = null;
    this._musicNodes   = [];
    this._musicLoop    = null;
    this._musicPlaying = false;

    // Persist prefs in localStorage so they survive page reload
    this._soundEnabled = this._load('wc_sound', true);
    this._musicEnabled = this._load('wc_music', true);
  }

  /* ── Prefs ─────────────────────────────────────────────────────── */

  get soundEnabled() { return this._soundEnabled; }
  get musicEnabled() { return this._musicEnabled; }

  setSoundEnabled(val) {
    this._soundEnabled = val;
    localStorage.setItem('wc_sound', JSON.stringify(val));
    if (!val) { /* nothing to stop — one-shot sounds fade on their own */ }
  }

  setMusicEnabled(val) {
    this._musicEnabled = val;
    localStorage.setItem('wc_music', JSON.stringify(val));
    val ? this.startMusic() : this.stopMusic();
  }

  /* ── Bootstrap ──────────────────────────────────────────────────── */

  /**
   * Must be called from a user-gesture handler (tap / click) to unlock
   * AudioContext on iOS/Chrome. Safe to call multiple times.
   */
  unlock() {
    const ctx = this._getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (this._musicEnabled && !this._musicPlaying) this.startMusic();
  }

  /* ── Sound effects ──────────────────────────────────────────────── */

  play(type) {
    if (!this._soundEnabled) return;
    try {
      switch (type) {
        case 'click':      this._beep(700, 0.08, 'sine', 0.07);            break;
        case 'cook_start': this._chime([440, 554], 0.09, 0.12);            break;
        case 'collect':    this._chime([523, 659, 784], 0.10, 0.13);       break;
        case 'serve':      this._chime([523, 659, 784, 1047], 0.09, 0.12); break;
        case 'coin':       this._chime([880, 1108], 0.08, 0.09);           break;
        case 'error':      this._beep(220, 0.12, 'sawtooth', 0.18);        break;
        case 'level_up':   this._fanfare();                                  break;
        default: break;
      }
    } catch { /* AudioContext not ready yet */ }
  }

  /* ── Background music ───────────────────────────────────────────── */

  startMusic() {
    if (!this._musicEnabled || this._musicPlaying) return;
    this._musicPlaying = true;
    this._scheduleMusic();
  }

  stopMusic() {
    clearTimeout(this._musicLoop);
    this._musicNodes.forEach(n => { try { n.stop(0); } catch {} });
    this._musicNodes = [];
    this._musicPlaying = false;
  }

  /* ── Private helpers ────────────────────────────────────────────── */

  _getCtx() {
    if (!this._ctx) {
      // eslint-disable-next-line no-undef
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  _beep(freq, vol, type, dur) {
    const ctx  = this._getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type           = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.01);
  }

  _chime(freqs, vol, dur) {
    freqs.forEach((freq, i) => {
      setTimeout(() => this._beep(freq, vol, 'sine', dur), i * 90);
    });
  }

  _fanfare() {
    // Ascending happy arpeggio
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((freq, i) => {
      setTimeout(() => this._beep(freq, 0.11, 'sine', 0.2), i * 90);
    });
  }

  _scheduleMusic() {
    if (!this._musicEnabled) return;

    // A short cheerful looping melody (C-major pentatonic)
    const melody = [
      // bar 1
      [523, 0.3], [587, 0.3], [659, 0.3], [523, 0.3],
      // bar 2
      [659, 0.3], [698, 0.3], [784, 0.6],
      // bar 3
      [784, 0.3], [698, 0.3], [659, 0.3], [523, 0.3],
      // bar 4
      [587, 0.3], [523, 0.6], [523, 0.3],
    ];

    const ctx  = this._getCtx();
    if (ctx.state === 'suspended') return; // still locked — try again on next unlock

    // Master gain for music (quiet, unobtrusive)
    const master = ctx.createGain();
    master.gain.value = 0.045;
    master.connect(ctx.destination);

    let t = ctx.currentTime + 0.05;
    let totalDur = 0;

    melody.forEach(([freq, dur]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(master);
      osc.type            = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.04);
      osc.start(t);
      osc.stop(t + dur);
      this._musicNodes.push(osc);
      t        += dur;
      totalDur += dur;
    });

    // Loop: schedule next iteration just before this one ends
    this._musicLoop = setTimeout(() => {
      this._musicNodes = [];
      if (this._musicEnabled && this._musicPlaying) this._scheduleMusic();
    }, totalDur * 1000 - 200);
  }

  _load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)); }
    catch { return fallback; }
  }
}

export const audioManager = new AudioManager();
