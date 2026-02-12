import React from 'react';
import { Canvas } from '@react-three/fiber';
import AvatarViewer from '../components/AvatarViewer';
import '../pages/Accessories.css';

// Simple page to show the neck accessory on the avatar (male only for now)
export default function NeckAvatarPreview({ onNavigate, gender = 'male' }) {
  return (
    <div className="accessories-page fade-in" style={{ paddingTop: '20px' }}>
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('neckPreview')}>← Back</button>
        <h1>Neck Massage On Avatar</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Canvas style={{ width: '650px', height: '520px', background: 'transparent' }} gl={{ alpha: true }} camera={{ position: [2.2, 1.2, 4.2], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[8, 10, 5]} intensity={1} />
          <directionalLight position={[-8, -6, -4]} intensity={0.35} />
          <AvatarViewer gender={gender} showNeckAccessory />
        </Canvas>
      </div>
    </div>
  );
}

