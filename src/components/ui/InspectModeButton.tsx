'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useCameraStore } from '@/stores/useCameraStore';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Snapshot hook: reads current camera world state ──────────────────────────
function useCurrentCameraState() {
  const store = useCameraStore;
  return {
    getCameraSnapshot: () => {
      // We'll use a global ref set by CameraDirector
      return null;
    }
  };
}

// ─── Main button component — rendered in DOM, outside Canvas ─────────────────
interface InspectModeButtonProps {
  getCameraState?: () => { position: THREE.Vector3; lookAt: THREE.Vector3 } | null;
}

export function InspectModeButton({ getCameraState }: InspectModeButtonProps) {
  const mode = useCameraStore((state) => state.mode);
  const enterInspectMode = useCameraStore((state) => state.enterInspectMode);
  const exitInspectMode = useCameraStore((state) => state.exitInspectMode);
  const resetInspectView = useCameraStore((state) => state.resetInspectView);
  const isTransitioning = useCameraStore((state) => state.isInspectTransitioning);

  const isInspect = mode === 'INSPECT';
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = () => {
    if (isTransitioning) return;
    if (isInspect) {
      exitInspectMode();
      setExpanded(false);
    } else {
      const snap = getCameraState?.();
      if (snap) {
        enterInspectMode(snap.position, snap.lookAt);
      } else {
        // Fallback: use board defaults
        enterInspectMode(
          new THREE.Vector3(7.5, 9, 9.5),
          new THREE.Vector3(0, 0, 0)
        );
      }
      setTimeout(() => setExpanded(true), 400);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetInspectView();
  };

  const showTooltip = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(true), 500);
  };

  const hideTooltip = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltipVisible(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');

        .inspect-root {
          position: fixed;
          bottom: 2.4rem;
          right: 2.4rem;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
          pointer-events: none;
        }

        /* ─── Radial sub-controls ───────────────────────────────────── */
        .inspect-sub-controls {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.55rem;
          pointer-events: all;
          opacity: 0;
          transform: translateY(8px) scale(0.95);
          transition:
            opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .inspect-sub-controls.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .sub-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(12, 9, 5, 0.75);
          border: 1px solid rgba(200, 160, 80, 0.22);
          border-radius: 100px;
          padding: 0.45rem 0.85rem 0.45rem 0.6rem;
          cursor: pointer;
          color: rgba(215, 175, 100, 0.75);
          font-family: 'Cinzel', serif;
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 2px 16px rgba(0,0,0,0.4),
            0 0 0 0px rgba(200,160,80,0);
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .sub-btn:hover {
          background: rgba(20, 15, 8, 0.9);
          border-color: rgba(200, 160, 80, 0.45);
          color: rgba(230, 195, 130, 1);
          box-shadow:
            0 2px 24px rgba(0,0,0,0.5),
            0 0 0 1px rgba(200,160,80,0.15);
        }

        .sub-btn-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .sub-btn:hover .sub-btn-icon {
          opacity: 1;
        }

        /* ─── Main Inspect Button ───────────────────────────────────── */
        .inspect-btn-wrap {
          position: relative;
          pointer-events: all;
        }

        .inspect-btn {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(10, 7, 4, 0.72);
          border: 1px solid rgba(200, 160, 80, 0.28);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 4px 32px rgba(0, 0, 0, 0.5),
            0 0 0 0px rgba(200, 160, 80, 0.0),
            inset 0 1px 0 rgba(255,255,255,0.04);
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .inspect-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, rgba(200,160,80,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Ambient pulse ring – always visible, subtle */
        .inspect-btn::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(200, 160, 80, 0.0);
          transition: border-color 0.4s ease, inset 0.4s ease;
        }

        .inspect-btn:hover {
          background: rgba(18, 12, 6, 0.88);
          border-color: rgba(210, 170, 90, 0.55);
          box-shadow:
            0 4px 40px rgba(0, 0, 0, 0.6),
            0 0 20px rgba(200, 160, 80, 0.12),
            0 0 0 1px rgba(200, 160, 80, 0.12),
            inset 0 1px 0 rgba(255,255,255,0.06);
          transform: scale(1.04);
        }

        .inspect-btn:hover::after {
          border-color: rgba(200, 160, 80, 0.18);
          inset: -6px;
        }

        .inspect-btn:active {
          transform: scale(0.96);
          transition-duration: 0.1s;
        }

        /* ACTIVE / INSPECT state */
        .inspect-btn.active {
          background: rgba(22, 15, 6, 0.92);
          border-color: rgba(210, 170, 90, 0.6);
          box-shadow:
            0 4px 40px rgba(0, 0, 0, 0.6),
            0 0 24px rgba(200, 150, 60, 0.22),
            0 0 0 1px rgba(200, 150, 60, 0.2),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .inspect-btn.active::after {
          animation: inspect-pulse 2.8s ease-in-out infinite;
          border-color: rgba(200, 150, 60, 0.3);
          inset: -5px;
        }

        @keyframes inspect-pulse {
          0%, 100% { opacity: 0.6; inset: -5px; }
          50%       { opacity: 0.15; inset: -10px; }
        }

        /* Disabled / transitioning */
        .inspect-btn.transitioning {
          opacity: 0.55;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* ─── Icon SVG styling ──────────────────────────────────────── */
        .inspect-icon {
          position: relative;
          z-index: 1;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }

        .inspect-btn:hover .inspect-icon {
          transform: scale(1.1);
        }

        .inspect-btn.active .inspect-icon {
          transform: rotate(15deg) scale(1.05);
        }

        /* ─── Tooltip ───────────────────────────────────────────────── */
        .inspect-tooltip {
          position: absolute;
          right: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          pointer-events: none;
        }

        .inspect-tooltip-inner {
          background: rgba(8, 6, 3, 0.88);
          border: 1px solid rgba(200, 160, 80, 0.2);
          border-radius: 6px;
          padding: 0.4rem 0.75rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .inspect-tooltip-label {
          font-family: 'Cinzel', serif;
          font-size: 0.5rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(200, 160, 80, 0.6);
          display: block;
          margin-bottom: 0.1rem;
        }

        .inspect-tooltip-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          color: rgba(230, 200, 145, 0.9);
          font-style: italic;
          display: block;
        }

        .inspect-tooltip-fade {
          opacity: 0;
          transform: translateX(6px);
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }
        .inspect-tooltip-fade.show {
          opacity: 1;
          transform: translateX(0);
        }

        /* ─── Mode label ────────────────────────────────────────────── */
        .inspect-mode-label {
          position: absolute;
          top: -1.8rem;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: 'Cinzel', serif;
          font-size: 0.45rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(200, 160, 80, 0.55);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .inspect-btn.active ~ .inspect-mode-label,
        .inspect-btn-wrap:hover .inspect-mode-label {
          opacity: 1;
        }

        /* ─── Hint overlay shown on first entry ─────────────────────── */
        .inspect-hint {
          position: fixed;
          bottom: 7rem;
          right: 2.4rem;
          pointer-events: none;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .inspect-hint.show {
          opacity: 1;
          transform: translateY(0);
        }

        .inspect-hint-inner {
          background: rgba(8, 6, 3, 0.78);
          border: 1px solid rgba(200, 160, 80, 0.15);
          border-radius: 8px;
          padding: 0.7rem 1rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .inspect-hint-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }
        .inspect-hint-row:last-child { margin-bottom: 0; }

        .inspect-hint-key {
          font-family: 'Cinzel', serif;
          font-size: 0.42rem;
          letter-spacing: 0.2em;
          color: rgba(200, 160, 80, 0.5);
          background: rgba(200,160,80,0.07);
          border: 1px solid rgba(200,160,80,0.15);
          border-radius: 3px;
          padding: 0.15rem 0.4rem;
          text-transform: uppercase;
          min-width: 52px;
          text-align: center;
          flex-shrink: 0;
        }

        .inspect-hint-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.72rem;
          color: rgba(200, 170, 110, 0.55);
          font-style: italic;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="inspect-root">

        {/* Sub controls (visible when in inspect mode) */}
        <div className={`inspect-sub-controls ${expanded && isInspect ? 'visible' : ''}`}>
          <button className="sub-btn" onClick={handleReset}>
            <span className="sub-btn-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5A5.5 5.5 0 1 0 12.5 7" stroke="rgba(200,160,80,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M10.5 1.5L12.5 3.5L10.5 5.5" stroke="rgba(200,160,80,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Reset View
          </button>
        </div>

        {/* Main button */}
        <div className="inspect-btn-wrap">
          <div
            className={`inspect-mode-label`}
            style={{ opacity: isInspect ? 1 : 0 }}
          >
            Inspect
          </div>

          <button
            className={`inspect-btn ${isInspect ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
            onClick={handleToggle}
            onMouseEnter={() => { setHovered(true); showTooltip(); }}
            onMouseLeave={() => { setHovered(false); hideTooltip(); }}
            aria-label={isInspect ? 'Exit Board Inspect Mode' : 'Enter Board Inspect Mode'}
            title=""
          >
            {isInspect ? (
              // Eye-with-X icon — exit inspect
              <svg className="inspect-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <ellipse cx="11" cy="11" rx="7.5" ry="4.5" stroke="rgba(220,180,100,0.9)" strokeWidth="1.3"/>
                <circle cx="11" cy="11" r="2.2" stroke="rgba(220,180,100,0.9)" strokeWidth="1.3"/>
                <circle cx="11" cy="11" r="0.8" fill="rgba(220,180,100,0.9)"/>
                <line x1="15.5" y1="6.5" x2="6.5" y2="15.5" stroke="rgba(220,180,100,0.75)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            ) : (
              // Magnifying-glass / board inspect icon
              <svg className="inspect-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="10" cy="10" r="5.5" stroke="rgba(200,160,80,0.85)" strokeWidth="1.3"/>
                <circle cx="10" cy="10" r="2.2" stroke="rgba(200,160,80,0.6)" strokeWidth="1"/>
                <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="rgba(200,160,80,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7" y1="10" x2="9" y2="10" stroke="rgba(200,160,80,0.5)" strokeWidth="0.9" strokeLinecap="round"/>
                <line x1="11" y1="10" x2="13" y2="10" stroke="rgba(200,160,80,0.5)" strokeWidth="0.9" strokeLinecap="round"/>
                <line x1="10" y1="7" x2="10" y2="9" stroke="rgba(200,160,80,0.5)" strokeWidth="0.9" strokeLinecap="round"/>
                <line x1="10" y1="11" x2="10" y2="13" stroke="rgba(200,160,80,0.5)" strokeWidth="0.9" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* Tooltip */}
          <div className="inspect-tooltip">
            <div className={`inspect-tooltip-fade ${tooltipVisible ? 'show' : ''}`}>
              <div className="inspect-tooltip-inner">
                <span className="inspect-tooltip-label">Camera</span>
                <span className="inspect-tooltip-name">
                  {isInspect ? 'Exit Inspect' : 'Board Inspect'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hint overlay shown briefly on first inspect entry */}
      <div className={`inspect-hint ${isInspect ? 'show' : ''}`}>
        <div className="inspect-hint-inner">
          {[
            { key: 'Drag', desc: 'Orbit around board' },
            { key: 'R-Drag', desc: 'Pan across surface' },
            { key: 'Scroll', desc: 'Zoom in / out' },
          ].map(({ key, desc }) => (
            <div key={key} className="inspect-hint-row">
              <span className="inspect-hint-key">{key}</span>
              <span className="inspect-hint-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
