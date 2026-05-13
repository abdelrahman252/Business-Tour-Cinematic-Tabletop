import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCameraStore } from '@/stores/useCameraStore';
import { useRef, useState } from 'react';
import { Html, Line } from '@react-three/drei';
import { pawnLogicalState } from '@/stores/usePawnStore';

export function CameraDebugVisualizer() {
  const targetMesh = useRef<THREE.Mesh>(null);
  const lookAtMesh = useRef<THREE.Mesh>(null);
  
  const [linePoints, setLinePoints] = useState<[THREE.Vector3, THREE.Vector3]>([
    new THREE.Vector3(), new THREE.Vector3()
  ]);

  useFrame((state) => {
    if (targetMesh.current && lookAtMesh.current) {
      targetMesh.current.position.copy(state.camera.position);
      
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
      const lookAtApprox = state.camera.position.clone().add(dir.multiplyScalar(5));
      lookAtMesh.current.position.copy(lookAtApprox);

      setLinePoints([state.camera.position.clone(), lookAtApprox]);
    }
  });

  return (
    <group>
      {/* Camera Position Helper */}
      <mesh ref={targetMesh}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="red" wireframe />
        <Html distanceFactor={10}>
          <div style={{ color: 'red', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>Camera Pos</div>
        </Html>
      </mesh>
      
      {/* LookAt Helper */}
      <mesh ref={lookAtMesh}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="yellow" wireframe />
        <Html distanceFactor={10}>
          <div style={{ color: 'yellow', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>LookAt</div>
        </Html>
      </mesh>

      {/* Pawn Position Helper */}
      <mesh position-y={0.1}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="blue" wireframe />
        <Html distanceFactor={10}>
          <div style={{ color: 'blue', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>Pawn Vector</div>
        </Html>
      </mesh>

      {/* Connecting Line */}
      <Line points={linePoints} color="white" transparent opacity={0.3} lineWidth={1} />
    </group>
  );
}

