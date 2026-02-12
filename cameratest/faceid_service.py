"""
FaceID Service - Face Recognition for Driver Verification
Uses dlib's deep learning face recognition (via face_recognition library).
Provides 99.38% accuracy on LFW benchmark with 128D embeddings.
"""
import cv2
import numpy as np
import json
import os
from collections import deque
import threading

# Try to import face_recognition (dlib-based deep learning)
try:
    import face_recognition
    DLIB_AVAILABLE = True
    print("[FaceID] ✓ face_recognition (dlib) loaded - using deep learning embeddings")
except ImportError:
    DLIB_AVAILABLE = False
    print("[FaceID] ⚠ face_recognition not available - falling back to LBP embeddings")


class FaceIDService:
    """
    Face recognition using dlib's deep learning model (via face_recognition library).
    Uses 128D face encodings from a ResNet trained on millions of faces.
    Achieves 99.38% accuracy on Labeled Faces in the Wild benchmark.
    Falls back to LBP if face_recognition is not available.
    """
    
    def __init__(self, storage_path=None):
        self.storage_path = storage_path or os.path.join(
            os.path.dirname(__file__), 'faceid_data.json'
        )
        self.enrolled_drivers = {}  # driver_id -> embedding (np.ndarray)
        
        # Use dlib's recommended threshold (distance-based)
        # 0.6 is typical, 0.5 is stricter (less false positives)
        # We use distance, not similarity: lower = more similar
        self.distance_threshold = 0.45  # Strict threshold for security
        
        # Legacy threshold for v2 embeddings (cosine similarity)
        self.recognition_threshold = 0.90
        
        self.enrollment_samples = 5  # Number of samples needed for enrollment
        self.temp_embeddings = []  # Temporary storage during enrollment
        self.lock = threading.Lock()
        
        # Embedding versions:
        # v1: 32D geometric only (obsolete)
        # v2: 288D geometric + LBP (obsolete)
        # v3: 128D dlib deep learning (current)
        self.embedding_version = 3 if DLIB_AVAILABLE else 2
        self.embedding_dim_v3 = 128
        self.embedding_dim_v2 = 288
        self.embedding_dim_v1 = 32
        
        # Load existing enrollments
        self._load_enrollments()
    
    def _load_enrollments(self):
        """Load enrolled drivers from storage"""
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                    enrolled = {}
                    for driver_id, payload in (data or {}).items():
                        # Backward compatible formats:
                        # - v1: { "driver": [..32 floats..] }
                        # - v2: { "driver": { "v": 2, "emb": [..288 floats..] } }
                        if isinstance(payload, dict) and "emb" in payload:
                            emb = np.array(payload["emb"], dtype=np.float32)
                        else:
                            emb = np.array(payload, dtype=np.float32)
                        enrolled[driver_id] = emb
                    self.enrolled_drivers = enrolled
                print(f"[FaceID] Loaded {len(self.enrolled_drivers)} enrolled drivers")
        except Exception as e:
            print(f"[FaceID] Error loading enrollments: {e}")
            self.enrolled_drivers = {}
    
    def _save_enrollments(self):
        """Save enrolled drivers to storage"""
        try:
            # Always save in v2 format (keeps backward compatibility in loader)
            data = {}
            for driver_id, emb in self.enrolled_drivers.items():
                data[driver_id] = {
                    "v": int(self.embedding_version),
                    "emb": np.asarray(emb, dtype=np.float32).tolist(),
                }
            with open(self.storage_path, 'w') as f:
                json.dump(data, f)
            print(f"[FaceID] Saved {len(self.enrolled_drivers)} enrollments")
        except Exception as e:
            print(f"[FaceID] Error saving enrollments: {e}")
    
    def _lbp_histogram(self, gray):
        """
        Compute a simple 8-neighbor LBP histogram (256 bins), normalized.
        This is lightweight and helps discriminate identities better than
        pure geometric landmark ratios.
        """
        if gray is None or gray.size == 0:
            return None

        img = gray.astype(np.uint8)
        if img.shape[0] < 3 or img.shape[1] < 3:
            return None

        c = img[1:-1, 1:-1]
        lbp = (
            ((img[:-2, :-2] >= c).astype(np.uint8) << 7) |
            ((img[:-2, 1:-1] >= c).astype(np.uint8) << 6) |
            ((img[:-2, 2:] >= c).astype(np.uint8) << 5) |
            ((img[1:-1, 2:] >= c).astype(np.uint8) << 4) |
            ((img[2:, 2:] >= c).astype(np.uint8) << 3) |
            ((img[2:, 1:-1] >= c).astype(np.uint8) << 2) |
            ((img[2:, :-2] >= c).astype(np.uint8) << 1) |
            ((img[1:-1, :-2] >= c).astype(np.uint8) << 0)
        )

        hist = np.bincount(lbp.reshape(-1), minlength=256).astype(np.float32)
        hist /= (hist.sum() + 1e-6)
        return hist

    def _extract_texture_embedding(self, frame_bgr, bbox):
        """Crop face ROI and compute LBP histogram embedding (256D)."""
        if frame_bgr is None or bbox is None:
            return None
        x, y, fw, fh = bbox
        if fw <= 0 or fh <= 0:
            return None

        h, w = frame_bgr.shape[:2]
        pad_x = int(fw * 0.20)
        pad_y = int(fh * 0.25)
        x0 = max(0, x - pad_x)
        y0 = max(0, y - pad_y)
        x1 = min(w, x + fw + pad_x)
        y1 = min(h, y + fh + pad_y)
        crop = frame_bgr[y0:y1, x0:x1]
        if crop.size < 1000:
            return None

        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (96, 96), interpolation=cv2.INTER_AREA)
        gray = cv2.equalizeHist(gray)
        return self._lbp_histogram(gray)

    def extract_embedding_dlib(self, frame_bgr, bbox=None, use_dlib_detection=False):
        """
        Extract 128D face embedding using dlib's deep learning model.
        This is the most accurate method (99.38% on LFW benchmark).
        
        Args:
            frame_bgr: BGR image from OpenCV
            bbox: Optional (x, y, w, h) bounding box to focus on specific face
            use_dlib_detection: If True, always use dlib's own face detection (more accurate)
            
        Returns:
            128D numpy array or None if no face found
        """
        if not DLIB_AVAILABLE:
            return None
            
        if frame_bgr is None:
            return None
        
        # Convert BGR to RGB (face_recognition uses RGB)
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        
        face_locations = None
        
        # If bbox provided and not forcing dlib detection, use it
        if bbox is not None and not use_dlib_detection:
            x, y, w, h = [int(v) for v in bbox]  # Ensure native int
            # Validate bbox
            img_h, img_w = rgb_frame.shape[:2]
            if x >= 0 and y >= 0 and w > 20 and h > 20 and x + w <= img_w and y + h <= img_h:
                # face_recognition uses (top, right, bottom, left) format
                face_locations = [(y, x + w, y + h, x)]
        
        # If no valid bbox or forcing dlib detection, use dlib's HOG detector
        if face_locations is None:
            face_locations = face_recognition.face_locations(rgb_frame, model="hog")
            # Only log if detection was needed (no bbox provided)
            # if face_locations:
            #     print(f"[FaceID] dlib HOG detected {len(face_locations)} face(s)")
            
        if not face_locations:
            return None
        
        # Get encoding for the first face (or the one specified by bbox)
        try:
            # FAST settings for real-time verification
            # num_jitters=1 is fastest, model="small" is faster
            encodings = face_recognition.face_encodings(
                rgb_frame, 
                known_face_locations=face_locations,
                num_jitters=1,   # Fast for real-time
                model="small"    # Faster model for verification
            )
            
            if encodings:
                return np.array(encodings[0], dtype=np.float32)
        except Exception as e:
            print(f"[FaceID] Error extracting dlib embedding: {e}")
            
        return None

    def face_distance(self, emb1, emb2):
        """
        Calculate euclidean distance between two embeddings.
        Lower distance = more similar faces.
        Threshold of 0.6 is typical, 0.5 is stricter.
        """
        if emb1 is None or emb2 is None:
            return float('inf')
        return np.linalg.norm(emb1 - emb2)

    def extract_embedding(self, landmarks, bbox, frame_shape, frame_bgr=None):
        """
        Extract a face embedding.
        v3: 128D dlib deep learning (preferred if available)
        v2: 32D geometric + 256D texture embedding (LBP) = 288D (fallback)
        v1: 32D geometric only (obsolete)
        """
        # Try dlib deep learning first (v3 - most accurate)
        if DLIB_AVAILABLE and frame_bgr is not None:
            dlib_emb = self.extract_embedding_dlib(frame_bgr, bbox)
            if dlib_emb is not None:
                return dlib_emb
        
        # Fallback to v2 geometric + LBP
        if not landmarks or not bbox:
            return None
        
        h, w = frame_shape[:2]
        x, y, fw, fh = bbox
        
        # Get landmark points
        points = {
            'right_eye': np.array(landmarks['right_eye']),
            'left_eye': np.array(landmarks['left_eye']),
            'nose': np.array(landmarks['nose']),
            'right_mouth': np.array(landmarks['right_mouth']),
            'left_mouth': np.array(landmarks['left_mouth'])
        }
        
        # Calculate center of face
        center = np.array([x + fw/2, y + fh/2])
        
        # Normalize points to face bounding box (0-1 range)
        normalized = {}
        for name, pt in points.items():
            normalized[name] = np.array([
                (pt[0] - x) / fw if fw > 0 else 0,
                (pt[1] - y) / fh if fh > 0 else 0
            ])
        
        # Build embedding from geometric features
        embedding = []
        
        # 1. Normalized landmark positions (10 values)
        for name in ['right_eye', 'left_eye', 'nose', 'right_mouth', 'left_mouth']:
            embedding.extend(normalized[name].tolist())
        
        # 2. Inter-eye distance
        eye_dist = np.linalg.norm(points['left_eye'] - points['right_eye']) / fw
        embedding.append(eye_dist)
        
        # 3. Eye-nose distances
        nose_to_left = np.linalg.norm(points['nose'] - points['left_eye']) / fw
        nose_to_right = np.linalg.norm(points['nose'] - points['right_eye']) / fw
        embedding.extend([nose_to_left, nose_to_right])
        
        # 4. Mouth width
        mouth_width = np.linalg.norm(points['left_mouth'] - points['right_mouth']) / fw
        embedding.append(mouth_width)
        
        # 5. Nose to mouth distance
        mouth_center = (points['left_mouth'] + points['right_mouth']) / 2
        nose_to_mouth = np.linalg.norm(mouth_center - points['nose']) / fh
        embedding.append(nose_to_mouth)
        
        # 6. Eye line angle
        eye_vector = points['left_eye'] - points['right_eye']
        eye_angle = np.arctan2(eye_vector[1], eye_vector[0])
        embedding.append(eye_angle)
        
        # 7. Nose position relative to eye line
        eye_center = (points['left_eye'] + points['right_eye']) / 2
        nose_offset = (points['nose'] - eye_center) / np.array([fw, fh])
        embedding.extend(nose_offset.tolist())
        
        # 8. Mouth center position relative to nose
        mouth_offset = (mouth_center - points['nose']) / np.array([fw, fh])
        embedding.extend(mouth_offset.tolist())
        
        # 9. Face aspect ratio
        aspect_ratio = fw / fh if fh > 0 else 1
        embedding.append(aspect_ratio)
        
        # 10. Additional geometric ratios
        # Eye to nose to mouth ratios
        eye_to_nose = np.linalg.norm(eye_center - points['nose'])
        nose_to_mouth_dist = np.linalg.norm(points['nose'] - mouth_center)
        ratio = eye_to_nose / (nose_to_mouth_dist + 0.001)
        embedding.append(ratio)
        
        # 11. Face symmetry features
        left_face = np.linalg.norm(points['left_eye'] - points['left_mouth'])
        right_face = np.linalg.norm(points['right_eye'] - points['right_mouth'])
        symmetry = left_face / (right_face + 0.001)
        embedding.append(symmetry)
        
        # Pad to 32 dimensions for consistency
        while len(embedding) < 32:
            embedding.append(0)
        
        geo = np.array(embedding[:32], dtype=np.float32)

        # Optional texture embedding (LBP histogram)
        tex = self._extract_texture_embedding(frame_bgr, bbox) if frame_bgr is not None else None
        if tex is None:
            # v1 fallback
            norm = np.linalg.norm(geo)
            if norm > 0:
                geo = geo / norm
            return geo

        combined = np.concatenate([geo, tex], axis=0).astype(np.float32)

        # Normalize to unit vector
        norm = np.linalg.norm(combined)
        if norm > 0:
            combined = combined / norm
        return combined
    
    def cosine_similarity(self, emb1, emb2):
        """Calculate cosine similarity between two embeddings"""
        if emb1 is None or emb2 is None:
            return 0.0
        
        dot = np.dot(emb1, emb2)
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot / (norm1 * norm2)
    
    def extract_embedding_for_enrollment(self, frame_bgr, bbox=None):
        """
        Extract embedding with higher quality settings for enrollment.
        Uses more jitters for better accuracy.
        """
        if not DLIB_AVAILABLE or frame_bgr is None:
            return None
        
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        
        face_locations = None
        if bbox is not None:
            x, y, w, h = [int(v) for v in bbox]
            img_h, img_w = rgb_frame.shape[:2]
            if x >= 0 and y >= 0 and w > 30 and h > 30 and x + w <= img_w and y + h <= img_h:
                face_locations = [(y, x + w, y + h, x)]
        
        if face_locations is None:
            face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        
        if not face_locations:
            return None
        
        try:
            # Higher quality for enrollment (but not too slow)
            encodings = face_recognition.face_encodings(
                rgb_frame,
                known_face_locations=face_locations,
                num_jitters=3,  # Good quality for enrollment
                model="large"   # Accurate model for enrollment
            )
            
            if encodings:
                print(f"[FaceID] ✓ Enrollment embedding extracted (high quality)")
                return np.array(encodings[0], dtype=np.float32)
        except Exception as e:
            print(f"[FaceID] Error in enrollment embedding: {e}")
        
        return None
    
    def start_enrollment(self):
        """Start the enrollment process"""
        with self.lock:
            self.temp_embeddings = []
        print("[FaceID] Starting enrollment...")
        return {'status': 'started', 'samples_needed': self.enrollment_samples}
    
    def add_enrollment_sample(self, landmarks, bbox, frame_shape, frame_bgr=None):
        """Add a face sample during enrollment"""
        # Use high-quality extraction for enrollment
        if DLIB_AVAILABLE and frame_bgr is not None:
            embedding = self.extract_embedding_for_enrollment(frame_bgr, bbox)
        else:
            embedding = self.extract_embedding(landmarks, bbox, frame_shape, frame_bgr=frame_bgr)
        
        if embedding is None:
            return {
                'status': 'error',
                'message': 'Could not extract face features',
                'samples_collected': len(self.temp_embeddings),
                'samples_needed': self.enrollment_samples
            }
        
        with self.lock:
            self.temp_embeddings.append(embedding)
            collected = len(self.temp_embeddings)
            print(f"[FaceID] Enrollment sample {collected}/{self.enrollment_samples} added")
        
        return {
            'status': 'sample_added',
            'samples_collected': collected,
            'samples_needed': self.enrollment_samples,
            'complete': collected >= self.enrollment_samples
        }
    
    def complete_enrollment(self, driver_id):
        """Complete enrollment and save the driver"""
        with self.lock:
            if len(self.temp_embeddings) < self.enrollment_samples:
                return {
                    'status': 'error',
                    'message': f'Need {self.enrollment_samples} samples, got {len(self.temp_embeddings)}'
                }
            
            # Average the embeddings for stability
            avg_embedding = np.mean(self.temp_embeddings, axis=0)
            
            # Normalize
            norm = np.linalg.norm(avg_embedding)
            if norm > 0:
                avg_embedding = avg_embedding / norm
            
            self.enrolled_drivers[driver_id] = avg_embedding
            self.temp_embeddings = []
            
            self._save_enrollments()
        
        return {
            'status': 'success',
            'driver_id': driver_id,
            'message': 'Driver enrolled successfully'
        }
    
    def cancel_enrollment(self):
        """Cancel ongoing enrollment"""
        with self.lock:
            self.temp_embeddings = []
        return {'status': 'cancelled'}
    
    def verify(self, landmarks, bbox, frame_shape, driver_id=None, frame_bgr=None):
        """
        Verify a face against enrolled drivers.
        If driver_id is provided, verify against specific driver.
        Otherwise, try to identify against all enrolled drivers.
        """
        embedding = self.extract_embedding(landmarks, bbox, frame_shape, frame_bgr=frame_bgr)
        
        if embedding is None:
            return {
                'status': 'error',
                'verified': False,
                'message': 'Could not extract face features'
            }
        
        with self.lock:
            if not self.enrolled_drivers:
                return {
                    'status': 'error',
                    'verified': False,
                    'message': 'No drivers enrolled'
                }
            
            if driver_id:
                # Verify against specific driver
                if driver_id not in self.enrolled_drivers:
                    return {
                        'status': 'error',
                        'verified': False,
                        'message': f'Driver {driver_id} not enrolled'
                    }
                
                enrolled_emb = self.enrolled_drivers[driver_id]
                emb_dim = getattr(embedding, "shape", (0,))[0]
                enrolled_dim = getattr(enrolled_emb, "shape", (0,))[0]
                
                if enrolled_dim != emb_dim:
                    return {
                        'status': 'error',
                        'verified': False,
                        'message': 'Driver enrolled with an older FaceID model. Please re-enroll.',
                        'driver_id': driver_id
                    }
                
                # Use distance for v3 (128D dlib), similarity for v2
                is_v3 = (emb_dim == self.embedding_dim_v3)
                
                if is_v3:
                    # Euclidean distance (lower = better match)
                    distance = self.face_distance(embedding, enrolled_emb)
                    verified = bool(distance <= self.distance_threshold)
                    # Convert distance to similarity-like score (0-1, higher = better)
                    similarity = max(0, 1 - distance)
                    return {
                        'status': 'success',
                        'verified': verified,
                        'similarity': float(similarity),
                        'distance': float(distance),
                        'threshold': float(self.distance_threshold),
                        'driver_id': driver_id,
                        'embedding_version': 3
                    }
                else:
                    # Cosine similarity for legacy embeddings
                    similarity = self.cosine_similarity(embedding, enrolled_emb)
                    return {
                        'status': 'success',
                        'verified': bool(similarity >= self.recognition_threshold),
                        'similarity': float(similarity),
                        'threshold': float(self.recognition_threshold),
                        'driver_id': driver_id,
                        'embedding_version': 2
                    }
            else:
                # Identify against all enrolled drivers
                best_match = None
                best_distance = float('inf')
                best_similarity = 0
                is_v3 = (getattr(embedding, "shape", (0,))[0] == self.embedding_dim_v3)
                
                for did, enrolled_emb in self.enrolled_drivers.items():
                    enrolled_dim = getattr(enrolled_emb, "shape", (0,))[0]
                    emb_dim = getattr(embedding, "shape", (0,))[0]
                    
                    if enrolled_dim != emb_dim:
                        # Skip incompatible embeddings
                        continue
                    
                    if is_v3:
                        distance = self.face_distance(embedding, enrolled_emb)
                        if distance < best_distance:
                            best_distance = distance
                            best_match = did
                    else:
                        similarity = self.cosine_similarity(embedding, enrolled_emb)
                        if similarity > best_similarity:
                            best_similarity = similarity
                            best_match = did
                
                if is_v3:
                    verified = bool(best_distance <= self.distance_threshold)
                    similarity_score = max(0, 1 - best_distance)
                    return {
                        'status': 'success',
                        'verified': verified,
                        'similarity': float(similarity_score),
                        'distance': float(best_distance),
                        'threshold': float(self.distance_threshold),
                        'driver_id': best_match if verified else None,
                        'message': 'Driver recognized' if verified else 'Driver not recognized',
                        'embedding_version': 3
                    }
                else:
                    verified = bool(best_similarity >= self.recognition_threshold)
                    return {
                        'status': 'success',
                        'verified': verified,
                        'similarity': float(best_similarity),
                        'threshold': float(self.recognition_threshold),
                        'driver_id': best_match if verified else None,
                        'message': 'Driver recognized' if verified else 'Driver not recognized',
                        'embedding_version': 2
                    }
    
    def delete_driver(self, driver_id):
        """Delete an enrolled driver"""
        with self.lock:
            if driver_id in self.enrolled_drivers:
                del self.enrolled_drivers[driver_id]
                self._save_enrollments()
                return {'status': 'success', 'message': f'Driver {driver_id} deleted'}
            return {'status': 'error', 'message': f'Driver {driver_id} not found'}
    
    def get_enrolled_drivers(self):
        """Get list of enrolled driver IDs"""
        with self.lock:
            return list(self.enrolled_drivers.keys())
    
    def is_enrolled(self, driver_id):
        """Check if a driver is enrolled"""
        with self.lock:
            return driver_id in self.enrolled_drivers
    
    def set_threshold(self, threshold):
        """Set recognition threshold (0.5 - 0.95)"""
        self.recognition_threshold = max(0.5, min(0.95, threshold))
        return {'threshold': float(self.recognition_threshold)}
    
    def check_image_quality(self, frame_bgr, bbox):
        """
        Check if the face image has good quality for recognition.
        Returns (is_good, quality_score, issues)
        """
        if frame_bgr is None or bbox is None:
            return False, 0, ['no_frame']
        
        x, y, fw, fh = bbox
        h, w = frame_bgr.shape[:2]
        
        issues = []
        score = 100
        
        # Check face size (minimum 80x80 pixels)
        if fw < 80 or fh < 80:
            issues.append('face_too_small')
            score -= 30
        
        # Check if face is too close to edges
        margin = 20
        if x < margin or y < margin or x + fw > w - margin or y + fh > h - margin:
            issues.append('face_near_edge')
            score -= 15
        
        # Extract face region
        x0 = max(0, x)
        y0 = max(0, y)
        x1 = min(w, x + fw)
        y1 = min(h, y + fh)
        face_crop = frame_bgr[y0:y1, x0:x1]
        
        if face_crop.size < 100:
            return False, 0, ['invalid_crop']
        
        # Check brightness
        gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        if brightness < 40:
            issues.append('too_dark')
            score -= 25
        elif brightness > 220:
            issues.append('too_bright')
            score -= 20
        
        # Check contrast (standard deviation)
        contrast = np.std(gray)
        if contrast < 20:
            issues.append('low_contrast')
            score -= 20
        
        # Check blur using Laplacian variance (relaxed threshold)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 30:  # Reduced from 50 - more permissive
            issues.append('blurry')
            score -= 20
        
        score = max(0, score)
        # Accept frame if score >= 50 (relaxed from 60)
        is_good = score >= 50 and 'face_too_small' not in issues
        
        return is_good, score, issues
    
    def verify_single_embedding(self, embedding, driver_id=None):
        """Verify a single embedding against enrolled drivers."""
        if embedding is None:
            return None, 0, None
        
        with self.lock:
            if not self.enrolled_drivers:
                return None, 0, None
            
            if driver_id and driver_id in self.enrolled_drivers:
                enrolled_emb = self.enrolled_drivers[driver_id]
                if getattr(enrolled_emb, "shape", (0,))[0] != getattr(embedding, "shape", (0,))[0]:
                    return None, 0, None
                similarity = self.cosine_similarity(embedding, enrolled_emb)
                return driver_id, similarity, None
            else:
                best_match = None
                best_similarity = 0
                all_similarities = {}
                
                for did, enrolled_emb in self.enrolled_drivers.items():
                    if getattr(enrolled_emb, "shape", (0,))[0] != getattr(embedding, "shape", (0,))[0]:
                        continue
                    similarity = self.cosine_similarity(embedding, enrolled_emb)
                    all_similarities[did] = similarity
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match = did
                
                return best_match, best_similarity, all_similarities


class RobustVerification:
    """
    Multi-frame robust verification system.
    Captures multiple frames, checks quality, and aggregates results.
    """
    
    def __init__(self, faceid_service, num_frames=12, min_good_frames=3):
        self.faceid = faceid_service
        self.num_frames = num_frames  # Total frames to capture
        self.min_good_frames = min_good_frames  # Minimum good quality frames needed
        self.frame_delay = 0.12  # Delay between frames (seconds)
        
        # Verification state
        self.is_running = False
        self.results = []
        self.quality_scores = []
        self.lock = threading.Lock()
    
    def start_verification(self):
        """Start a new robust verification session"""
        with self.lock:
            self.is_running = True
            self.results = []
            self.quality_scores = []
        return {
            'status': 'started',
            'num_frames': self.num_frames,
            'min_good_frames': self.min_good_frames
        }
    
    def add_frame(self, landmarks, bbox, frame_shape, frame_bgr, driver_id=None):
        """
        Add a frame to the verification session.
        Returns progress and intermediate results.
        """
        with self.lock:
            if not self.is_running:
                return {
                    'status': 'error',
                    'message': 'Verification not started'
                }
            
            current_frame = len(self.results) + 1
        
        # Check image quality
        is_good, quality_score, issues = self.faceid.check_image_quality(frame_bgr, bbox)
        
        result = {
            'frame': current_frame,
            'quality_good': is_good,
            'quality_score': quality_score,
            'quality_issues': issues
        }
        
        if is_good:
            # Extract embedding and verify
            embedding = self.faceid.extract_embedding(landmarks, bbox, frame_shape, frame_bgr=frame_bgr)
            if embedding is not None:
                match_id, similarity, all_sims = self.faceid.verify_single_embedding(embedding, driver_id)
                result['embedding_ok'] = True
                result['similarity'] = float(similarity) if similarity else 0
                result['matched_driver'] = match_id
            else:
                result['embedding_ok'] = False
                result['similarity'] = 0
                result['matched_driver'] = None
        else:
            result['embedding_ok'] = False
            result['similarity'] = 0
            result['matched_driver'] = None
        
        with self.lock:
            self.results.append(result)
            self.quality_scores.append(quality_score)
            
            frames_captured = len(self.results)
            good_frames = sum(1 for r in self.results if r['quality_good'] and r['embedding_ok'])
            
            # Check if we have enough good frames or reached max
            is_complete = frames_captured >= self.num_frames or good_frames >= self.min_good_frames
        
        return {
            'status': 'progress',
            'frames_captured': frames_captured,
            'frames_needed': self.num_frames,
            'good_frames': good_frames,
            'min_good_frames': self.min_good_frames,
            'current_quality': quality_score,
            'current_similarity': result.get('similarity', 0),
            'is_complete': is_complete,
            'frame_result': result
        }
    
    def get_final_result(self, driver_id=None):
        """
        Compute the final verification result from all captured frames.
        Uses weighted average based on quality scores.
        """
        with self.lock:
            if not self.results:
                return {
                    'status': 'error',
                    'verified': False,
                    'message': 'No frames captured'
                }
            
            self.is_running = False
            
            # Filter good frames with valid embeddings
            good_results = [r for r in self.results if r['quality_good'] and r['embedding_ok']]
            
            if len(good_results) < 2:
                # If we have at least 1 good frame with very high similarity, accept it
                if len(good_results) == 1 and good_results[0]['similarity'] >= 0.95:
                    r = good_results[0]
                    return {
                        'status': 'success',
                        'verified': True,
                        'driver_id': r['matched_driver'],
                        'similarity': float(r['similarity']),
                        'threshold': float(self.faceid.recognition_threshold),
                        'consistency': 1.0,
                        'frames_analyzed': len(self.results),
                        'good_frames': 1,
                        'confidence': 'high',
                        'message': 'Driver verified (single high-confidence frame)'
                    }
                return {
                    'status': 'error',
                    'verified': False,
                    'message': f'Not enough good frames ({len(good_results)}/2 minimum)',
                    'frames_analyzed': len(self.results),
                    'good_frames': len(good_results),
                    'quality_issues': self._summarize_issues()
                }
            
            # Compute weighted average similarity
            total_weight = 0
            weighted_similarity = 0
            driver_votes = {}
            
            for r in good_results:
                weight = r['quality_score'] / 100.0
                similarity = r['similarity']
                matched_driver = r['matched_driver']
                
                weighted_similarity += similarity * weight
                total_weight += weight
                
                if matched_driver:
                    if matched_driver not in driver_votes:
                        driver_votes[matched_driver] = {'count': 0, 'total_sim': 0}
                    driver_votes[matched_driver]['count'] += 1
                    driver_votes[matched_driver]['total_sim'] += similarity
            
            avg_similarity = weighted_similarity / total_weight if total_weight > 0 else 0
            
            # Find best matching driver by vote count and average similarity
            best_driver = None
            best_score = 0
            for did, data in driver_votes.items():
                # Score = vote count * average similarity
                score = data['count'] * (data['total_sim'] / data['count'])
                if score > best_score:
                    best_score = score
                    best_driver = did
            
            # Compute consistency (how many frames agreed on the same driver)
            consistency = 0
            if best_driver and len(good_results) > 0:
                matching_frames = sum(1 for r in good_results if r['matched_driver'] == best_driver)
                consistency = matching_frames / len(good_results)
            
            # Final decision - more permissive with high similarity
            threshold = self.faceid.recognition_threshold
            
            # Accept if:
            # - High similarity (>= 95%) with at least 2 good frames
            # - Or normal threshold with good consistency and 3+ frames
            verified = False
            if avg_similarity >= 0.95 and len(good_results) >= 2:
                verified = True  # Very high confidence match
            elif avg_similarity >= threshold and consistency >= 0.6 and len(good_results) >= 2:
                verified = True  # Normal confidence match
            
            return {
                'status': 'success',
                'verified': verified,
                'driver_id': best_driver if verified else None,
                'similarity': float(avg_similarity),
                'threshold': float(threshold),
                'consistency': float(consistency),
                'frames_analyzed': len(self.results),
                'good_frames': len(good_results),
                'confidence': 'high' if consistency >= 0.8 and avg_similarity >= 0.92 else 
                             'medium' if consistency >= 0.6 and avg_similarity >= 0.88 else 'low',
                'message': 'Driver verified with high confidence' if verified and consistency >= 0.8 else
                          'Driver verified' if verified else
                          'Driver not recognized'
            }
    
    def _summarize_issues(self):
        """Summarize quality issues from all frames"""
        issue_counts = {}
        for r in self.results:
            for issue in r.get('quality_issues', []):
                issue_counts[issue] = issue_counts.get(issue, 0) + 1
        return issue_counts
    
    def cancel(self):
        """Cancel ongoing verification"""
        with self.lock:
            self.is_running = False
            self.results = []
            self.quality_scores = []
        return {'status': 'cancelled'}


# Global instances
faceid_service = FaceIDService()
robust_verifier = RobustVerification(faceid_service)
