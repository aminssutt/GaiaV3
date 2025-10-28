import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import ConfirmationPopup from '../components/ConfirmationPopup';
import './Accessories.css';

// Import emoji for button
import bonhommeEmoji from '../../images/emojis/bonhomme.png';

function ShoesModel() {
  const base = import.meta.env.BASE_URL || '/';
  const gltf = useLoader(GLTFLoader, `${base}avatars/shoesmassage.glb`);
  return <primitive object={gltf.scene} scale={2.5} position={[0, -0.6, 0]} />;
}

export default function ShoesPreview({ onNavigate }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePreviewOnAvatar = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    onNavigate('shoesAvatarPreview');
  };

  return (
    <div className="accessories-page fade-in" style={{ paddingTop: '20px' }}>
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('accessories')}>← Back</button>
        <h1>Shoes Massage Preview</h1>
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
            <ShoesModel />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2} maxDistance={12} enableDamping target={[0, -0.2, 0]} />
          <Environment preset="studio" />
        </Canvas>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button className="btn-preview-3d" onClick={handlePreviewOnAvatar}>
          <span className="btn-icon">
            <img src={bonhommeEmoji} alt="Avatar Preview" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
          </span>
          <span className="btn-text">Preview on Avatar</span>
        </button>
      </div>

      {showConfirm && (
        <ConfirmationPopup
          bodyPart="shoes"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
