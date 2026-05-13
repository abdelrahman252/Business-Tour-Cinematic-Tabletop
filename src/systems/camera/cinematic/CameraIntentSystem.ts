import * as THREE from 'three';
import { BoardNode } from '@/systems/board/createBoardPath';
import { ShotType } from './FramingProfiles';
import { PathAnalyzer } from './PathAnalyzer';
import { MotionIntensitySystem } from './MotionIntensitySystem';
import { CompositionAnalyzer, CompositionSide } from './CompositionAnalyzer';
import { CameraWeights } from './CameraWeights';
import { ShotComposer, ShotComposition } from './ShotComposer';

export interface CameraIntentState {
  currentShot: ShotType;
  baseShot: ShotType;
  transitionWeight: number; // 0 to 1
  compositionSide: CompositionSide;
  currentShoulderMultiplier: number;
}

export class CameraIntentSystem {
  private state: CameraIntentState = {
    currentShot: "FOLLOW",
    baseShot: "FOLLOW",
    transitionWeight: 0,
    compositionSide: "CENTER",
    currentShoulderMultiplier: 0
  };

  public update(
    currentNode: BoardNode | null,
    nextNode: BoardNode | null,
    futureNode: BoardNode | null,
    movementVector: THREE.Vector3,
    targetMovementVector: THREE.Vector3,
    normalizedVelocity: number,
    progress: number,
    isFinalApproach: boolean
  ): ShotComposition {
    // 1. Analyze Path
    const pathAnalysis = PathAnalyzer.analyze(currentNode, nextNode, futureNode, progress, isFinalApproach);

    // 2. Motion Intensity
    const intensity = MotionIntensitySystem.calculate(normalizedVelocity, isFinalApproach);

    // 3. Composition Side
    const optimalSide = CompositionAnalyzer.determineOptimalSide(currentNode, movementVector);
    this.state.compositionSide = optimalSide;

    // Damp shoulder multiplier
    let targetShoulder = 0;
    if (optimalSide === "LEFT") targetShoulder = -1;
    if (optimalSide === "RIGHT") targetShoulder = 1;

    // Simple lerp for shoulder multiplier
    this.state.currentShoulderMultiplier = THREE.MathUtils.lerp(
      this.state.currentShoulderMultiplier, 
      targetShoulder, 
      0.05
    );

    // 4. Determine Target Shot
    let targetShot: ShotType = pathAnalysis.recommendedShot;
    
    // 5. Cinematic Corner Stabilization
    const turnDot = movementVector.dot(targetMovementVector);
    // If the smoothed movement vector is lagging significantly behind the target vector, we are actively in a turn
    const isActivelyTurning = turnDot < 0.98 && normalizedVelocity > 0.05;

    if (isActivelyTurning) {
      targetShot = "CORNER_SWEEP"; // Override to temporary corner camera state
    }
    // Override logic based on intensity or state
    else if (normalizedVelocity < 0.1 && !isFinalApproach && !pathAnalysis.upcomingTurn) {
       targetShot = "FOLLOW"; // slow moving, just follow
    }
    
    // 6. Update Intent State
    if (this.state.currentShot !== targetShot) {
      this.state.baseShot = this.state.currentShot;
      this.state.currentShot = targetShot;
      this.state.transitionWeight = 0; // Start transition
    }

    // Advance transition weight (faster blend for corners)
    if (this.state.transitionWeight < 1.0) {
      const blendSpeed = isActivelyTurning ? 0.08 : 0.05; // Slightly faster transition into corner state
      this.state.transitionWeight = Math.min(1.0, this.state.transitionWeight + blendSpeed);
    }

    // 7. Blend Profiles
    const blendedProfile = CameraWeights.blendProfiles(
      this.state.baseShot,
      this.state.currentShot,
      this.state.transitionWeight
    );

    // Apply intensity modifiers
    blendedProfile.fov += intensity.cameraExcitement * 2; // Reduced from 5 for subtler speed effect
    blendedProfile.positionDamping *= intensity.dampingMultiplier;
    blendedProfile.rotationDamping *= intensity.dampingMultiplier;

    // 8. Compose Final Shot
    const noiseIntensity = intensity.movementEnergy > 0.1 ? 1.0 : 0.0; // ZERO breathing when stopped
    const composition = ShotComposer.compose(
      blendedProfile,
      movementVector,
      this.state.currentShoulderMultiplier,
      noiseIntensity
    );

    return composition;
  }
  
  public getState(): CameraIntentState {
    return this.state;
  }
}

