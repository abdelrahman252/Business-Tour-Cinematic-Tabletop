'use client';

/**
 * InspectOverlay — DEPRECATED
 *
 * The old toggle button has been replaced by CinematicDock.
 * Side-snap arrows have been removed (they were on board edges — the messy UX).
 *
 * This file is kept for compatibility but exports empty stubs.
 * InspectBridge is now co-located with InspectController.
 */

export function InspectOverlay() {
  return null;
}

// Keep InspectBridge export here for any lingering imports
export { InspectBridge } from '@/systems/inspect/InspectController';
