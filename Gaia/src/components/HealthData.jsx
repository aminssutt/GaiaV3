import React from 'react'
import './HealthData.css'

function HealthData({ title, value, unit, status }) {
  return (
    <div className={`health-data-card ${status}`}>
      <div className="health-data-header">
        <h3>{title}</h3>
        <div className={`status-indicator ${status}`}></div>
      </div>
      <div className="health-data-value">
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      <div className="health-data-bar">
        <div 
          className={`health-data-progress ${status}`}
          style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}

export default HealthData

