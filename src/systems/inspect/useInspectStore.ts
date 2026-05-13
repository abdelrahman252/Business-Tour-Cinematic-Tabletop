import { create } from 'zustand';

export type InspectSide = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT' | null;

interface InspectStore {
  // Core toggle
  isInspecting: boolean;

  // Polar coordinates around board center
  // azimuth: horizontal angle around Y axis (radians)
  // polar: vertical angle from zenith (radians)
  // radius: distance from board center
  azimuth: number;
  polar: number;
  radius: number;

  // Velocity for inertia
  azimuthVelocity: number;
  polarVelocity: number;

  // Snap target (null = free drag)
  snapTarget: InspectSide;

  // Entry snapshot — where CameraDirector was when we entered
  entryPosition: [number, number, number];
  entryLookAt: [number, number, number];

  // Actions
  enterInspect: (camPos: [number, number, number], lookAt: [number, number, number]) => void;
  exitInspect: () => void;
  setAngles: (azimuth: number, polar: number) => void;
  setVelocity: (az: number, po: number) => void;
  snapToSide: (side: InspectSide) => void;
}

// Side anchor definitions — azimuth angles (radians) for each board face
export const SIDE_ANCHORS: Record<NonNullable<InspectSide>, { azimuth: number; polar: number; radius: number }> = {
  BOTTOM: { azimuth: 0,           polar: 0.72, radius: 13.5 }, // front face
  LEFT:   { azimuth: Math.PI / 2, polar: 0.72, radius: 13.5 },
  TOP:    { azimuth: Math.PI,     polar: 0.72, radius: 13.5 },
  RIGHT:  { azimuth: -Math.PI / 2,polar: 0.72, radius: 13.5 },
};

// Default entry angle mirrors board's cinematic view
const DEFAULT_AZIMUTH = 0.78; // ~45°, matches basePosition [7.5, 9, 9.5]
const DEFAULT_POLAR   = 0.78;
const DEFAULT_RADIUS  = 14.5;

export const useInspectStore = create<InspectStore>((set) => ({
  isInspecting: false,

  azimuth: DEFAULT_AZIMUTH,
  polar: DEFAULT_POLAR,
  radius: DEFAULT_RADIUS,

  azimuthVelocity: 0,
  polarVelocity: 0,

  snapTarget: null,

  entryPosition: [7.5, 9, 9.5],
  entryLookAt: [0, 0, 0],

  enterInspect: (camPos, lookAt) => {
    // Convert current camera position to polar coords for seamless entry
    const dx = camPos[0] - lookAt[0];
    const dz = camPos[2] - lookAt[2];
    const dy = camPos[1] - lookAt[1];
    const r  = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const az = Math.atan2(dx, dz);
    const po = Math.acos(Math.max(-1, Math.min(1, dy / r)));

    set({
      isInspecting: true,
      azimuth: az,
      polar: po,
      radius: Math.max(10, Math.min(18, r)),
      azimuthVelocity: 0,
      polarVelocity: 0,
      snapTarget: null,
      entryPosition: camPos,
      entryLookAt: lookAt,
    });
  },

  exitInspect: () =>
    set({
      isInspecting: false,
      snapTarget: null,
      azimuthVelocity: 0,
      polarVelocity: 0,
    }),

  setAngles: (azimuth, polar) => set({ azimuth, polar }),
  setVelocity: (azimuthVelocity, polarVelocity) => set({ azimuthVelocity, polarVelocity }),
  snapToSide: (snapTarget) => set({ snapTarget }),
}));
