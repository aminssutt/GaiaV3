import React, { useState, useEffect, useCallback, useRef } from 'react';
import faceIDService from '../services/faceIDService';
import './FaceIDModal.css';

/**
 * FaceID Verification Modal
 * Shows camera feed and verifies driver identity using robust multi-frame verification
 */
function FaceIDVerificationModal({ isVisible, onVerified, onCancel, driverId }) {
  const [status, setStatus] = useState('waiting'); // waiting, analyzing, success, failed
  const [message, setMessage] = useState('Preparing camera...');
  const [similarity, setSimilarity] = useState(0);
  const [confidence, setConfidence] = useState('');
  const [progress, setProgress] = useState(0);
  const [framesAnalyzed, setFramesAnalyzed] = useState(0);
  const [goodFrames, setGoodFrames] = useState(0);
  const verificationRef = useRef(null);

  const handleRobustVerify = useCallback(async () => {
    if (status === 'analyzing') return;
    
    setStatus('analyzing');
    setMessage('Analyzing face... Hold still');
    setProgress(0);
    setFramesAnalyzed(0);
    setGoodFrames(0);
    
    // Start robust verification with progress updates
    const startResult = await faceIDService.startRobustVerification();
    if (startResult.status !== 'started') {
      setStatus('failed');
      setMessage(startResult.message || 'Failed to start verification');
      return;
    }
    
    const totalFrames = startResult.num_frames || 8;
    let complete = false;
    let frameCount = 0;
    const maxAttempts = totalFrames * 2;
    
    // Capture frames with progress
    for (let i = 0; i < maxAttempts && !complete; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const frameResult = await faceIDService.addRobustFrame(driverId);
      
      if (frameResult.status === 'progress') {
        frameCount = frameResult.frames_captured;
        setFramesAnalyzed(frameCount);
        setGoodFrames(frameResult.good_frames);
        setProgress((frameCount / totalFrames) * 100);
        
        if (frameResult.current_similarity > 0) {
          setSimilarity(Math.round(frameResult.current_similarity * 100));
        }
        
        // Update message based on quality
        if (frameResult.frame_result?.quality_issues?.length > 0) {
          const issues = frameResult.frame_result.quality_issues;
          if (issues.includes('blurry')) {
            setMessage('Hold still - image is blurry');
          } else if (issues.includes('too_dark')) {
            setMessage('Move to better lighting');
          } else if (issues.includes('face_too_small')) {
            setMessage('Move closer to the camera');
          } else {
            setMessage('Analyzing face...');
          }
        } else if (frameResult.good_frames > 0) {
          setMessage(`Analyzing... ${frameResult.good_frames} good frames`);
        }
        
        complete = frameResult.is_complete;
      } else if (frameResult.status === 'error') {
        setMessage(frameResult.message || 'No face detected');
      }
    }
    
    setProgress(100);
    setMessage('Computing result...');
    
    // Get final result
    const result = await faceIDService.getRobustResult(driverId);
    
    if (result.status === 'success') {
      setSimilarity(Math.round(result.similarity * 100));
      setConfidence(result.confidence || '');
      setFramesAnalyzed(result.frames_analyzed || 0);
      setGoodFrames(result.good_frames || 0);
      
      if (result.verified) {
        setStatus('success');
        setMessage(result.message || 'Identity verified!');
        
        // Auto-close after success
        setTimeout(() => {
          onVerified(result);
        }, 1500);
      } else {
        setStatus('failed');
        setMessage(result.message || 'Driver not recognized');
      }
    } else {
      setStatus('failed');
      setMessage(result.message || 'Verification failed');
    }
  }, [status, driverId, onVerified]);

  // Auto-start verification when modal opens
  useEffect(() => {
    if (isVisible) {
      setStatus('waiting');
      setProgress(0);
      setSimilarity(0);
      setConfidence('');
      setFramesAnalyzed(0);
      setGoodFrames(0);
      setMessage('Preparing camera...');
      
      // Start verification after a short delay
      const timer = setTimeout(() => {
        handleRobustVerify();
      }, 1000);
      
      verificationRef.current = timer;
      
      return () => {
        clearTimeout(timer);
        faceIDService.cancelRobustVerification();
      };
    }
  }, [isVisible]);

  const handleRetry = () => {
    setStatus('waiting');
    setProgress(0);
    setSimilarity(0);
    setMessage('Retrying...');
    setTimeout(() => handleRobustVerify(), 500);
  };

  const handleCancel = async () => {
    await faceIDService.cancelRobustVerification();
    onCancel();
  };

  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="faceid-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="faceid-icon failed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="faceid-icon scanning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 00-2 2v4" />
              <path d="M9 21H5a2 2 0 01-2-2v-4" />
              <path d="M15 3h4a2 2 0 012 2v4" />
              <path d="M15 21h4a2 2 0 002-2v-4" />
              <circle cx="12" cy="10" r="3" />
              <path d="M12 13v3" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="faceid-overlay">
      <div className="faceid-modal">
        <div className="faceid-header">
          <h2>FaceID Verification</h2>
          <p>Driver authentication required</p>
        </div>

        <div className="faceid-camera-container">
          <img 
            src={faceIDService.getVideoFeedUrl()} 
            alt="Camera Feed"
            className={`faceid-camera ${status}`}
            onLoad={() => console.log('[FaceID] Video feed loaded')}
            onError={(e) => {
              console.error('[FaceID] Video feed error:', e);
              // Retry loading after delay
              setTimeout(() => {
                e.target.src = faceIDService.getVideoFeedUrl() + '?t=' + Date.now();
              }, 1000);
            }}
          />
          <div className={`faceid-frame ${status}`}>
            <div className="frame-corner top-left"></div>
            <div className="frame-corner top-right"></div>
            <div className="frame-corner bottom-left"></div>
            <div className="frame-corner bottom-right"></div>
          </div>
          
          {/* Scanning animation overlay */}
          {status === 'analyzing' && (
            <div className="scanning-overlay">
              <div className="scan-line"></div>
            </div>
          )}
        </div>

        {/* Progress bar for robust verification */}
        {status === 'analyzing' && (
          <div className="verification-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill analyzing" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Analyzing... {goodFrames}/{framesAnalyzed} quality frames
            </p>
          </div>
        )}

        <div className="faceid-status">
          {getStatusIcon()}
          <p className={`status-message ${status}`}>{message}</p>
          {similarity > 0 && status !== 'analyzing' && (
            <p className="similarity">Match: {similarity}%</p>
          )}
          {confidence && status === 'success' && (
            <p className="confidence-badge">{confidence} confidence</p>
          )}
        </div>

        <div className="faceid-actions">
          {status === 'failed' && (
            <button className="btn-retry" onClick={handleRetry}>
              Try Again
            </button>
          )}
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * FaceID Enrollment Modal
 * Captures face samples to enroll a new driver
 */
function FaceIDEnrollmentModal({ isVisible, onComplete, onCancel, driverId }) {
  const [status, setStatus] = useState('ready'); // ready, capturing, complete, error
  const [progress, setProgress] = useState(0);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [samplesNeeded, setSamplesNeeded] = useState(5);
  const [message, setMessage] = useState('Press Start to begin face enrollment');
  const [captureInterval, setCaptureInterval] = useState(null);

  const startEnrollment = async () => {
    const result = await faceIDService.startEnrollment();
    
    if (result.status === 'started') {
      setStatus('capturing');
      setSamplesNeeded(result.samples_needed || 5);
      setSamplesCollected(0);
      setProgress(0);
      setMessage('Look at the camera. Move your head slightly.');
      
      // Auto-capture samples
      const interval = setInterval(async () => {
        const sampleResult = await faceIDService.captureSample();
        
        if (sampleResult.status === 'sample_added') {
          setSamplesCollected(sampleResult.samples_collected);
          setProgress(sampleResult.samples_collected / sampleResult.samples_needed);
          
          if (sampleResult.complete) {
            clearInterval(interval);
            completeEnrollment();
          }
        } else if (sampleResult.status === 'error') {
          setMessage(sampleResult.message);
        }
      }, 800);
      
      setCaptureInterval(interval);
    } else {
      setStatus('error');
      setMessage(result.message || 'Failed to start enrollment');
    }
  };

  const completeEnrollment = async () => {
    setMessage('Saving face data...');
    
    const result = await faceIDService.completeEnrollment(driverId);
    
    if (result.status === 'success') {
      setStatus('complete');
      setMessage('Face enrolled successfully!');
      
      setTimeout(() => {
        onComplete(result);
      }, 1500);
    } else {
      setStatus('error');
      setMessage(result.message || 'Failed to save enrollment');
    }
  };

  const handleCancel = async () => {
    if (captureInterval) {
      clearInterval(captureInterval);
    }
    await faceIDService.cancelEnrollment();
    onCancel();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [captureInterval]);

  // Reset when modal opens
  useEffect(() => {
    if (isVisible) {
      setStatus('ready');
      setProgress(0);
      setSamplesCollected(0);
      setMessage('Press Start to begin face enrollment');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="faceid-overlay">
      <div className="faceid-modal enrollment">
        <div className="faceid-header">
          <h2>Face Enrollment</h2>
          <p>Register your face for secure access</p>
        </div>

        <div className="faceid-camera-container">
          <img 
            src={faceIDService.getVideoFeedUrl()} 
            alt="Camera Feed"
            className={`faceid-camera ${status}`}
            onLoad={() => console.log('[FaceID] Video feed loaded (enrollment)')}
            onError={(e) => {
              console.error('[FaceID] Video feed error (enrollment):', e);
              // Retry loading after delay
              setTimeout(() => {
                e.target.src = faceIDService.getVideoFeedUrl() + '?t=' + Date.now();
              }, 1000);
            }}
          />
          <div className={`faceid-frame ${status}`}>
            <div className="frame-corner top-left"></div>
            <div className="frame-corner top-right"></div>
            <div className="frame-corner bottom-left"></div>
            <div className="frame-corner bottom-right"></div>
          </div>
        </div>

        {status === 'capturing' && (
          <div className="enrollment-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">{samplesCollected}/{samplesNeeded} samples</p>
          </div>
        )}

        <div className="faceid-status">
          {status === 'complete' && (
            <div className="faceid-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          )}
          <p className={`status-message ${status}`}>{message}</p>
        </div>

        <div className="faceid-actions">
          {status === 'ready' && (
            <button className="btn-start" onClick={startEnrollment}>
              Start Enrollment
            </button>
          )}
          {status !== 'complete' && (
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { FaceIDVerificationModal, FaceIDEnrollmentModal };
export default FaceIDVerificationModal;
