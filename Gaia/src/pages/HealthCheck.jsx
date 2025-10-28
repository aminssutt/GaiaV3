import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import AvatarViewer from '../components/AvatarViewer'
import HealthData from '../components/HealthData'
import RecommendationPopup from '../components/RecommendationPopup'
import ConfirmationPopup from '../components/ConfirmationPopup'
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
    cough: 5,
    ambiance: 45
  })
  const [isTesting, setIsTesting] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [recommendation, setRecommendation] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedBodyPart, setSelectedBodyPart] = useState('')
  const [selectedPartId, setSelectedPartId] = useState('')
  const [dataHistory, setDataHistory] = useState([]) // { t, heartBeat, tension, temperature, fatigue, cough, ambiance }
  const [popupHistory, setPopupHistory] = useState([]) // { t, message }

  // Load existing histories from sessionStorage so they persist across navigation
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

  const generateRandomData = () => {
    const newData = {
      heartBeat: Math.floor(Math.random() * 40) + 60, // 60-100
      tension: Math.floor(Math.random() * 40) + 100, // 100-140
      temperature: (Math.random() * 2 + 35.5).toFixed(1), // 35.5-37.5
      fatigue: Math.floor(Math.random() * 100), // 0-100
      cough: Math.floor(Math.random() * 100), // 0-100
      ambiance: Math.floor(Math.random() * 100) // 0-100
    }
    setHealthData(newData)
    setDataHistory(prev => {
      const next = [...prev, { t: Date.now(), ...newData }]
      try { sessionStorage.setItem(STORAGE_KEYS.data, JSON.stringify(next)) } catch {}
      return next
    })
    checkRecommendations(newData)
  }

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
      recommendations.push("High fatigue level. Do relaxation exercises.")
    }
    if (data.cough > 60) {
      recommendations.push("Persistent cough detected. Consult a doctor if necessary.")
    }
    if (data.ambiance > 80) {
      recommendations.push("High ambient noise. Use relaxation techniques.")
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

  const startTest = () => {
    setIsTesting(true)
    let count = 0
    const interval = setInterval(() => {
      generateRandomData()
      count++
      if (count >= 10) {
        clearInterval(interval)
        setIsTesting(false)
      }
    }, 1000)
  }

  return (
    <div className="health-check fade-in">
      <div className="health-header">
        <button className="back-btn" onClick={() => onNavigate('main')}>
          ← Back
        </button>
        <h1>Health Check</h1>
      </div>

      <div className="health-content">
        <div className="health-data-left">
          <HealthData 
            title="Heart Beat" 
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
            title="Temperature" 
            value={healthData.temperature} 
            unit="°C" 
            status={healthData.temperature > 37.2 ? 'warning' : 'normal'}
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
            title="Fatigue" 
            value={healthData.fatigue} 
            unit="%" 
            status={healthData.fatigue > 70 ? 'warning' : 'normal'}
          />
          <HealthData 
            title="Cough" 
            value={healthData.cough} 
            unit="%" 
            status={healthData.cough > 60 ? 'warning' : 'normal'}
          />
          <HealthData 
            title="Ambient Noise" 
            value={healthData.ambiance} 
            unit="dB" 
            status={healthData.ambiance > 80 ? 'warning' : 'normal'}
          />
        </div>
      </div>

      <div className="health-actions-row">
        <div className="health-button-row">
          <button
            className={`test-data-btn ${isTesting ? 'testing' : ''}`}
            onClick={startTest}
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test Data'}
          </button>
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
        </div>
      </div>

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
