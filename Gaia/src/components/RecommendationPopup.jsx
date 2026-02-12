import React from 'react'
import './RecommendationPopup.css'

function RecommendationPopup({ message, onClose, onGoToExercises }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content fade-in">
        <div className="popup-header">
          <h3>💡 Recommendation</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <p>{message}</p>
        </div>
        <div className="popup-actions">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-btn primary" onClick={onGoToExercises}>
            View Exercises
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecommendationPopup

