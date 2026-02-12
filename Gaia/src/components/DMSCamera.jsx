import React, { useState, useEffect, useRef } from 'react';
import dmsService from '../services/dmsService';
import './DMSCamera.css';

function DMSCamera({ onClose, onAlert, isMinimized = false }) {
  const [connected, setConnected] = useState(dmsService.isConnected());
  const [metrics, setMetrics] = useState(dmsService.getMetrics());
  const [serverUrl, setServerUrl] = useState(dmsService.getServerUrl());
  const [showSettings, setShowSettings] = useState(false);
  const [alertLevel, setAlertLevel] = useState(dmsService.getAttentionLevel());
  const [videoKey, setVideoKey] = useState(Date.now()); // Force video reload
  const imgRef = useRef(null);

  useEffect(() => {
    // Subscribe to DMS events
    const unsubMetrics = dmsService.on('metricsUpdate', (data) => {
      setMetrics(data);
    });

    const unsubConnection = dmsService.on('connectionChange', (isConnected) => {
      setConnected(isConnected);
      if (isConnected) {
        // Reload video feed when reconnected
        setVideoKey(Date.now());
      }
    });

    const unsubAttention = dmsService.on('attentionChange', (level) => {
      setAlertLevel(level);
    });

    const unsubAlert = dmsService.on('alert', (alert) => {
      if (onAlert) {
        onAlert(alert);
      }
    });

    // Sync initial state
    setConnected(dmsService.isConnected());
    setMetrics(dmsService.getMetrics());
    setAlertLevel(dmsService.getAttentionLevel());

    return () => {
      unsubMetrics();
      unsubConnection();
      unsubAttention();
      unsubAlert();
    };
  }, [onAlert]);

  const handleUrlChange = (e) => {
    setServerUrl(e.target.value);
  };

  const handleUrlSave = () => {
    dmsService.setServerUrl(serverUrl);
    setShowSettings(false);
    // Refresh connection
    dmsService.checkConnection();
  };

  const handleReset = async () => {
    await dmsService.resetCounters();
  };

  // Minimized view - just small indicator
  if (isMinimized) {
    return (
      <div className={`dms-minimized ${alertLevel}`}>
        <div className="dms-mini-indicator">
          {connected ? (
            <>
              <span className="mini-eye">{metrics?.eyes_open ? '👁️' : '😑'}</span>
              <span className="mini-status">{alertLevel === 'danger' ? '⚠️' : alertLevel === 'warning' ? '⚡' : '✓'}</span>
            </>
          ) : (
            <span className="mini-disconnected">📷❌</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`dms-camera-container ${alertLevel}`}>
      {/* Header */}
      <div className="dms-header">
        <h3>🚗 Driver Monitor</h3>
        <div className="dms-header-actions">
          <button className="dms-btn-icon" onClick={() => setShowSettings(!showSettings)} title="Settings">
            ⚙️
          </button>
          {onClose && (
            <button className="dms-btn-icon" onClick={onClose} title="Close">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="dms-settings">
          <label>Server URL:</label>
          <input 
            type="text" 
            value={serverUrl} 
            onChange={handleUrlChange}
            placeholder="http://localhost:5000 or ngrok URL"
          />
          <button onClick={handleUrlSave}>Save</button>
        </div>
      )}

      {/* Connection status */}
      <div className={`dms-connection ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '● Connected' : '○ Disconnected - Check server'}
      </div>

      {/* Video feed */}
      <div className="dms-video-wrapper">
        {connected ? (
          <img 
            ref={imgRef}
            key={videoKey}
            src={dmsService.getVideoFeedUrl()}
            alt="DMS Camera"
            className="dms-video-feed"
            onLoad={() => {
              console.log('[DMS] Video feed loaded');
            }}
            onError={(e) => {
              console.error('[DMS] Video feed error:', e);
              // Retry after a short delay
              setTimeout(() => {
                setVideoKey(Date.now());
              }, 1000);
            }}
          />
        ) : (
          <div className="dms-no-video">
            <span>📷</span>
            <p>Camera not available</p>
            <p className="dms-hint">Start the DMS server:<br/>
              <code>python web_dms_server.py</code>
            </p>
            <button className="dms-retry-btn" onClick={() => {
              dmsService.checkConnection();
              setVideoKey(Date.now());
            }}>
              🔄 Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Metrics */}
      {connected && metrics && (
        <div className="dms-metrics">
          {/* Eyes status */}
          <div className="dms-metric">
            <span className="metric-label">Eyes</span>
            <span className={`metric-value ${metrics.eyes_open ? 'open' : 'closed'}`}>
              {metrics.eyes_open ? '👁️ OPEN' : '😑 CLOSED'}
            </span>
          </div>

          {/* EAR */}
          <div className="dms-metric">
            <span className="metric-label">EAR</span>
            <span className="metric-value">{metrics.ear?.toFixed(2) || '--'}</span>
          </div>

          {/* Blinks */}
          <div className="dms-metric">
            <span className="metric-label">Blinks</span>
            <span className="metric-value">{metrics.blinks_per_min || 0}/min</span>
          </div>

          {/* PERCLOS */}
          <div className="dms-metric">
            <span className="metric-label">PERCLOS</span>
            <span className={`metric-value ${metrics.perclos > 30 ? 'warning' : ''}`}>
              {metrics.perclos?.toFixed(1) || 0}%
            </span>
            <div className="perclos-bar">
              <div 
                className="perclos-fill" 
                style={{ width: `${Math.min(metrics.perclos || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Head pose */}
          <div className="dms-metric head-pose">
            <span className="metric-label">Head</span>
            <span className="metric-value small">
              P:{metrics.pitch?.toFixed(0)}° Y:{metrics.yaw?.toFixed(0)}° R:{metrics.roll?.toFixed(0)}°
            </span>
          </div>
        </div>
      )}

      {/* Alerts */}
      {metrics?.drowsy_alert && (
        <div className="dms-alert danger">
          ⚠️ DROWSINESS DETECTED - WAKE UP!
        </div>
      )}
      {!metrics?.face_detected && connected && (
        <div className="dms-alert warning">
          ❌ No face detected
        </div>
      )}

      {/* Actions */}
      <div className="dms-actions">
        <button className="dms-btn" onClick={handleReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default DMSCamera;
