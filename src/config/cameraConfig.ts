export const cameraConfig = {
  modes: {
    BOARD: {
      fov: 35,
      damping: 2.5,
    },
    FOLLOW: {
      fov: 28,
      damping: 4,
      followOffset: [4, 5, 4] as [number, number, number],
    },
    EVENT: {
      fov: 40,
      damping: 3,
    },
    DICE: {
      fov: 30,
      damping: 3.5,
      followOffset: [2, 3, 2] as [number, number, number],
    },
    OVERVIEW: {
      fov: 45,
      damping: 2,
    }
  },
  basePosition:  [7.5, 9, 9.5]as [number, number, number],
  near: 0.1,
  far: 120,
  idleDrift: {
    speed: 1.0, // multiplier
    xAmp1: 0.35, xFreq1: 0.18,
    xAmp2: 0.15, xFreq2: 0.07,
    yAmp: 0.15, yFreq: 0.13,
    zAmp: 0.25, zFreq: 0.16,
    lerpFactor: 0.012,
  },
  lookAtDrift: {
    xAmp: 0.08, xFreq: 0.11,
    yAmp: 0.04, yFreq: 0.09,
    zAmp: 0.06, zFreq: 0.14,
  },
  anticipation: {
    anticipationDistance: 0.8, // Start anticipating before the corner (using progress 0-1, so 0.8 means last 80% of tile)
    anticipationStrength: 1.5,
    cornerBlendSpeed: 3.0,
  }
};
