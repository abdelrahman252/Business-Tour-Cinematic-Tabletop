export type TransitionType = 
  | "EASE"
  | "SWEEP"
  | "PUNCH_IN"
  | "FLOAT"
  | "GLIDE";

export interface TransitionSettings {
  duration: number;
  easing: (t: number) => number;
}

export class TransitionLanguage {
  public static getTransition(type: TransitionType): TransitionSettings {
    switch (type) {
      case "EASE":
        return {
          duration: 1.0,
          easing: (t) => t * t * (3 - 2 * t) // Smoothstep
        };
      case "SWEEP":
        return {
          duration: 1.5,
          easing: (t) => 1 - Math.pow(1 - t, 3) // Ease out cubic
        };
      case "PUNCH_IN":
        return {
          duration: 0.5,
          easing: (t) => Math.pow(t, 2) // Ease in quad for impact
        };
      case "FLOAT":
        return {
          duration: 2.0,
          easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // Ease in out quad
        };
      case "GLIDE":
        return {
          duration: 2.5,
          easing: (t) => 1 - Math.pow(1 - t, 4) // Ease out quart
        };
    }
  }
}
