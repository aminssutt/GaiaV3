import React from 'react'
import './HistoryPopup.css'

function HistoryPopup({ onClose }) {
  const recommendations = [
    { id: 1, date: '2024-01-15', message: 'High heart rate detected. Do breathing exercises.', category: 'Breathing' },
    { id: 2, date: '2024-01-14', message: 'High blood pressure. Practice relaxing stretches.', category: 'Stretching' },
    { id: 3, date: '2024-01-13', message: 'High fatigue level. Do relaxation exercises.', category: 'Relaxation' },
    { id: 4, date: '2024-01-12', message: 'Persistent cough. Consult a doctor if necessary.', category: 'Health' },
    { id: 5, date: '2024-01-11', message: 'High ambient noise. Use relaxation techniques.', category: 'Relaxation' }
  ]

  return (
    <div className="history-overlay">
      <div className="history-content fade-in">
        <div className="history-header">
          <h3>❤️ Recommendation History</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="history-body">
          <div className="history-stats">
            <div className="stat-card">
              <span className="stat-number">{recommendations.length}</span>
              <span className="stat-label">Recommendations</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">3</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">7</span>
              <span className="stat-label">Active Days</span>
            </div>
          </div>
          
          <div className="recommendations-list">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-item">
                <div className="rec-header">
                  <span className="rec-date">{rec.date}</span>
                  <span className={`rec-category ${rec.category.toLowerCase()}`}>
                    {rec.category}
                  </span>
                </div>
                <p className="rec-message">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-actions">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-btn primary">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryPopup

