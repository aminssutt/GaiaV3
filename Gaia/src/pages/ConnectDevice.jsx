import React from 'react';
import './ConnectDevice.css';

export default function ConnectDevice({ onNavigate }) {
  return (
    <div className="connect-device-page fade-in">
      <button className="back-btn" onClick={() => onNavigate('main')}>
        ← Back
      </button>
      <div className="cd-wrapper">
        <h1 className="cd-title">Connect Your Device</h1>
        <p className="cd-sub">Connect your own device to get access to your metrics.</p>
        <div className="cd-buttons">
          <button className="cd-btn apple" disabled>🍎 Apple </button>
          <button className="cd-btn android" disabled>🤖 Android </button>
        </div>
      </div>
    </div>
  );
}
