# GAIA Mobile - React Native App avec HealthKit

Application mobile React Native pour synchroniser les données de santé avec le dashboard GAIA.

## ✅ Ce qui a été fait

### 1. **Projet React Native créé**
- TypeScript activé par défaut
- Structure complète iOS + Android

### 2. **Services implémentés**

#### **HealthKitService.ts**
- Intégration HealthKit (iOS uniquement pour l'instant)
- Collecte des données:
  - ❤️ Heart Rate (Fréquence cardiaque)
  - 🚶 Steps (Pas)
  - 🩺 Blood Pressure (Pression artérielle)
  - 😴 Sleep (Sommeil)
  - 🫁 SpO2 (Saturation en oxygène)
  - 🧘 Stress (Calculé depuis le heart rate)

#### **ApiService.ts**
- Connexion au backend Flask
- Endpoints:
  - `POST /api/verify-pairing` - Vérification du code de pairing
  - `POST /api/sync-health` - Synchronisation des données
- Stockage local avec AsyncStorage

### 3. **UI complète**
- Écran de pairing avec code à 6 caractères
- Statut de connexion en temps réel
- Bouton de sync avec indicateur de chargement
- Affichage des dernières métriques collectées
- Design moderne avec Material Design

### 4. **Configuration iOS**
- Permissions HealthKit ajoutées dans Info.plist
- Packages installés: `react-native-health`, `axios`, `@react-native-async-storage`

---

## 🚀 Prochaines étapes (IMPORTANT!)

### **Étape 1: Installer les pods iOS**

```bash
cd ios
pod install
cd ..
```

### **Étape 2: Activer HealthKit dans Xcode**

1. Ouvrez le projet dans Xcode:
   ```bash
   open ios/GaiaMobile.xcworkspace
   ```

2. Sélectionnez le projet "GaiaMobile" dans le navigateur

3. Onglet "Signing & Capabilities"

4. Cliquez sur "+ Capability"

5. Recherchez et ajoutez "HealthKit"

6. Cochez "Clinical Health Records"

### **Étape 3: Modifier l'IP du backend**

Dans `src/services/ApiService.ts`, ligne 4:
```typescript
const API_URL = 'http://192.168.225.51:5000/api';
```
**Remplacez** par l'IP de votre PC (où tourne le serveur Flask)

### **Étape 4: Construire et installer sur iPhone**

1. Connectez votre iPhone en USB

2. Dans Xcode:
   - Sélectionnez votre iPhone comme cible
   - Product → Run (ou Cmd+R)

3. **Sur votre iPhone:**
   - Allez dans Réglages → Général → Gestion des périphériques
   - Faites confiance au certificat de développement

---

## 📱 Utilisation de l'app

### 1. **Sur le Dashboard (PC)**
- Allez sur la page "Connect Device"
- Notez le code de pairing à 6 caractères (ex: ABC123)

### 2. **Sur l'iPhone**
- Ouvrez l'app GAIA Mobile
- Entrez le code de pairing
- Appuyez sur "Connect"
- ✅ L'app se connecte au dashboard

### 3. **Autoriser HealthKit**
- iOS va demander les permissions
- **Accordez toutes les permissions** pour:
  - Fréquence cardiaque
  - Pas
  - Pression artérielle
  - Sommeil
  - Saturation en oxygène

### 4. **Synchroniser**
- Appuyez sur "📊 Sync Health Data"
- L'app collecte les données de l'app Santé
- Les données sont envoyées au dashboard
- ✅ Vérifiez sur le dashboard que les données apparaissent!

---

## 🔧 Commandes utiles

```bash
# Lancer Metro bundler
npm start

# Build iOS (depuis la racine)
npx react-native run-ios

# Build Android (plus tard)
npx react-native run-android

# Clean cache
npm start -- --reset-cache

# Clean iOS build
cd ios && rm -rf build && pod install && cd ..
```

---

## 🐛 Troubleshooting

### **"HealthKit not available"**
- HealthKit ne fonctionne QUE sur de vrais iPhones
- Le simulateur iOS ne supporte PAS HealthKit
- Vous DEVEZ tester sur un vrai iPhone physique

### **"Pairing Failed"**
- Vérifiez que le serveur Flask tourne (192.168.225.51:5000)
- Vérifiez que l'iPhone et le PC sont sur le même réseau Wi-Fi
- Vérifiez l'IP dans `src/services/ApiService.ts`

### **"No health data"**
- Ouvrez l'app Santé sur l'iPhone
- Vérifiez qu'il y a des données (utilisez une Apple Watch ou entrez manuellement)
- Réessayez le sync

### **Build errors**
```bash
# Clean et rebuild
cd ios
rm -rf build Pods
pod deintegrate
pod install
cd ..
npm start -- --reset-cache
```

---

## 📊 Structure du projet

```
GaiaMobile/
├── App.tsx                          # UI principale
├── src/
│   └── services/
│       ├── HealthKitService.ts      # Intégration HealthKit
│       └── ApiService.ts            # Communication backend
├── ios/                             # Projet iOS natif
│   └── GaiaMobile/
│       └── Info.plist               # Permissions HealthKit
├── android/                         # Projet Android (TODO)
└── package.json                     # Dépendances
```

---

## 🎯 Prochaines améliorations

- [ ] Sync automatique périodique
- [ ] Support Android avec Google Fit
- [ ] Notifications push
- [ ] Historique des syncs
- [ ] Mode offline

---

## ✅ Compatibilité

- **iOS:** 14.0+ (HealthKit)
- **Android:** API 29+ (Google Fit) - À implémenter
- **React Native:** 0.82.1
- **Node:** 16+

---

**Créé pour GAIA v3 POC** 🚗💓
