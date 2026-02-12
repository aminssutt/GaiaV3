# 🏗️ GAIA v3 - Architecture complète avec intégration mobile

## 📋 Vue d'ensemble

GAIA v3 est maintenant un **système distribué complet** qui collecte des données de santé réelles via une app mobile Android, les synchronise avec un backend Python Flask, et les affiche sur un dashboard véhicule interactif avec recommandations AI.

---

## 🔧 Composants du système

### 1. **GAIA Mobile (Android App)** 📱
- **Technologies**: Kotlin, Jetpack Compose, Room Database, WorkManager
- **Intégrations**:
  - Samsung Health SDK (heart rate, blood pressure, sleep, steps, stress, SpO2)
  - Google Fit API (fitness tracking, activity recognition)
  - Device sensors (accelerometer, gyroscope for fatigue detection)
- **Fonctionnalités**:
  - Collecte automatique de données de santé
  - Sync en temps réel ou périodique (toutes les 15 min / 1 heure)
  - Mode offline avec queue de synchronisation
  - Authentification JWT
  - Chiffrement AES-256

**Localisation**: `gaia-mobile/`

---

### 2. **Backend API (Flask Server)** 🖥️
- **Technologies**: Python 3.10+, Flask 3.0.0, Google Gemini AI
- **Endpoints**:
  - **`POST /api/recommendations`**: Génère recommandations AI (existing)
  - **`POST /api/sync-health`**: Reçoit données de l'app mobile (NEW)
  - **`GET /api/health/latest?userId=xxx`**: Récupère dernières données santé (NEW)
  - **`POST /api/auth/login`**: Authentification utilisateur (NEW)
  - **`GET /api/health`**: Health check

**Localisation**: `backend/`

**Stockage actuel**: In-memory dictionary (à remplacer par SQLite/PostgreSQL en production)

---

### 3. **Dashboard Véhicule (React Frontend)** 🚗
- **Technologies**: React 18, Vite, Three.js, React Three Fiber
- **Pages modifiées**:
  - **`HealthCheck.jsx`**: Affiche maintenant données réelles de l'app mobile
  - **`AIRecommendations.jsx`**: Utilise données complètes (steps, sleep, stress, SpO2) pour recommandations AI

**Localisation**: `Gaia/`

---

## 🔄 Flow de données complet

```
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: COLLECTE MOBILE (Samsung Health / Google Fit)           │
│  ├─ Heart Rate (continuous monitoring)                            │
│  ├─ Blood Pressure (manual + connected devices)                   │
│  ├─ Body Temperature (wearable sensors)                           │
│  ├─ Steps & Activity (daily tracking)                             │
│  ├─ Sleep Quality (duration, stages: deep/light/REM)              │
│  ├─ Oxygen Saturation (SpO2)                                      │
│  ├─ Stress Level (HRV analysis)                                   │
│  ├─ Fatigue Detection (activity + sleep correlation)              │
│  ├─ Respiratory Rate (breathing patterns)                         │
│  ├─ Hydration Levels (manual logging)                             │
│  └─ Calorie Intake (nutrition tracking)                           │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: AGRÉGATION MOBILE (HealthDataAggregator.kt)            │
│  ├─ Merge data from Samsung Health + Google Fit                   │
│  ├─ Calculate averages, trends                                    │
│  ├─ Detect anomalies (abnormal heart rate, BP spikes)             │
│  └─ Store in Room Database (local cache)                          │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: SYNCHRONISATION (SyncWorker - WorkManager)             │
│  ├─ Background sync (every 15 min / 1 hour)                       │
│  ├─ Manual sync (user-triggered)                                  │
│  ├─ Retry avec exponential backoff si échec                       │
│  └─ Offline queue (sync quand réseau disponible)                  │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: BACKEND API (Flask Server)                              │
│                                                                    │
│  POST /api/sync-health                                             │
│  ├─ Validate data structure                                       │
│  ├─ Store in health_data_store{} (in-memory)                      │
│  │   ✅ TODO: Replace with SQLite/PostgreSQL database             │
│  ├─ Cache in Redis (fast retrieval) - TODO                        │
│  └─ Return success response                                       │
│                                                                    │
│  GET /api/health/latest?userId=xxx                                │
│  ├─ Retrieve latest data from store                               │
│  ├─ Format for frontend (convert to expected structure)           │
│  └─ Return health metrics                                         │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: DASHBOARD VÉHICULE (React Frontend)                     │
│                                                                    │
│  HealthCheck.jsx                                                   │
│  ├─ useEffect: Fetch data every 30 seconds                        │
│  │   └─ GET /api/health/latest?userId={currentUserId}            │
│  ├─ Display real-time metrics:                                    │
│  │   ├─ Heart Rate (from mobile sync)                             │
│  │   ├─ Blood Pressure (from mobile sync)                         │
│  │   ├─ Temperature (from mobile sync)                            │
│  │   ├─ Fatigue (from mobile sync)                                │
│  │   ├─ Cough (from mobile sync)                                  │
│  │   └─ Ambient Noise (from mobile sync)                          │
│  ├─ 3D Avatar interaction (click body parts)                      │
│  └─ Navigate to AI Recommendations                                │
│                                                                    │
│  AIRecommendations.jsx                                             │
│  ├─ Load health averages (from mobile sync)                       │
│  ├─ Load user profile (age, height, weight, gender)               │
│  ├─ POST /api/recommendations                                     │
│  │   ├─ personal: {age, height, weight, gender}                   │
│  │   └─ healthAverages: {heartBeat, tension, ...}                 │
│  │       + EXTENDED DATA:                                          │
│  │       ├─ steps (daily activity)                                │
│  │       ├─ sleep quality (duration, stages)                      │
│  │       ├─ oxygenSaturation (SpO2)                               │
│  │       ├─ stressLevel (HRV)                                     │
│  │       └─ respiratoryRate                                       │
│  ├─ Display AI-generated recommendations:                         │
│  │   ├─ 🏥 Health Recommendations (gender-aware)                  │
│  │   ├─ 💪 Fitness Recommendations (activity-based)               │
│  │   └─ 🌟 Lifestyle Recommendations (sleep, stress)              │
│  └─ Edit Profile button (update UserInfoPopup)                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Données collectées et utilisation

### Métriques de base (déjà implémentées)
| Métrique | Source | Affichage | AI Recommendations |
|----------|--------|-----------|-------------------|
| Heart Rate | Mobile sync | HealthCheck ✅ | ✅ |
| Blood Pressure | Mobile sync | HealthCheck ✅ | ✅ |
| Temperature | Mobile sync | HealthCheck ✅ | ✅ |
| Fatigue | Mobile sync | HealthCheck ✅ | ✅ |
| Cough | Mobile sync | HealthCheck ✅ | ✅ |
| Ambient Noise | Mobile sync | HealthCheck ✅ | ✅ |

### Métriques étendues (nouvelles avec mobile app)
| Métrique | Source | Affichage | AI Recommendations |
|----------|--------|-----------|-------------------|
| Steps | Samsung Health / Google Fit | ⏳ TODO | ✅ ENHANCED |
| Sleep Duration | Samsung Health / Google Fit | ⏳ TODO | ✅ ENHANCED |
| Sleep Quality | Samsung Health | ⏳ TODO | ✅ ENHANCED |
| Oxygen Saturation | Wearable sensors | ⏳ TODO | ✅ ENHANCED |
| Stress Level | HRV (Samsung Health) | ⏳ TODO | ✅ ENHANCED |
| Respiratory Rate | Wearable sensors | ⏳ TODO | ✅ ENHANCED |
| Hydration | Manual input | ⏳ TODO | ⏳ TODO |
| Calorie Intake | Manual input | ⏳ TODO | ⏳ TODO |

---

## 🔐 Sécurité & Privacy

### Données en transit
- **HTTPS/TLS 1.3** pour toutes les communications
- **JWT Authentication** (à implémenter complètement)
- **Payload encryption** (AES-256)

### Données au repos
- **Mobile**: Room Database chiffrée (AES-256)
- **Backend**: In-memory (remplacer par database chiffrée en production)
- **Frontend**: localStorage (données non-sensibles), sessionStorage (temporaire)

### Permissions
- **Android**: Runtime permissions (Health Data, Location, Activity Recognition)
- **GDPR Compliance**: User consent, data export, right to deletion

---

## 🚀 Prochaines étapes d'implémentation

### ✅ COMPLÉTÉ
1. Backend endpoints créés:
   - `POST /api/sync-health`
   - `GET /api/health/latest?userId=xxx`
   - `POST /api/auth/login`
2. Documentation mobile app (README.md)
3. Configuration Android (build.gradle.kts, settings.gradle.kts)

### ⏳ TODO - Phase 1 (MVP Mobile)
1. **Implémenter Android app core**:
   - [ ] MainActivity.kt + DashboardFragment.kt
   - [ ] SamsungHealthManager.kt (collecte Heart Rate, BP, Sleep, Steps)
   - [ ] GoogleFitManager.kt (collecte fitness data)
   - [ ] HealthDataAggregator.kt (merge data sources)
   - [ ] Room Database (AppDatabase.kt, HealthDataDao.kt)
   - [ ] SyncWorker.kt (background sync avec WorkManager)
   - [ ] ApiService.kt + RetrofitClient.kt (networking)

2. **Modifier HealthCheck.jsx (Frontend)**:
   - [ ] Ajouter `useEffect` pour fetch data de l'API:
     ```javascript
     useEffect(() => {
       const fetchRealHealthData = async () => {
         const response = await fetch(`http://localhost:5000/api/health/latest?userId=${userId}`);
         const data = await response.json();
         if (data.success) {
           setHealthData(data.data);
         }
       };
       
       // Initial fetch
       fetchRealHealthData();
       
       // Poll every 30 seconds
       const interval = setInterval(fetchRealHealthData, 30000);
       return () => clearInterval(interval);
     }, [userId]);
     ```
   - [ ] Remplacer "Test Data" button par "Sync Mobile Data"
   - [ ] Afficher indicateur "Last synced: X minutes ago"

3. **Modifier AIRecommendations.jsx (Frontend)**:
   - [ ] Ajouter métriques étendues au payload `/api/recommendations`:
     ```javascript
     healthAverages: {
       heartBeat: 72,
       tension: 120,
       temperature: 36.8,
       fatigue: 30,
       cough: 5,
       ambiance: 45,
       // NEW from mobile sync:
       steps: 8543,
       sleepDuration: 7.5,
       sleepQuality: "good",
       oxygenSaturation: 98,
       stressLevel: 45,
       respiratoryRate: 16
     }
     ```

4. **Modifier recommandations.py (Backend)**:
   - [ ] Accepter métriques étendues dans le prompt:
     ```python
     # Add to prompt
     - Steps: {steps} (Normal: 7,000-10,000 steps/day)
     - Sleep Duration: {sleep_duration} hours (Normal: 7-9 hours)
     - Sleep Quality: {sleep_quality}
     - Oxygen Saturation: {oxygen_saturation}% (Normal: 95-100%)
     - Stress Level: {stress_level}% (Lower is better)
     - Respiratory Rate: {respiratory_rate} breaths/min (Normal: 12-20)
     ```

5. **Database persistante (Backend)**:
   - [ ] Remplacer `health_data_store = {}` par SQLite/PostgreSQL
   - [ ] Créer tables: `users`, `health_data`, `sync_history`
   - [ ] Implémenter user authentication (JWT complet)

### ⏳ TODO - Phase 2 (Enhanced Features)
- [ ] Wear OS companion app (smartwatch)
- [ ] Real-time sync via WebSocket
- [ ] Advanced analytics dashboard (trends, charts)
- [ ] Push notifications (health alerts)
- [ ] Doctor/caregiver sharing portal

### ⏳ TODO - Phase 3 (AI/ML)
- [ ] Predictive health alerts (ML models)
- [ ] Anomaly detection (abnormal patterns)
- [ ] Personalized recommendations (on-device ML)

---

## 🛠️ Comment tester localement

### 1. Backend (Flask Server)
```bash
cd backend
python server.py
```
Accessible sur `http://localhost:5000`

**Test sync endpoint**:
```bash
curl -X POST http://localhost:5000/api/sync-health \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "timestamp": 1700000000000,
    "healthData": {
      "heartRate": {"value": 72, "unit": "bpm", "timestamp": 1700000000000},
      "bloodPressure": {"systolic": 120, "diastolic": 80, "unit": "mmHg", "timestamp": 1700000000000},
      "temperature": {"value": 36.8, "unit": "celsius", "timestamp": 1700000000000},
      "fatigue": {"value": 30, "unit": "percent", "timestamp": 1700000000000},
      "cough": {"value": 5, "unit": "percent", "timestamp": 1700000000000},
      "ambiance": {"value": 45, "unit": "dB", "timestamp": 1700000000000},
      "steps": {"value": 8543, "timestamp": 1700000000000},
      "sleep": {"duration": 7.5, "quality": "good", "timestamp": 1699900000000},
      "oxygenSaturation": {"value": 98, "unit": "percent", "timestamp": 1700000000000},
      "stressLevel": {"value": 45, "unit": "percent", "timestamp": 1700000000000}
    }
  }'
```

**Test retrieve endpoint**:
```bash
curl http://localhost:5000/api/health/latest?userId=test_user_123
```

### 2. Frontend (React)
```bash
cd Gaia
npm run dev
```
Accessible sur `http://localhost:5173`

### 3. Mobile App (Android)
```bash
cd gaia-mobile
./gradlew build
# Open in Android Studio, run on emulator/device
```

---

## 📁 Structure complète du projet

```
GaiaV2/
├── backend/                      # Flask API Server
│   ├── recommandations.py        # Google Gemini AI integration
│   ├── server.py                 # API endpoints (✅ NEW mobile endpoints)
│   ├── requirements.txt
│   ├── test_recommendations.py
│   ├── README.md
│   └── .env                      # API keys (GOOGLE_API_KEY)
│
├── Gaia/                         # React Frontend (Vehicle Dashboard)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MainPage.jsx
│   │   │   ├── HealthCheck.jsx   # ⏳ TODO: Fetch from /api/health/latest
│   │   │   ├── AIRecommendations.jsx # ⏳ TODO: Send extended metrics
│   │   │   ├── Exercises.jsx
│   │   │   └── Accessories.jsx
│   │   ├── components/
│   │   │   ├── AvatarViewer.jsx
│   │   │   ├── HealthData.jsx
│   │   │   ├── UserInfoPopup.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── userDataUtils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── gaia-mobile/                  # Android Mobile App (NEW)
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/gaia/mobile/
│   │   │   │   │   ├── ui/              # ⏳ TODO
│   │   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   │   ├── DashboardFragment.kt
│   │   │   │   │   │   └── SettingsFragment.kt
│   │   │   │   │   ├── data/            # ⏳ TODO
│   │   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── local/
│   │   │   │   │   ├── network/         # ⏳ TODO
│   │   │   │   │   │   ├── ApiService.kt
│   │   │   │   │   │   └── RetrofitClient.kt
│   │   │   │   │   ├── workers/         # ⏳ TODO
│   │   │   │   │   │   └── SyncWorker.kt
│   │   │   │   │   └── health/          # ⏳ TODO
│   │   │   │   │       ├── SamsungHealthManager.kt
│   │   │   │   │       ├── GoogleFitManager.kt
│   │   │   │   │       └── HealthDataAggregator.kt
│   │   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts       # ✅ DONE
│   ├── settings.gradle.kts        # ✅ DONE
│   ├── local.properties.example   # ✅ DONE
│   └── README.md                  # ✅ DONE
│
├── AI_RECOMMENDATIONS_GUIDE.md
├── IMPLEMENTATION_SUMMARY.md
├── PRIOR_ART_ANALYSIS.md
├── PRIOR_ART_SUMMARY.md
└── MOBILE_INTEGRATION_ARCHITECTURE.md  # ✅ DONE (ce fichier)
```

---

## 🔗 API Documentation Summary

### Backend Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/recommendations` | Generate AI recommendations | ✅ Existing |
| GET | `/api/health` | Health check | ✅ Existing |
| POST | `/api/sync-health` | Sync mobile health data | ✅ NEW |
| GET | `/api/health/latest?userId=xxx` | Get latest health data | ✅ NEW |
| POST | `/api/auth/login` | User authentication | ✅ NEW |

### Frontend API Calls

| Component | API Call | Purpose | Status |
|-----------|----------|---------|--------|
| AIRecommendations.jsx | POST `/api/recommendations` | Get AI recommendations | ✅ Existing |
| HealthCheck.jsx | GET `/api/health/latest?userId=xxx` | Fetch real mobile data | ⏳ TODO |
| App.jsx | POST `/api/auth/login` | User login | ⏳ TODO |

---

## 📝 Notes importantes

### Données simulées vs réelles
- **Actuellement**: HealthCheck utilise "Test Data" button (random data generation)
- **Après mobile app**: HealthCheck fetch data de `/api/health/latest` (real data from Samsung Health/Google Fit)

### Storage temporaire
- **Backend**: In-memory dictionary `health_data_store = {}`
- **⚠️ Important**: Remplacer par database persistante (SQLite/PostgreSQL) avant production

### Authentification
- **Actuellement**: Mock JWT token
- **TODO**: Implémenter vrai système JWT avec database users, password hashing (bcrypt), token refresh

### GDPR Compliance
- **User consent**: Demander permission explicite avant collecte de données
- **Data export**: Permettre utilisateur de télécharger ses données
- **Right to deletion**: Implémenter endpoint `/api/user/delete-data`

---

## 🎯 Résumé

GAIA v3 est maintenant une **plateforme de santé complète** qui:

1. ✅ **Collecte** des données de santé réelles via app mobile Android (Samsung Health + Google Fit)
2. ✅ **Synchronise** ces données avec un backend Flask via API REST
3. ✅ **Affiche** les données en temps réel sur dashboard véhicule (React + Three.js)
4. ✅ **Génère** des recommandations AI personnalisées avec Google Gemini 2.0 (gender-aware)
5. ⏳ **TODO**: Implémenter mobile app Kotlin, modifier frontend pour fetch real data, database persistante

**Prochaine étape critique**: Implémenter l'app mobile Android (SamsungHealthManager.kt, SyncWorker.kt, ApiService.kt).

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Maintainer**: GAIA Development Team
