export interface MotionProfile {
  bobAmplitude: number;
  bobFrequency: number;
  landingCompression: number;
  turnResponsiveness: number;
  anticipationStrength: number;
}

export const defaultMotionProfile: MotionProfile = {
  bobAmplitude: 0.15,
  bobFrequency: 15.0,
  landingCompression: 0.3,
  turnResponsiveness: 6.0, // Smoother rotational carry through corners
  anticipationStrength: 2.0,
};
