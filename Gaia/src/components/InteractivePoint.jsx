import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function InteractivePoint({ position, label, onShowConfirmation }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onShowConfirmation(label);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <sphereGeometry args={[0.07, 14, 14]} />
      <meshBasicMaterial
        color={hovered ? '#ff6b6b' : '#4f46e5'}
        transparent
        opacity={hovered ? 1 : 0.7}
        depthTest={false}
      />
    </mesh>
  );
}

export default InteractivePoint;
