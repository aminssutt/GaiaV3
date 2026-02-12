import React, { useState, useEffect } from 'react';
import './ConnectDevice.css';

export default function ConnectDevice({ onNavigate }) {
  const [pairingCode, setPairingCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    // Check if we already have a pairing code stored
    let code = localStorage.getItem('gaia:pairingCode');
    
    // If not, generate a new one
    if (!code) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('gaia:pairingCode', code);
    }
    
    setPairingCode(code);
    
    // Check if already connected locally
    const userId = localStorage.getItem('gaia:connectedUserId');
    if (userId) {
      setIsConnected(true);
      setConnectedDevice({ userId, deviceType: 'Android' });
    }
    
    // Poll backend to check if mobile connected
    const checkPairing = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/check-pairing?pairingCode=${code}`);
        const data = await response.json();
        
        if (data.success && data.connected && data.userId) {
          // Mobile has connected!
          localStorage.setItem('gaia:connectedUserId', data.userId);
          setIsConnected(true);
          setConnectedDevice({ userId: data.userId, deviceType: 'Android' });
        }
      } catch (error) {
        console.log('Waiting for mobile connection...');
      }
    };
    
    // Poll every 2 seconds
    const interval = setInterval(checkPairing, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem('gaia:connectedUserId');
    setIsConnected(false);
    setConnectedDevice(null);
    
    // Generate new pairing code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPairingCode(code);
    localStorage.setItem('gaia:pairingCode', code);
  };

  return (
    <div className="connect-device-page fade-in">
      <button className="back-btn" onClick={() => onNavigate('main')}>
        ← Back
      </button>
      <div className="cd-wrapper">
        <h1 className="cd-title">Connect Your Phone</h1>
        <p className="cd-sub">Connect your mobile app to sync health data in real-time.</p>
        
        {!isConnected ? (
          <>
            <div className="pairing-code-section">
              <h2>Pairing Code</h2>
              <div className="pairing-code-display">
                {pairingCode}
              </div>
              <p className="pairing-instructions">
                1. Open GAIA Mobile app on your phone<br/>
                2. Tap "Connect to Dashboard"<br/>
                3. Enter this pairing code<br/>
                4. Health data will sync automatically
              </p>
            </div>

            <div className="qr-code-section">
              <p className="qr-hint">Or scan QR code (coming soon)</p>
              <div className="qr-placeholder">
                <span className="qr-icon">📱</span>
              </div>
            </div>
          </>
        ) : (
          <div className="connected-section">
            <div className="connected-icon">✅</div>
            <h2>Phone Connected</h2>
            <div className="device-info">
              <p><strong>Device:</strong> {connectedDevice.deviceType}</p>
              <p><strong>User ID:</strong> {connectedDevice.userId}</p>
              <p><strong>Status:</strong> <span className="status-active">Active</span></p>
            </div>
            <button className="disconnect-btn" onClick={handleDisconnect}>
              Disconnect Phone
            </button>
            <p className="sync-info">
              Health data is syncing in real-time. Go to Health Check to view your metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

