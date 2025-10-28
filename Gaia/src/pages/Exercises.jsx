import React, { useEffect, useState, useRef } from 'react';
import './Exercises.css';
import UserInfoPopup from '../components/UserInfoPopup';
import { hasUserInfo, saveUserInfo } from '../utils/userDataUtils';

// Import emoji images
import neckEmoji from '../../images/emojis/neck.png';
import backEmoji from '../../images/emojis/back.png';
import legsEmoji from '../../images/emojis/legs.png';
import wristEmoji from '../../images/emojis/wrist.png';
import shouldersEmoji from '../../images/emojis/shoulders.png';
import armEmoji from '../../images/emojis/arm.png';
import breathingEmoji from '../../images/emojis/breathing.png';

function Exercises({ onNavigate, onGenderChange }) {
  const categories = [
    { id: 'neck', name: 'Neck', icon: neckEmoji, description: 'Stretches and exercises for neck pain and stiffness.' },
    { id: 'back', name: 'Back', icon: backEmoji, description: 'Strengthen your back and improve your posture.' },
    { id: 'legs', name: 'Legs', icon: legsEmoji, description: 'Workouts for stronger and more flexible legs.' },
    { id: 'wrists', name: 'Wrists', icon: wristEmoji, description: 'Improve mobility and prevent wrist injuries.' },
    { id: 'shoulders', name: 'Shoulders', icon: shouldersEmoji, description: 'Exercises for shoulder mobility and strength.' },
    { id: 'arms', name: 'Arms', icon: armEmoji, description: 'Tone and strengthen your arms.' },
    { id: 'breathing', name: 'Breathing', icon: breathingEmoji, description: 'Techniques for relaxation and better breathing.' }
  ];

  const [items, setItems] = useState(categories)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState('left') // 'left' | 'right'
  const [paused, setPaused] = useState(false)
  const [showUserInfoPopup, setShowUserInfoPopup] = useState(false)
  const pageSize = 4

  // Check if user info exists in localStorage on mount
  useEffect(() => {
    if (!hasUserInfo()) {
      // Show popup if no user info exists
      setShowUserInfoPopup(true);
    }
  }, []);

  const handleUserInfoConfirm = (userInfo) => {
    // Save user info using utility function
    saveUserInfo(userInfo);
    console.log('User info saved:', userInfo);
  };
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

  // Drag to rotate (horizontal) like avatar orbit
  const viewportRef = useRef(null)
  const dragRef = useRef({ dragging:false, startX:0, moved:false })
  const threshold = 40
  const onPointerDown = (e) => {
    dragRef.current.dragging = true
    dragRef.current.startX = e.clientX
    dragRef.current.moved = false
    setPaused(true)
  }
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > threshold && !sliding) {
      if (dx < 0) rotateLeft(); else rotateRight();
      dragRef.current.moved = true
      dragRef.current.startX = e.clientX
    }
  }
  const endDrag = () => {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    setTimeout(()=> setPaused(false), 250)
  }
  const suppressClickIfDragged = (e) => {
    if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); dragRef.current.moved = false }
  }

  const handleCategoryClick = (categoryId) => {
    onNavigate('exerciseDetail', { exerciseId: categoryId });
  };

  return (
    <>
      {showUserInfoPopup && (
        <UserInfoPopup
          isVisible={showUserInfoPopup}
          onClose={() => setShowUserInfoPopup(false)}
          onConfirm={handleUserInfoConfirm}
          onGenderChange={onGenderChange}
        />
      )}
      
      <div className="exercises-page fade-in">
        <div className="exercises-header">
          <button className="back-btn" onClick={() => onNavigate('main')}>
            ← Back
          </button>
          <h1>Exercises & Stretching</h1>
        </div>

      <div className="exercises-content" style={{ alignItems: 'center' }}>
        <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <button className="carousel-btn left" onClick={rotateRight} aria-label="Previous">◀</button>
          <div
            className="carousel-viewport"
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={endDrag}
            onPointerUp={endDrag}
            onClickCapture={suppressClickIfDragged}
          >
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
                  <div className="exercise-card" onClick={() => handleCategoryClick(prevItem.id)}>
                    <div className="exercise-icon">
                      <img src={prevItem.icon} alt={prevItem.name} style={{width: '5.5rem', height: '5.5rem', objectFit: 'contain'}} />
                    </div>
                    <h3>{prevItem.name}</h3>
                    <p>{prevItem.description}</p>
                  </div>
                </div>
              )}
              {visible.map((category) => (
                <div className="carousel-item" key={category.id}>
                  <div className="exercise-card" onClick={() => handleCategoryClick(category.id)}>
                    <div className="exercise-icon">
                      <img src={category.icon} alt={category.name} style={{width: '5.5rem', height: '5.5rem', objectFit: 'contain'}} />
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
              ))}
              {direction === 'left' && nextItem && (
                <div className="carousel-item">
                  <div className="exercise-card" onClick={() => handleCategoryClick(nextItem.id)}>
                    <div className="exercise-icon">
                      <img src={nextItem.icon} alt={nextItem.name} style={{width: '5.5rem', height: '5.5rem', objectFit: 'contain'}} />
                    </div>
                    <h3>{nextItem.name}</h3>
                    <p>{nextItem.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button className="carousel-btn right" onClick={rotateLeft} aria-label="Next">▶</button>
        </div>
      </div>
    </div>
    </>
  );
}

export default Exercises;