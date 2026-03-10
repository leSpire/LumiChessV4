export type MoveSoundType = 'move' | 'capture' | 'castle' | 'check';
export type SoundTheme = 'classic' | 'soft';

const CLASSIC_FREQUENCIES: Record<MoveSoundType, number[]> = {
  move: [520],
  capture: [360, 240],
  castle: [460, 620],
  check: [680, 540, 420]
};

const SOFT_FREQUENCIES: Record<MoveSoundType, number[]> = {
  move: [420],
  capture: [300, 220],
  castle: [380, 520],
  check: [520, 460, 360]
};

export function playMoveSound(type: MoveSoundType, theme: SoundTheme, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;

  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const frequencies = (theme === 'soft' ? SOFT_FREQUENCIES : CLASSIC_FREQUENCIES)[type];

  frequencies.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = theme === 'soft' ? 'sine' : 'triangle';
    osc.frequency.value = frequency;

    const startAt = ctx.currentTime + index * 0.07;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + 0.14);
  });

  void ctx.close();
}
