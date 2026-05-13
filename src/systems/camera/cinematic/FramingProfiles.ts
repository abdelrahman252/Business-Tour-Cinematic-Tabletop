export type ShotType = 
  | "FOLLOW"
  | "CORNER_SWEEP"
  | "STRAIGHT_PUSH"
  | "LANDING"
  | "TENSION"
  | "OVERVIEW"
  | "DRAMATIC_CLOSE";

export interface FramingProfile {
  distance: number;
  height: number;
  fov: number;
  lookAhead: number; // Reduced: how far ahead to look
  positionDamping: number; // Higher is faster catch-up
  rotationDamping: number; // Smoother rotation
  shoulderOffset: number; // Very subtle lateral offset
}

export const FramingProfiles: Record<ShotType, FramingProfile> = {
  FOLLOW: {
    distance: 6.0,
    height: 4.0,
    fov: 48,
    lookAhead: 0.15, // Subtle anticipation only
    positionDamping: 18, // Increased for tighter lock
    rotationDamping: 12, // Faster correction
    shoulderOffset: 0.05 // Almost unnoticeable
  },
  CORNER_SWEEP: {
    distance: 7.2, // Widened framing during turns
    height: 4.8, // Slightly raised
    fov: 50,
    lookAhead: 0.1, // Reduced to stabilize lookAt and lock composition
    positionDamping: 4, // Very sluggish to reduce traversal whip energy
    rotationDamping: 3, // Very sluggish to smooth yaw transition
    shoulderOffset: 0.2 // Widen shoulder offset slightly
  },
  STRAIGHT_PUSH: {
    distance: 5.8,
    height: 3.5,
    fov: 52,
    lookAhead: 0.4,
    positionDamping: 15, // Holds pushing framing
    rotationDamping: 10,
    shoulderOffset: 0.0
  },
  LANDING: {
    distance: 5.5,
    height: 3.0,
    fov: 45,
    lookAhead: 0.0,
    positionDamping: 20, // Snappy but not jerky
    rotationDamping: 14,
    shoulderOffset: 0.0
  },
  TENSION: {
    distance: 5,
    height: 2.5,
    fov: 42,
    lookAhead: 0.5,
    positionDamping: 10,
    rotationDamping: 6,
    shoulderOffset: 0.2
  },
  OVERVIEW: {
    distance: 14,
    height: 10,
    fov: 60,
    lookAhead: 0.0,
    positionDamping: 8,
    rotationDamping: 5,
    shoulderOffset: 0.0
  },
  DRAMATIC_CLOSE: {
    distance: 3.5,
    height: 1.8,
    fov: 40,
    lookAhead: 0.2,
    positionDamping: 12,
    rotationDamping: 8,
    shoulderOffset: 0.2
  }
};
