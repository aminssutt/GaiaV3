# 🔐 Explication complète du système FaceID - GAIA

## 📋 Vue d'ensemble

Le système FaceID de GAIA permet de **vérifier l'identité du conducteur** avant d'accéder au Health Check. Il utilise la **reconnaissance faciale** basée sur des **landmarks** (points caractéristiques du visage) détectés par YuNet.

---

## 🛠️ Technologies et frameworks utilisés

### 1. **Backend Python (Serveur DMS)**

#### Framework principal
- **Flask** (`flask`) : Serveur web HTTP pour exposer les endpoints FaceID
- **OpenCV** (`cv2`) : Traitement d'images et détection faciale

#### Bibliothèques de traitement
- **NumPy** (`numpy`) : Calculs mathématiques sur les embeddings
- **SciPy** (`scipy`) : Fonctions scientifiques (utilisé pour le signal processing DMS)
- **JSON** (built-in) : Stockage persistant des drivers enregistrés

#### Modèle de détection faciale
- **YuNet** (`face_detection_yunet.onnx`) : Modèle ONNX pour détecter les visages et extraire les landmarks
  - Format : ONNX (Open Neural Network Exchange)
  - Points détectés : 5 landmarks (yeux gauche/droit, nez, bouche gauche/droite)
  - Confiance minimale : 0.6 (60%)

### 2. **Frontend React (GAIA Dashboard)**

#### Services JavaScript
- **FaceIDService** (`src/services/faceIDService.js`) : Client HTTP pour communiquer avec le backend
- **Fetch API** (natif) : Requêtes HTTP vers `/faceid/*`

#### Composants React
- **FaceIDVerificationModal** : Modal de vérification (affiche caméra + statut)
- **FaceIDEnrollmentModal** : Modal d'enrollment (capture 5 échantillons)

---

## 🔄 Flux de fonctionnement détaillé

### **ÉTAPE 1 : Enrollment (Enregistrement du conducteur)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique "Enroll Face ID" dans MainPage      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend appelle: POST /faceid/enroll/start            │
│    → Backend initialise temp_embeddings = []               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend capture 5 échantillons (toutes les 800ms)    │
│    Pour chaque échantillon:                               │
│    → POST /faceid/enroll/sample                           │
│    → Backend détecte visage dans frame actuel              │
│    → Extrait landmarks (5 points)                          │
│    → Calcule embedding géométrique (32 dimensions)        │
│    → Ajoute à temp_embeddings[]                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend appelle: POST /faceid/enroll/complete         │
│    → Backend moyenne les 5 embeddings                     │
│    → Normalise le vecteur résultant                        │
│    → Sauvegarde dans enrolled_drivers[driver_id]           │
│    → Écrit dans faceid_data.json (persistance)             │
└─────────────────────────────────────────────────────────────┘
```

**Code clé - Extraction embedding** (`faceid_service.py:57-158`):
```python
def extract_embedding(self, landmarks, bbox, frame_shape):
    """
    Crée un vecteur de 32 dimensions basé sur:
    1. Positions normalisées des 5 landmarks (10 valeurs)
    2. Distance inter-yeux
    3. Distances œil-nez (2 valeurs)
    4. Largeur de la bouche
    5. Distance nez-bouche
    6. Angle de la ligne des yeux
    7. Position du nez relative aux yeux (2 valeurs)
    8. Position de la bouche relative au nez (2 valeurs)
    9. Ratio d'aspect du visage
    10. Ratio œil-nez-bouche
    11. Symétrie faciale
    → Total: 32 dimensions normalisées
    """
```

**Pourquoi 5 échantillons ?**
- Réduit le bruit (variations d'éclairage, expressions faciales)
- Moyenne = embedding plus stable et robuste
- Meilleure précision lors de la vérification

---

### **ÉTAPE 2 : Vérification (Accès Health Check)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique "Health Check" dans MainPage        │
│    → MainPage vérifie: isDriverEnrolled(driverId)        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Si enrolled → Ouvre FaceIDVerificationModal           │
│    → Affiche flux vidéo (/video_feed)                      │
│    → Auto-déclenche vérification après 1.5s                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend appelle: POST /faceid/verify                   │
│    Body: { "driver_id": "default_driver" }                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend (web_dms_server.py:502-529):                   │
│    a) Récupère frame actuel de la caméra                   │
│    b) Détecte visage avec YuNet                            │
│    c) Extrait landmarks                                     │
│    d) Appelle faceid_service.verify()                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. faceid_service.verify() (faceid_service.py:237-299):  │
│    a) Extrait embedding du visage actuel                   │
│    b) Récupère embedding enregistré (driver_id)            │
│    c) Calcule cosine similarity                             │
│    d) Compare avec threshold (0.75 = 75%)                   │
│    e) Retourne:                                            │
│       - verified: True/False                                │
│       - similarity: 0.0-1.0                                 │
│       - driver_id: identifié                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend reçoit résultat                                │
│    → Si verified=True:                                     │
│       • Affiche "Identity verified!"                        │
│       • Ferme modal après 1s                               │
│       • Navigue vers HealthCheck                            │
│    → Si verified=False:                                    │
│       • Affiche "Driver not recognized"                     │
│       • Retry automatique (max 5 tentatives)                │
└─────────────────────────────────────────────────────────────┘
```

**Code clé - Cosine Similarity** (`faceid_service.py:160-172`):
```python
def cosine_similarity(self, emb1, emb2):
    """
    Mesure la similarité entre 2 embeddings.
    Retourne une valeur entre -1 et 1:
    - 1.0 = identique
    - 0.0 = orthogonal (différent)
    - -1.0 = opposé
    
    Formule: dot(emb1, emb2) / (||emb1|| * ||emb2||)
    """
    dot = np.dot(emb1, emb2)
    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)
    return dot / (norm1 * norm2)
```

**Seuil de reconnaissance** (`recognition_threshold = 0.75`):
- **≥ 0.75** (75%) → Visage reconnu ✅
- **< 0.75** → Visage non reconnu ❌
- Ajustable via `POST /faceid/threshold`

---

## 📊 Structure des données

### **Embedding (Vecteur de caractéristiques)**
```python
embedding = np.array([
    # 10 valeurs: positions normalisées des 5 landmarks
    0.45, 0.32,  # right_eye (x, y)
    0.55, 0.32,  # left_eye
    0.50, 0.45,  # nose
    0.48, 0.58,  # right_mouth
    0.52, 0.58,  # left_mouth
    
    # 22 valeurs: distances, angles, ratios, symétrie...
    0.10,  # inter-eye distance
    0.15, 0.16,  # nose-to-eye distances
    # ... (total 32 dimensions)
], dtype=np.float32)

# Normalisé en vecteur unitaire (norme = 1.0)
embedding = embedding / ||embedding||
```

### **Stockage persistant** (`faceid_data.json`)
```json
{
  "default_driver": [
    0.45, 0.32, 0.55, 0.32, 0.50, 0.45, ...
  ],
  "driver_1": [
    0.42, 0.30, 0.58, 0.30, 0.48, 0.42, ...
  ]
}
```

---

## 🎯 Avantages de cette approche

### ✅ **Avantages**
1. **Pas de deep learning lourd** : Pas besoin de modèle pré-entraîné (FaceNet, ArcFace)
2. **Léger et rapide** : Calculs géométriques simples (pas de GPU)
3. **Robuste aux variations** : Normalisation par bbox réduit l'impact de la distance caméra
4. **Persistance simple** : JSON suffit (pas de base de données)
5. **Multi-drivers** : Supporte plusieurs conducteurs enregistrés

### ⚠️ **Limitations**
1. **Moins précis qu'un vrai modèle deep learning** : Peut confondre des visages similaires
2. **Sensible à l'angle** : Landmarks doivent être bien détectés (tête droite recommandée)
3. **Éclairage** : Variations importantes peuvent affecter la détection YuNet
4. **Pas de protection anti-spoofing** : Pas de détection de photo/vidéo (mais acceptable pour un usage véhicule)

---

## 🔧 Configuration et ajustements

### **Seuil de reconnaissance**
```python
# Dans faceid_service.py
self.recognition_threshold = 0.75  # 75%

# Ajuster via API:
POST /faceid/threshold
Body: { "threshold": 0.80 }  # Plus strict (80%)
```

### **Nombre d'échantillons d'enrollment**
```python
self.enrollment_samples = 5  # Par défaut

# Plus d'échantillons = plus robuste mais plus long
```

### **Fréquence de vérification (DMS)**
```python
# Dans web_dms_server.py (DMSProcessor)
self.faceid_verify_interval = 30  # Vérifie toutes les 30 frames

# Plus fréquent = plus réactif mais plus de calculs
```

---

## 🧪 Tests locaux

### **Script de test fourni**
```bash
cd cameratest
python test_faceid_local.py
```

Ce script teste:
1. ✅ Service FaceID direct (sans HTTP)
2. ✅ Accès caméra
3. ✅ Endpoints HTTP du serveur

### **Test manuel étape par étape**

1. **Lancer le serveur DMS**:
   ```bash
   cd cameratest
   python web_dms_server.py
   ```

2. **Ouvrir GAIA dans le navigateur**:
   ```
   http://localhost:5000
   ```

3. **Enrollment**:
   - MainPage → Profile → Enroll Face ID
   - Regarde la caméra, bouge légèrement la tête
   - Attends la barre de progression complète

4. **Vérification**:
   - MainPage → Health Check
   - Modal FaceID s'ouvre
   - Regarde la caméra
   - Devrait afficher "Identity verified!"

---

## 📝 Résumé technique

| Composant | Technologie | Rôle |
|-----------|------------|------|
| **Détection visage** | YuNet (ONNX) | Détecte visage + extrait 5 landmarks |
| **Extraction features** | Géométrie pure (NumPy) | Crée embedding 32D à partir des landmarks |
| **Stockage** | JSON | Persiste les embeddings des drivers |
| **Matching** | Cosine Similarity | Compare embedding actuel vs enregistré |
| **Seuil** | 0.75 (75%) | Détermine si visage reconnu |
| **Frontend** | React + Fetch API | Interface utilisateur + appels HTTP |
| **Backend** | Flask + OpenCV | Serveur HTTP + traitement images |

---

## 🚀 Prochaines améliorations possibles

1. **Deep Learning** : Remplacer par FaceNet/ArcFace pour meilleure précision
2. **Anti-spoofing** : Détecter photos/vidéos (liveness detection)
3. **Multi-caméras** : Support plusieurs angles de vue
4. **Temps réel continu** : Vérification continue pendant la conduite
5. **Base de données** : Remplacer JSON par SQLite/PostgreSQL pour production

---

**Version**: 1.0  
**Date**: Janvier 2025  
**Auteur**: GAIA Development Team
