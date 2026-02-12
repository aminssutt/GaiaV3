/**
 * DMS (Driver Monitoring System) Service
 * Connects to Python DMS server via localhost or ngrok
 * Singleton service that runs continuously in background
 */

// Load from bench-config.js if available, then localStorage, then default
const getInitialUrl = () => {
  // Check bench config first (set via bench-config.js)
  if (typeof window !== 'undefined' && window.GAIA_CONFIG?.DMS_SERVER_URL) {
    console.log('[DMS] Using bench config URL:', window.GAIA_CONFIG.DMS_SERVER_URL);
    return window.GAIA_CONFIG.DMS_SERVER_URL;
  }
  // Then localStorage
  const stored = localStorage.getItem('dms_server_url');
  if (stored) {
    return stored;
  }
  // Default
  return 'http://localhost:5000';
};

let DMS_SERVER_URL = getInitialUrl();

class DMSService {
  constructor() {
    this.connected = false;
    this.metrics = null;
    this.pollingInterval = null;
    this.lastAlertTime = 0;
    this.alertCooldown = 3000; // 3 seconds between alerts
    this.consecutiveFailures = 0;
    
    // Callbacks - support multiple listeners
    this.listeners = {
      metricsUpdate: [],
      connectionChange: [],
      alert: [],
      attentionChange: []
    };
    
    // Current attention level - tracks real-time state
    this.attentionLevel = 'unknown';
    
    // Auto-start polling on creation
    this.startPolling();
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
          console.error(`[DMS] Error in ${event} listener:`, e);
        }
      });
    }
  }

  /**
   * Set the DMS server URL (localhost or ngrok)
   */
  setServerUrl(url) {
    DMS_SERVER_URL = url;
    localStorage.setItem('dms_server_url', url);
    console.log('[DMS] Server URL set to:', url);
    this.consecutiveFailures = 0;
    this.fetchMetrics();
  }

  getServerUrl() {
    return DMS_SERVER_URL;
  }

  /**
   * Get the video feed URL for <img> tag
   */
  getVideoFeedUrl() {
    return `${DMS_SERVER_URL}/video_feed`;
  }

  /**
   * Start polling metrics from DMS server
   */
  startPolling(intervalMs = 300) {
    if (this.pollingInterval) {
      return; // Already polling
    }

    console.log('[DMS] Starting background polling...');
    
    this.pollingInterval = setInterval(async () => {
      await this.fetchMetrics();
    }, intervalMs);

    this.fetchMetrics();
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[DMS] Polling stopped');
    }
  }

  /**
   * Fetch metrics from server
   */
  async fetchMetrics() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${DMS_SERVER_URL}/metrics`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Server error');
      
      const data = await response.json();
      this.metrics = data;
      this.consecutiveFailures = 0;
      
      if (!this.connected) {
        this.connected = true;
        this.emit('connectionChange', true);
        console.log('[DMS] Connected');
      }

      // Update attention level in real-time
      this.updateAttentionLevel(data);
      this.emit('metricsUpdate', data);

      return data;
    } catch (error) {
      this.consecutiveFailures++;
      
      if (this.connected) {
        this.connected = false;
        this.attentionLevel = 'unknown';
        this.emit('connectionChange', false);
        this.emit('attentionChange', 'unknown');
      }
      
      return null;
    }
  }

  /**
   * Update attention level based on current metrics - REAL-TIME
   */
  updateAttentionLevel(metrics) {
    let newLevel = 'normal';
    const now = Date.now();
    
    // Determine level from current metrics
    if (metrics.drowsy_alert) {
      newLevel = 'danger';
    } else if (!metrics.face_detected) {
      // No face - could be looking away, mild warning
      newLevel = 'warning';
    } else if (metrics.perclos > 40) {
      newLevel = 'danger';
    } else if (metrics.perclos > 25 || !metrics.eyes_open) {
      newLevel = 'warning';
    } else {
      // Eyes open, face detected, low perclos = NORMAL
      newLevel = 'normal';
    }
    
    // Always emit if changed
    if (newLevel !== this.attentionLevel) {
      console.log(`[DMS] Attention: ${this.attentionLevel} -> ${newLevel}`);
      this.attentionLevel = newLevel;
      this.emit('attentionChange', newLevel);
    }
    
    // Trigger alert only for danger (with cooldown)
    if (newLevel === 'danger' && (now - this.lastAlertTime) > this.alertCooldown) {
      this.lastAlertTime = now;
      this.emit('alert', {
        type: metrics.drowsy_alert ? 'drowsy' : 'high_perclos',
        level: 'danger',
        message: '⚠️ WAKE UP! Drowsiness detected!',
        metrics
      });
    }
  }

  /**
   * Reset DMS counters on server
   */
  async resetCounters() {
    try {
      const response = await fetch(`${DMS_SERVER_URL}/reset`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (response.ok) {
        this.attentionLevel = 'normal';
        this.emit('attentionChange', 'normal');
      }
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check connection status
   */
  async checkConnection() {
    return await this.fetchMetrics() !== null;
  }

  getMetrics() { return this.metrics; }
  isConnected() { return this.connected; }
  getAttentionLevel() { return this.attentionLevel; }

  /**
   * Clear alerts and reset to normal
   */
  clearAlerts() {
    this.attentionLevel = 'normal';
    this.emit('attentionChange', 'normal');
  }
}

// Singleton - auto-starts polling
const dmsService = new DMSService();

export default dmsService;
