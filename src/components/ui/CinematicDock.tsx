'use client';

/**
 * CinematicDock
 *
 * Three main actions: Rotate (side-snap), Navigate (pan), Reset.
 *
 * When INSPECT/Rotate mode is active, a floating strip of 4 side-picker
 * buttons (F · R · B · L) appears above the first dock button.
 * Clicking a side button calls window.__sideSnapGoTo(index) directly.
 *
 * Design language: dark glassmorphism, gold accents, Cinzel typeface.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useInteractionStore } from '@/stores/useInteractionStore';
import { useCameraReset } from '@/systems/camera/useCameraReset';

// ─── Tooltip data ──────────────────────────────────────────────────────────────

const TOOLTIPS: Record<string, { label: string; desc: string }> = {
  INSPECT: { label: 'Rotate',   desc: 'Pick a side or swipe to rotate view' },
  DRAG:    { label: 'Navigate', desc: 'Move freely across the tabletop' },
  RESET:   { label: 'Reset',    desc: 'Return to default cinematic angle' },
};

// ─── Side definitions (mirrors InspectController) ─────────────────────────────

const SIDES = ['F', 'R', 'B', 'L'] as const;
const SIDE_LABELS: Record<string, string> = { F: 'Front', R: 'Right', B: 'Back', L: 'Left' };

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({ id, visible }: { id: string; visible: boolean }) {
  const tip = TOOLTIPS[id];
  if (!tip) return null;
  return (
    <div className="dock-tooltip" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.97)',
    }}>
      <span className="dock-tooltip-label">{tip.label}</span>
      <span className="dock-tooltip-desc">{tip.desc}</span>
    </div>
  );
}

// ─── Dock Button ──────────────────────────────────────────────────────────────

interface DockButtonProps {
  id: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  'aria-label': string;
}

function DockButton({ id, active, onClick, children, 'aria-label': ariaLabel }: DockButtonProps) {
  const [hovered, setHovered]             = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTooltipVisible(true), 150);
  };
  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTooltipVisible(false);
  };
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <div className="dock-btn-wrap">
      <button
        className={`dock-btn ${active ? 'dock-btn--active' : ''} ${hovered ? 'dock-btn--hovered' : ''}`}
        onClick={onClick}
        onMouseEnter={() => { setHovered(true); showTooltip(); }}
        onMouseLeave={() => { setHovered(false); hideTooltip(); }}
        aria-label={ariaLabel}
        aria-pressed={active}
      >
        <span className="dock-btn-icon">{children}</span>
        {active && <span className="dock-btn-active-ring" />}
      </button>
      <Tooltip id={id} visible={tooltipVisible} />
    </div>
  );
}

// ─── Side Picker Strip ────────────────────────────────────────────────────────

function SidePickerStrip({ visible }: { visible: boolean }) {
  const [activeSide, setActiveSide] = useState(0);

  // Poll active side index from controller (lightweight — only runs when visible)
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const idx = (window as any).__sideSnapGetIndex?.();
      if (typeof idx === 'number') setActiveSide(idx);
    }, 80);
    return () => clearInterval(interval);
  }, [visible]);

  const handleSide = (index: number) => {
    (window as any).__sideSnapGoTo?.(index);
    setActiveSide(index);
  };

  return (
    <div
      className="side-picker-strip"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
        pointerEvents: visible ? 'all' : 'none',
      }}
      aria-hidden={!visible}
    >
      {SIDES.map((letter, i) => (
        <button
          key={letter}
          className={`side-btn ${activeSide === i ? 'side-btn--active' : ''}`}
          onClick={() => handleSide(i)}
          aria-label={SIDE_LABELS[letter]}
          title={SIDE_LABELS[letter]}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const InspectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3.5 10C3.5 6.96 5.96 4.5 9 4.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.45"/>
    <path d="M16.5 10C16.5 13.04 14.04 15.5 11 15.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.45"/>
    <path d="M3.5 10L6 7.8M3.5 10L6 12.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 10L14 7.8M16.5 10L14 12.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="10" r="1.2" fill="currentColor" opacity="0.7"/>
  </svg>
);

const DragIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 3L10 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
    <path d="M3 10L17 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
    <path d="M10 3L8 6M10 3L12 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 17L8 14M10 17L12 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10L6 8M3 10L6 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 10L14 8M17 10L14 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 3.5A6.5 6.5 0 1 0 16.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M13.5 3.5L16.5 5L15 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Divider = () => (
  <div style={{ width: 1, height: 20, background: 'rgba(200,160,80,0.14)', margin: '0 2px', flexShrink: 0 }} />
);

// ─── Main Dock ────────────────────────────────────────────────────────────────

export function CinematicDock() {
  const mode       = useInteractionStore((s) => s.mode);
  const toggleMode = useInteractionStore((s) => s.toggleMode);
  const resetCamera = useCameraReset();

  const isInspect = mode === 'INSPECT';

  const handleInspect = useCallback(() => toggleMode('INSPECT'), [toggleMode]);
  const handleDrag    = useCallback(() => toggleMode('DRAG'),    [toggleMode]);
  const handleReset   = useCallback(() => resetCamera(),         [resetCamera]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

        /* ── Dock container ──────────────────────────────────────────── */
        .cinematic-dock {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          padding: 0.55rem 0.65rem;
          background: rgba(8, 6, 3, 0.78);
          border: 1px solid rgba(200, 160, 80, 0.18);
          border-radius: 100px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow:
            0 8px 40px rgba(0, 0, 0, 0.55),
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 0 0 1px rgba(200, 160, 80, 0.06);
          pointer-events: all;
          user-select: none;
          width: fit-content !important;
          height: fit-content !important;
        }

        .cinematic-dock::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 100px;
          background: radial-gradient(ellipse at 50% 0%, rgba(200,160,80,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Button wrap ─────────────────────────────────────────────── */
        .dock-btn-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Base button ─────────────────────────────────────────────── */
        .dock-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(200, 160, 80, 0.55);
          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            color 0.22s ease,
            transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.22s ease;
          outline: none;
          overflow: visible;
          flex-shrink: 0;
        }

        .dock-btn:hover, .dock-btn--hovered {
          background: rgba(200, 160, 80, 0.08);
          border-color: rgba(200, 160, 80, 0.22);
          color: rgba(230, 195, 130, 0.9);
          transform: scale(1.08);
          box-shadow: 0 0 16px rgba(200, 160, 80, 0.08);
        }

        .dock-btn:active { transform: scale(0.93); transition-duration: 0.08s; }

        .dock-btn--active {
          background: rgba(200, 160, 80, 0.14);
          border-color: rgba(200, 160, 80, 0.45);
          color: rgba(235, 200, 130, 1);
          box-shadow: 0 0 18px rgba(200, 150, 60, 0.18), 0 0 0 1px rgba(200, 150, 60, 0.15);
        }

        .dock-btn--active:hover, .dock-btn--active.dock-btn--hovered {
          background: rgba(200, 160, 80, 0.2);
          border-color: rgba(200, 160, 80, 0.65);
          color: rgba(245, 215, 150, 1);
          transform: scale(1.08);
          box-shadow: 0 0 24px rgba(200, 150, 60, 0.28), 0 0 0 1px rgba(200, 150, 60, 0.25);
        }

        .dock-btn-active-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(200, 160, 80, 0.3);
          animation: dock-pulse 2.4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes dock-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 0.15; transform: scale(1.2); }
        }

        .dock-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        /* ── Tooltip ─────────────────────────────────────────────────── */
        .dock-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          pointer-events: none;
          z-index: 200;
          transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .dock-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid rgba(200, 160, 80, 0.2);
        }

        .dock-tooltip-label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 0.46rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(200, 160, 80, 0.55);
          margin-bottom: 0.15rem;
        }

        .dock-tooltip-desc {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.78rem;
          letter-spacing: 0.03em;
          color: rgba(230, 200, 145, 0.88);
          font-style: italic;
        }

        .dock-tooltip-label, .dock-tooltip-desc {
          background: rgba(8, 5, 2, 0.92);
          padding: 0.1rem 0.6rem;
          border-radius: 4px;
          border: 1px solid rgba(200, 160, 80, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: block;
        }

        .dock-tooltip-label + .dock-tooltip-desc {
          margin-top: 1px;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }

        .dock-tooltip-label {
          border-radius: 4px 4px 0 0;
          border-bottom: 1px solid rgba(200, 160, 80, 0.08);
        }

        /* ── Mode label ──────────────────────────────────────────────── */
        .dock-mode-label {
          position: absolute;
          top: -1.6rem;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: 'Cinzel', serif;
          font-size: 0.42rem;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(200, 160, 80, 0.4);
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        /* ── Side picker strip ───────────────────────────────────────── */
        .side-picker-strip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 8px;
          background: rgba(8, 6, 3, 0.82);
          border: 1px solid rgba(200, 160, 80, 0.2);
          border-radius: 100px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(200, 160, 80, 0.06);
          transition:
            opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
          z-index: 110;
        }

        /* ── Side button ─────────────────────────────────────────────── */
        .side-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(200, 160, 80, 0.15);
          background: transparent;
          color: rgba(200, 160, 80, 0.5);
          font-family: 'Cinzel', serif;
          font-size: 0.5rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.18s ease;
          outline: none;
          flex-shrink: 0;
        }

        .side-btn:hover {
          background: rgba(200, 160, 80, 0.1);
          border-color: rgba(200, 160, 80, 0.35);
          color: rgba(230, 195, 130, 0.95);
          transform: scale(1.12);
        }

        .side-btn:active {
          transform: scale(0.9);
          transition-duration: 0.08s;
        }

        .side-btn--active {
          background: rgba(200, 160, 80, 0.18);
          border-color: rgba(200, 160, 80, 0.55);
          color: rgba(240, 210, 140, 1);
          box-shadow:
            0 0 12px rgba(200, 150, 60, 0.2),
            0 0 0 1px rgba(200, 150, 60, 0.12);
        }

        .side-btn--active:hover {
          background: rgba(200, 160, 80, 0.25);
          border-color: rgba(200, 160, 80, 0.7);
          transform: scale(1.12);
        }
      `}</style>

      <div className="cinematic-dock" role="toolbar" aria-label="Camera controls">

        {/* Mode label */}
        <div className="dock-mode-label">
          {isInspect ? 'ROTATE VIEW' : mode === 'DRAG' ? 'NAVIGATE MODE' : 'CINEMATIC'}
        </div>

        {/* Side picker — floats above dock when inspect active */}
        <SidePickerStrip visible={isInspect} />

        {/* Rotate / Inspect */}
        <DockButton
          id="INSPECT"
          active={isInspect}
          onClick={handleInspect}
          aria-label="Toggle rotate view — pick a board side"
        >
          <InspectIcon />
        </DockButton>

        <Divider />

        {/* Navigate */}
        <DockButton
          id="DRAG"
          active={mode === 'DRAG'}
          onClick={handleDrag}
          aria-label="Toggle navigate mode — pan across tabletop"
        >
          <DragIcon />
        </DockButton>

        {/* <Divider /> */}

        {/* Reset */}
        {/* <DockButton
          id="RESET"
          onClick={handleReset}
          aria-label="Reset camera to default cinematic angle"
        >
          <ResetIcon />
        </DockButton> */}

      </div>
    </>
  );
}
