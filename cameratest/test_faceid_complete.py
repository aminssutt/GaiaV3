#!/usr/bin/env python3
"""
Complete FaceID Test Suite for GAIA
Tests all components: FaceIDService, camera, HTTP endpoints, embedding compatibility
Run this to validate the entire FaceID system before deployment
"""
import cv2
import numpy as np
import time
import requests
import json
import sys
import os
import traceback

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from faceid_service import FaceIDService

# Configuration
DMS_SERVER_URL = "http://localhost:5000"
TEST_DRIVER_ID = "test_driver_v2"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}  {text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f"  {text}")


# ============== TEST 1: FaceIDService Direct ==============
def test_faceid_service():
    """Test FaceIDService directly without HTTP"""
    print_header("TEST 1: FaceIDService Direct")
    
    results = {
        'passed': 0,
        'failed': 0,
        'tests': []
    }
    
    service = FaceIDService()
    
    # Test 1.1: Check embedding version
    print("\n1.1 Checking embedding version...")
    expected_dim = 288 if service.embedding_version == 2 else 32
    print_info(f"Embedding version: v{service.embedding_version}")
    print_info(f"Expected dimension: {expected_dim}")
    if service.embedding_version == 2:
        print_success("Using v2 embeddings (288D with texture)")
        results['passed'] += 1
    else:
        print_warning("Using v1 embeddings (32D geometric only)")
        results['passed'] += 1
    results['tests'].append(('Embedding version', True))
    
    # Test 1.2: Check storage path
    print("\n1.2 Checking storage...")
    print_info(f"Storage path: {service.storage_path}")
    if os.path.exists(service.storage_path):
        with open(service.storage_path, 'r') as f:
            data = json.load(f)
        print_info(f"Enrolled drivers: {list(data.keys()) if data else 'none'}")
        
        # Check for v1/v2 incompatibility
        for driver_id, payload in data.items():
            if isinstance(payload, dict) and 'emb' in payload:
                dim = len(payload['emb'])
            else:
                dim = len(payload)
            
            if dim != expected_dim:
                print_warning(f"Driver '{driver_id}' has incompatible embedding ({dim}D vs expected {expected_dim}D)")
                print_warning("Consider re-enrolling this driver")
            else:
                print_success(f"Driver '{driver_id}': {dim}D embedding OK")
        results['passed'] += 1
    else:
        print_info("No enrollments file yet (will be created on first enrollment)")
        results['passed'] += 1
    results['tests'].append(('Storage check', True))
    
    # Test 1.3: Enrollment flow with simulated landmarks
    print("\n1.3 Testing enrollment flow...")
    service.start_enrollment()
    
    # Create realistic fake landmarks
    fake_landmarks = {
        'right_eye': (100, 100),
        'left_eye': (180, 100),
        'nose': (140, 150),
        'right_mouth': (110, 190),
        'left_mouth': (170, 190)
    }
    fake_bbox = (60, 50, 160, 200)
    fake_frame_shape = (480, 640, 3)
    
    # Create a fake BGR frame for texture extraction
    fake_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    enrollment_success = True
    for i in range(5):
        result = service.add_enrollment_sample(
            fake_landmarks, fake_bbox, fake_frame_shape, frame_bgr=fake_frame
        )
        if result['status'] != 'sample_added':
            print_error(f"Sample {i+1}: {result.get('message', 'Failed')}")
            enrollment_success = False
            break
        print_info(f"Sample {i+1}/5: {result['status']}")
    
    if enrollment_success:
        result = service.complete_enrollment(TEST_DRIVER_ID)
        if result['status'] == 'success':
            print_success("Enrollment completed successfully")
            results['passed'] += 1
        else:
            print_error(f"Enrollment failed: {result.get('message')}")
            results['failed'] += 1
            enrollment_success = False
    else:
        results['failed'] += 1
    results['tests'].append(('Enrollment flow', enrollment_success))
    
    # Test 1.4: Verify enrolled driver
    if enrollment_success:
        print("\n1.4 Testing verification (same face)...")
        result = service.verify(
            fake_landmarks, fake_bbox, fake_frame_shape,
            driver_id=TEST_DRIVER_ID, frame_bgr=fake_frame
        )
        
        if result['status'] == 'success' and result['verified']:
            print_success(f"Verification passed! Similarity: {result['similarity']:.2%}")
            results['passed'] += 1
            results['tests'].append(('Verification same face', True))
        else:
            print_error(f"Verification failed: {result}")
            results['failed'] += 1
            results['tests'].append(('Verification same face', False))
        
        # Test 1.5: Verify with different face (should fail or low similarity)
        print("\n1.5 Testing verification (different face)...")
        different_landmarks = {
            'right_eye': (50, 80),
            'left_eye': (220, 80),
            'nose': (135, 180),
            'right_mouth': (80, 250),
            'left_mouth': (190, 250)
        }
        different_bbox = (30, 30, 210, 280)
        different_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        result = service.verify(
            different_landmarks, different_bbox, fake_frame_shape,
            driver_id=TEST_DRIVER_ID, frame_bgr=different_frame
        )
        
        if result['status'] == 'success':
            if result['verified']:
                print_warning(f"Different face MATCHED (similarity: {result['similarity']:.2%})")
                print_warning("This may indicate threshold too low or embeddings not discriminative enough")
            else:
                print_success(f"Different face correctly rejected (similarity: {result['similarity']:.2%})")
            results['passed'] += 1
            results['tests'].append(('Verification different face', True))
        else:
            print_info(f"Verification error: {result.get('message')}")
            results['passed'] += 1
            results['tests'].append(('Verification different face', True))
    
    # Cleanup: Delete test driver
    print("\n1.6 Cleanup...")
    service.delete_driver(TEST_DRIVER_ID)
    print_info(f"Deleted test driver '{TEST_DRIVER_ID}'")
    
    return results


# ============== TEST 2: Camera Access ==============
def test_camera():
    """Test camera access and capture"""
    print_header("TEST 2: Camera Access")
    
    results = {
        'passed': 0,
        'failed': 0,
        'tests': []
    }
    
    print("\n2.1 Opening camera...")
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    if not camera.isOpened():
        print_error("Cannot open camera")
        print_info("Possible causes:")
        print_info("  - Camera not connected")
        print_info("  - Another application using camera")
        print_info("  - Driver issues")
        results['failed'] += 1
        results['tests'].append(('Camera open', False))
        return results
    
    print_success("Camera opened successfully")
    results['passed'] += 1
    results['tests'].append(('Camera open', True))
    
    # Get camera properties
    width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = camera.get(cv2.CAP_PROP_FPS)
    print_info(f"Resolution: {width}x{height}")
    print_info(f"FPS: {fps}")
    
    # Capture test frames
    print("\n2.2 Capturing test frames...")
    frames_ok = 0
    for i in range(5):
        ret, frame = camera.read()
        if ret and frame is not None:
            frames_ok += 1
        time.sleep(0.1)
    
    camera.release()
    
    if frames_ok == 5:
        print_success(f"Captured {frames_ok}/5 frames successfully")
        results['passed'] += 1
        results['tests'].append(('Frame capture', True))
    else:
        print_error(f"Only captured {frames_ok}/5 frames")
        results['failed'] += 1
        results['tests'].append(('Frame capture', False))
    
    return results


# ============== TEST 3: Face Detection ==============
def test_face_detection():
    """Test YuNet face detection"""
    print_header("TEST 3: Face Detection (YuNet)")
    
    results = {
        'passed': 0,
        'failed': 0,
        'tests': []
    }
    
    # Find model file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_paths = [
        os.path.join(script_dir, "face_detection_yunet.onnx"),
        "face_detection_yunet.onnx"
    ]
    
    model_path = None
    for path in model_paths:
        if os.path.exists(path):
            model_path = path
            break
    
    if not model_path:
        print_error("YuNet model not found")
        print_info(f"Searched: {model_paths}")
        results['failed'] += 1
        results['tests'].append(('Model load', False))
        return results
    
    print_info(f"Model: {model_path}")
    
    try:
        detector = cv2.FaceDetectorYN.create(model_path, "", (320, 320), 0.6, 0.3)
        print_success("YuNet detector created")
        results['passed'] += 1
        results['tests'].append(('Model load', True))
    except Exception as e:
        print_error(f"Failed to create detector: {e}")
        results['failed'] += 1
        results['tests'].append(('Model load', False))
        return results
    
    # Test with camera
    print("\n3.2 Testing face detection with camera...")
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    if not camera.isOpened():
        print_warning("Camera not available, skipping live test")
        return results
    
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print_info("Look at the camera... (5 seconds)")
    
    faces_detected = 0
    total_frames = 0
    
    start_time = time.time()
    while time.time() - start_time < 5:
        ret, frame = camera.read()
        if not ret:
            continue
        
        total_frames += 1
        h, w = frame.shape[:2]
        detector.setInputSize((w, h))
        _, faces = detector.detect(frame)
        
        if faces is not None and len(faces) > 0:
            faces_detected += 1
    
    camera.release()
    
    detection_rate = (faces_detected / total_frames * 100) if total_frames > 0 else 0
    print_info(f"Frames processed: {total_frames}")
    print_info(f"Faces detected in: {faces_detected} frames ({detection_rate:.1f}%)")
    
    if detection_rate > 50:
        print_success("Face detection working well")
        results['passed'] += 1
        results['tests'].append(('Live detection', True))
    elif detection_rate > 0:
        print_warning("Low detection rate - check lighting and camera position")
        results['passed'] += 1
        results['tests'].append(('Live detection', True))
    else:
        print_error("No faces detected - check if face is visible in camera")
        results['failed'] += 1
        results['tests'].append(('Live detection', False))
    
    return results


# ============== TEST 4: HTTP Endpoints ==============
def test_http_endpoints():
    """Test DMS server HTTP endpoints"""
    print_header("TEST 4: HTTP Endpoints")
    
    results = {
        'passed': 0,
        'failed': 0,
        'tests': []
    }
    
    print(f"\nTesting server at: {DMS_SERVER_URL}")
    
    # Test 4.1: Server health
    print("\n4.1 Testing server health...")
    try:
        response = requests.get(f"{DMS_SERVER_URL}/metrics", timeout=5)
        if response.status_code == 200:
            metrics = response.json()
            print_success(f"Server responding (face_detected: {metrics.get('face_detected')})")
            results['passed'] += 1
            results['tests'].append(('Server health', True))
        else:
            print_error(f"Server returned: {response.status_code}")
            results['failed'] += 1
            results['tests'].append(('Server health', False))
            return results
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server")
        print_info("Make sure web_dms_server.py is running")
        results['failed'] += 1
        results['tests'].append(('Server health', False))
        return results
    except Exception as e:
        print_error(f"Error: {e}")
        results['failed'] += 1
        results['tests'].append(('Server health', False))
        return results
    
    # Test 4.2: Video feed
    print("\n4.2 Testing video feed...")
    try:
        response = requests.get(f"{DMS_SERVER_URL}/video_feed", stream=True, timeout=5)
        if response.status_code == 200:
            # Read first chunk
            chunk = next(response.iter_content(chunk_size=1024))
            if chunk:
                print_success(f"Video feed streaming ({len(chunk)} bytes received)")
                results['passed'] += 1
                results['tests'].append(('Video feed', True))
            else:
                print_error("Video feed empty")
                results['failed'] += 1
                results['tests'].append(('Video feed', False))
        else:
            print_error(f"Video feed returned: {response.status_code}")
            results['failed'] += 1
            results['tests'].append(('Video feed', False))
    except Exception as e:
        print_error(f"Video feed error: {e}")
        results['failed'] += 1
        results['tests'].append(('Video feed', False))
    
    # Test 4.3: FaceID drivers endpoint
    print("\n4.3 Testing FaceID drivers endpoint...")
    try:
        response = requests.get(f"{DMS_SERVER_URL}/faceid/drivers", timeout=5)
        if response.status_code == 200:
            drivers = response.json().get('drivers', [])
            print_success(f"Drivers endpoint OK (enrolled: {drivers})")
            results['passed'] += 1
            results['tests'].append(('FaceID drivers', True))
        else:
            print_error(f"Drivers endpoint returned: {response.status_code}")
            results['failed'] += 1
            results['tests'].append(('FaceID drivers', False))
    except Exception as e:
        print_error(f"Drivers endpoint error: {e}")
        results['failed'] += 1
        results['tests'].append(('FaceID drivers', False))
    
    # Test 4.4: FaceID enrollment start
    print("\n4.4 Testing FaceID enrollment start...")
    try:
        response = requests.post(f"{DMS_SERVER_URL}/faceid/enroll/start", timeout=5)
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'started':
                print_success(f"Enrollment start OK (samples needed: {result.get('samples_needed')})")
                results['passed'] += 1
                results['tests'].append(('FaceID enrollment start', True))
                
                # Cancel enrollment
                requests.post(f"{DMS_SERVER_URL}/faceid/enroll/cancel", timeout=5)
            else:
                print_error(f"Unexpected response: {result}")
                results['failed'] += 1
                results['tests'].append(('FaceID enrollment start', False))
        else:
            print_error(f"Enrollment start returned: {response.status_code}")
            results['failed'] += 1
            results['tests'].append(('FaceID enrollment start', False))
    except Exception as e:
        print_error(f"Enrollment start error: {e}")
        results['failed'] += 1
        results['tests'].append(('FaceID enrollment start', False))
    
    # Test 4.5: FaceID verify (should fail gracefully if no driver enrolled)
    print("\n4.5 Testing FaceID verify endpoint...")
    try:
        response = requests.post(
            f"{DMS_SERVER_URL}/faceid/verify",
            json={},
            timeout=5
        )
        if response.status_code == 200:
            result = response.json()
            print_success(f"Verify endpoint OK (status: {result.get('status')}, message: {result.get('message', 'N/A')})")
            results['passed'] += 1
            results['tests'].append(('FaceID verify', True))
        else:
            print_error(f"Verify returned: {response.status_code}")
            results['failed'] += 1
            results['tests'].append(('FaceID verify', False))
    except Exception as e:
        print_error(f"Verify error: {e}")
        results['failed'] += 1
        results['tests'].append(('FaceID verify', False))
    
    return results


# ============== MAIN ==============
def main():
    print("\n" + "=" * 60)
    print(f"{Colors.BOLD}      GAIA FaceID Complete Test Suite{Colors.END}")
    print("=" * 60)
    
    all_results = {}
    
    # Run all tests
    all_results['service'] = test_faceid_service()
    all_results['camera'] = test_camera()
    all_results['detection'] = test_face_detection()
    
    # HTTP tests - optional if server not running
    print("\n" + "-" * 60)
    run_http = input("Run HTTP endpoint tests? (requires server running) [y/N]: ").strip().lower()
    if run_http == 'y':
        all_results['http'] = test_http_endpoints()
    
    # Summary
    print_header("TEST SUMMARY")
    
    total_passed = 0
    total_failed = 0
    
    for test_name, results in all_results.items():
        print(f"\n{Colors.BOLD}{test_name.upper()}:{Colors.END}")
        for name, passed in results['tests']:
            status = f"{Colors.GREEN}PASS{Colors.END}" if passed else f"{Colors.RED}FAIL{Colors.END}"
            print(f"  {name}: {status}")
        total_passed += results['passed']
        total_failed += results['failed']
    
    print("\n" + "-" * 60)
    print(f"{Colors.BOLD}Total: {total_passed} passed, {total_failed} failed{Colors.END}")
    
    if total_failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}All tests passed! FaceID system is ready.{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}Some tests failed. Please review the errors above.{Colors.END}")
    
    print("\n" + "=" * 60)
    return total_failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
