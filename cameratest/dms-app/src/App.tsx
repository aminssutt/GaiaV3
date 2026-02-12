import { useEffect, useState } from 'react'
import './App.css'

// DMS Server URL - uses 10.0.2.2 for Android emulator, localhost for web
// For real device with adb reverse: localhost:5000 works
// For real device without adb reverse: use actual PC IP
const getServerUrl = () => {
  // Check if running on Android
  const userAgent = navigator.userAgent.toLowerCase()
  const isAndroid = userAgent.includes('android')
  
  // For Android with adb reverse tcp:5000 tcp:5000, localhost works
  // Otherwise use actual IP address
  if (isAndroid) {
    // Try localhost first (works with adb reverse)
    return 'http://localhost:5000'
  }
  return 'http://localhost:5000'
}

const DMS_SERVER = getServerUrl()

interface DMSMetrics {
  eyes_open: boolean
  ear: number
  blinks_total: number
  blinks_per_min: number
  perclos: number
  pitch: number
  yaw: number
  roll: number
  drowsy_alert: boolean
  face_detected: boolean
}

function App() {
  const [metrics, setMetrics] = useState<DMSMetrics | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${DMS_SERVER}/metrics`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        })
        const data = await response.json()
        setMetrics(data)
        setConnected(true)
      } catch {
        setConnected(false)
      }
    }

    const interval = setInterval(fetchMetrics, 200)
    return () => clearInterval(interval)
  }, [])

  const getAlertClass = () => {
    if (!metrics) return ''
    if (metrics.drowsy_alert) return 'alert-drowsy'
    return ''
  }

  return (
    <div className={`app ${getAlertClass()}`}>
      {/* Header */}
      <div className="header">
        <h1>🚗 DMS Monitor</h1>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● Connected' : '○ Disconnected'}
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Video feed */}
        <div className="video-container">
          <img 
            src={`${DMS_SERVER}/video_feed?t=${Date.now()}`} 
            alt="DMS Camera Feed"
            className="video-feed"
            onError={(e) => {
              // Retry loading the image on error
              setTimeout(() => {
                const img = e.target as HTMLImageElement
                img.src = `${DMS_SERVER}/video_feed?t=${Date.now()}`
              }, 1000)
            }}
          />
        </div>

        {/* Metrics panel */}
        <div className="metrics-panel">
          {/* Eyes status */}
          <div className="metric-card">
            <h3>👁️ Eyes</h3>
            <div className="eyes-status">
              <div className={`eye ${metrics?.eyes_open ? 'open' : 'closed'}`}>
                {metrics?.eyes_open ? 'OPEN' : 'CLOSED'}
              </div>
            </div>
            <div className="ear-value">
              EAR: {metrics?.ear?.toFixed(2) || '--'}
            </div>
          </div>

          {/* Blinks */}
          <div className="metric-card">
            <h3>😑 Blinks</h3>
            <div className="metric-value">
              {metrics?.blinks_per_min || 0} /min
            </div>
            <div className="blinks-total">
              Total: {metrics?.blinks_total || 0}
            </div>
          </div>

          {/* PERCLOS */}
          <div className="metric-card">
            <h3>😴 PERCLOS</h3>
            <div className={`metric-value ${(metrics?.perclos || 0) > 30 ? 'warning' : ''}`}>
              {(metrics?.perclos || 0).toFixed(1)}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(metrics?.perclos || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Head pose */}
          <div className="metric-card">
            <h3>🗣️ Head Pose</h3>
            <div className="head-pose">
              <div>Pitch: {metrics?.pitch?.toFixed(0) || '--'}°</div>
              <div>Yaw: {metrics?.yaw?.toFixed(0) || '--'}°</div>
              <div>Roll: {metrics?.roll?.toFixed(0) || '--'}°</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="alerts">
            {metrics?.drowsy_alert && (
              <div className="alert drowsy-alert">
                ⚠️ DROWSINESS DETECTED
              </div>
            )}
            {!metrics?.face_detected && (
              <div className="alert no-face-alert">
                ❌ NO FACE DETECTED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
