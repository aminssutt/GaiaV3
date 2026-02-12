import React, { useState, useEffect } from 'react'
import './UserInfoPopup.css'
import { getUserInfo } from '../utils/userDataUtils'

function UserInfoPopup({ isVisible, onClose, onConfirm, onGenderChange }) {
  const [userInfo, setUserInfo] = useState({
    age: '',
    gender: 'male'
  })
  const [errors, setErrors] = useState({})

  // Load existing user info if available (for editing)
  useEffect(() => {
    if (isVisible) {
      const existingInfo = getUserInfo()
      if (existingInfo) {
        setUserInfo({
          age: existingInfo.age || '',
          gender: existingInfo.gender || 'male'
        })
      }
    }
  }, [isVisible])

  const handleGenderChange = (newGender) => {
    setUserInfo(prev => ({ ...prev, gender: newGender }))
    // Change avatar immediately when gender button is clicked
    if (onGenderChange) {
      onGenderChange(newGender)
    }
  }

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    
    // Validate age
    const age = parseInt(userInfo.age)
    if (!userInfo.age || isNaN(age) || age < 1 || age > 120) {
      newErrors.age = 'Please enter a valid age (1-120) !'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validateInputs()) {
      onConfirm({
        age: parseInt(userInfo.age),
        gender: userInfo.gender
      })
      onClose()
    }
  }

  const handleCancel = () => {
    setUserInfo({ age: '', gender: 'male' })
    setErrors({})
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="user-info-overlay">
      <div className="user-info-popup">
        <div className="popup-header">
          <h2>Personal Information</h2>
          <p className="popup-description">
          Please provide your age and gender. Weight and height will be synced automatically from Google Fit.
          </p>
        </div>

        <div className="popup-content">
          {/* Gender Selection */}
          <div className="input-group gender-group">
            <label>Gender</label>
            <div className="gender-selection">
              <button
                type="button"
                className={`gender-btn ${userInfo.gender === 'male' ? 'active' : ''}`}
                onClick={() => handleGenderChange('male')}
              >
                Male
              </button>
              <button
                type="button"
                className={`gender-btn ${userInfo.gender === 'female' ? 'active' : ''}`}
                onClick={() => handleGenderChange('female')}
              >
                Female
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="age">Age (year)</label>
            <input
              id="age"
              type="number"
              value={userInfo.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Ex: 25"
              className={errors.age ? 'error' : ''}
              autoComplete="off"
              inputMode="numeric"
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

        </div>

        <div className="popup-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            Undo
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserInfoPopup


