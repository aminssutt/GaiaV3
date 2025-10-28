import React from 'react'
import './MainPage.css'

// Import emoji images
import exercisesEmoji from '../../images/emojis/bonhomme.png';
import healthEmoji from '../../images/emojis/coeur.png';
import accessoriesEmoji from '../../images/emojis/charriot.png';

function MainPage({ onNavigate, onGenderChange, gender }) {
  return (
    <div className="main-page fade-in">
      <div className="header">
        <h1 className="app-title">GAÏA</h1>
        <p className="app-subtitle">Fitness & Health Companion</p>
      </div>

      <div className="main-options">
        <div className="option-card" onClick={() => onNavigate('exercises')}>
          <div className="option-icon">
            <img src={exercisesEmoji} alt="Exercises" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Exercises & Stretching</h3>
          <p>Workout routines & flexibility</p>
        </div>

        <div className="option-card" onClick={() => onNavigate('health')}>
          <div className="option-icon">
            <img src={healthEmoji} alt="Health Check" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Health Check</h3>
          <p>Monitor your vitals</p>
        </div>

        <div className="option-card" onClick={() => onNavigate('accessories')}>
          <div className="option-icon">
            <img src={accessoriesEmoji} alt="Accessories" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Accessories</h3>
          <p>Enhance your experience</p>
        </div>
      </div>
    </div>
  )
}

export default MainPage
