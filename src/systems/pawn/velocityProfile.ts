// Cinematic velocity curves to provide weight and momentum to movement

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function generateVelocityProfile(progress: number): number {
  // Simulate acceleration, coasting, and deceleration (speed peaks at 0.5)
  return Math.sin(progress * Math.PI);
}
