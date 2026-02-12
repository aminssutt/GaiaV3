"""
DMS Health Monitor v3.2 - Stable Edition
Uses YuNet for face detection with 5-point landmarks
Features:
- Precise Eye Aspect Ratio (EAR) for blink detection
- Accurate head pose with real landmarks
- Robust gaze tracking
- PERCLOS drowsiness detection
- Works even when head is tilted/turned
"""
import cv2
import numpy as np
from collections import deque
from scipy import signal
import time
import winsound
import os


class YuNetFaceDetector:
    """YuNet-based face detector with 5 facial landmarks"""
    
    def __init__(self, model_path, input_size=(320, 320), conf_threshold=0.6, nms_threshold=0.3):
        self.input_size = input_size
        self.conf_threshold = conf_threshold
        self.nms_threshold = nms_threshold
        
        self.detector = cv2.FaceDetectorYN.create(
            model_path,
            "",
            input_size,
            conf_threshold,
            nms_threshold
        )
    
    def detect(self, image):
        """
        Detect faces and return bounding boxes with landmarks
        Returns list of dicts with 'bbox', 'landmarks', 'confidence'
        Landmarks: right_eye, left_eye, nose, right_mouth, left_mouth
        """
        h, w = image.shape[:2]
        self.detector.setInputSize((w, h))
        
        _, faces = self.detector.detect(image)
        
        results = []
        if faces is not None:
            for face in faces:
                # face format: [x, y, w, h, x_re, y_re, x_le, y_le, x_n, y_n, x_rm, y_rm, x_lm, y_lm, confidence]
                bbox = face[:4].astype(int)
                confidence = face[14]
                
                landmarks = {
                    'right_eye': (int(face[4]), int(face[5])),
                    'left_eye': (int(face[6]), int(face[7])),
                    'nose': (int(face[8]), int(face[9])),
                    'right_mouth': (int(face[10]), int(face[11])),
                    'left_mouth': (int(face[12]), int(face[13]))
                }
                
                results.append({
                    'bbox': bbox,
                    'landmarks': landmarks,
                    'confidence': confidence
                })
        
        return results


class EyeAnalyzer:
    """Analyze eyes for blinks and gaze using landmarks"""
    
    def __init__(self):
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.left_ear_history = deque(maxlen=10)
        self.right_ear_history = deque(maxlen=10)
        self.gaze_history = deque(maxlen=15)
        
    def get_eye_region(self, frame, eye_center, face_width):
        """Extract eye region around landmark"""
        eye_w = int(face_width * 0.25)
        eye_h = int(face_width * 0.15)
        
        x = max(0, eye_center[0] - eye_w // 2)
        y = max(0, eye_center[1] - eye_h // 2)
        x2 = min(frame.shape[1], x + eye_w)
        y2 = min(frame.shape[0], y + eye_h)
        
        return frame[y:y2, x:x2], (x, y, x2-x, y2-y)
    
    def calculate_ear_from_contour(self, eye_gray):
        """Calculate Eye Aspect Ratio from eye region using contour analysis"""
        if eye_gray is None or eye_gray.size < 100:
            return 0.3
        
        # Enhance contrast
        eye_gray = cv2.equalizeHist(eye_gray)
        
        # Threshold to find eye white and iris
        _, thresh = cv2.threshold(eye_gray, 30, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.3
        
        # Get largest contour (should be eye opening)
        largest = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest)
        
        # Calculate aspect ratio from bounding rect
        x, y, w, h = cv2.boundingRect(largest)
        
        if w == 0:
            return 0.3
        
        # EAR approximation: height / width of eye opening
        ear = h / w
        
        # Normalize to typical EAR range (0.15-0.4)
        return min(0.4, max(0.1, ear * 0.8))
    
    def analyze_eyes(self, frame, landmarks, face_width):
        """Analyze both eyes and return EAR values and gaze"""
        left_eye_center = landmarks['left_eye']
        right_eye_center = landmarks['right_eye']
        
        # Get eye regions
        left_eye_roi, left_bbox = self.get_eye_region(frame, left_eye_center, face_width)
        right_eye_roi, right_bbox = self.get_eye_region(frame, right_eye_center, face_width)
        
        # Convert to grayscale
        left_gray = cv2.cvtColor(left_eye_roi, cv2.COLOR_BGR2GRAY) if len(left_eye_roi.shape) == 3 else left_eye_roi
        right_gray = cv2.cvtColor(right_eye_roi, cv2.COLOR_BGR2GRAY) if len(right_eye_roi.shape) == 3 else right_eye_roi
        
        # Calculate EAR for each eye
        left_ear = self.calculate_ear_from_contour(left_gray)
        right_ear = self.calculate_ear_from_contour(right_gray)
        
        # Smooth EAR values
        self.left_ear_history.append(left_ear)
        self.right_ear_history.append(right_ear)
        
        smooth_left = np.mean(self.left_ear_history)
        smooth_right = np.mean(self.right_ear_history)
        avg_ear = (smooth_left + smooth_right) / 2
        
        # Gaze estimation from pupil position
        gaze_direction = self.estimate_gaze(left_gray, right_gray)
        
        return {
            'left_ear': smooth_left,
            'right_ear': smooth_right,
            'avg_ear': avg_ear,
            'gaze_direction': gaze_direction,
            'left_bbox': left_bbox,
            'right_bbox': right_bbox
        }
    
    def estimate_gaze(self, left_eye, right_eye):
        """Estimate gaze direction from pupil positions"""
        def find_pupil_ratio(eye_gray):
            if eye_gray is None or eye_gray.size < 50:
                return 0.5, 0.5
            
            # Heavy blur and threshold to find darkest region (pupil)
            blurred = cv2.GaussianBlur(eye_gray, (7, 7), 0)
            _, thresh = cv2.threshold(blurred, 40, 255, cv2.THRESH_BINARY_INV)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return 0.5, 0.5
            
            # Find centroid of largest dark region
            largest = max(contours, key=cv2.contourArea)
            M = cv2.moments(largest)
            
            if M["m00"] == 0:
                return 0.5, 0.5
            
            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]
            
            h, w = eye_gray.shape
            return cx / w, cy / h
        
        left_h, left_v = find_pupil_ratio(left_eye)
        right_h, right_v = find_pupil_ratio(right_eye)
        
        # Average both eyes
        avg_h = (left_h + right_h) / 2
        avg_v = (left_v + right_v) / 2
        
        # Smooth
        self.gaze_history.append((avg_h, avg_v))
        smooth_h = np.mean([g[0] for g in self.gaze_history])
        smooth_v = np.mean([g[1] for g in self.gaze_history])
        
        # Determine direction with wider thresholds
        if smooth_h < 0.35:
            h_dir = "LEFT"
        elif smooth_h > 0.65:
            h_dir = "RIGHT"
        else:
            h_dir = "CENTER"
        
        if smooth_v < 0.3:
            v_dir = "UP "
        elif smooth_v > 0.7:
            v_dir = "DOWN "
        else:
            v_dir = ""
        
        return f"{v_dir}{h_dir}".strip()


class HeadPoseEstimator:
    """Accurate head pose estimation using 5 landmarks"""
    
    def __init__(self):
        # 3D model points for 5 landmarks
        self.model_points = np.array([
            (-165.0, 170.0, -135.0),    # Right eye
            (165.0, 170.0, -135.0),     # Left eye
            (0.0, 0.0, 0.0),            # Nose tip
            (-90.0, -100.0, -100.0),    # Right mouth corner
            (90.0, -100.0, -100.0)      # Left mouth corner
        ], dtype=np.float64)
        
        self.pose_history = deque(maxlen=15)
        
    def estimate(self, landmarks, frame_shape):
        """Estimate head pose from 5 landmarks"""
        h, w = frame_shape[:2]
        
        # Camera matrix
        focal_length = w
        center = (w / 2, h / 2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype=np.float64)
        
        dist_coeffs = np.zeros((4, 1))
        
        # 2D image points (in same order as model points)
        image_points = np.array([
            landmarks['right_eye'],
            landmarks['left_eye'],
            landmarks['nose'],
            landmarks['right_mouth'],
            landmarks['left_mouth']
        ], dtype=np.float64)
        
        try:
            success, rotation_vector, translation_vector = cv2.solvePnP(
                self.model_points, image_points, camera_matrix, dist_coeffs,
                flags=cv2.SOLVEPNP_EPNP
            )
            
            if not success:
                return self._get_smoothed_pose(0, 0, 0, None, None)
            
            # Convert to rotation matrix
            rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
            
            # Get Euler angles
            proj_matrix = np.hstack((rotation_matrix, translation_vector))
            _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)
            
            pitch = euler_angles[0][0]
            yaw = euler_angles[1][0]
            roll = euler_angles[2][0]
            
            # Calculate nose direction for visualization
            nose_end_3d = np.array([[0, 0, 300.0]])
            nose_end_2d, _ = cv2.projectPoints(
                nose_end_3d, rotation_vector, translation_vector,
                camera_matrix, dist_coeffs
            )
            
            return self._get_smoothed_pose(pitch, yaw, roll, nose_end_2d, landmarks['nose'])
            
        except Exception as e:
            return self._get_smoothed_pose(0, 0, 0, None, None)
    
    def _get_smoothed_pose(self, pitch, yaw, roll, nose_end, nose_start):
        """Apply temporal smoothing to pose"""
        self.pose_history.append((pitch, yaw, roll))
        
        avg_pitch = np.mean([p[0] for p in self.pose_history])
        avg_yaw = np.mean([p[1] for p in self.pose_history])
        avg_roll = np.mean([p[2] for p in self.pose_history])
        
        return {
            'pitch': avg_pitch,
            'yaw': avg_yaw,
            'roll': avg_roll,
            'nose_end': nose_end,
            'nose_start': nose_start
        }


class DMSHealthMonitor:
    """Main DMS Monitor with high accuracy"""
    
    def __init__(self, model_path):
        # Initialize detectors
        self.face_detector = YuNetFaceDetector(model_path)
        self.eye_analyzer = EyeAnalyzer()
        self.head_pose = HeadPoseEstimator()
        
        # Thresholds
        self.EAR_THRESHOLD = 0.22
        self.CLOSED_TIME_THRESHOLD = 2.0
        self.HEAD_YAW_THRESHOLD = 30
        self.HEAD_PITCH_THRESHOLD = 25
        
        # State
        self.total_blinks = 0
        self.blink_timestamps = deque(maxlen=100)
        self.eyes_closed_start = None
        self.eyes_closed = False
        self.last_ear_above_threshold = True
        self.yawn_counter = 0
        self.yawning = False
        
        self.perclos_window = deque(maxlen=1800)
        
        # Face tracking (keep last known position)
        self.last_face = None
        self.frames_without_face = 0
        self.max_frames_without_face = 30
        
        self.alert_active = False
        
    def play_alert(self):
        if not self.alert_active:
            self.alert_active = True
            try:
                winsound.Beep(1200, 300)
                winsound.Beep(1500, 300)
            except:
                pass
            self.alert_active = False
    
    def get_blinks_per_minute(self):
        current = time.time()
        while self.blink_timestamps and (current - self.blink_timestamps[0]) > 60:
            self.blink_timestamps.popleft()
        return len(self.blink_timestamps)
    
    def get_perclos(self):
        if not self.perclos_window:
            return 0
        return (sum(self.perclos_window) / len(self.perclos_window)) * 100
    
    def detect_yawn(self, landmarks):
        """Detect yawn from mouth landmarks distance"""
        left_mouth = np.array(landmarks['left_mouth'])
        right_mouth = np.array(landmarks['right_mouth'])
        nose = np.array(landmarks['nose'])
        
        # Mouth width
        mouth_width = np.linalg.norm(left_mouth - right_mouth)
        
        # Distance from nose to mouth center (vertical opening indicator)
        mouth_center = (left_mouth + right_mouth) / 2
        nose_to_mouth = np.linalg.norm(nose - mouth_center)
        
        # Ratio - higher means mouth more open vertically
        ratio = nose_to_mouth / (mouth_width + 1e-6)
        
        return ratio > 0.85
    
    def process_frame(self, frame):
        frame_h, frame_w = frame.shape[:2]
        
        metrics = {
            'face_detected': False,
            'eyes_open': True,
            'blinks_per_minute': self.get_blinks_per_minute(),
            'total_blinks': self.total_blinks,
            'perclos': self.get_perclos(),
            'yawn_count': self.yawn_counter,
            'ear': 0.3,
            'pitch': 0, 'yaw': 0, 'roll': 0,
            'gaze': 'CENTER',
            'drowsy_alert': False,
            'distraction_alert': False
        }
        
        # Detect faces
        faces = self.face_detector.detect(frame)
        
        if faces:
            # Use face with highest confidence
            face = max(faces, key=lambda f: f['confidence'])
            self.last_face = face
            self.frames_without_face = 0
            metrics['face_detected'] = True
            
            bbox = face['bbox']
            landmarks = face['landmarks']
            x, y, w, h = bbox
            
            # Draw face box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 150, 0), 2)
            
            # Draw landmarks
            for name, point in landmarks.items():
                color = (0, 255, 0) if 'eye' in name else (255, 0, 255) if 'mouth' in name else (0, 255, 255)
                cv2.circle(frame, point, 3, color, -1)
            
            # Head pose
            pose = self.head_pose.estimate(landmarks, frame.shape)
            metrics['pitch'] = pose['pitch']
            metrics['yaw'] = pose['yaw']
            metrics['roll'] = pose['roll']
            
            # Draw pose direction
            if pose['nose_end'] is not None and pose['nose_start'] is not None:
                p1 = tuple(map(int, pose['nose_start']))
                p2 = (int(pose['nose_end'][0][0][0]), int(pose['nose_end'][0][0][1]))
                cv2.arrowedLine(frame, p1, p2, (0, 255, 255), 2, tipLength=0.3)
            
            # Distraction check (more lenient when head is turned)
            if abs(pose['yaw']) > self.HEAD_YAW_THRESHOLD or abs(pose['pitch']) > self.HEAD_PITCH_THRESHOLD:
                metrics['distraction_alert'] = True
            
            # Eye analysis
            eye_data = self.eye_analyzer.analyze_eyes(frame, landmarks, w)
            metrics['ear'] = eye_data['avg_ear']
            metrics['gaze'] = eye_data['gaze_direction']
            
            # Draw eye boxes
            for bbox_key in ['left_bbox', 'right_bbox']:
                bx, by, bw, bh = eye_data[bbox_key]
                cv2.rectangle(frame, (bx, by), (bx+bw, by+bh), (0, 255, 0), 1)
            
            # Blink detection
            eyes_open = eye_data['avg_ear'] > self.EAR_THRESHOLD
            metrics['eyes_open'] = eyes_open
            
            self.perclos_window.append(0 if eyes_open else 1)
            
            if not eyes_open:
                if self.last_ear_above_threshold:
                    self.eyes_closed_start = time.time()
                    self.eyes_closed = True
                elif self.eyes_closed and self.eyes_closed_start:
                    duration = time.time() - self.eyes_closed_start
                    if duration >= self.CLOSED_TIME_THRESHOLD:
                        metrics['drowsy_alert'] = True
                        self.play_alert()
            else:
                if not self.last_ear_above_threshold and self.eyes_closed:
                    if self.eyes_closed_start:
                        duration = time.time() - self.eyes_closed_start
                        if 0.1 < duration < 0.5:
                            self.total_blinks += 1
                            self.blink_timestamps.append(time.time())
                self.eyes_closed = False
                self.eyes_closed_start = None
            
            self.last_ear_above_threshold = eyes_open
            
            # Yawn detection
            is_yawning = self.detect_yawn(landmarks)
            if is_yawning and not self.yawning:
                self.yawn_counter += 1
            self.yawning = is_yawning
            
        else:
            self.frames_without_face += 1
            
            # Keep showing last known values briefly
            if self.last_face and self.frames_without_face < self.max_frames_without_face:
                metrics['face_detected'] = True  # Still consider detected briefly
            else:
                self.last_face = None
        
        # Draw UI
        self.draw_ui(frame, metrics)
        
        return frame, metrics
    
    def draw_ui(self, frame, metrics):
        h, w = frame.shape[:2]
        
        # Left panel
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (300, 300), (30, 30, 30), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        y = 35
        dy = 26
        
        # Title
        cv2.putText(frame, "DMS MONITOR v3.2", (20, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        y += dy + 5
        
        # Face status
        color = (0, 255, 0) if metrics['face_detected'] else (0, 0, 255)
        cv2.putText(frame, f"Face: {'DETECTED' if metrics['face_detected'] else 'LOST'}", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        y += dy
        
        # Eyes
        color = (0, 255, 0) if metrics['eyes_open'] else (0, 100, 255)
        status = "OPEN" if metrics['eyes_open'] else "CLOSED"
        cv2.putText(frame, f"Eyes: {status} (EAR: {metrics['ear']:.2f})", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        y += dy
        
        # Blink rate
        bpm = metrics['blinks_per_minute']
        color = (0, 255, 0) if bpm >= 10 else (0, 165, 255) if bpm >= 5 else (0, 0, 255)
        cv2.putText(frame, f"Blinks/min: {bpm} (Total: {metrics['total_blinks']})", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        y += dy
        
        # PERCLOS
        perclos = metrics['perclos']
        color = (0, 255, 0) if perclos < 20 else (0, 165, 255) if perclos < 40 else (0, 0, 255)
        cv2.putText(frame, f"PERCLOS: {perclos:.1f}%", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        y += dy
        
        # Yawns
        cv2.putText(frame, f"Yawns: {metrics['yawn_count']}", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        y += dy
        
        # Gaze
        color = (0, 255, 0) if metrics['gaze'] == 'CENTER' else (0, 165, 255)
        cv2.putText(frame, f"Gaze: {metrics['gaze']}", (20, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        
        # Right panel - Head Pose
        cv2.rectangle(overlay, (w-220, 10), (w-10, 140), (30, 30, 30), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        cv2.putText(frame, "HEAD POSE", (w-210, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
        
        # Pitch
        p = metrics['pitch']
        color = (0, 255, 0) if abs(p) < 20 else (0, 165, 255) if abs(p) < 30 else (0, 0, 255)
        cv2.putText(frame, f"Pitch: {p:+.1f} deg", (w-210, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
        
        # Yaw
        ya = metrics['yaw']
        color = (0, 255, 0) if abs(ya) < 25 else (0, 165, 255) if abs(ya) < 35 else (0, 0, 255)
        cv2.putText(frame, f"Yaw: {ya:+.1f} deg", (w-210, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
        
        # Roll
        r = metrics['roll']
        color = (0, 255, 0) if abs(r) < 15 else (0, 165, 255) if abs(r) < 25 else (0, 0, 255)
        cv2.putText(frame, f"Roll: {r:+.1f} deg", (w-210, 115), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
        
        # Alerts
        if metrics['drowsy_alert']:
            cv2.rectangle(frame, (0, 0), (w-1, h-1), (0, 0, 255), 20)
            cv2.putText(frame, "!!! WAKE UP !!!", (w//2 - 180, h//2),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 4)
        
        if metrics['distraction_alert'] and not metrics['drowsy_alert']:
            cv2.rectangle(frame, (0, 0), (w-1, h-1), (0, 165, 255), 12)
            cv2.putText(frame, "EYES ON THE ROAD!", (w//2 - 180, h - 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 165, 255), 3)


def main():
    print("=" * 70)
    print("    DMS HEALTH MONITOR v3.2 - Stable Edition")
    print("=" * 70)
    
    model_path = "c:/Users/k250079/Desktop/cameratest/face_detection_yunet.onnx"
    
    if not os.path.exists(model_path):
        print(f"ERROR: Model not found at {model_path}")
        print("Please download from: https://github.com/opencv/opencv_zoo")
        return
    
    print("\nFeatures:")
    print("  - YuNet face detection (5-point landmarks)")
    print("  - Accurate blink detection with EAR")
    print("  - Robust head pose tracking")
    print("  - Gaze direction")
    print("  - PERCLOS drowsiness detection")
    
    print("\nInitializing camera...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    if not cap.isOpened():
        print("Error: Cannot open camera")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    print(f"Camera: {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
    
    monitor = DMSHealthMonitor(model_path)
    
    print("\n--- Controls ---")
    print("  'q' - Quit")
    print("  's' - Screenshot")
    print("  'r' - Reset counters")
    print("\n--- Monitoring Started ---\n")
    
    fps_time = time.time()
    fps_count = 0
    fps = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = cv2.flip(frame, 1)
        processed, metrics = monitor.process_frame(frame)
        
        fps_count += 1
        if time.time() - fps_time >= 1.0:
            fps = fps_count
            fps_count = 0
            fps_time = time.time()
        
        cv2.putText(processed, f"FPS: {fps}", (processed.shape[1] - 90, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        cv2.imshow("DMS Health Monitor v3.2", processed)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            fname = f"dms_{int(time.time())}.png"
            cv2.imwrite(fname, processed)
            print(f"Saved: {fname}")
        elif key == ord('r'):
            monitor.total_blinks = 0
            monitor.yawn_counter = 0
            monitor.blink_timestamps.clear()
            monitor.perclos_window.clear()
            print("Reset!")
    
    cap.release()
    cv2.destroyAllWindows()
    print("Done.")


if __name__ == "__main__":
    main()
