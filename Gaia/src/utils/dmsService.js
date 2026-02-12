/**
 * DMS (Driver Monitoring System) Service
 * Browser-based eye tracking and drowsiness detection
 */

class DMSService {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.isRunning = false;
    this.onMetricsUpdate = null;
    this.onAlert = null;
    this.onFrame = null;
    
    // Detection state
    this.eyesClosed = false;
    this.eyesClosedStart = null;
    this.blinkCount = 0;
    this.blinkTimestamps = [];
    this.perclosWindow = [];
    this.lastEyeState = 'open';
    
    // Thresholds
    this.CLOSED_THRESHOLD_MS = 2000; // 2 seconds eyes closed = drowsy
    this.PERCLOS_ALERT_THRESHOLD = 30; // 30% eyes closed = warning
    this.PERCLOS_DANGER_THRESHOLD = 50; // 50% eyes closed = danger
    
    // Face detection (using ML5 or TensorFlow.js later, simple brightness for now)
    this.faceDetector = null;
    this.eyeDetectionModel = null;
    
    // Metrics
    this.metrics = {
      faceDetected: false,
      eyesOpen: true,
      ear: 0.3, // Eye Aspect Ratio
      blinksTotal: 0,
      blinksPerMin: 0,
      perclos: 0,
      drowsyAlert: false,
      attentionLevel: 'normal', // 'normal', 'warning', 'danger'
      lastUpdate: Date.now()
    };
    
    // Frame processing
    this.frameInterval = null;
    this.faceApi = null;
  }
  
  async initialize() {
    // Try to load face-api.js if available
    try {
      if (typeof faceapi !== 'undefined') {
        await this.loadFaceApiModels();
        this.faceApi = true;
        console.log('[DMS] Face-API.js loaded successfully');
      }
    } catch (e) {
      console.log('[DMS] Face-API not available, using basic detection');
    }
    
    return true;
  }
  
  async loadFaceApiModels() {
    // This would load TensorFlow models for face detection
    // For now we'll use basic image processing
  }
  
  async startCamera() {
    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      // Create video element
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', '');
      this.video.muted = true;
      await this.video.play();
      
      // Create canvas for processing
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.video.videoWidth || 640;
      this.canvas.height = this.video.videoHeight || 480;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      
      this.isRunning = true;
      this.startProcessing();
      
      console.log('[DMS] Camera started successfully');
      return true;
    } catch (error) {
      console.error('[DMS] Camera access denied:', error);
      return false;
    }
  }
  
  stopCamera() {
    this.isRunning = false;
    
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.video) {
      this.video.pause();
      this.video = null;
    }
    
    console.log('[DMS] Camera stopped');
  }
  
  startProcessing() {
    // Process frames at ~15 FPS
    this.frameInterval = setInterval(() => {
      if (this.isRunning && this.video && this.video.readyState >= 2) {
        this.processFrame();
      }
    }, 66);
  }
  
  processFrame() {
    // Draw current frame to canvas
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    // Get image data for analysis
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Analyze for face and eyes
    const analysis = this.analyzeFrame(imageData);
    
    // Update metrics
    this.updateMetrics(analysis);
    
    // Send frame to callback
    if (this.onFrame) {
      this.onFrame(this.canvas, this.metrics);
    }
    
    // Send metrics update
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.metrics);
    }
  }
  
  analyzeFrame(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Define face region (center of image, assuming user is looking at camera)
    const faceX = Math.floor(width * 0.25);
    const faceY = Math.floor(height * 0.1);
    const faceWidth = Math.floor(width * 0.5);
    const faceHeight = Math.floor(height * 0.7);
    
    // Eye regions (upper portion of face area)
    const eyeY = faceY + Math.floor(faceHeight * 0.2);
    const eyeHeight = Math.floor(faceHeight * 0.2);
    
    const leftEyeX = faceX + Math.floor(faceWidth * 0.1);
    const rightEyeX = faceX + Math.floor(faceWidth * 0.55);
    const eyeWidth = Math.floor(faceWidth * 0.35);
    
    // Analyze brightness in eye regions
    const leftEyeBrightness = this.getRegionBrightness(data, width, leftEyeX, eyeY, eyeWidth, eyeHeight);
    const rightEyeBrightness = this.getRegionBrightness(data, width, rightEyeX, eyeY, eyeWidth, eyeHeight);
    
    // Analyze contrast/variance in eye regions (higher variance = eyes open)
    const leftEyeVariance = this.getRegionVariance(data, width, leftEyeX, eyeY, eyeWidth, eyeHeight);
    const rightEyeVariance = this.getRegionVariance(data, width, rightEyeX, eyeY, eyeWidth, eyeHeight);
    
    // Face brightness for presence detection
    const faceBrightness = this.getRegionBrightness(data, width, faceX, faceY, faceWidth, faceHeight);
    
    // Calculate EAR approximation based on variance
    // Higher variance suggests more detail (open eyes have pupil/iris contrast)
    const avgVariance = (leftEyeVariance + rightEyeVariance) / 2;
    const ear = Math.min(0.4, Math.max(0.15, avgVariance / 150));
    
    // Determine if face is detected (reasonable brightness and variance)
    const faceDetected = faceBrightness > 30 && faceBrightness < 220;
    
    // Determine if eyes are open
    const eyesOpen = avgVariance > 25; // Threshold for eye openness
    
    return {
      faceDetected,
      eyesOpen,
      ear,
      leftEyeBrightness,
      rightEyeBrightness,
      leftEyeVariance,
      rightEyeVariance,
      eyeRegions: {
        left: { x: leftEyeX, y: eyeY, w: eyeWidth, h: eyeHeight },
        right: { x: rightEyeX, y: eyeY, w: eyeWidth, h: eyeHeight }
      }
    };
  }
  
  getRegionBrightness(data, width, startX, startY, regionWidth, regionHeight) {
    let total = 0;
    let count = 0;
    
    for (let y = startY; y < startY + regionHeight; y++) {
      for (let x = startX; x < startX + regionWidth; x++) {
        const idx = (y * width + x) * 4;
        if (idx < data.length) {
          // Calculate luminance
          const brightness = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          total += brightness;
          count++;
        }
      }
    }
    
    return count > 0 ? total / count : 0;
  }
  
  getRegionVariance(data, width, startX, startY, regionWidth, regionHeight) {
    const values = [];
    
    for (let y = startY; y < startY + regionHeight; y++) {
      for (let x = startX; x < startX + regionWidth; x++) {
        const idx = (y * width + x) * 4;
        if (idx < data.length) {
          const brightness = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          values.push(brightness);
        }
      }
    }
    
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance); // Standard deviation
  }
  
  updateMetrics(analysis) {
    const now = Date.now();
    
    this.metrics.faceDetected = analysis.faceDetected;
    this.metrics.ear = analysis.ear;
    this.metrics.eyesOpen = analysis.eyesOpen;
    
    if (!analysis.faceDetected) {
      // No face detected
      this.metrics.attentionLevel = 'warning';
      return;
    }
    
    // Track PERCLOS (Percentage of Eye Closure)
    this.perclosWindow.push(analysis.eyesOpen ? 0 : 1);
    if (this.perclosWindow.length > 1800) { // ~2 minutes at 15fps
      this.perclosWindow.shift();
    }
    
    const perclos = this.perclosWindow.length > 0 
      ? (this.perclosWindow.reduce((a, b) => a + b, 0) / this.perclosWindow.length) * 100 
      : 0;
    this.metrics.perclos = perclos;
    
    // Blink detection (transition from open to closed to open)
    if (!analysis.eyesOpen) {
      if (this.lastEyeState === 'open') {
        // Eyes just closed
        this.eyesClosedStart = now;
      }
    } else {
      if (this.lastEyeState === 'closed' && this.eyesClosedStart) {
        const duration = now - this.eyesClosedStart;
        // Blink is typically 100-400ms
        if (duration > 100 && duration < 500) {
          this.blinkCount++;
          this.blinkTimestamps.push(now);
          this.metrics.blinksTotal = this.blinkCount;
        }
      }
      this.eyesClosedStart = null;
    }
    
    this.lastEyeState = analysis.eyesOpen ? 'open' : 'closed';
    
    // Calculate blinks per minute
    const oneMinuteAgo = now - 60000;
    this.blinkTimestamps = this.blinkTimestamps.filter(t => t > oneMinuteAgo);
    this.metrics.blinksPerMin = this.blinkTimestamps.length;
    
    // Drowsiness detection
    let drowsyAlert = false;
    let attentionLevel = 'normal';
    
    // Check if eyes have been closed too long
    if (!analysis.eyesOpen && this.eyesClosedStart) {
      const closedDuration = now - this.eyesClosedStart;
      if (closedDuration >= this.CLOSED_THRESHOLD_MS) {
        drowsyAlert = true;
        attentionLevel = 'danger';
      }
    }
    
    // Check PERCLOS levels
    if (perclos >= this.PERCLOS_DANGER_THRESHOLD) {
      drowsyAlert = true;
      attentionLevel = 'danger';
    } else if (perclos >= this.PERCLOS_ALERT_THRESHOLD) {
      attentionLevel = 'warning';
    }
    
    // Very low blink rate can also indicate fatigue
    if (this.metrics.blinksPerMin < 5 && this.blinkTimestamps.length > 0) {
      if (attentionLevel === 'normal') attentionLevel = 'warning';
    }
    
    this.metrics.drowsyAlert = drowsyAlert;
    this.metrics.attentionLevel = attentionLevel;
    this.metrics.lastUpdate = now;
    
    // Trigger alert callback if drowsy
    if (drowsyAlert && this.onAlert) {
      this.onAlert({
        type: 'drowsy',
        message: 'Wake up! Eyes have been closed too long.',
        level: attentionLevel,
        metrics: { ...this.metrics }
      });
    }
  }
  
  getVideoElement() {
    return this.video;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  resetCounters() {
    this.blinkCount = 0;
    this.blinkTimestamps = [];
    this.perclosWindow = [];
    this.metrics.blinksTotal = 0;
    this.metrics.blinksPerMin = 0;
    this.metrics.perclos = 0;
    this.metrics.drowsyAlert = false;
    this.metrics.attentionLevel = 'normal';
  }
}

// Singleton instance
const dmsService = new DMSService();

export default dmsService;
