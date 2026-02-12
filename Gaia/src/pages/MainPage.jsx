import React, { useState, useEffect } from 'react'
import './MainPage.css'
import UserInfoPopup from '../components/UserInfoPopup'
import { FaceIDVerificationModal, FaceIDEnrollmentModal } from '../components/FaceIDModal'
import { saveUserInfo, getUserInfo } from '../utils/userDataUtils'
import faceIDService from '../services/faceIDService'

// Import logo
import gaiaLogo from '../../images/logo.png'

// Import emoji images
import exercisesEmoji from '../../images/emojis/bonhomme.png';
import healthEmoji from '../../images/emojis/coeur.png';
import accessoriesEmoji from '../../images/emojis/charriot.png';

function MainPage({ onNavigate, onGenderChange, gender }) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showFaceIDVerification, setShowFaceIDVerification] = useState(false)
  const [showFaceIDEnrollment, setShowFaceIDEnrollment] = useState(false)
  const [isDriverEnrolled, setIsDriverEnrolled] = useState(false)
  const [driverId, setDriverId] = useState('driver_1')

  // Check if driver is enrolled on mount
  useEffect(() => {
    const checkEnrollment = async () => {
      const enrolled = await faceIDService.isDriverEnrolled(driverId)
      setIsDriverEnrolled(enrolled)
    }
    checkEnrollment()
  }, [driverId])

  const handleProfileConfirm = (userInfo) => {
    saveUserInfo(userInfo)
    if (onGenderChange && userInfo.gender) {
      onGenderChange(userInfo.gender)
    }
  }

  const handleHealthClick = () => {
    if (isDriverEnrolled) {
      // If driver is enrolled, show verification modal
      setShowFaceIDVerification(true)
    } else {
      // If not enrolled, go directly to health (or could prompt enrollment)
      onNavigate('health')
    }
  }

  const handleFaceIDVerified = (result) => {
    setShowFaceIDVerification(false)
    if (result.verified) {
      onNavigate('health')
    }
  }

  const handleEnrollmentComplete = (result) => {
    setShowFaceIDEnrollment(false)
    setIsDriverEnrolled(true)
  }

  return (
    <div className="main-page fade-in">
      {/* Top Bar - Profile + Logo */}
      <div className="top-bar">
        <div className="profile-menu-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="profile-icon">👤</span>
            Profile
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowEditProfile(true)
                  setShowProfileMenu(false)
                }}
              >
                <span>⚙️</span> Edit Profile
              </button>
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowFaceIDEnrollment(true)
                  setShowProfileMenu(false)
                }}
              >
                <span>🔐</span> {isDriverEnrolled ? 'Re-enroll Face' : 'Enroll Face ID'}
              </button>
            </div>
          )}
        </div>

        <div className="header">
          <img src={gaiaLogo} alt="GAIA" className="header-logo" />
        </div>
      </div>

      {/* Main Options */}
      <div className="main-options">
        <div className="option-card" onClick={() => onNavigate('exercises')}>
          <div className="option-icon">
            <img src={exercisesEmoji} alt="Exercises" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Exercises & Stretching</h3>
          <p>Workout routines & flexibility</p>
        </div>

        <div className="option-card" onClick={handleHealthClick}>
          <div className="option-icon">
            <img src={healthEmoji} alt="Health Check" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Health Check</h3>
          <p>Monitor your vitals</p>
          {isDriverEnrolled && (
            <span className="faceid-badge" title="FaceID Required">🔐</span>
          )}
        </div>

        <div className="option-card" onClick={() => onNavigate('accessories')}>
          <div className="option-icon">
            <img src={accessoriesEmoji} alt="Accessories" style={{width: '4.4rem', height: '4.4rem', objectFit: 'contain'}} />
          </div>
          <h3>Accessories</h3>
          <p>Enhance your experience</p>
        </div>
      </div>

      {showEditProfile && (
        <UserInfoPopup
          isVisible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onConfirm={handleProfileConfirm}
          onGenderChange={onGenderChange}
        />
      )}

      {showFaceIDVerification && (
        <FaceIDVerificationModal
          isVisible={showFaceIDVerification}
          onVerified={handleFaceIDVerified}
          onCancel={() => setShowFaceIDVerification(false)}
          driverId={driverId}
        />
      )}

      {showFaceIDEnrollment && (
        <FaceIDEnrollmentModal
          isVisible={showFaceIDEnrollment}
          onComplete={handleEnrollmentComplete}
          onCancel={() => setShowFaceIDEnrollment(false)}
          driverId={driverId}
        />
      )}
    </div>
  )
}

export default MainPage