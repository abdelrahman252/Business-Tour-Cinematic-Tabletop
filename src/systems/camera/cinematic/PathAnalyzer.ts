import { BoardNode } from '@/systems/board/createBoardPath';
import { ShotType } from './FramingProfiles';

export type SegmentType = 
  | "STRAIGHT" 
  | "CORNER_SOFT" 
  | "CORNER_HARD" 
  | "FINAL_APPROACH";

export interface PathAnalysis {
  segmentType: SegmentType;
  upcomingTurn: boolean;
  turnSeverity: number; // 0 to 1+
  straightDistance: number;
  recommendedShot: ShotType;
}

export class PathAnalyzer {
  public static analyze(
    currentNode: BoardNode | null,
    nextNode: BoardNode | null,
    futureNode: BoardNode | null,
    progress: number,
    isFinalApproach: boolean
  ): PathAnalysis {
    if (isFinalApproach) {
      return {
        segmentType: "FINAL_APPROACH",
        upcomingTurn: false,
        turnSeverity: 0,
        straightDistance: 0,
        recommendedShot: "LANDING"
      };
    }

    if (!nextNode || !futureNode) {
      return {
        segmentType: "STRAIGHT",
        upcomingTurn: false,
        turnSeverity: 0,
        straightDistance: 1,
        recommendedShot: "FOLLOW"
      };
    }

    const isTurn = nextNode.direction !== futureNode.direction;
    
    if (isTurn) {
      // Calculate severity based on vectors later, but for orthogonal grids, it's 1.0
      const turnSeverity = 1.0; 
      const distanceToCorner = 1.0 - progress;

      // Determine how close we are
      // REDUCED: Activate corner choreography much closer to the turn
      if (distanceToCorner < 0.3) {
        return {
          segmentType: turnSeverity > 0.8 ? "CORNER_HARD" : "CORNER_SOFT",
          upcomingTurn: true,
          turnSeverity,
          straightDistance: distanceToCorner,
          recommendedShot: "CORNER_SWEEP"
        };
      }
    }

    // Determine how many straight nodes ahead
    // For now, if no immediate turn
    return {
      segmentType: "STRAIGHT",
      upcomingTurn: isTurn,
      turnSeverity: 0,
      straightDistance: 3, // placeholder for actual straight length calc
      recommendedShot: "STRAIGHT_PUSH"
    };
  }
}
