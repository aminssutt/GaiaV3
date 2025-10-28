import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import InteractivePoint from './InteractivePoint';
import * as THREE from 'three';

// Interactive hotspot positions differ already per gender.
const pointsData = {
  male: [
    { id: 'breathing', position: [0, 1.7, 0], label: 'Breathing' },
    { id: 'neck', position: [0, 1.4, 0], label: 'Neck' },
    { id: 'shoulders', position: [0.25, 1.2, -0.26], label: 'Shoulders' },
    { id: 'arms', position: [-0.49, 0.9, 0.12], label: 'Arms' },
    { id: 'wrists', position: [0.7, 0.34, -0.4], label: 'Wrists' },
    { id: 'back', position: [0, 0.5, -0.15], label: 'Back' },
    { id: 'legs', position: [0.2, -0.5, 0], label: 'Legs' },
  ],
  female: [
    // Recalibrated for increased female scale (now near male proportions)
    { id: 'breathing', position: [0, 1.65, 0], label: 'Breathing' },
    { id: 'neck', position: [0, 1.35, 0], label: 'Neck' },
    { id: 'shoulders', position: [0.23, 1.15, -0.25], label: 'Shoulders' },
    { id: 'arms', position: [-0.46, 0.87, 0.12], label: 'Arms' },
    { id: 'wrists', position: [0.68, 0.32, -0.38], label: 'Wrists' },
    { id: 'back', position: [0, 0.48, -0.15], label: 'Back' },
    { id: 'legs', position: [0.18, -0.5, 0], label: 'Legs' },
  ],
};

// Separate transform config per gender so we can fine‑tune scale / vertical offset independently.
// These values are initial guesses; adjust after visual review if needed.
// If later you want automatic normalization, we can compute a bounding box and derive scale.
const avatarConfig = {
  male: {
    scale: 1.85,          // slightly larger build
    position: [0, -1.95, 0], // drop a touch lower so feet sit nicely
    rotation: [0, Math.PI / 6, 0]
  },
  female: {
    scale: 2.15,            // increased to match male visual presence
    position: [0, -1.95, 0], // align feet similarly after scale change
    rotation: [0, Math.PI / 6, 0]
  }
};

function NeckAccessory({ gender }) {
  const base = import.meta.env.BASE_URL || '/';
  const gltf = useLoader(GLTFLoader, `${base}avatars/neckmassage.glb`);
  // Per-gender placement (initial values; tweak as needed after visual review)
  const neckAccessoryConfig = {
    male:   { position: [0.03, 1.5, 0.07], rotation: [4, Math.PI - 0.18, -0.3],  scale: 0.18 },
    female: { position: [0.02, 1.47, 0.06], rotation: [3.95, Math.PI - 0.2, -0.28], scale: 0.17 }
  };
  const cfg = neckAccessoryConfig[gender] || neckAccessoryConfig.male;
  return (
    <group position={cfg.position} rotation={cfg.rotation} scale={cfg.scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Shoes accessory (pair) – initial placement guess; adjust after visual review.
// We allow both genders immediately.
function ShoesAccessory({ gender }) {
  const base = import.meta.env.BASE_URL || '/';
  const gltf = useLoader(GLTFLoader, `${base}avatars/shoesmassage.glb`);

  /*
    Placement rationale (first pass):
    - Avatar root has been shifted down (position in avatarConfig) so local Y values for feet are negative.
    - legs hotspot sits around y: -0.5; shoes need to go further down toward ankles.
    - Start near y: -1.55 (tweak ±0.05) — expose config per gender for quick refinement.
  */
  const shoesConfig = {
    male:   { position: [-0.02, -1.85, -0.08], rotation: [0, Math.PI / 4 - 0.3, 0], scale: 0.22 },
    female: { position: [-0.081, -1.79, -0.1], rotation: [0.9, Math.PI / 4 - 0.3, -0.4], scale: 0.20 }
  };
  const cfg = shoesConfig[gender] || shoesConfig.male;

  return (
    <group position={cfg.position} rotation={cfg.rotation} scale={cfg.scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function Model({ gender, onShowConfirmation, showNeckAccessory, showShoesAccessory }) {
  const groupRef = useRef();
  const base = import.meta.env.BASE_URL || '/';
  const gltfPath = gender === 'male'
    ? `${base}avatars/man_muscle_human_body.glb`
    : `${base}avatars/female_muscle_human_body.glb`;
  const gltf = useLoader(GLTFLoader, gltfPath);

  const cfg = avatarConfig[gender] || avatarConfig.male;

  return (
    <group ref={groupRef}>
      {/* Apply gender-specific transform */}
      <primitive
        object={gltf.scene}
        scale={cfg.scale}
        position={cfg.position}
        rotation={cfg.rotation}
      />
      {pointsData[gender].map(point => (
        <InteractivePoint
          key={point.id}
          position={point.position}
          label={point.label}
          onShowConfirmation={onShowConfirmation}
        />
      ))}
      {showNeckAccessory && <NeckAccessory gender={gender} />}
      {showShoesAccessory && <ShoesAccessory gender={gender} />}
    </group>
  );
}

function AvatarViewer({ gender, onNavigate, onShowConfirmation, showNeckAccessory = false, showShoesAccessory = false }) {
  return (
    <>
      <Suspense fallback={null}>
        <Model
          gender={gender}
          onShowConfirmation={onShowConfirmation}
          showNeckAccessory={showNeckAccessory}
          showShoesAccessory={showShoesAccessory}
        />
      </Suspense>
      <OrbitControls
        minDistance={1}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </>
  );
}

export default AvatarViewer;