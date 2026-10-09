import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  } catch {}
}
