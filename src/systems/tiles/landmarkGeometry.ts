import * as THREE from 'three';

// Returns a Group of meshes forming a stylized landmark icon.
// All geometry is gold-tinted, max height ~0.35 units, fits in a ~0.5x0.5 footprint.

const GOLD = new THREE.MeshStandardMaterial({
  color: '#c8a028',
  metalness: 0.85,
  roughness: 0.25,
  emissive: '#7a5a00',
  emissiveIntensity: 0.15,
});

const GOLD_BRIGHT = new THREE.MeshStandardMaterial({
  color: '#e8c040',
  metalness: 0.9,
  roughness: 0.15,
  emissive: '#9a7010',
  emissiveIntensity: 0.25,
});

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0, mat = GOLD) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  return m;
}

function cyl(rt: number, rb: number, h: number, x = 0, y = 0, z = 0, segs = 8, mat = GOLD) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  return m;
}

function cone(r: number, h: number, x = 0, y = 0, z = 0, mat = GOLD) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  return m;
}

function sphere(r: number, x = 0, y = 0, z = 0, mat = GOLD) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), mat);
  m.position.set(x, y + r, z);
  m.castShadow = true;
  return m;
}

type LandmarkBuilder = () => THREE.Group;

const LANDMARKS: Record<string, LandmarkBuilder> = {

  // Eiffel Tower — iconic 3-tier silhouette
  eiffel: () => {
    const g = new THREE.Group();
    g.add(box(0.30, 0.04, 0.04, 0, 0, 0));        // base beam
    g.add(box(0.04, 0.08, 0.04, -0.11, 0.04, 0)); // left leg
    g.add(box(0.04, 0.08, 0.04,  0.11, 0.04, 0)); // right leg
    g.add(box(0.20, 0.03, 0.03, 0, 0.12, 0));     // 1st platform
    g.add(box(0.03, 0.08, 0.03, -0.07, 0.15, 0)); // left mid
    g.add(box(0.03, 0.08, 0.03,  0.07, 0.15, 0)); // right mid
    g.add(box(0.14, 0.03, 0.03, 0, 0.23, 0));     // 2nd platform
    g.add(cyl(0.015, 0.025, 0.10, 0, 0.26, 0, 6));// top spire
    return g;
  },

  // Big Ben / Clock Tower
  clock: () => {
    const g = new THREE.Group();
    g.add(box(0.20, 0.15, 0.08, 0, 0, 0));        // base building
    g.add(box(0.13, 0.12, 0.06, 0, 0.15, 0));     // clock tower
    g.add(box(0.15, 0.02, 0.08, 0, 0.27, 0));     // clock face
    g.add(cone(0.07, 0.08, 0, 0.29, 0, GOLD_BRIGHT)); // spire
    return g;
  },

  // Colosseum — oval ring with arches
  colosseum: () => {
    const g = new THREE.Group();
    g.add(cyl(0.18, 0.20, 0.06, 0, 0, 0, 16));    // outer ring
    g.add(cyl(0.12, 0.13, 0.04, 0, 0.06, 0, 16)); // inner ring
    g.add(box(0.38, 0.02, 0.02, 0, 0.10, 0));     // top rim
    // Arch pillars
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.add(box(0.02, 0.06, 0.02, Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16));
    }
    return g;
  },

  // Sydney Opera House — shell shapes
  opera: () => {
    const g = new THREE.Group();
    g.add(box(0.30, 0.03, 0.12, 0, 0, 0));  // base platform
    // shells as tilted cylinders
    const shell1 = cyl(0.001, 0.08, 0.16, -0.08, 0.03, 0, 8);
    shell1.rotation.z = 0.6;
    g.add(shell1);
    const shell2 = cyl(0.001, 0.10, 0.20, 0.0, 0.03, 0, 8);
    shell2.rotation.z = 0.5;
    g.add(shell2);
    const shell3 = cyl(0.001, 0.07, 0.12, 0.1, 0.03, 0, 8);
    shell3.rotation.z = 0.55;
    g.add(shell3);
    return g;
  },

  // Arch (Granada / Alhambra)
  arch: () => {
    const g = new THREE.Group();
    g.add(box(0.04, 0.22, 0.04, -0.09, 0, 0));  // left pillar
    g.add(box(0.04, 0.22, 0.04,  0.09, 0, 0));  // right pillar
    g.add(box(0.22, 0.04, 0.04, 0, 0.20, 0));   // top lintel
    g.add(box(0.22, 0.02, 0.04, 0, 0.26, 0));   // crown
    return g;
  },

  // Space Needle (Seattle)
  tower: () => {
    const g = new THREE.Group();
    g.add(cyl(0.03, 0.07, 0.14, 0, 0, 0));       // base
    g.add(cyl(0.02, 0.03, 0.12, 0, 0.14, 0));    // shaft
    g.add(cyl(0.12, 0.08, 0.05, 0, 0.26, 0, 16));// saucer
    g.add(cyl(0.01, 0.01, 0.06, 0, 0.31, 0));    // top spike
    return g;
  },

  // Gate (Madrid — Puerta de Alcalá)
  gate: () => {
    const g = new THREE.Group();
    g.add(box(0.30, 0.22, 0.04, 0, 0, 0));        // gate facade
    g.add(box(0.12, 0.10, 0.04, 0, 0.04, 0.01, new THREE.MeshStandardMaterial({ color: '#0a0806' }))); // arch opening
    g.add(box(0.32, 0.03, 0.06, 0, 0.23, 0));     // top entablature
    g.add(cone(0.025, 0.06, -0.10, 0.26, 0));
    g.add(cone(0.025, 0.06,  0.10, 0.26, 0));
    g.add(cone(0.035, 0.08,  0.00, 0.26, 0));
    return g;
  },

  // Palm trees (Maldives)
  palm: () => {
    const g = new THREE.Group();
    g.add(cyl(0.01, 0.02, 0.20, -0.06, 0, 0, 6));
    g.add(cyl(0.01, 0.02, 0.18,  0.06, 0, 0, 6));
    // fronds
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const frond = box(0.10, 0.01, 0.02, -0.06 + Math.cos(a) * 0.06, 0.20, Math.sin(a) * 0.04);
      frond.rotation.z = a * 0.3;
      g.add(frond);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const frond = box(0.10, 0.01, 0.02, 0.06 + Math.cos(a) * 0.06, 0.18, Math.sin(a) * 0.04);
      frond.rotation.z = a * 0.3;
      g.add(frond);
    }
    return g;
  },

  // Skyline (Hong Kong)
  skyline: () => {
    const g = new THREE.Group();
    const heights = [0.22, 0.30, 0.18, 0.26, 0.14];
    const widths  = [0.05, 0.04, 0.04, 0.05, 0.04];
    let x = -0.12;
    for (let i = 0; i < heights.length; i++) {
      g.add(box(widths[i], heights[i], 0.04, x, 0, 0));
      x += widths[i] + 0.02;
    }
    return g;
  },

  // Temple of Heaven (Beijing)
  temple: () => {
    const g = new THREE.Group();
    g.add(cyl(0.14, 0.16, 0.03, 0, 0, 0, 8));   // base
    g.add(cyl(0.10, 0.12, 0.03, 0, 0.03, 0, 8)); // mid
    g.add(cyl(0.08, 0.10, 0.08, 0, 0.06, 0, 8)); // drum
    g.add(cone(0.08, 0.07, 0, 0.14, 0, GOLD_BRIGHT)); // lower roof cone
    g.add(cyl(0.04, 0.06, 0.06, 0, 0.21, 0, 8));
    g.add(cone(0.05, 0.06, 0, 0.27, 0, GOLD_BRIGHT));
    g.add(cyl(0.01, 0.02, 0.04, 0, 0.33, 0));
    return g;
  },

  // Shanghai Tower
  tower2: () => {
    const g = new THREE.Group();
    g.add(cyl(0.07, 0.09, 0.04, 0, 0, 0, 16));
    g.add(cyl(0.03, 0.07, 0.22, 0, 0.04, 0, 12));
    g.add(cyl(0.01, 0.03, 0.06, 0, 0.26, 0, 8));
    g.add(cyl(0.005, 0.01, 0.04, 0, 0.32, 0, 6));
    return g;
  },

  // Milan Duomo dome
  dome: () => {
    const g = new THREE.Group();
    g.add(box(0.28, 0.10, 0.08, 0, 0, 0));
    g.add(box(0.24, 0.04, 0.07, 0, 0.10, 0));
    const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), GOLD);
    domeMesh.position.set(0, 0.14, 0);
    g.add(domeMesh);
    g.add(cyl(0.008, 0.015, 0.06, 0, 0.23, 0));
    // spires
    for (let i = -1; i <= 1; i++) {
      g.add(cone(0.015, 0.05, i * 0.08, 0.14, 0));
    }
    return g;
  },

  // Hamburg Bridge
  bridge: () => {
    const g = new THREE.Group();
    g.add(box(0.30, 0.02, 0.06, 0, 0, 0));         // deck
    g.add(cyl(0.015, 0.015, 0.18, -0.10, 0, 0));   // left tower
    g.add(cyl(0.015, 0.015, 0.18,  0.10, 0, 0));   // right tower
    g.add(cone(0.02, 0.04, -0.10, 0.18, 0));
    g.add(cone(0.02, 0.04,  0.10, 0.18, 0));
    // cables
    const cableMat = new THREE.LineBasicMaterial({ color: '#c8a028', linewidth: 1 });
    [[-0.10, 0.18], [0.10, 0.18]].forEach(([tx, ty]) => {
      [-0.14, -0.06, 0.06, 0.14].forEach((bx) => {
        const pts = [new THREE.Vector3(tx, ty, 0), new THREE.Vector3(bx, 0.02, 0)];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableMat));
      });
    });
    return g;
  },

  // Cyprus ruins
  ruins: () => {
    const g = new THREE.Group();
    const cols = [-0.12, -0.04, 0.04, 0.12];
    cols.forEach((x, i) => {
      const h = [0.18, 0.22, 0.20, 0.15][i];
      g.add(cyl(0.018, 0.022, h, x, 0, 0, 8));
    });
    g.add(box(0.30, 0.02, 0.03, 0, 0.22, 0)); // partial entablature
    return g;
  },

  // Berlin Brandenburg Gate
  gate2: () => {
    const g = new THREE.Group();
    const colPositions = [-0.10, -0.05, 0, 0.05, 0.10];
    colPositions.forEach((x) => {
      g.add(cyl(0.015, 0.018, 0.20, x, 0, 0, 8));
    });
    g.add(box(0.26, 0.04, 0.05, 0, 0.20, 0)); // top beam
    g.add(box(0.26, 0.02, 0.05, 0, 0.26, 0)); // cornice
    g.add(cone(0.04, 0.04, 0, 0.28, 0));      // quadriga
    return g;
  },

  // Las Vegas welcome sign
  sign: () => {
    const g = new THREE.Group();
    g.add(box(0.26, 0.18, 0.03, 0, 0, 0));
    g.add(box(0.28, 0.02, 0.03, 0, 0.18, 0));
    g.add(cone(0.06, 0.08, 0, 0.20, 0, GOLD_BRIGHT));
    g.add(cyl(0.01, 0.01, 0.15, -0.12, 0, 0)); // left post
    g.add(cyl(0.01, 0.01, 0.15,  0.12, 0, 0)); // right post
    return g;
  },

  // Statue of Liberty
  liberty: () => {
    const g = new THREE.Group();
    g.add(box(0.12, 0.08, 0.08, 0, 0, 0));    // pedestal
    g.add(cyl(0.04, 0.05, 0.12, 0, 0.08, 0)); // body
    g.add(sphere(0.045, 0, 0.20, 0));          // head
    // crown spikes
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.add(cone(0.008, 0.035, Math.cos(a) * 0.03, 0.27, Math.sin(a) * 0.015));
    }
    g.add(box(0.015, 0.10, 0.015, 0.06, 0.14, 0)); // torch arm
    return g;
  },

  // Nice seaside
  seaside: () => {
    const g = new THREE.Group();
    g.add(box(0.28, 0.03, 0.08, 0, 0, 0));   // waterfront promenade
    g.add(box(0.06, 0.16, 0.05, -0.08, 0.03, 0)); // building 1
    g.add(box(0.08, 0.20, 0.05,  0.02, 0.03, 0)); // building 2 (taller)
    g.add(box(0.05, 0.13, 0.05,  0.12, 0.03, 0)); // building 3
    g.add(cone(0.03, 0.04, 0.02, 0.23, 0));
    return g;
  },

  // Lyon bridge (Pont de la Guillotière style)
  bridge2: () => {
    const g = new THREE.Group();
    g.add(box(0.30, 0.03, 0.06, 0, 0.08, 0)); // deck
    // arch supports
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.09;
      g.add(box(0.02, 0.10, 0.05, x, 0, 0));
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12, Math.PI), GOLD);
      arch.position.set(x, 0.08, 0);
      arch.rotation.z = Math.PI;
      g.add(arch);
    }
    return g;
  },

  // Kazan Kremlin
  kremlin: () => {
    const g = new THREE.Group();
    g.add(box(0.26, 0.12, 0.08, 0, 0, 0));    // main building
    g.add(cyl(0.05, 0.05, 0.08, -0.08, 0.12, 0, 8)); // left tower
    g.add(cyl(0.05, 0.05, 0.10,  0.08, 0.12, 0, 8)); // right tower
    g.add(cone(0.05, 0.06, -0.08, 0.20, 0, GOLD_BRIGHT)); // left dome/spire
    const onion = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), GOLD_BRIGHT);
    onion.scale.set(1, 1.4, 1);
    onion.position.set(0.08, 0.28, 0);
    g.add(onion);
    return g;
  },

  // Tax — Roman columns
  columns: () => {
    const g = new THREE.Group();
    g.add(box(0.28, 0.02, 0.06, 0, 0, 0));    // base step
    g.add(box(0.22, 0.02, 0.05, 0, 0.02, 0)); // 2nd step
    const colXs = [-0.09, -0.03, 0.03, 0.09];
    colXs.forEach((x) => {
      g.add(cyl(0.018, 0.022, 0.18, x, 0.04, 0, 8));
    });
    g.add(box(0.24, 0.03, 0.06, 0, 0.22, 0)); // entablature
    g.add(box(0.22, 0.02, 0.05, 0, 0.25, 0));
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(0.001, 0.13, 0.06, 4),
      GOLD_BRIGHT
    );
    roof.position.set(0, 0.30, 0);
    g.add(roof);
    return g;
  },

  // Mountain (Sochi)
  mountain: () => {
    const g = new THREE.Group();
    const peak1 = cone(0.12, 0.22, -0.06, 0, 0);
    const peak2 = cone(0.10, 0.28,  0.06, 0, 0, GOLD_BRIGHT);
    const peak3 = cone(0.08, 0.16, -0.14, 0, 0);
    g.add(peak1, peak2, peak3);
    // snow caps (flat lighter disc)
    const snowMat = new THREE.MeshStandardMaterial({ color: '#e8e0d0', metalness: 0.1, roughness: 0.8 });
    g.add(cyl(0.02, 0.04, 0.02, 0.06, 0.24, 0, 8, snowMat));
    return g;
  },

  // Chicago Willis Tower
  tower3: () => {
    const g = new THREE.Group();
    g.add(box(0.18, 0.28, 0.08, 0, 0, 0));
    g.add(box(0.12, 0.10, 0.07, 0, 0.28, 0));
    g.add(box(0.08, 0.06, 0.06, 0, 0.38, 0));
    g.add(cyl(0.008, 0.008, 0.05, -0.03, 0.44, 0));
    g.add(cyl(0.008, 0.008, 0.05,  0.03, 0.44, 0));
    return g;
  },

};

// Fallback: a simple pin/marker
const defaultLandmark = (): THREE.Group => {
  const g = new THREE.Group();
  g.add(cyl(0.04, 0.06, 0.04, 0, 0, 0));
  g.add(sphere(0.06, 0, 0.04, 0));
  return g;
};

export function buildLandmark(key?: string): THREE.Group {
  const builder = key ? LANDMARKS[key] : null;
  return builder ? builder() : defaultLandmark();
}
