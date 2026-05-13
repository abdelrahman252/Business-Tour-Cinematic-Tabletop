export const lightingConfig = {
  keyLight: {
    position: [-4, 12, 6] as [number, number, number],
    color: 0xffd280,
    intensity: 2.8,
  },
  fillLight: {
    position: [8, 6, -3] as [number, number, number],
    color: 0xffe8b0,
    intensity: 0.6,
  },
  rimLight: {
    position: [-5, 3, -10] as [number, number, number],
    color: 0x8ab4d8,
    intensity: 0.35,
  },
  ambient: {
    color: 0x3d2a14,
    intensity: 1.1,
  },
  hemisphere: {
    skyColor: 0x2d1f0d,
    groundColor: 0x0a0806,
    intensity: 0.5,
  },
  boardGlow: {
    position: [0, 4.5, 0] as [number, number, number],
    color: 0xffc060,
    baseIntensity: 1.8,
    pulseAmp: 0.25,
    pulseFreq: 1.1,
    distance: 9,
    decay: 1.6,
  },
  accentLight: {
    position: [-2, 2, -3] as [number, number, number],
    color: 0xff9030,
    intensity: 0.6,
    distance: 6,
    decay: 2,
  }
};
