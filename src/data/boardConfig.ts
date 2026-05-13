/**
 * BUSINESS TOUR — PREMIUM EDITION
 * Board Configuration v2 — Physical Construction Parameters
 *
 * Dimensional Philosophy:
 *   The board is a thick, machined artifact. Every measurement reflects
 *   physical believability — beveled edges, inset tile cavities, layered
 *   construction depth, and architectural precision.
 */

export const boardConfig = {
  // ── Board body ────────────────────────────────────────────────────────────
  dimensions: {
    width:  8.0,
    depth:  8.0,
    height: 0.26,   // Slightly thicker — more physical presence
    bevel:  0.07,   // Chamfered edge radius
  },

  // ── Gold frame rails ──────────────────────────────────────────────────────
  frame: {
    thickness: 0.12,
    height:    0.018,  // Slightly taller rail cap
  },

  // ── Tile grid ─────────────────────────────────────────────────────────────
  grid: {
    lineCount:  9,
    lineHeight: 0.008,
  },

  // ── Individual tile construction ──────────────────────────────────────────
  tiles: {
    height:         0.160,   // Physical tile THICKNESS (slab height above board)
    portraitRatio:  1.55,    // Tile depth (into board) = width * portraitRatio
    margin:         0.028,   // Gap between tiles
    chamfer:        0.018,   // Tile edge bevel radius
    chamferSmooth:  5,

    // Accent band
    accentHeight:   0.022,
    accentDepth:    0.20,

    // Ownership ring band
    ownershipDepth: 0.048,

    // Legacy (kept for compatibility)
    topInset:       0.065,
    insetDepth:     0.006,
    seamWidth:      0.006,
    seamHeight:     0.003,
  },

  // ── Board feet ────────────────────────────────────────────────────────────
  feet: {
    offset: 0.32,
    radius: 0.055,
    height: 0.10,
    depth:  0.16,
  },

  // ── Center emblem ─────────────────────────────────────────────────────────
  centerEmblem: {
    radius:             1.24,
    thickness:          0.018,
    innerRingRadius:    0.88,
    innerRingThickness: 0.016,
    midRingRadius:      0.56,
    midRingThickness:   0.010,
    crossBarLength:     1.20,
    crossBarWidth:      0.028,
  },

  // ── Hologram system ───────────────────────────────────────────────────────
  hologram: {
    riseHeight:   0.60,   // How high the hologram rises above the tile
    riseSpeed:    2.2,    // Rise animation speed multiplier
    ringRadius:   0.28,   // Projection ring radius beneath hologram
    ringThick:    0.012,  // Projection ring tube thickness
    particleCount: 12,    // Ambient particles per hologram
  },
} as const;
