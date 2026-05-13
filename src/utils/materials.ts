import * as THREE from 'three';

// Wood grain procedural (dark walnut)
export function createWoodMaterial(dark = false) {
  return new THREE.MeshStandardMaterial({
    color: dark ? 0x1a0e06 : 0x3a1f0a,
    roughness: 0.78,
    metalness: 0.0,
    envMapIntensity: 0.3,
  });
}

// Board surface — deep forest green with gold
export const boardSurfaceMat = new THREE.MeshStandardMaterial({
  color: 0x0f2318,
  roughness: 0.45,
  metalness: 0.12,
  envMapIntensity: 0.6,
});

// Board bevel/side — dark ebony
export const boardEdgeMat = new THREE.MeshStandardMaterial({
  color: 0x0a0806,
  roughness: 0.35,
  metalness: 0.3,
  envMapIntensity: 0.8,
});

// Gold trim
export const goldMat = new THREE.MeshStandardMaterial({
  color: 0xc8952a,
  roughness: 0.2,
  metalness: 0.9,
  envMapIntensity: 1.2,
});
