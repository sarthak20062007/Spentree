/* Web Audio API sound effects — no external files needed */

const ctx = () => {
  if (!window.__audioCtx) {
    window.__audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.__audioCtx;
};

function playTone(freq, duration = 0.15, type = 'sine', volume = 0.3) {
  try {
    const a = ctx();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, a.currentTime);
    gain.gain.setValueAtTime(volume, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + duration);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + duration);
  } catch { /* silent fail */ }
}

export function playCoinSound() {
  playTone(880, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(1320, 0.15, 'sine', 0.2), 80);
}

export function playLevelUpSound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'triangle', 0.25), i * 120);
  });
}

export function playSpinSound() {
  playTone(440, 0.08, 'square', 0.15);
}

export function playBadgeSound() {
  playTone(660, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(880, 0.2, 'sine', 0.25), 100);
  setTimeout(() => playTone(1100, 0.25, 'sine', 0.2), 200);
}
