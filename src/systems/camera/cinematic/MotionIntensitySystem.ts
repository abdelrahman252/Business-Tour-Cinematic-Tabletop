export interface MotionIntensity {
  movementEnergy: number; // 0 to 1
  cameraExcitement: number; // 0 to 1
  dampingMultiplier: number;
}

export class MotionIntensitySystem {
  public static calculate(
    normalizedVelocity: number, // 0 to 1
    isFinalApproach: boolean
  ): MotionIntensity {
    // Energy scales with velocity, but has a base floor
    const movementEnergy = Math.max(0.1, normalizedVelocity);
    
    // Excitement should be very subtle to preserve cinematic framing stability.
    // Instead of violently pulsing 0-1 every tile step, we cap it or smooth it conceptually.
    let cameraExcitement = normalizedVelocity > 0.1 ? 0.2 : 0; 

    if (isFinalApproach) {
       // Calm down on final approach
       cameraExcitement = 0;
    }

    // Damping Multiplier:
    // Stable damping, avoid changing it dramatically based on instantaneous velocity
    const dampingMultiplier = 1.0;

    return {
      movementEnergy,
      cameraExcitement,
      dampingMultiplier
    };
  }
}
