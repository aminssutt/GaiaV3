import React, { useState, useEffect } from 'react';
import { getUserInfo, formatUserInfo } from '../utils/userDataUtils';
import UserInfoPopup from '../components/UserInfoPopup';
import { saveUserInfo } from '../utils/userDataUtils';
import './AIRecommendations.css';

function AIRecommendations({ onNavigate, healthHistory = [], onGenderChange }) {
  const [userInfo, setUserInfo] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthAverages, setHealthAverages] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    // Load user info
    const info = getUserInfo();
    setUserInfo(info);

    // Calculate averages from health history
    if (healthHistory && healthHistory.length > 0) {
      const averages = calculateAverages(healthHistory);
      setHealthAverages(averages);
    }
  }, [healthHistory]);

  const calculateAverages = (data) => {
    if (!data || data.length === 0) return null;

    const totals = data.reduce((acc, curr) => ({
      steps: acc.steps + (curr.steps || 0),
      calories: acc.calories + (curr.calories || 0),
      distance: acc.distance + (curr.distance || 0),
      sleepDuration: acc.sleepDuration + (curr.sleepDuration || 0),
      heartBeat: acc.heartBeat + (curr.heartBeat || 0),
    }), { steps: 0, calories: 0, distance: 0, sleepDuration: 0, heartBeat: 0 });

    const count = data.length;
    return {
      steps: Math.round(totals.steps / count),
      calories: Math.round(totals.calories / count),
      distance: (totals.distance / count).toFixed(2),
      sleepDuration: (totals.sleepDuration / count).toFixed(1),
      heartBeat: Math.round(totals.heartBeat / count),
    };
  };

  const generateRecommendations = async () => {
    if (!healthAverages) {
      setError('No health data available. Please sync your Google Fit data first in Connect Device.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for AI with Google Fit data
      const requestData = {
        personal: {
          age: userInfo?.age,
          height: userInfo?.height,
          weight: userInfo?.weight,
          gender: userInfo?.gender || 'male',
        },
        healthAverages: healthAverages,
        googleFitData: {
          steps: healthAverages.steps,
          calories: healthAverages.calories,
          distance: healthAverages.distance,
          sleepDuration: healthAverages.sleepDuration,
          heartRate: healthAverages.heartBeat,
        }
      };

      // Try to call the real backend API
      try {
        const response = await fetch('http://localhost:5000/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const data = await response.json();
          // Parse the AI response into categories
          const parsedRecommendations = parseAIRecommendations(data.recommendations);
          setRecommendations(parsedRecommendations);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        console.log('Backend not available, using simulated recommendations');
        // Fallback to mock recommendations if backend is not running
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockRecommendations = generateMockRecommendations(userInfo, healthAverages);
        setRecommendations(mockRecommendations);
      }
      
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseAIRecommendations = (aiText) => {
    // Parse AI response text into structured categories
    const recommendations = {
      health: [],
      fitness: [],
      lifestyle: [],
    };

    // Split by sections (looking for headers)
    const sections = aiText.split(/\*\*|\d\.\s*/).filter(s => s.trim());
    
    let currentCategory = null;
    
    sections.forEach(section => {
      const lower = section.toLowerCase();
      if (lower.includes('health recommendation')) {
        currentCategory = 'health';
      } else if (lower.includes('fitness recommendation')) {
        currentCategory = 'fitness';
      } else if (lower.includes('lifestyle recommendation')) {
        currentCategory = 'lifestyle';
      } else if (currentCategory) {
        // Extract bullet points
        const bullets = section.split(/\n[-*•]/).map(b => b.trim()).filter(b => b.length > 10);
        recommendations[currentCategory].push(...bullets);
      }
    });

    // Fallback: if parsing failed, split by lines and distribute
    if (recommendations.health.length === 0 && recommendations.fitness.length === 0 && recommendations.lifestyle.length === 0) {
      const lines = aiText.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.includes('**'));
      const third = Math.ceil(lines.length / 3);
      recommendations.health = lines.slice(0, third);
      recommendations.fitness = lines.slice(third, third * 2);
      recommendations.lifestyle = lines.slice(third * 2);
    }

    return recommendations;
  };

  const generateMockRecommendations = (user, health) => {
    const recommendations = {
      health: [],
      fitness: [],
      lifestyle: [],
    };

    const gender = user.gender || 'male';
    const isFemale = gender === 'female';

    // Health recommendations based on metrics (MAX 3-4)
    if (health.heartBeat > 85) {
      recommendations.health.push('Heart rate elevated. Practice breathing exercises daily.');
    } else if (health.heartBeat < 60) {
      recommendations.health.push('Low resting heart rate. Monitor if feeling dizzy.');
    } else {
      recommendations.health.push('Heart rate is healthy. Keep up good habits.');
    }

    if (health.tension > 125) {
      recommendations.health.push('Blood pressure high. Reduce sodium and increase activity.');
    } else {
      recommendations.health.push('Blood pressure normal. Maintain balanced diet.');
    }

    if (health.fatigue > 60) {
      recommendations.health.push('High fatigue detected. Prioritize 7-9 hours sleep nightly.');
    } else if (isFemale) {
      recommendations.health.push('Consider iron-rich foods for energy and wellness.');
    }

    // Limit to 3 items
    recommendations.health = recommendations.health.slice(0, 3);

    // Fitness recommendations based on age, BMI and gender (MAX 3-4)
    const bmi = user.weight / Math.pow(user.height / 100, 2);
    
    if (bmi < 18.5) {
      recommendations.fitness.push('BMI low. Focus on strength training and nutrition.');
    } else if (bmi > 25) {
      recommendations.fitness.push('Consider 150 min/week moderate cardio for weight management.');
    } else {
      recommendations.fitness.push('BMI healthy. Mix cardio and strength training weekly.');
    }

    if (user.age > 50) {
      recommendations.fitness.push(isFemale ? 
        'Low-impact exercises like Pilates to maintain bone density.' : 
        'Focus on low-impact activities like swimming or cycling.');
    } else if (user.age < 30) {
      recommendations.fitness.push(isFemale ? 
        'Mix strength training with cardio for balanced fitness.' : 
        'Try high-intensity interval training for peak fitness.');
    } else {
      recommendations.fitness.push(isFemale ? 
        'Combine resistance training with 30-min cardio sessions.' : 
        'Mix moderate and vigorous exercise for optimal health.');
    }

    recommendations.fitness.push(isFemale ? 
      'Include pelvic floor exercises in your routine.' : 
      'Include flexibility exercises 2-3 times per week.');

    // Limit to 3 items
    recommendations.fitness = recommendations.fitness.slice(0, 3);

    // General lifestyle recommendations (MAX 3-4)
    recommendations.lifestyle.push('Drink 8 glasses of water daily for hydration.');
    
    if (health.fatigue < 40) {
      recommendations.lifestyle.push('Good energy levels. Challenge yourself with new activities.');
    } else {
      recommendations.lifestyle.push('Practice 10 minutes daily meditation to reduce stress.');
    }

    if (health.ambiance > 70) {
      recommendations.lifestyle.push('High noise exposure. Use noise-cancelling headphones.');
    } else {
      recommendations.lifestyle.push('Maintain consistent sleep schedule for better recovery.');
    }

    // Limit to 3 items
    recommendations.lifestyle = recommendations.lifestyle.slice(0, 3);

    return recommendations;
  };

  const formattedUserInfo = userInfo ? formatUserInfo(userInfo) : null;

  return (
    <div className="ai-recommendations-page fade-in">
      <div className="ai-header">
        <button className="back-btn" onClick={() => onNavigate('health')}>
          ← Back to Health Check
        </button>
        <h1>🤖 AI Recommendations</h1>
        <p className="ai-subtitle">Personalized health insights powered by AI</p>
      </div>

      <div className="ai-content">
        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <h2>Your Profile</h2>
            <button className="edit-profile-btn" onClick={() => setShowEditPopup(true)}>
              ✏️ Edit Profile
            </button>
          </div>
          {userInfo ? (
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Gender</span>
                <span className="stat-value">{formattedUserInfo.gender}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Age</span>
                <span className="stat-value">{formattedUserInfo.age}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Height</span>
                <span className="stat-value">{formattedUserInfo.height}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Weight</span>
                <span className="stat-value">{formattedUserInfo.weight}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">BMI</span>
                <span className="stat-value">{formattedUserInfo.bmi} ({formattedUserInfo.bmiCategory})</span>
              </div>
            </div>
          ) : (
            <p className="no-data">No personal information available. Please complete your profile in the Exercises section.</p>
          )}
        </div>

        {/* Health Averages Card */}
        <div className="averages-card">
          <h2>Health Data Averages</h2>
          {healthAverages ? (
            <div className="averages-grid">
              <div className="avg-item">
                <span className="avg-icon">❤️</span>
                <span className="avg-label">Heart Rate</span>
                <span className="avg-value">{healthAverages.heartBeat} bpm</span>
              </div>
              <div className="avg-item">
                <span className="avg-icon">🩺</span>
                <span className="avg-label">Blood Pressure</span>
                <span className="avg-value">{healthAverages.tension} mmHg</span>
              </div>
              <div className="avg-item">
                <span className="avg-icon">🌡️</span>
                <span className="avg-label">Temperature</span>
                <span className="avg-value">{healthAverages.temperature} °C</span>
              </div>
              <div className="avg-item">
                <span className="avg-icon">😮‍💨</span>
                <span className="avg-label">Fatigue</span>
                <span className="avg-value">{healthAverages.fatigue}%</span>
              </div>
              <div className="avg-item">
                <span className="avg-icon">🤧</span>
                <span className="avg-label">Cough</span>
                <span className="avg-value">{healthAverages.cough}%</span>
              </div>
              <div className="avg-item">
                <span className="avg-icon">🔊</span>
                <span className="avg-label">Ambient Noise</span>
                <span className="avg-value">{healthAverages.ambiance} dB</span>
              </div>
            </div>
          ) : (
            <p className="no-data">No health data available. Run "Test Data" in Health Check to collect metrics.</p>
          )}
        </div>

        {/* Generate Button */}
        <div className="generate-section">
          <button 
            className="generate-btn"
            onClick={generateRecommendations}
            disabled={loading || !userInfo || !healthAverages}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing your data...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate AI Recommendations
              </>
            )}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Recommendations Display */}
        {recommendations && (
          <div className="recommendations-container">
            <div className="recommendations-section">
              <h2>🏥 Health Recommendations</h2>
              <ul className="recommendations-list">
                {recommendations.health.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="recommendations-section">
              <h2>💪 Fitness Recommendations</h2>
              <ul className="recommendations-list">
                {recommendations.fitness.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="recommendations-section">
              <h2>🌟 Lifestyle Recommendations</h2>
              <ul className="recommendations-list">
                {recommendations.lifestyle.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Popup */}
      {showEditPopup && (
        <UserInfoPopup
          isVisible={showEditPopup}
          onClose={() => setShowEditPopup(false)}
          onConfirm={(updatedInfo) => {
            saveUserInfo(updatedInfo);
            setUserInfo(updatedInfo);
            setShowEditPopup(false);
            // Clear recommendations to force regeneration with new data
            setRecommendations(null);
          }}
          onGenderChange={onGenderChange}
        />
      )}
    </div>
  );
}

export default AIRecommendations;

