export const lightingConfig = {
  keyLight: {
    position: [-6, 16, 8] as [number, number, number],
    color: '#fff8e8',
    intensity: 4.5,   // was ~2 — needs to be much stronger for tile shine
  },
  fillLight: {
    position: [10, 10, -6] as [number, number, number],
    color: '#ffe8cc',
    intensity: 1.8,
  },
  rimLight: {
    position: [0, 8, -14] as [number, number, number],
    color: '#c8d8ff',
    intensity: 1.2,
  },
  // Extra front fill — prevents tiles facing camera from being dark
  frontFill: {
    position: [0, 6, 12] as [number, number, number],
    color: '#fff4e0',
    intensity: 1.4,
  },
  ambient: {
    color: '#2a1e10',
    intensity: 0.9,   // was 0.35 — tiles need ambient to not look black
  },
  hemisphere: {
    skyColor:    '#3a2810' as any,
    groundColor: '#0a0806' as any,
    intensity: 0.8,
  },
  boardGlow: {
    position:      [0, 5, 0] as [number, number, number],
    color:         '#ffd080',
    baseIntensity: 2.0,
    pulseAmp:      0.4,
    pulseFreq:     0.6,
    distance:      14,
    decay:         1.8,
  },
  accentLight: {
    position:  [0, -1, 0] as [number, number, number],
    color:     '#c8a028',
    intensity: 0.5,
    distance:  10,
    decay:     2,
  },
};
