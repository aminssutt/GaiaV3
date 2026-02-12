"""
DMS Web Server - Stream camera to WebView
Simple Flask server for vehicle bench deployment
Compatible with ngrok for remote access
"""
import cv2
import numpy as np
from flask import Flask, Response, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import threading
import time
import os

# Import DMS components
from collections import deque
from scipy import signal

# Import FaceID service
from faceid_service import FaceIDService, RobustVerification

# Global FaceID instance
faceid_service = FaceIDService()
robust_verifier = RobustVerification(faceid_service)

# Path to Gaia dist-bench folder
GAIA_DIST_PATH = os.path.join(os.path.dirname(__file__), '..', 'Gaia', 'dist-bench')

app = Flask(__name__, static_folder='static', template_folder='templates')
# Enable CORS for all origins (needed for ngrok + different frontends)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,ngrok-skip-browser-warning')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Global variables
camera = None
output_frame = None
lock = threading.Lock()
metrics = {}

# ============== DMS Classes (simplified) ==============

class FaceStabilizer:
    """
    Lightweight face stabilization - reduces jitter without heavy processing.
    """
    def __init__(self, smoothing_factor=0.5, max_frames_without_detection=5):
        self.smoothing_factor = smoothing_factor
        self.max_frames_without = max_frames_without_detection
        self.frames_without_detection = 0
        self.smooth_bbox = None
        self.smooth_landmarks = None
        self.smooth_confidence = 0.0
        self.confidence_history = deque(maxlen=5)
        
    def update(self, detected_faces):
        if not detected_faces:
            self.frames_without_detection += 1
            if self.frames_without_detection > self.max_frames_without:
                self.smooth_bbox = None
                self.smooth_landmarks = None
                return None
            if self.smooth_bbox is not None:
                return {
                    'bbox': np.array(self.smooth_bbox, dtype=np.int32),
                    'landmarks': self.smooth_landmarks,
                    'confidence': self.smooth_confidence * 0.9
                }
            return None
        
        self.frames_without_detection = 0
        face = max(detected_faces, key=lambda f: f['confidence'])
        new_bbox = np.array(face['bbox'], dtype=np.float32)
        new_landmarks = face['landmarks']
        new_conf = float(face['confidence'])
        
        if self.smooth_bbox is None:
            self.smooth_bbox = new_bbox
            self.smooth_landmarks = new_landmarks
            self.smooth_confidence = new_conf
        else:
            alpha = self.smoothing_factor
            self.smooth_bbox = alpha * self.smooth_bbox + (1 - alpha) * new_bbox
            self.smooth_confidence = alpha * self.smooth_confidence + (1 - alpha) * new_conf
            # Simple landmark smoothing
            for key in new_landmarks:
                if key in self.smooth_landmarks:
                    old = np.array(self.smooth_landmarks[key], dtype=np.float32)
                    new = np.array(new_landmarks[key], dtype=np.float32)
                    smoothed = alpha * old + (1 - alpha) * new
                    self.smooth_landmarks[key] = (int(smoothed[0]), int(smoothed[1]))
                else:
                    self.smooth_landmarks[key] = new_landmarks[key]
        
        self.confidence_history.append(self.smooth_confidence)
        return {
            'bbox': np.array(self.smooth_bbox, dtype=np.int32),
            'landmarks': self.smooth_landmarks,
            'confidence': self.smooth_confidence
        }
    
    def get_stable_bbox(self):
        return self.smooth_bbox.astype(np.int32) if self.smooth_bbox is not None else None
    
    def is_stable(self):
        return len(self.confidence_history) >= 3 and np.mean(self.confidence_history) > 0.5


class YuNetFaceDetector:
    def __init__(self, model_path, conf_threshold=0.5):
        # Lower threshold = detect more faces (but maybe more false positives)
        # Default was 0.6, lowered to 0.5 for better detection
        self.detector = cv2.FaceDetectorYN.create(
            model_path, "", (320, 320), conf_threshold, 0.3
        )
    
    def detect(self, image):
        h, w = image.shape[:2]
        self.detector.setInputSize((w, h))
        _, faces = self.detector.detect(image)
        
        # Only log occasionally to avoid spam (every 100 detections)
        # if faces is not None and len(faces) > 0:
        #     print(f"[YuNet] Detected {len(faces)} face(s) with conf: {[f'{f[14]:.2f}' for f in faces]}")
        
        results = []
        if faces is not None:
            for face in faces:
                # Validate face data before processing
                if np.any(np.isnan(face[:4])) or np.any(np.isinf(face[:4])):
                    continue
                    
                bbox = face[:4].astype(np.int32)
                # Validate bbox values are reasonable
                if bbox[0] < 0 or bbox[1] < 0 or bbox[2] <= 0 or bbox[3] <= 0:
                    continue
                if bbox[0] > w or bbox[1] > h or bbox[2] > w or bbox[3] > h:
                    continue
                    
                landmarks = {
                    'right_eye': (int(face[4]), int(face[5])),
                    'left_eye': (int(face[6]), int(face[7])),
                    'nose': (int(face[8]), int(face[9])),
                    'right_mouth': (int(face[10]), int(face[11])),
                    'left_mouth': (int(face[12]), int(face[13]))
                }
                results.append({'bbox': bbox, 'landmarks': landmarks, 'confidence': face[14]})
        return results


class EyeAnalyzer:
    """
    Eye analyzer using contour-based EAR calculation.
    Simplified and stable approach.
    """
    def __init__(self):
        self.left_ear_history = deque(maxlen=10)
        self.right_ear_history = deque(maxlen=10)
        
    def analyze(self, frame, landmarks, face_width, head_pose=None):
        """
        Analyze eye state and return smoothed EAR.
        """
        left_eye = landmarks['left_eye']
        right_eye = landmarks['right_eye']
        
        # Get EAR for each eye
        left_ear = self._compute_ear_single(frame, left_eye, face_width)
        right_ear = self._compute_ear_single(frame, right_eye, face_width)
        
        # Store in history
        self.left_ear_history.append(left_ear)
        self.right_ear_history.append(right_ear)
        
        # Smooth with mean
        smooth_left = np.mean(self.left_ear_history)
        smooth_right = np.mean(self.right_ear_history)
        
        # Average both eyes
        avg_ear = (smooth_left + smooth_right) / 2
        
        return avg_ear
    
    def _compute_ear_single(self, frame, eye_center, face_width):
        """Compute EAR for a single eye using contour analysis."""
        eye_w = int(face_width * 0.25)
        eye_h = int(face_width * 0.15)
        
        x = max(0, eye_center[0] - eye_w // 2)
        y = max(0, eye_center[1] - eye_h // 2)
        h, w = frame.shape[:2]
        x2 = min(w, x + eye_w)
        y2 = min(h, y + eye_h)
        
        eye_roi = frame[y:y2, x:x2]
        
        if eye_roi.size < 100:
            return 0.3
        
        # Convert to grayscale
        gray = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2GRAY) if len(eye_roi.shape) == 3 else eye_roi
        gray = cv2.equalizeHist(gray)
        
        # Threshold to find eye opening
        _, thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.3
        
        # Get largest contour
        largest = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(largest)
        
        if bw == 0:
            return 0.3
        
        # EAR = height / width ratio
        ear = (bh / bw) * 0.8
        return min(0.4, max(0.1, ear))


class HeadPoseEstimator:
    def __init__(self):
        self.model_points = np.array([
            (-165.0, 170.0, -135.0), (165.0, 170.0, -135.0),
            (0.0, 0.0, 0.0), (-90.0, -100.0, -100.0), (90.0, -100.0, -100.0)
        ], dtype=np.float64)
        self.pose_history = deque(maxlen=10)
        
    def estimate(self, landmarks, frame_shape):
        h, w = frame_shape[:2]
        focal_length = w
        camera_matrix = np.array([
            [focal_length, 0, w/2], [0, focal_length, h/2], [0, 0, 1]
        ], dtype=np.float64)
        
        image_points = np.array([
            landmarks['right_eye'], landmarks['left_eye'], landmarks['nose'],
            landmarks['right_mouth'], landmarks['left_mouth']
        ], dtype=np.float64)
        
        try:
            success, rvec, tvec = cv2.solvePnP(
                self.model_points, image_points, camera_matrix, np.zeros((4,1)), flags=cv2.SOLVEPNP_EPNP
            )
            if success:
                rmat, _ = cv2.Rodrigues(rvec)
                proj = np.hstack((rmat, tvec))
                _, _, _, _, _, _, euler = cv2.decomposeProjectionMatrix(proj)
                self.pose_history.append((euler[0][0], euler[1][0], euler[2][0]))
        except:
            pass
        
        if self.pose_history:
            return {
                'pitch': np.mean([p[0] for p in self.pose_history]),
                'yaw': np.mean([p[1] for p in self.pose_history]),
                'roll': np.mean([p[2] for p in self.pose_history])
            }
        return {'pitch': 0, 'yaw': 0, 'roll': 0}


class DMSProcessor:
    def __init__(self, model_path):
        self.face_detector = YuNetFaceDetector(model_path)
        self.face_stabilizer = FaceStabilizer(smoothing_factor=0.5)
        self.eye_analyzer = EyeAnalyzer()
        self.head_pose = HeadPoseEstimator()
        
        self.total_blinks = 0
        self.blink_timestamps = deque(maxlen=100)
        self.last_ear_above = True
        self.eyes_closed_start = None
        self.yawn_count = 0
        self.perclos_window = deque(maxlen=1800)
        
        # Thresholds (proven values from dms_health_monitor)
        self.EAR_THRESHOLD = 0.22  # Standard threshold
        self.CLOSED_TIME_THRESHOLD = 2.0  # Seconds before drowsy alert
        self.DISTRACTION_YAW_THRESHOLD = 30  # Degrees for looking away
        self.DISTRACTION_TIME_THRESHOLD = 2.0  # Seconds looking away
        
        # Simple state tracking
        self.eyes_closed_frames = 0
        self.eyes_open_frames = 0
        self.FRAMES_TO_CONFIRM_CLOSED = 3  # Quick response
        self.FRAMES_TO_CONFIRM_OPEN = 2
        
        # Distraction tracking
        self.distraction_start = None
        self.looking_away = False
        
        # FaceID integration
        self.faceid_enabled = True
        self.faceid_verify_interval = 90
        self.frame_count = 0
        self.driver_recognized = False
        self.stable_driver_id = None
        
        # Last known good pose (for when face is temporarily lost)
        self.last_pose = {'pitch': 0, 'yaw': 0, 'roll': 0}
        
    def process(self, frame):
        global metrics, faceid_service
        h, w = frame.shape[:2]
        
        current_metrics = {
            'face_detected': False,
            'eyes_open': True,
            'ear': 0.3,
            'blinks_total': self.total_blinks,
            'blinks_per_min': self._get_bpm(),
            'perclos': self._get_perclos(),
            'yawns': self.yawn_count,
            'pitch': 0, 'yaw': 0, 'roll': 0,
            'drowsy_alert': False,
            'distraction_alert': False,
            'driver_recognized': self.driver_recognized,
            'driver_id': self.stable_driver_id
        }
        
        # Detect faces with raw detector
        raw_faces = self.face_detector.detect(frame)
        
        # Stabilize face detection (reduces jitter)
        face = self.face_stabilizer.update(raw_faces)
        
        if face is not None:
            current_metrics['face_detected'] = True
            
            bbox = face['bbox']
            landmarks = face['landmarks']
            # Convert to native Python int to avoid numpy overflow issues
            x, y, fw, fh = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
            
            # FaceID verification (periodic - every N frames to save CPU)
            self.frame_count += 1
            if self.faceid_enabled and self.frame_count % self.faceid_verify_interval == 0:
                if self.face_stabilizer.is_stable():
                    bbox_tuple = (x, y, fw, fh)
                    result = faceid_service.verify(landmarks, bbox_tuple, frame.shape, driver_id=None, frame_bgr=frame)
                    
                    if result['status'] == 'success':
                        self.driver_recognized = result['verified']
                        self.stable_driver_id = result.get('driver_id')
                        current_metrics['driver_recognized'] = self.driver_recognized
                        current_metrics['driver_id'] = self.stable_driver_id
            
            # Determine face box color based on recognition
            if faceid_service.get_enrolled_drivers():  # If any drivers are enrolled
                if self.driver_recognized:
                    box_color = (0, 255, 0)  # Green - recognized driver
                else:
                    box_color = (0, 0, 255)  # Red - unknown person
            else:
                box_color = (0, 255, 200)  # Cyan - no drivers enrolled (default)
            
            # Draw face box with recognition color
            cv2.rectangle(frame, (x, y), (x+fw, y+fh), box_color, 3)
            
            # Add recognition status text
            if faceid_service.get_enrolled_drivers():
                status_text = "Driver OK" if self.driver_recognized else "UNKNOWN"
                text_color = (0, 255, 0) if self.driver_recognized else (0, 0, 255)
                cv2.putText(frame, status_text, (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2)
            
            # Draw landmarks
            for name, pt in landmarks.items():
                color = (0, 255, 0) if 'eye' in name else (255, 0, 255)
                cv2.circle(frame, pt, 4, color, -1)
            
            # Head pose FIRST (needed for eye analysis compensation)
            pose = self.head_pose.estimate(landmarks, frame.shape)
            self.last_pose = pose
            current_metrics['pitch'] = pose['pitch']
            current_metrics['yaw'] = pose['yaw']
            current_metrics['roll'] = pose['roll']
            
            # Eye analysis with head pose compensation
            ear = self.eye_analyzer.analyze(frame, landmarks, fw, head_pose=pose)
            current_metrics['ear'] = ear
            
            # Adaptive threshold based on head pose
            # When looking down or to the side, be more lenient
            effective_threshold = self.EAR_THRESHOLD
            if abs(pose['pitch']) > 15 or abs(pose['yaw']) > 25:
                effective_threshold -= 0.03  # More lenient
            
            eyes_open = ear > effective_threshold
            
            # Multi-frame confirmation for eye state
            if eyes_open:
                self.eyes_open_frames += 1
                self.eyes_closed_frames = 0
            else:
                self.eyes_closed_frames += 1
                self.eyes_open_frames = 0
            
            # Only consider eyes closed after N consecutive frames
            confirmed_closed = self.eyes_closed_frames >= self.FRAMES_TO_CONFIRM_CLOSED
            confirmed_open = self.eyes_open_frames >= self.FRAMES_TO_CONFIRM_OPEN
            
            # Update eyes_open based on confirmed state
            if confirmed_closed:
                eyes_open = False
            elif confirmed_open:
                eyes_open = True
            else:
                # In transition, keep previous state
                eyes_open = self.last_ear_above
            
            current_metrics['eyes_open'] = eyes_open
            
            self.perclos_window.append(0 if eyes_open else 1)
            current_metrics['perclos'] = self._get_perclos()
            
            # Drowsiness detection
            if not eyes_open and confirmed_closed:
                if self.eyes_closed_start is None:
                    self.eyes_closed_start = time.time()
                else:
                    closed_duration = time.time() - self.eyes_closed_start
                    if closed_duration >= self.CLOSED_TIME_THRESHOLD:
                        current_metrics['drowsy_alert'] = True
            else:
                # Blink detection
                if self.eyes_closed_start is not None and confirmed_open:
                    duration = time.time() - self.eyes_closed_start
                    if 0.1 < duration < 0.5:
                        self.total_blinks += 1
                        self.blink_timestamps.append(time.time())
                    self.eyes_closed_start = None
            
            self.last_ear_above = eyes_open
            current_metrics['blinks_total'] = self.total_blinks
            current_metrics['blinks_per_min'] = self._get_bpm()
            
            # Distraction detection (looking away too long)
            if abs(pose['yaw']) > self.DISTRACTION_YAW_THRESHOLD:
                if self.distraction_start is None:
                    self.distraction_start = time.time()
                elif time.time() - self.distraction_start > self.DISTRACTION_TIME_THRESHOLD:
                    current_metrics['distraction_alert'] = True
                    self.looking_away = True
            else:
                self.distraction_start = None
                self.looking_away = False
        
        metrics = current_metrics
        return frame, current_metrics
    
    def _get_bpm(self):
        now = time.time()
        while self.blink_timestamps and (now - self.blink_timestamps[0]) > 60:
            self.blink_timestamps.popleft()
        return len(self.blink_timestamps)
    
    def _get_perclos(self):
        if not self.perclos_window:
            return 0
        return (sum(self.perclos_window) / len(self.perclos_window)) * 100


# ============== Video Processing ==============

dms_processor = None

def init_camera():
    global camera, dms_processor
    
    # Model path - try multiple locations
    script_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(script_dir, "face_detection_yunet.onnx"),
        "c:/Users/k250079/Desktop/cameratest/face_detection_yunet.onnx",
        "c:/Users/k250079/Desktop/Projects/GaiaV2/cameratest/face_detection_yunet.onnx",
        "face_detection_yunet.onnx"
    ]
    
    model_path = None
    for path in possible_paths:
        if os.path.exists(path):
            model_path = path
            break
    
    if not model_path:
        print(f"ERROR: Model not found in any of: {possible_paths}")
        return False
    
    print(f"Using model: {model_path}")
    dms_processor = DMSProcessor(model_path)
    
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 30)
    
    return camera.isOpened()


def process_frames():
    global output_frame, camera, dms_processor
    
    while True:
        if camera is None:
            time.sleep(0.1)
            continue
            
        ret, frame = camera.read()
        if not ret:
            continue
        
        frame = cv2.flip(frame, 1)
        
        if dms_processor:
            frame, _ = dms_processor.process(frame)
        
        with lock:
            output_frame = frame.copy()


def generate_frames():
    global output_frame
    
    # Create a black placeholder frame
    placeholder = np.zeros((720, 1280, 3), dtype=np.uint8)
    cv2.putText(placeholder, "Initializing camera...", (400, 360), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    while True:
        # Quick copy with lock, encode outside lock
        with lock:
            frame_to_send = output_frame.copy() if output_frame is not None else placeholder.copy()
        
        # Encode frame as JPEG OUTSIDE the lock (this is slow)
        ret, buffer = cv2.imencode('.jpg', frame_to_send, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            time.sleep(0.01)
            continue
            
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS


# ============== Routes ==============

# Serve Gaia app at /app/
@app.route('/app/')
@app.route('/app/<path:filename>')
def serve_gaia(filename='index.html'):
    """Serve Gaia frontend from dist-bench folder"""
    return send_from_directory(GAIA_DIST_PATH, filename)

@app.route('/')
def index():
    """Redirect root to Gaia app"""
    return send_from_directory(GAIA_DIST_PATH, 'index.html')


@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve Gaia assets"""
    return send_from_directory(os.path.join(GAIA_DIST_PATH, 'assets'), filename)

@app.route('/avatars/<path:filename>')
def serve_avatars(filename):
    """Serve Gaia avatars"""
    return send_from_directory(os.path.join(GAIA_DIST_PATH, 'avatars'), filename)

@app.route('/fonts/<path:filename>')
def serve_fonts(filename):
    """Serve Gaia fonts"""
    return send_from_directory(os.path.join(GAIA_DIST_PATH, 'fonts'), filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Serve Gaia images"""
    return send_from_directory(os.path.join(GAIA_DIST_PATH, 'images'), filename)

@app.route('/bench-config.js')
def serve_bench_config():
    """Serve bench config"""
    return send_from_directory(GAIA_DIST_PATH, 'bench-config.js')

@app.route('/nouvelr-fonts.css')
def serve_fonts_css():
    """Serve fonts CSS"""
    return send_from_directory(GAIA_DIST_PATH, 'nouvelr-fonts.css')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/metrics')
def get_metrics():
    # Convert numpy types to native Python types for JSON serialization
    safe_metrics = {}
    for key, value in metrics.items():
        if hasattr(value, 'item'):  # numpy scalar
            safe_metrics[key] = value.item()
        elif isinstance(value, (np.bool_, np.integer, np.floating)):
            safe_metrics[key] = value.item()
        else:
            safe_metrics[key] = value
    return jsonify(safe_metrics)


@app.route('/reset', methods=['POST'])
def reset_counters():
    global dms_processor
    if dms_processor:
        dms_processor.total_blinks = 0
        dms_processor.yawn_count = 0
        dms_processor.blink_timestamps.clear()
        dms_processor.perclos_window.clear()
    return jsonify({'status': 'ok'})


# ============== FaceID Routes ==============

@app.route('/faceid/enroll/start', methods=['POST'])
def faceid_enroll_start():
    """Start the face enrollment process"""
    result = faceid_service.start_enrollment()
    return jsonify(result)


@app.route('/faceid/enroll/sample', methods=['POST'])
def faceid_enroll_sample():
    """Add a face sample during enrollment (uses current camera frame)"""
    global output_frame, dms_processor
    
    with lock:
        if output_frame is None:
            return jsonify({'status': 'error', 'message': 'No camera frame available'})
        frame = output_frame.copy()
    
    # Detect face in current frame
    if dms_processor:
        faces = dms_processor.face_detector.detect(frame)
        if faces:
            face = max(faces, key=lambda f: f['confidence'])
            bbox = tuple(face['bbox'].tolist())
            landmarks = face['landmarks']
            
            result = faceid_service.add_enrollment_sample(landmarks, bbox, frame.shape, frame_bgr=frame)
            return jsonify(result)
    
    return jsonify({
        'status': 'error',
        'message': 'No face detected. Please look at the camera.'
    })


@app.route('/faceid/enroll/complete', methods=['POST'])
def faceid_enroll_complete():
    """Complete enrollment and save the driver"""
    data = request.get_json() or {}
    driver_id = data.get('driver_id', 'default_driver')
    
    result = faceid_service.complete_enrollment(driver_id)
    return jsonify(result)


@app.route('/faceid/enroll/cancel', methods=['POST'])
def faceid_enroll_cancel():
    """Cancel ongoing enrollment"""
    result = faceid_service.cancel_enrollment()
    return jsonify(result)


@app.route('/faceid/verify', methods=['POST'])
def faceid_verify():
    """Verify face against enrolled drivers"""
    global output_frame, dms_processor
    
    data = request.get_json() or {}
    driver_id = data.get('driver_id')  # Optional: verify against specific driver
    
    with lock:
        if output_frame is None:
            return jsonify({'status': 'error', 'verified': False, 'message': 'No camera frame'})
        frame = output_frame.copy()
    
    if dms_processor:
        faces = dms_processor.face_detector.detect(frame)
        if faces:
            face = max(faces, key=lambda f: f['confidence'])
            bbox = tuple(face['bbox'].tolist())
            landmarks = face['landmarks']
            
            result = faceid_service.verify(landmarks, bbox, frame.shape, driver_id, frame_bgr=frame)
            return jsonify(result)
    
    return jsonify({
        'status': 'error',
        'verified': False,
        'message': 'No face detected. Please look at the camera.'
    })


@app.route('/faceid/drivers', methods=['GET'])
def faceid_get_drivers():
    """Get list of enrolled drivers"""
    drivers = faceid_service.get_enrolled_drivers()
    return jsonify({'drivers': drivers})


@app.route('/faceid/drivers/<driver_id>', methods=['DELETE'])
def faceid_delete_driver(driver_id):
    """Delete an enrolled driver"""
    result = faceid_service.delete_driver(driver_id)
    return jsonify(result)


@app.route('/faceid/drivers/<driver_id>/enrolled', methods=['GET'])
def faceid_is_enrolled(driver_id):
    """Check if a driver is enrolled"""
    enrolled = faceid_service.is_enrolled(driver_id)
    return jsonify({'driver_id': driver_id, 'enrolled': enrolled})


@app.route('/faceid/threshold', methods=['POST'])
def faceid_set_threshold():
    """Set recognition threshold"""
    data = request.get_json() or {}
    threshold = data.get('threshold', 0.75)
    result = faceid_service.set_threshold(threshold)
    return jsonify(result)


# ============== Robust Verification Routes ==============

@app.route('/faceid/verify/robust/start', methods=['POST'])
def faceid_robust_start():
    """Start a robust multi-frame verification session"""
    result = robust_verifier.start_verification()
    return jsonify(result)


@app.route('/faceid/verify/robust/frame', methods=['POST'])
def faceid_robust_frame():
    """Add a frame to the robust verification session"""
    global output_frame, dms_processor
    
    data = request.get_json() or {}
    driver_id = data.get('driver_id')
    
    with lock:
        if output_frame is None:
            return jsonify({
                'status': 'error',
                'message': 'No camera frame available'
            })
        frame = output_frame.copy()
    
    if dms_processor:
        faces = dms_processor.face_detector.detect(frame)
        if faces:
            face = max(faces, key=lambda f: f['confidence'])
            bbox = tuple(face['bbox'].tolist())
            landmarks = face['landmarks']
            
            result = robust_verifier.add_frame(
                landmarks, bbox, frame.shape, frame, driver_id
            )
            return jsonify(result)
    
    # No face detected - still add as a failed frame
    result = robust_verifier.add_frame(None, None, frame.shape, frame, driver_id)
    result['message'] = 'No face detected in this frame'
    return jsonify(result)


@app.route('/faceid/verify/robust/result', methods=['POST'])
def faceid_robust_result():
    """Get the final result of robust verification"""
    data = request.get_json() or {}
    driver_id = data.get('driver_id')
    
    result = robust_verifier.get_final_result(driver_id)
    return jsonify(result)


@app.route('/faceid/verify/robust/cancel', methods=['POST'])
def faceid_robust_cancel():
    """Cancel ongoing robust verification"""
    result = robust_verifier.cancel()
    return jsonify(result)


@app.route('/faceid/verify/robust/auto', methods=['POST'])
def faceid_robust_auto():
    """
    Automatic robust verification - captures multiple frames and returns final result.
    This is a blocking call that takes a few seconds.
    """
    global output_frame, dms_processor
    
    data = request.get_json() or {}
    driver_id = data.get('driver_id')
    num_frames = data.get('num_frames', 12)  # Increased from 8
    
    # Start verification
    robust_verifier.start_verification()
    
    frames_captured = 0
    good_frames = 0
    max_attempts = num_frames * 3  # Triple attempts to ensure we get enough good frames
    
    for attempt in range(max_attempts):
        time.sleep(0.10)  # Faster capture - 100ms between frames
        
        with lock:
            if output_frame is None:
                continue
            frame = output_frame.copy()
        
        if dms_processor:
            faces = dms_processor.face_detector.detect(frame)
            if faces:
                face = max(faces, key=lambda f: f['confidence'])
                bbox = tuple(face['bbox'].tolist())
                landmarks = face['landmarks']
                
                progress = robust_verifier.add_frame(
                    landmarks, bbox, frame.shape, frame, driver_id
                )
                
                frames_captured = progress.get('frames_captured', 0)
                good_frames = progress.get('good_frames', 0)
                
                # Stop if we have enough good frames OR reached max frames
                if good_frames >= 5 or frames_captured >= num_frames:
                    break
    
    # Get final result
    result = robust_verifier.get_final_result(driver_id)
    return jsonify(result)


@app.route('/faceid/debug', methods=['GET'])
def faceid_debug():
    """Debug endpoint to test face detection and embedding extraction"""
    try:
        import face_recognition
        DLIB_OK = True
    except ImportError:
        DLIB_OK = False
    
    with lock:
        if output_frame is None:
            return jsonify({'error': 'No frame available'}), 500
        frame = output_frame.copy()
    
    results = {
        'dlib_available': DLIB_OK,
        'yunet_detection': None,
        'dlib_detection': None,
        'embedding_extraction': None,
        'enrolled_drivers': faceid_service.get_enrolled_drivers()
    }
    
    # Test YuNet detection
    yunet_faces = dms_processor.face_detector.detect(frame)
    results['yunet_detection'] = {
        'count': len(yunet_faces),
        'faces': [{'bbox': f['bbox'].tolist() if hasattr(f['bbox'], 'tolist') else list(f['bbox']), 
                   'confidence': float(f['confidence'])} for f in yunet_faces]
    }
    
    # Test dlib detection
    if DLIB_OK:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        dlib_locs = face_recognition.face_locations(rgb_frame, model="hog")
        results['dlib_detection'] = {
            'count': len(dlib_locs),
            'locations': list(dlib_locs)  # (top, right, bottom, left)
        }
    else:
        dlib_locs = []
        results['dlib_detection'] = {'error': 'dlib not available'}
    
    # Test embedding extraction
    if yunet_faces:
        bbox = tuple(yunet_faces[0]['bbox'])
        landmarks = yunet_faces[0]['landmarks']
        
        # Try with YuNet bbox
        emb_yunet = faceid_service.extract_embedding_dlib(frame, bbox)
        results['embedding_extraction'] = {
            'with_yunet_bbox': emb_yunet is not None,
            'embedding_dim': len(emb_yunet) if emb_yunet is not None else 0
        }
        
        # Try with dlib detection only
        emb_dlib = faceid_service.extract_embedding_dlib(frame, bbox=None)
        results['embedding_extraction']['with_dlib_detection'] = emb_dlib is not None
        
    elif dlib_locs:
        # Use dlib detection
        emb_dlib = faceid_service.extract_embedding_dlib(frame, bbox=None)
        results['embedding_extraction'] = {
            'with_yunet_bbox': False,
            'with_dlib_detection': emb_dlib is not None,
            'embedding_dim': len(emb_dlib) if emb_dlib is not None else 0
        }
    else:
        results['embedding_extraction'] = {
            'error': 'No face detected by either method'
        }
    
    return jsonify(results)


# ============== Main ==============

if __name__ == '__main__':
    print("=" * 60)
    print("      DMS Web Server - Vehicle Bench Deployment")
    print("=" * 60)
    
    if not init_camera():
        print("ERROR: Cannot initialize camera")
        exit(1)
    
    print("\nCamera initialized: 1280x720")
    
    # Start processing thread
    thread = threading.Thread(target=process_frames, daemon=True)
    thread.start()
    
    print("\n" + "=" * 60)
    print("  Server running at:")
    print("  - Local:   http://localhost:5000")
    print("  - Network: http://<YOUR_IP>:5000")
    print("=" * 60)
    print("\nFor external access, use ngrok:")
    print("  ngrok http 5000")
    print("\nPress Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
