# 🤖 AI Recommendations - Guide d'implémentation

## 📋 Vue d'ensemble

Le système de recommandations AI de GAIA analyse les données personnelles de l'utilisateur (âge, taille, poids) et les moyennes de ses métriques de santé pour générer des recommandations personnalisées en matière de santé, fitness et lifestyle.

## 🔄 Flow complet

```
1. User entre age/height/weight → Exercises Page (UserInfoPopup)
   └─> Stocké dans localStorage via userDataUtils.js

2. User clique "Test Data" → Health Check Page
   └─> Génère 10 échantillons de données santé
   └─> Stocké dans sessionStorage (dataHistory)

3. User clique "AI Recommendations" → Health Check Page
   └─> Navigation vers AIRecommendations page avec dataHistory

4. AIRecommendations calcule les moyennes des métriques
   └─> heartBeat, tension, temperature, fatigue, cough, ambiance

5. User clique "Generate AI Recommendations"
   └─> Envoie données au backend Flask (ou fallback simulation)
   └─> Backend utilise Google Gemini AI
   └─> Affiche recommandations sous forme de bullet points
```

## 📁 Fichiers modifiés/créés

### Frontend (React)

#### Nouveaux composants
- `src/pages/AIRecommendations.jsx` - Page principale des recommandations
- `src/pages/AIRecommendations.css` - Styles de la page
- `src/utils/userDataUtils.js` - Utilitaires pour gérer les données utilisateur

#### Composants modifiés
- `src/pages/Exercises.jsx` - Affiche popup UserInfoPopup au premier accès
- `src/pages/HealthCheck.jsx` - Bouton "AI Recommendations" ajouté
- `src/App.jsx` - Route ajoutée pour 'aiRecommendations'

#### Composants existants utilisés
- `src/components/UserInfoPopup.jsx` - Formulaire âge/taille/poids
- `src/components/UserInfoPopup.css` - Styles du formulaire

### Backend (Python)

- `backend/recommandations.py` - Module principal de génération AI
- `backend/server.py` - Serveur Flask API
- `backend/requirements.txt` - Dépendances Python
- `backend/README.md` - Documentation backend
- `backend/test_recommendations.py` - Script de test
- `backend/.env.example` - Template configuration API key
- `backend/.gitignore` - Fichiers à ignorer

## 🎯 Fonctionnalités implémentées

### 1. Collecte des données personnelles
- **Où** : Première visite de la page Exercises
- **Comment** : Popup automatique (UserInfoPopup)
- **Stockage** : localStorage ('gaia:userInfo')
- **Validation** : 
  - Age: 1-120 ans
  - Height: 100-250 cm
  - Weight: 20-150 kg

### 2. Collecte des données de santé
- **Où** : Health Check → Test Data
- **Comment** : Génère 10 échantillons aléatoires/seconde
- **Stockage** : sessionStorage ('gaia:dataHistory')
- **Métriques** :
  - Heart Rate (60-100 bpm)
  - Blood Pressure (100-140 mmHg)
  - Temperature (35.5-37.5°C)
  - Fatigue (0-100%)
  - Cough (0-100%)
  - Ambient Noise (0-100 dB)

### 3. Calcul des moyennes
- **Où** : AIRecommendations page (useEffect)
- **Fonction** : `calculateAverages(data)`
- **Résultat** : Moyenne de toutes les métriques collectées

### 4. Génération des recommandations

#### Option A : Backend AI (Google Gemini)
```javascript
POST http://localhost:5000/api/recommendations
Body: {
  personal: { age, height, weight },
  healthAverages: { heartBeat, tension, ... }
}
```

#### Option B : Fallback simulation
- Active si backend non disponible
- Génère recommandations basées sur règles logiques
- Mock recommendations intelligentes

### 5. Affichage des recommandations
- **3 catégories** :
  - 🏥 Health Recommendations
  - 💪 Fitness Recommendations
  - 🌟 Lifestyle Recommendations
- **Format** : Bullet points avec animations
- **Design** : Cards avec hover effects, gradients

## 🚀 Pour lancer l'application complète

### Frontend (React)
```bash
cd Gaia
npm install
npm run dev
```
Accessible sur `http://localhost:5173`

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt

# Configurer API Key
# Créer .env avec: GOOGLE_API_KEY=your_key

python server.py
```
Accessible sur `http://localhost:5000`

## 🧪 Test rapide

### Test sans backend
1. Lancer uniquement le frontend
2. Aller dans Exercises → Remplir formulaire
3. Aller dans Health Check → Test Data (attendre quelques secondes)
4. Cliquer "AI Recommendations"
5. Cliquer "Generate AI Recommendations"
6. → Utilise les recommandations simulées

### Test avec backend
1. Lancer backend : `python server.py`
2. Lancer frontend : `npm run dev`
3. Même processus qu'au-dessus
4. → Utilise Google Gemini AI

## 📊 Structure des données

### User Info (localStorage)
```javascript
{
  age: 30,
  height: 175,
  weight: 70,
  timestamp: 1234567890,
  lastUpdated: "2025-10-21T10:30:00.000Z"
}
```

### Health History (sessionStorage)
```javascript
[
  {
    t: 1234567890,
    heartBeat: 72,
    tension: 115,
    temperature: 36.8,
    fatigue: 30,
    cough: 10,
    ambiance: 50
  },
  // ... more samples
]
```

### Health Averages (calculated)
```javascript
{
  heartBeat: 75,      // average of all samples
  tension: 118,
  temperature: 36.9,
  fatigue: 35,
  cough: 15,
  ambiance: 55
}
```

### AI Request Format
```javascript
{
  personal: {
    age: 30,
    height: 175,
    weight: 70
  },
  healthAverages: {
    heartBeat: 75,
    tension: 118,
    temperature: 36.9,
    fatigue: 35,
    cough: 15,
    ambiance: 55
  }
}
```

### AI Response Format
```javascript
{
  health: [
    "Your heart rate is in a healthy range...",
    "Consider reducing sodium intake..."
  ],
  fitness: [
    "Your BMI is in a healthy range...",
    "Mix moderate and vigorous exercise..."
  ],
  lifestyle: [
    "Stay hydrated: Aim for 8 glasses daily...",
    "Practice mindfulness for 10 minutes daily..."
  ]
}
```

## 🎨 Design Features

- **Gradient backgrounds** avec animations
- **Cards hover effects** avec transformations
- **Loading spinner** pendant génération
- **Error handling** avec messages clairs
- **Responsive design** adaptatif
- **Icons emoji** pour chaque métrique
- **Bullet points animés** au scroll

## 🔐 Sécurité

- ✅ Validation des inputs (frontend)
- ✅ CORS enabled (backend)
- ✅ .env pour API keys (non commité)
- ✅ Error handling sur tous les appels
- ✅ Fallback si backend indisponible

## 🔄 Prochaines étapes

1. **Authentification** : Sauvegarder données utilisateur en DB
2. **Historique** : Tracker évolution des recommandations
3. **Export PDF** : Permettre téléchargement des recommandations
4. **Notifications** : Alertes basées sur métriques critiques
5. **Multi-langue** : Support FR/EN
6. **Graphiques** : Visualisation des tendances

## 💡 Tips

- Les données Test Data doivent être générées AVANT de cliquer sur AI Recommendations
- Plus de données = recommandations plus précises (laisser tourner Test Data longtemps)
- Les données sont stockées en session → Persistent durant navigation
- Le backend peut être testé indépendamment avec `test_recommendations.py`

## 🐛 Troubleshooting

### "No personal information available"
→ Aller dans Exercises, le popup devrait apparaître automatiquement

### "No health data available"
→ Aller dans Health Check, cliquer "Test Data" et attendre

### "Failed to generate recommendations"
→ Backend non lancé → Utilisera les recommandations simulées

### Backend errors
→ Vérifier que l'API key Google est configurée dans .env
→ Vérifier que toutes les dépendances sont installées

## 📞 Support

Pour toute question sur l'implémentation, consulter :
- Frontend: `src/pages/AIRecommendations.jsx`
- Backend: `backend/recommandations.py`
- Utils: `src/utils/userDataUtils.js`
