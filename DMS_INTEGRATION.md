# DMS Integration Guide - Gaia

## Architecture

```
┌─────────────────┐     ngrok/localhost     ┌──────────────────┐
│   DMS Server    │◄───────────────────────►│      Gaia        │
│   (Python)      │      :5000              │   (React Web)    │
│                 │                         │                  │
│  - Camera       │  /video_feed (stream)   │  - DMSCamera     │
│  - YuNet Face   │  /metrics (JSON)        │  - Alerts        │
│  - Eye Analysis │  /reset (POST)          │  - UI            │
└─────────────────┘                         └──────────────────┘
         │                                           │
         │                                           │
    PC Camera                              Browser / Android App
```

## Quick Start

### 1. Start DMS Server (on PC with camera)

```bash
cd cameratest
pip install flask flask-cors opencv-python numpy scipy
python web_dms_server.py
```

Server runs at `http://localhost:5000`

### 2. For Remote Access (ngrok)

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 3. Run Gaia

```bash
cd Gaia
npm install
npm run dev
```

Open `http://localhost:5173` → Health Check → Click "📷 DMS Camera"

### 4. Configure Server URL

In Gaia's DMS panel, click ⚙️ and enter:
- **Local:** `http://localhost:5000`
- **Remote/Android:** `https://your-ngrok-url.ngrok.io`

## Features

### Eye Tracking
- **EAR (Eye Aspect Ratio):** Measures eye openness
- **Blink Detection:** Counts blinks per minute
- **PERCLOS:** Percentage of eye closure over time

### Drowsiness Detection
- Eyes closed > 2 seconds → **DANGER ALERT**
- PERCLOS > 30% → **WARNING**
- PERCLOS > 50% → **DANGER**

### Alerts
- 🔴 **Danger:** Full-screen red alert + voice warning
- 🟡 **Warning:** Toast notification
- ✅ **Normal:** Green status

## Android Deployment

### Option A: Gaia Web in WebView (Capacitor)
```bash
cd Gaia
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npm run build
npx cap sync
npx cap open android
```

### Option B: Use existing dms-app
```bash
cd cameratest/dms-app
npm install
npm run build
npx cap sync android
npx cap open android
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/video_feed` | GET | MJPEG video stream |
| `/metrics` | GET | JSON metrics |
| `/reset` | POST | Reset counters |

### Metrics Response
```json
{
  "face_detected": true,
  "eyes_open": true,
  "ear": 0.28,
  "blinks_total": 42,
  "blinks_per_min": 15,
  "perclos": 12.5,
  "pitch": -5.2,
  "yaw": 3.1,
  "roll": 1.8,
  "drowsy_alert": false
}
```

## Troubleshooting

### Camera not found
- Check if another app is using the camera
- Try changing camera index in `web_dms_server.py`

### CORS errors
- Make sure server has `CORS(app, resources={r"/*": {"origins": "*"}})`
- For ngrok, add header: `ngrok-skip-browser-warning: true`

### Model not found
- Ensure `face_detection_yunet.onnx` is in `cameratest/` folder
- Download from: https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet

## Files Structure

```
cameratest/
├── web_dms_server.py       # Main Flask server
├── dms_health_monitor.py   # Full DMS implementation
├── face_detection_yunet.onnx  # YuNet model
├── templates/
│   └── index.html          # Standalone web interface
└── dms-app/                # Capacitor app
    ├── src/App.tsx
    └── android/

Gaia/
├── src/
│   ├── services/
│   │   └── dmsService.js   # DMS API client
│   ├── components/
│   │   ├── DMSCamera.jsx   # DMS UI component
│   │   └── DMSCamera.css
│   └── pages/
│       └── HealthCheck.jsx # Integration point
```
