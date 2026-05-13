import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useDiceStore } from './useDiceStore';
import { diceResultController } from './DiceResultController';

const DICE_VISUAL_SIZE = 0.364;
const DICE_HALF_EXTENT = DICE_VISUAL_SIZE / 2;
const DICE_SPAWN_Y = 2.05;
const DICE_SPAWN_Z = 1.15;

const DICE_BODY_TUNING = {
  restitution: 0.22,
  friction: 1.05,
  density: 2.35,
  linearDamping: 0.38,
  angularDamping: 0.72,
  additionalSolverIterations: 6,
};

const SETTLE_TUNING = {
  linearQuietSpeed: 0.055,
  angularQuietSpeed: 0.28,
  lockAfter: 0.34,
  microDampingStart: 0.08,
  microLinearDamping: 0.72,
  microAngularDamping: 0.62,
};

function resolveUpwardFace(rotationQuat: THREE.Quaternion): number {
  const faces = [
    { dir: new THREE.Vector3(0, 1, 0).applyQuaternion(rotationQuat), val: 1 },
    { dir: new THREE.Vector3(0, -1, 0).applyQuaternion(rotationQuat), val: 6 },
    { dir: new THREE.Vector3(0, 0, 1).applyQuaternion(rotationQuat), val: 2 },
    { dir: new THREE.Vector3(0, 0, -1).applyQuaternion(rotationQuat), val: 5 },
    { dir: new THREE.Vector3(1, 0, 0).applyQuaternion(rotationQuat), val: 3 },
    { dir: new THREE.Vector3(-1, 0, 0).applyQuaternion(rotationQuat), val: 4 },
  ];
  faces.sort((a, b) => b.dir.y - a.dir.y);
  return faces[0].val;
}

function getVectorMagnitude(v?: { x: number; y: number; z: number }) {
  return v ? Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) : 0;
}

function createSpawnRotation(xSign: number, zSign: number) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(
    xSign * (0.35 + Math.random() * 0.5),
    Math.random() * Math.PI,
    zSign * (0.25 + Math.random() * 0.45)
  ));

  return { x: q.x, y: q.y, z: q.z, w: q.w };
}

function easeBodyTowardRest(body?: RapierRigidBody | null) {
  if (!body) return;

  const v = body.linvel();
  const a = body.angvel();

  body.setLinvel({
    x: v.x * SETTLE_TUNING.microLinearDamping,
    y: v.y * SETTLE_TUNING.microLinearDamping,
    z: v.z * SETTLE_TUNING.microLinearDamping,
  }, true);

  body.setAngvel({
    x: a.x * SETTLE_TUNING.microAngularDamping,
    y: a.y * SETTLE_TUNING.microAngularDamping,
    z: a.z * SETTLE_TUNING.microAngularDamping,
  }, true);
}

function lockBodyAtRest(body?: RapierRigidBody | null) {
  if (!body) return;

  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.sleep();
}

export function DiceMesh() {
  // Premium materials for tactile, collectible, miniature feel
  const pipMaterial = <meshStandardMaterial color={0x0a0a0a} roughness={0.3} metalness={0.7} />;
  const pipGeo = <cylinderGeometry args={[0.022, 0.022, 0.015, 24]} />;
  const pipRotX: [number, number, number] = [Math.PI / 2, 0, 0];
  const pipRotY: [number, number, number] = [0, 0, 0];
  const pipRotZ: [number, number, number] = [0, 0, Math.PI / 2];

  return (
    <group scale={[1.4, 1.4, 1.4]}>
      {/* Beveled edges, realistic shadows */}
      <RoundedBox args={[0.26, 0.26, 0.26]} radius={0.04} smoothness={12} castShadow receiveShadow>
        <meshStandardMaterial color={0xfffcf7} roughness={0.15} metalness={0.1} />
      </RoundedBox>
      
      {/* 1 pip face (+Y) */}
      <mesh position={[0, 0.126, 0]} rotation={pipRotY}>{pipGeo}{pipMaterial}</mesh>
      
      {/* 6 pip face (-Y) */}
      <group position={[0, -0.126, 0]} rotation={pipRotY}>
        <mesh position={[0.06, 0, 0.07]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, 0.07]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0.06, 0, -0.07]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, -0.07]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0.06, 0, 0]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, 0]}>{pipGeo}{pipMaterial}</mesh>
      </group>

      {/* 2 pip face (+Z) */}
      <group position={[0, 0, 0.126]} rotation={pipRotX}>
        <mesh position={[0.05, 0, 0.05]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.05, 0, -0.05]}>{pipGeo}{pipMaterial}</mesh>
      </group>
      
      {/* 5 pip face (-Z) */}
      <group position={[0, 0, -0.126]} rotation={pipRotX}>
        <mesh position={[0.06, 0, 0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, -0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0.06, 0, -0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, 0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0, 0, 0]}>{pipGeo}{pipMaterial}</mesh>
      </group>

      {/* 3 pip face (+X) */}
      <group position={[0.126, 0, 0]} rotation={pipRotZ}>
        <mesh position={[0.06, 0, 0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, -0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0, 0, 0]}>{pipGeo}{pipMaterial}</mesh>
      </group>
      
      {/* 4 pip face (-X) */}
      <group position={[-0.126, 0, 0]} rotation={pipRotZ}>
        <mesh position={[0.06, 0, 0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, -0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[0.06, 0, -0.06]}>{pipGeo}{pipMaterial}</mesh>
        <mesh position={[-0.06, 0, 0.06]}>{pipGeo}{pipMaterial}</mesh>
      </group>
    </group>
  );
}

export function DicePhysicsController() {
  const body1 = useRef<RapierRigidBody>(null);
  const body2 = useRef<RapierRigidBody>(null);

  const eventState = useDiceStore(state => state.eventState);
  const settleTimer = useRef(0);

  useEffect(() => {
    if (eventState === 'CONTROLLED_ROLL') {
      settleTimer.current = 0;

      // PHYSICAL MID-AIR ENTRY
      // Spawn both dice ABOVE the board (MID-TABLETOP SCALE), fully visible in frame
      const spawnY = DICE_SPAWN_Y;
      const spawnZ = DICE_SPAWN_Z; // MUST BE < 1.8 to spawn inside the invisible arena walls!
      
      // Separated left/right, near the top of the frame, tossed from slightly behind/near camera
      body1.current?.setTranslation({ x: -0.4, y: spawnY, z: spawnZ }, true);
      body2.current?.setTranslation({ x: 0.4, y: spawnY + 0.1, z: spawnZ + 0.2 }, true);
      body1.current?.setRotation(createSpawnRotation(1, 1), true);
      body2.current?.setRotation(createSpawnRotation(-1, -1), true);

      // Apply downward velocity, forward impulse (towards center -Z)
      // Lower vertical drop with stronger gravity reads heavier without feeling floaty.
      body1.current?.setLinvel({ x: 0.32, y: -1.9, z: -2.25 }, true);
      body2.current?.setLinvel({ x: -0.34, y: -1.85, z: -2.65 }, true);

      // Tumble while falling
      body1.current?.setAngvel({ x: Math.PI * 3.6 + Math.random() * 1.4, y: 1.1 + Math.random() * 1.2, z: 0.6 + Math.random() * 1.4 }, true);
      body2.current?.setAngvel({ x: Math.PI * 3.8 + Math.random() * 1.4, y: 0.8 + Math.random() * 1.2, z: -0.8 - Math.random() * 1.3 }, true);
    }
  }, [eventState]);

  useFrame((state, delta) => {
    const currentState = useDiceStore.getState().eventState;

    if (['CONTROLLED_ROLL', 'RESULT_SETTLE', 'RESULT_HOLD'].includes(currentState)) {
      const t1 = body1.current?.translation();
      const t2 = body2.current?.translation();
      if (t1 && t2) {
        useDiceStore.getState().setDiceCenter([
          (t1.x + t2.x) / 2,
          (t1.y + t2.y) / 2,
          (t1.z + t2.z) / 2
        ]);
      }
    }

    if (currentState === 'CONTROLLED_ROLL' || currentState === 'RESULT_SETTLE') {
      const isSleeping1 = body1.current?.isSleeping();
      const isSleeping2 = body2.current?.isSleeping();

      const v1Mag = getVectorMagnitude(body1.current?.linvel());
      const v2Mag = getVectorMagnitude(body2.current?.linvel());
      const a1Mag = getVectorMagnitude(body1.current?.angvel());
      const a2Mag = getVectorMagnitude(body2.current?.angvel());

      const isQuiet =
        v1Mag < SETTLE_TUNING.linearQuietSpeed &&
        v2Mag < SETTLE_TUNING.linearQuietSpeed &&
        a1Mag < SETTLE_TUNING.angularQuietSpeed &&
        a2Mag < SETTLE_TUNING.angularQuietSpeed;

      if ((isSleeping1 && isSleeping2) || isQuiet) {
        if (currentState === 'CONTROLLED_ROLL') {
           useDiceStore.getState().setEventState('RESULT_SETTLE');
        }
        settleTimer.current += delta;

        if (settleTimer.current > SETTLE_TUNING.microDampingStart) {
          easeBodyTowardRest(body1.current);
          easeBodyTowardRest(body2.current);
        }

        // Wait for readable quiet, then remove the last simulation shimmer.
        if (settleTimer.current > SETTLE_TUNING.lockAfter) {
          lockBodyAtRest(body1.current);
          lockBodyAtRest(body2.current);

          const q1 = body1.current?.rotation();
          const q2 = body2.current?.rotation();

          const val1 = q1 ? resolveUpwardFace(new THREE.Quaternion(q1.x, q1.y, q1.z, q1.w)) : 1;
          const val2 = q2 ? resolveUpwardFace(new THREE.Quaternion(q2.x, q2.y, q2.z, q2.w)) : 1;

          diceResultController.onDiceSettled(val1, val2);
        }
      } else {
        settleTimer.current = 0;
        if (currentState === 'RESULT_SETTLE') {
           useDiceStore.getState().setEventState('CONTROLLED_ROLL');
        }
      }
    }
  });

  const activePhysics = ['CONTROLLED_ROLL', 'RESULT_SETTLE', 'RESULT_HOLD'].includes(eventState);

  return (
    <>
      <RigidBody
        ref={body1}
        colliders={false}
        ccd
        canSleep
        additionalSolverIterations={DICE_BODY_TUNING.additionalSolverIterations}
        angularDamping={DICE_BODY_TUNING.angularDamping}
        linearDamping={DICE_BODY_TUNING.linearDamping}
        position={[-0.4, 10.0, 2.2]}
        gravityScale={activePhysics ? 1 : 0}
      >
        <CuboidCollider
          args={[DICE_HALF_EXTENT, DICE_HALF_EXTENT, DICE_HALF_EXTENT]}
          density={DICE_BODY_TUNING.density}
          restitution={DICE_BODY_TUNING.restitution}
          friction={DICE_BODY_TUNING.friction}
        />
        <DiceMesh />
      </RigidBody>
      <RigidBody
        ref={body2}
        colliders={false}
        ccd
        canSleep
        additionalSolverIterations={DICE_BODY_TUNING.additionalSolverIterations}
        angularDamping={DICE_BODY_TUNING.angularDamping}
        linearDamping={DICE_BODY_TUNING.linearDamping}
        position={[0.4, 10.0, 2.4]}
        gravityScale={activePhysics ? 1 : 0}
      >
        <CuboidCollider
          args={[DICE_HALF_EXTENT, DICE_HALF_EXTENT, DICE_HALF_EXTENT]}
          density={DICE_BODY_TUNING.density}
          restitution={DICE_BODY_TUNING.restitution}
          friction={DICE_BODY_TUNING.friction}
        />
        <DiceMesh />
      </RigidBody>
    </>
  );
}
