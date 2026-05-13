export const postprocessingConfig = {
  toneMappingExposure: 1.05,
  // Cleanup pass: bloom dialed back for cleaner, less noisy presentation
  bloom: {
    intensity: 0.55,          // was 1.0 — reduced to cut glow noise
    luminanceThreshold: 0.92, // was 0.8 — only brightest highlights bloom
    luminanceSmoothing: 0.015, // tighter falloff for crisper edges
  }
};
