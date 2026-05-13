import * as THREE from 'three';

// ─── Factory functions ────────────────────────────────────────────────────────

export function makeAccentMat(color: number | string, isPremium?: boolean): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: c, emissive: c,
    emissiveIntensity: isPremium ? 0.6 : 0.45,
    metalness: isPremium ? 0.75 : 0.62,
    roughness: isPremium ? 0.18 : 0.28,
    envMapIntensity: 1.0,
  });
}

export function makeOwnerMat(color: number | string, hasOwner?: boolean): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: c, emissive: c,
    emissiveIntensity: hasOwner ? 0.7 : 0.08,
    metalness: 0.3, roughness: 0.5,
    transparent: true, opacity: hasOwner ? 0.92 : 0.3,
  });
}

export function makeHologramMat(color: number | string, emissiveIntensity = 0.8): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity,
    metalness: 0, roughness: 0,
    transparent: true, opacity: 0.45,
    side: THREE.DoubleSide, depthWrite: false,
  });
}

export function makeHologramWireMat(color: number | string, emissiveIntensity = 0.25): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    wireframe: true, transparent: true, opacity: emissiveIntensity,
  });
}

export function makeRingMat(color: number | string, opacity = 0.6): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity: 1.0,
    metalness: 0, roughness: 0,
    transparent: true, opacity,
    side: THREE.DoubleSide, depthWrite: false,
  });
}

export function createWoodMaterial(isSide: boolean): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: isSide ? '#0a0806' : '#0e0b08',
    metalness: 0.02, roughness: isSide ? 0.98 : 0.92,
  });
}

// ─── Gold ─────────────────────────────────────────────────────────────────────

export const goldMat = new THREE.MeshStandardMaterial({
  color: '#c8a028', metalness: 0.95, roughness: 0.10,
  emissive: '#7a5a00', emissiveIntensity: 0.35, envMapIntensity: 1.2,
});

export const goldDarkMat = new THREE.MeshStandardMaterial({
  color: '#a07820', metalness: 0.9, roughness: 0.2,
  emissive: '#5a3a00', emissiveIntensity: 0.15,
});

export const goldFrameMat = goldMat;

export const goldBrightMat = new THREE.MeshStandardMaterial({
  color: '#e8c040', metalness: 0.95, roughness: 0.08,
  emissive: '#9a7010', emissiveIntensity: 0.40,
});

export const brassMat = new THREE.MeshStandardMaterial({
  color: '#b8860b', metalness: 0.88, roughness: 0.22,
  emissive: '#6a4a00', emissiveIntensity: 0.20,
});

// ─── Board ────────────────────────────────────────────────────────────────────

export const darkMat           = new THREE.MeshStandardMaterial({ color: '#0a0806', metalness: 0.05, roughness: 0.92 });
export const boardSurfaceMat   = new THREE.MeshStandardMaterial({ color: '#080608', metalness: 0.10, roughness: 0.88 });
export const boardBodyMat      = new THREE.MeshStandardMaterial({ color: '#09070a', metalness: 0.08, roughness: 0.88 });
export const boardEdgeMat      = new THREE.MeshStandardMaterial({ color: '#c8a028', metalness: 0.96, roughness: 0.10, emissive: '#7a5a00', emissiveIntensity: 0.28 });
export const boardEdgeDarkMat  = new THREE.MeshStandardMaterial({ color: '#a07820', metalness: 0.90, roughness: 0.20, emissive: '#5a3a00', emissiveIntensity: 0.10 });

// ─── Tile base variants ───────────────────────────────────────────────────────

// ④ Dark matte obsidian — matches reference image dark atmosphere
export const tileBaseMat    = new THREE.MeshStandardMaterial({ color: '#0d0b12', metalness: 0.10, roughness: 0.82, envMapIntensity: 0.3 });
export const cornerBaseMat  = new THREE.MeshStandardMaterial({ color: '#0c0a10', metalness: 0.10, roughness: 0.82, envMapIntensity: 0.3 });
export const specialBaseMat = new THREE.MeshStandardMaterial({ color: '#0e0c14', metalness: 0.12, roughness: 0.80, envMapIntensity: 0.3 });
export const premiumBaseMat = new THREE.MeshStandardMaterial({ color: '#120e0a', metalness: 0.14, roughness: 0.78, envMapIntensity: 0.3 });
export const tileInsetMat   = new THREE.MeshStandardMaterial({ color: '#c8a028', metalness: 0.90, roughness: 0.18, emissive: '#6a4a00', emissiveIntensity: 0.15, transparent: true, opacity: 0.55 });

// ─── Table ────────────────────────────────────────────────────────────────────

export const tableMat       = new THREE.MeshStandardMaterial({ color: '#0e0b08', metalness: 0.05, roughness: 0.92 });
export const tableLeatherMat= new THREE.MeshStandardMaterial({ color: '#181210', metalness: 0.02, roughness: 0.98 });

// ─── Accents ──────────────────────────────────────────────────────────────────

export const chanceMat = new THREE.MeshStandardMaterial({ color: '#9b59b6', emissive: '#6a2fa0', emissiveIntensity: 0.7,  metalness: 0.3, roughness: 0.4 });
export const startMat  = new THREE.MeshStandardMaterial({ color: '#22c55e', emissive: '#15803d', emissiveIntensity: 0.8,  metalness: 0.3, roughness: 0.4 });
export const dangerMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#991b1b', emissiveIntensity: 0.8,  metalness: 0.3, roughness: 0.4 });
export const taxMat    = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.6,  metalness: 0.4, roughness: 0.5 });
