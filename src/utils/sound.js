// High quality tactile mechanical key sound generator using Web Audio API
let audioCtx = null;

export function playKeyClick(frequency = 440) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    // Transient click noise
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency + (Math.random() * 80 - 40), t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  } catch (e) {
    // Audio context may be blocked by browser policy before first interaction
  }
}
