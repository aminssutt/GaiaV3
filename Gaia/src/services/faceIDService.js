/**
 * FaceID Service
 * Face recognition for driver verification
 * Works with the Python DMS server's FaceID endpoints
 */

// Get server URL from config
const getServerUrl = () => {
  if (typeof window !== 'undefined' && window.GAIA_CONFIG?.DMS_SERVER_URL) {
    return window.GAIA_CONFIG.DMS_SERVER_URL;
  }
  const stored = localStorage.getItem('dms_server_url');
  return stored || 'http://localhost:5000';
};

class FaceIDService {
  constructor() {
    this.enrollmentInProgress = false;
    this.samplesCollected = 0;
    this.samplesNeeded = 5;
    
    // Callbacks
    this.listeners = {
      enrollmentProgress: [],
      enrollmentComplete: [],
      verificationResult: []
    };
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`[FaceID] Error in ${event} listener:`, e);
        }
      });
    }
  }

  /**
   * Get server URL
   */
  getServerUrl() {
    return getServerUrl();
  }

  /**
   * Start face enrollment process
   */
  async startEnrollment() {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/enroll/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'started') {
        this.enrollmentInProgress = true;
        this.samplesCollected = 0;
        this.samplesNeeded = result.samples_needed || 5;
      }
      
      return result;
    } catch (error) {
      console.error('[FaceID] Error starting enrollment:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Capture a face sample during enrollment
   */
  async captureSample() {
    if (!this.enrollmentInProgress) {
      return { status: 'error', message: 'Enrollment not started' };
    }

    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/enroll/sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'sample_added') {
        this.samplesCollected = result.samples_collected;
        this.emit('enrollmentProgress', {
          collected: result.samples_collected,
          needed: result.samples_needed,
          progress: result.samples_collected / result.samples_needed
        });
      }
      
      return result;
    } catch (error) {
      console.error('[FaceID] Error capturing sample:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Complete enrollment and save driver
   */
  async completeEnrollment(driverId) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/enroll/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ driver_id: driverId })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        this.enrollmentInProgress = false;
        this.samplesCollected = 0;
        this.emit('enrollmentComplete', { driverId, success: true });
      }
      
      return result;
    } catch (error) {
      console.error('[FaceID] Error completing enrollment:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Cancel ongoing enrollment
   */
  async cancelEnrollment() {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/enroll/cancel`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const result = await response.json();
      this.enrollmentInProgress = false;
      this.samplesCollected = 0;
      
      return result;
    } catch (error) {
      console.error('[FaceID] Error cancelling enrollment:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Verify face against enrolled driver(s)
   */
  async verify(driverId = null) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ driver_id: driverId })
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          status: 'error',
          verified: false,
          message: `HTTP ${response.status} on /faceid/verify: ${text?.slice(0, 200) || ''}`
        };
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => '');
        return {
          status: 'error',
          verified: false,
          message: `Invalid JSON from /faceid/verify: ${text?.slice(0, 200) || ''}`
        };
      }
      
      this.emit('verificationResult', result);
      
      return result;
    } catch (error) {
      console.error('[FaceID] Error verifying face:', error);
      return { status: 'error', verified: false, message: error.message };
    }
  }

  /**
   * Robust verification - captures multiple frames for higher accuracy
   * This is a blocking call that takes a few seconds
   */
  async verifyRobust(driverId = null, onProgress = null) {
    try {
      // Use automatic robust verification endpoint
      const response = await fetch(`${this.getServerUrl()}/faceid/verify/robust/auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          driver_id: driverId,
          num_frames: 8
        })
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          status: 'error',
          verified: false,
          message: `HTTP ${response.status}: ${text?.slice(0, 200) || ''}`
        };
      }

      const result = await response.json();
      this.emit('verificationResult', result);
      return result;
    } catch (error) {
      console.error('[FaceID] Error in robust verification:', error);
      return { status: 'error', verified: false, message: error.message };
    }
  }

  /**
   * Start interactive robust verification (for progress updates)
   */
  async startRobustVerification() {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/verify/robust/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('[FaceID] Error starting robust verification:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Add a frame to robust verification
   */
  async addRobustFrame(driverId = null) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/verify/robust/frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ driver_id: driverId })
      });
      return await response.json();
    } catch (error) {
      console.error('[FaceID] Error adding robust frame:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get robust verification result
   */
  async getRobustResult(driverId = null) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/verify/robust/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ driver_id: driverId })
      });
      return await response.json();
    } catch (error) {
      console.error('[FaceID] Error getting robust result:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Cancel robust verification
   */
  async cancelRobustVerification() {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/verify/robust/cancel`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('[FaceID] Error cancelling robust verification:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get list of enrolled drivers
   */
  async getEnrolledDrivers() {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/drivers`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const result = await response.json();
      return result.drivers || [];
    } catch (error) {
      console.error('[FaceID] Error getting drivers:', error);
      return [];
    }
  }

  /**
   * Check if a driver is enrolled
   */
  async isDriverEnrolled(driverId) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/drivers/${driverId}/enrolled`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const result = await response.json();
      return result.enrolled || false;
    } catch (error) {
      console.error('[FaceID] Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Delete enrolled driver
   */
  async deleteDriver(driverId) {
    try {
      const response = await fetch(`${this.getServerUrl()}/faceid/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('[FaceID] Error deleting driver:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get video feed URL for preview
   */
  getVideoFeedUrl() {
    return `${this.getServerUrl()}/video_feed`;
  }
}

// Singleton instance
const faceIDService = new FaceIDService();
export default faceIDService;
