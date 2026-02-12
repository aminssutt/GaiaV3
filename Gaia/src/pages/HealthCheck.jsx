import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import AvatarViewer from '../components/AvatarViewer'
import HealthData from '../components/HealthData'
import RecommendationPopup from '../components/RecommendationPopup'
import ConfirmationPopup from '../components/ConfirmationPopup'
import DMSCamera from '../components/DMSCamera'
import dmsService from '../services/dmsService'
import './HealthCheck.css'

function HealthCheck({ onNavigate, gender }) {
  const STORAGE_KEYS = {
    data: 'gaia:dataHistory',
    popups: 'gaia:popupHistory',
  }
  const [healthData, setHealthData] = useState({
    heartBeat: 72,
    tension: 120,
    temperature: 36.5,
    fatigue: 30,
    steps: 0,
    sleepDuration: 0,
    weight: null,
    height: null,
    oxygenSaturation: null,
    calories: 0,
    distance: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [recommendation, setRecommendation] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedBodyPart, setSelectedBodyPart] = useState('')
  const [selectedPartId, setSelectedPartId] = useState('')
  const [dataHistory, setDataHistory] = useState([])
  const [popupHistory, setPopupHistory] = useState([])
  
  // DMS States
  const [showDMS, setShowDMS] = useState(false)
  const [dmsAlert, setDmsAlert] = useState(null)
  const [dmsAttentionLevel, setDmsAttentionLevel] = useState(dmsService.getAttentionLevel())
  const [dmsConnected, setDmsConnected] = useState(dmsService.isConnected())

  // Subscribe to DMS events for real-time updates
  useEffect(() => {
    const unsubAttention = dmsService.on('attentionChange', (level) => {
      console.log('[HealthCheck] Attention level changed:', level);
      setDmsAttentionLevel(level);
      
      // Clear alert when back to normal
      if (level === 'normal') {
        setDmsAlert(null);
      }
    });

    const unsubConnection = dmsService.on('connectionChange', (connected) => {
      setDmsConnected(connected);
      if (!connected) {
        setDmsAttentionLevel('unknown');
      }
    });

    const unsubAlert = dmsService.on('alert', (alert) => {
      handleDMSAlert(alert);
    });

    // Sync initial state
    setDmsAttentionLevel(dmsService.getAttentionLevel());
    setDmsConnected(dmsService.isConnected());

    return () => {
      unsubAttention();
      unsubConnection();
      unsubAlert();
    };
  }, []);

  // Load existing histories from sessionStorage
  useEffect(() => {
    try {
      const rawData = sessionStorage.getItem(STORAGE_KEYS.data)
      const rawPopups = sessionStorage.getItem(STORAGE_KEYS.popups)
      if (rawData) setDataHistory(JSON.parse(rawData))
      if (rawPopups) setPopupHistory(JSON.parse(rawPopups))
    } catch (e) {
      console.warn('Failed to load session histories', e)
    }
  }, [])

  // Simulate health data updates (camera-based detection will be added later)
  useEffect(() => {
    // Generate realistic health data with small variations
    const simulateHealthData = () => {
      const newData = {
        heartBeat: Math.floor(68 + Math.random() * 15),
        tension: Math.floor(115 + Math.random() * 15),
        temperature: (36.2 + Math.random() * 0.8).toFixed(1),
        fatigue: Math.floor(20 + Math.random() * 30),
        steps: Math.floor(3000 + Math.random() * 7000),
        sleepDuration: (6 + Math.random() * 2).toFixed(1),
        weight: healthData.weight,
        height: healthData.height,
        oxygenSaturation: Math.floor(95 + Math.random() * 4),
        calories: Math.floor(1500 + Math.random() * 800),
        distance: (2 + Math.random() * 5).toFixed(1)
      }
      
      setHealthData(newData)
      setLastSyncTime(Date.now())
      
      // Save to history
      setDataHistory(prev => {
        const next = [...prev, { t: Date.now(), ...newData }]
        try { sessionStorage.setItem(STORAGE_KEYS.data, JSON.stringify(next)) } catch {}
        return next
      })
      
      checkRecommendations(newData)
    }

    simulateHealthData() // Initial data
    const interval = setInterval(simulateHealthData, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleShowConfirmation = (label) => {
    // Map label to id
    const pointsData = {
      male: [
        { id: 'breathing', label: 'Breathing' },
        { id: 'neck', label: 'Neck' },
        { id: 'shoulders', label: 'Shoulders' },
        { id: 'arms', label: 'Arms' },
        { id: 'wrists', label: 'Wrists' },
        { id: 'back', label: 'Back' },
        { id: 'legs', label: 'Legs' },
      ],
      female: [
        { id: 'breathing', label: 'Breathing' },
        { id: 'neck', label: 'Neck' },
        { id: 'shoulders', label: 'Shoulders' },
        { id: 'arms', label: 'Arms' },
        { id: 'wrists', label: 'Wrists' },
        { id: 'back', label: 'Back' },
        { id: 'legs', label: 'Legs' },
      ],
    };
    
    setSelectedBodyPart(label);
    setSelectedPartId(pointsData[gender].find(point => point.label === label)?.id);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onNavigate('exerciseDetail', { exerciseId: selectedPartId });
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const checkRecommendations = (data) => {
    const recommendations = []
    
    if (data.heartBeat > 90) {
      recommendations.push("Your heart rate is elevated. Do breathing exercises.")
    }
    if (data.tension > 130) {
      recommendations.push("Your blood pressure is high. Practice relaxing stretches.")
    }
    if (data.temperature > 37.2) {
      recommendations.push("High temperature detected. Rest and hydrate.")
    }
    if (data.fatigue > 70) {
      recommendations.push("High stress level detected. Try relaxation exercises.")
    }

    if (recommendations.length > 0) {
      setRecommendation(recommendations[0])
      setShowRecommendation(true)
      setPopupHistory(prev => {
        const next = [...prev, { t: Date.now(), message: recommendations[0] }]
        try { sessionStorage.setItem(STORAGE_KEYS.popups, JSON.stringify(next)) } catch {}
        return next
      })
    }
  }

  // Handle DMS alerts
  const handleDMSAlert = (alert) => {
    setDmsAlert(alert)
    
    // Auto-dismiss warning after 5 seconds
    if (alert.level === 'warning') {
      setTimeout(() => setDmsAlert(null), 5000)
    }
    // Danger alerts auto-dismiss after 10 seconds
    if (alert.level === 'danger') {
      setTimeout(() => setDmsAlert(null), 10000)
    }
    
    // Play sound for danger alerts
    if (alert.level === 'danger' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Wake up! Please stay alert!')
      utterance.rate = 1.2
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className={`health-check fade-in ${dmsAttentionLevel === 'danger' ? 'dms-danger-mode' : dmsAttentionLevel === 'warning' ? 'dms-warning-mode' : ''}`}>
      {/* DMS Fullscreen Alert */}
      {dmsAlert && dmsAlert.level === 'danger' && (
        <div className="dms-fullscreen-alert" onClick={() => {
          setDmsAlert(null);
          dmsService.clearAlerts();
        }}>
          <h1>⚠️ WAKE UP!</h1>
          <p>{dmsAlert.message}</p>
          <span className="tap-dismiss">Tap to dismiss</span>
        </div>
      )}

      <div className="health-header">
        <button className="back-btn" onClick={() => onNavigate('main')}>
          ← Back
        </button>
        <h1>Health Check</h1>
        {/* DMS Status indicator in header - shows real-time state */}
        <div 
          className={`dms-status-indicator ${dmsConnected ? 'connected' : ''} ${dmsAttentionLevel}`}
          onClick={() => setShowDMS(true)}
          style={{ cursor: 'pointer' }}
          title="Click to open DMS Camera"
        >
          <span className="dms-icon">
            {dmsConnected 
              ? (dmsAttentionLevel === 'danger' ? '🔴' : dmsAttentionLevel === 'warning' ? '🟡' : '🟢')
              : '📷'
            }
          </span>
          <span className="dms-label">
            {dmsConnected 
              ? (dmsAttentionLevel === 'danger' ? 'ALERT!' : dmsAttentionLevel === 'warning' ? 'Warning' : 'DMS OK')
              : 'DMS Off'
            }
          </span>
        </div>
      </div>

      <div className="health-content">
        <div className="health-data-left">
          <HealthData 
            title="Heart Rate" 
            value={healthData.heartBeat} 
            unit="bpm" 
            status={healthData.heartBeat > 90 ? 'warning' : 'normal'}
          />
          <HealthData 
            title="Blood Pressure" 
            value={healthData.tension} 
            unit="mmHg" 
            status={healthData.tension > 130 ? 'warning' : 'normal'}
          />
          <HealthData 
            title="Sleep Duration" 
            value={healthData.sleepDuration} 
            unit="hours" 
            status={healthData.sleepDuration < 6 ? 'warning' : 'normal'}
          />
        </div>

            <div className="avatar-container">
              <Canvas
                camera={{ position: [2, 1, 4], fov: 50 }}
                style={{ width: '600px', height: '500px' }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />
                <AvatarViewer
                  gender={gender}
                  onNavigate={onNavigate}
                  onShowConfirmation={handleShowConfirmation}
                />
              </Canvas>
            </div>

            <div className="health-data-right">
              <HealthData 
                title="Daily Steps" 
                value={healthData.steps.toLocaleString()} 
                unit="steps" 
                status={healthData.steps < 5000 ? 'warning' : 'normal'}
              />
              <HealthData 
                title="Calories Burned" 
                value={healthData.calories} 
                unit="kcal" 
                status="normal"
              />
              <HealthData 
                title="Distance" 
                value={healthData.distance} 
                unit="km" 
                status="normal"
              />
            </div>
          </div>

          <div className="health-actions-row">
            <div className="health-button-row">
              <button
                className="test-data-btn"
                onClick={() => onNavigate('history', { data: dataHistory, popups: popupHistory })}
              >
                ❤️ History
              </button>
              <button
                className="test-data-btn ai-recommendations-btn"
                onClick={() => onNavigate('aiRecommendations', { healthHistory: dataHistory })}
                title="Get AI-powered personalized recommendations"
              >
                🤖 AI Recommendations
              </button>
              <button
                className={`test-data-btn dms-btn ${dmsService.isConnected() ? 'dms-active' : ''}`}
                onClick={() => setShowDMS(true)}
                title="Driver Monitoring System - Eye tracking & drowsiness detection"
              >
                📷 DMS Camera
              </button>
            </div>
          </div>

      {/* DMS Camera Modal */}
      {showDMS && (
        <div className="dms-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDMS(false)}>
          <DMSCamera 
            onClose={() => setShowDMS(false)}
            onAlert={handleDMSAlert}
          />
        </div>
      )}

      {/* DMS Warning Toast */}
      {dmsAlert && dmsAlert.level === 'warning' && (
        <div className="dms-toast warning" onClick={() => setDmsAlert(null)}>
          {dmsAlert.message}
        </div>
      )}

      {showRecommendation && (
        <RecommendationPopup 
          message={recommendation}
          onClose={() => setShowRecommendation(false)}
          onGoToExercises={() => {
            setShowRecommendation(false)
            onNavigate('exercises')
          }}
        />
      )}

      {showConfirmation && (
        <ConfirmationPopup
          bodyPart={selectedBodyPart}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default HealthCheck

