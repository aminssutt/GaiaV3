import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import './Accessories.css';

function ScentModel() {
  const base = import.meta.env.BASE_URL || '/';
  const gltf = useLoader(GLTFLoader, `${base}avatars/scent.glb`);
  return <primitive object={gltf.scene} scale={2.5} position={[0, -0.6, 0]} />;
}

export default function ScentPreview({ onNavigate }) {
  return (
    <div className="accessories-page fade-in" style={{ paddingTop: '20px' }}>
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('accessories')}>← Back</button>
        <h1>Scent Diffuser Preview</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <Canvas style={{ width: '600px', height: '500px', background: 'transparent' }} gl={{ alpha: true }} camera={{ position: [5, 4, 12], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={0.4} />
          <Suspense fallback={
            <mesh>
              <ambientLight intensity={0.5} />
              <directionalLight position={[2,2,2]} />
            </mesh>
          }>
            <ScentModel />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2} maxDistance={12} enableDamping target={[0, -0.2, 0]} />
          <Environment preset="studio" />
        </Canvas>
      </div>
    </div>
  );
}
