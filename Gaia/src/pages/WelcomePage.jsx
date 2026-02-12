import React from 'react'
import './WelcomePage.css'
import gaiaLogo from '../../images/logo.png'

function WelcomePage({ onNavigate }) {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <img src={gaiaLogo} alt="GAIA AI" className="welcome-logo" />
        
        <button className="start-btn" onClick={() => onNavigate('main')}>
          START <span className="arrow">→</span>
        </button>
      </div>
    </div>
  )
}

export default WelcomePage

