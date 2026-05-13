import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const BOARD_SURFACE_Y = 0.385;
const FLOOR_HALF_HEIGHT = 1.0;

const CONTACT_TUNING = {
  floorRestitution: 0.16,
  floorFriction: 1.18,
  wallRestitution: 0.18,
  wallFriction: 0.85,
};

export function DiceArena() {
  // A controlled center-board cinematic roll zone.
  // Constrain dice area, maintain readable composition, preserve center-board framing, prevent chaotic trajectories.
  return (
    <group>
      {/* True Physical Floor (Top face exactly at Y=0.385 to match visual board + tiles) */}
      {/* Half-height is 1.0. Top face = -0.615 + 1.0 = 0.385. Width/Depth = 9x9 (half extents 4.5) */}
      {/* Making the floor 2.0 units thick ensures high-speed dice never tunnel through it */}
      <RigidBody type="fixed" position={[0, BOARD_SURFACE_Y - FLOOR_HALF_HEIGHT, 0]} colliders={false}>
         <CuboidCollider
           args={[4.5, FLOOR_HALF_HEIGHT, 4.5]}
           restitution={CONTACT_TUNING.floorRestitution}
           friction={CONTACT_TUNING.floorFriction}
         />
      </RigidBody>
      
      {/* Invisible Walls to keep dice strictly inside the cinematic frame (3.5x3.5 area) */}
      {/* Half-extents: width=1.8, height=2, depth=0.2 (full size: 3.6 x 4 x 0.4) */}
      <RigidBody type="fixed" position={[0, 2.0, -1.8]} colliders={false}>
         <CuboidCollider
           args={[1.8, 2, 0.2]}
           restitution={CONTACT_TUNING.wallRestitution}
           friction={CONTACT_TUNING.wallFriction}
         />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 2.0, 1.8]} colliders={false}>
         <CuboidCollider
           args={[1.8, 2, 0.2]}
           restitution={CONTACT_TUNING.wallRestitution}
           friction={CONTACT_TUNING.wallFriction}
         />
      </RigidBody>
      <RigidBody type="fixed" position={[-1.8, 2.0, 0]} colliders={false}>
         <CuboidCollider
           args={[0.2, 2, 1.8]}
           restitution={CONTACT_TUNING.wallRestitution}
           friction={CONTACT_TUNING.wallFriction}
         />
      </RigidBody>
      <RigidBody type="fixed" position={[1.8, 2.0, 0]} colliders={false}>
         <CuboidCollider
           args={[0.2, 2, 1.8]}
           restitution={CONTACT_TUNING.wallRestitution}
           friction={CONTACT_TUNING.wallFriction}
         />
      </RigidBody>
    </group>
  );
}
