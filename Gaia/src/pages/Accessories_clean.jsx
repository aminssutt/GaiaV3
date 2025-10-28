import React, { useEffect, useState } from 'react'
import './Accessories.css'
import { accessories } from '../data/accessories'

// Import emoji image for view wishlist button
import coeurEmoji from '../../images/emojis/coeur.png';

function Accessories({ onNavigate }) {
  const [items, setItems] = useState(accessories)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState('left') // 'left' | 'right'
  const [paused, setPaused] = useState(false)
  const pageSize = 4
  const visible = items.slice(0, pageSize)
  const nextItem = items[pageSize]
  const prevItem = items[items.length - 1]

  const rotateLeftCommit = () => setItems((arr) => arr.slice(1).concat(arr[0]))
  const rotateRightCommit = () => setItems((arr) => [arr[arr.length - 1]].concat(arr.slice(0, arr.length - 1)))

  const rotateLeft = () => {
    if (sliding) return
    setDirection('left')
    setSliding(true)
  }

  const rotateRight = () => {
    if (sliding) return
    setDirection('right')
    setSliding(true)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => rotateLeft(), 5000)
    return () => clearInterval(t)
  }, [paused])
  
  const handleOpenDetail = (id) => onNavigate('accessoryDetail', { accessoryId: id })

  return (
    <div className="accessories-page fade-in">
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('main')}>
          ← Back
        </button>
        <h1>Accessories</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-view-wishlist" onClick={() => onNavigate('wishlist')}>
            <span className="btn-icon">
              <img src={coeurEmoji} alt="View Wishlist" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
            </span>
            <span className="btn-text">View Wishlist</span>
          </button>
        </div>
      </div>

      <div className="exercises-content" style={{ alignItems: 'center' }}>
        <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <button className="carousel-btn left" onClick={rotateRight} aria-label="Previous">◀</button>
          <div className="carousel-viewport">
            <div
              className={`carousel-page ${sliding ? (direction === 'left' ? 'sliding-left' : 'sliding-right') : ''}`}
              onTransitionEnd={() => {
                if (!sliding) return
                if (direction === 'left') rotateLeftCommit(); else rotateRightCommit();
                // reset after commit to remove transform jump
                setSliding(false)
              }}
            >
              {direction === 'right' && (
                <div className="carousel-item">
                  <div className="exercise-card" onClick={() => handleOpenDetail(prevItem.id)}>
                    <div className="exercise-icon">
                      <img className="accessory-card-img" src={prevItem.image} alt={prevItem.name} />
                    </div>
                    <h3>{prevItem.name}</h3>
                    <p>{prevItem.price} · {prevItem.description}</p>
                  </div>
                </div>
              )}
              {visible.map((acc) => (
                <div className="carousel-item" key={acc.id}>
                  <div className="exercise-card" onClick={() => handleOpenDetail(acc.id)}>
                    <div className="exercise-icon">
                      <img className="accessory-card-img" src={acc.image} alt={acc.name} />
                    </div>
                    <h3>{acc.name}</h3>
                    <p>{acc.price} · {acc.description}</p>
                  </div>
                </div>
              ))}
              {direction === 'left' && nextItem && (
                <div className="carousel-item">
                  <div className="exercise-card" onClick={() => handleOpenDetail(nextItem.id)}>
                    <div className="exercise-icon">
                      <img className="accessory-card-img" src={nextItem.image} alt={nextItem.name} />
                    </div>
                    <h3>{nextItem.name}</h3>
                    <p>{nextItem.price} · {nextItem.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button className="carousel-btn right" onClick={rotateLeft} aria-label="Next">▶</button>
        </div>
      </div>
    </div>
  )
}

export default Accessories