import React, { useState, useEffect } from 'react'
import './UserInfoPopup.css'
import { getUserInfo } from '../utils/userDataUtils'

function UserInfoPopup({ isVisible, onClose, onConfirm, onGenderChange }) {
  const [userInfo, setUserInfo] = useState({
    age: '',
    weight: '',
    height: '',
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
          weight: existingInfo.weight || '',
          height: existingInfo.height || '',
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
      newErrors.age = 'Please enter a valid age !'
    }
    
    // Validate weight
    const weight = parseFloat(userInfo.weight)
    if (!userInfo.weight || isNaN(weight) || weight < 20 || weight > 150) {
      newErrors.weight = 'Please enter a valid weight !'
    }
    
    // Validate height
    const height = parseFloat(userInfo.height)
    if (!userInfo.height || isNaN(height) || height < 100 || height > 250) {
      newErrors.height = 'Please enter a valid height !'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validateInputs()) {
      onConfirm({
        age: parseInt(userInfo.age),
        weight: parseFloat(userInfo.weight),
        height: parseFloat(userInfo.height),
        gender: userInfo.gender
      })
      onClose()
    }
  }

  const handleCancel = () => {
    setUserInfo({ age: '', weight: '', height: '', gender: 'male' })
    setErrors({})
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="user-info-overlay">
      <div className="user-info-popup">
        <div className="popup-header">
          <h2>Personal informations</h2>
          <p className="popup-description">
          To better understand and accurately analyze your habits,
          we need some personal information.
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

          <div className="input-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              value={userInfo.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="Ex: 70.5"
              className={errors.weight ? 'error' : ''}
              autoComplete="off"
              inputMode="decimal"
            />
            {errors.weight && <span className="error-message">{errors.weight}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              step="0.1"
              value={userInfo.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder="Ex: 175.0"
              className={errors.height ? 'error' : ''}
              autoComplete="off"
              inputMode="decimal"
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
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
