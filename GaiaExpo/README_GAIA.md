# GAIA Expo - Health Data Sync Mobile App

✅ **App Expo créée avec succès ! Accès complet aux données de santé via HealthKit.**

## 📱 Ce qui a été fait

### 1. **Projet Expo initialisé**
- Expo SDK 54.0.0
- TypeScript support
- iOS & Android ready

### 2. **Services de santé implémentés**
- **HealthKitService.ts** : Intégration complète d'expo-health
  - ✅ Heart Rate (Fréquence cardiaque)
  - ✅ Steps (Pas)
  - ✅ Blood Pressure (Tension artérielle)
  - ✅ Sleep Duration (Durée de sommeil)
  - ✅ Oxygen Saturation (SpO2)
  - ✅ Stress Level (Niveau de stress calculé)

- **ApiService.ts** : Communication avec le backend Flask
  - Pairing avec le dashboard
  - Synchronisation des données de santé
  - Stockage local avec AsyncStorage

### 3. **Interface utilisateur complète**
- Écran de pairing (code à 6 caractères)
- Bouton de synchronisation
- Affichage des métriques en temps réel
- Design moderne Material Design

### 4. **Configuration HealthKit**
- Permissions HealthKit ajoutées dans app.json
- Entitlements configurés
- Messages d'autorisation personnalisés

## 🚀 Comment construire et tester

### Option A : Build avec EAS (GRATUIT) - RECOMMANDÉ

1. **Installer EAS CLI**
```powershell
npm install -g eas-cli
```

2. **Se connecter à Expo**
```powershell
cd c:\Users\k250079\Desktop\Projects\GaiaV2\GaiaExpo
eas login
```

3. **Configurer le projet**
```powershell
eas build:configure
```

4. **Build iOS**
```powershell
eas build --platform ios --profile development
```

5. **Installer sur iPhone**
- L'app sera disponible via TestFlight ou direct download
- Scannez le QR code avec votre iPhone
- Téléchargez et installez l'IPA

### Option B : Test avec Expo Go (Limité pour HealthKit)

⚠️ **Note**: Expo Go ne supporte PAS HealthKit. Vous DEVEZ utiliser EAS Build pour tester les données de santé.

```powershell
cd c:\Users\k250079\Desktop\Projects\GaiaV2\GaiaExpo
npx expo start
```

## 📊 Données de santé accessibles

L'app utilise **expo-health** qui donne accès complet à HealthKit :

| Donnée | Type HealthKit | Description |
|--------|---------------|-------------|
| Heart Rate | HeartRate | Fréquence cardiaque (BPM) |
| Steps | StepCount | Nombre de pas |
| Blood Pressure | BloodPressure | Tension systolique/diastolique |
| Sleep | SleepAnalysis | Durée de sommeil (heures) |
| SpO2 | OxygenSaturation | Saturation en oxygène (%) |
| Stress | Calculé | Basé sur la fréquence cardiaque |

## 🔧 Dépannage

### "HealthKit is not available"
- ✅ Vous devez utiliser un **vrai iPhone** (pas le simulateur)
- ✅ L'app doit être **buildée avec EAS** (pas Expo Go)
- ✅ iOS 14+ requis

### "Permissions denied"
- Ouvrez **Réglages** → **Santé** → **Accès aux données** → **GAIA Mobile**
- Activez toutes les permissions

### "Pairing failed"
- Vérifiez que le backend Flask est démarré
- Vérifiez l'IP dans `src/services/ApiService.ts` (actuellement 192.168.225.51)
- Assurez-vous que l'iPhone et le PC sont sur le même réseau

## 📝 Structure du projet

```
GaiaExpo/
├── App.tsx                      # UI principale de l'app
├── app.json                     # Configuration Expo avec HealthKit
├── src/
│   └── services/
│       ├── HealthKitService.ts  # Intégration expo-health
│       └── ApiService.ts        # Communication backend
└── package.json                 # Dépendances
```

## 🎯 Prochaines étapes

1. **Build avec EAS** : `eas build --platform ios --profile development`
2. **Installer sur iPhone** via TestFlight ou direct download
3. **Autoriser HealthKit** lors du premier lancement
4. **Pairer avec dashboard** (code à 6 caractères)
5. **Synchroniser** les données de santé

## 💰 Coûts

- ✅ **Expo** : 100% GRATUIT
- ✅ **EAS Build** : GRATUIT pour développement (limitless builds)
- ✅ **expo-health** : Open source, GRATUIT
- ✅ **TestFlight** : GRATUIT (Apple Developer Program requis - $99/an pour production)

**Pour un POC/Test** : Tout est GRATUIT avec EAS development builds ! 🎉

## 🔐 Sécurité

- Données stockées localement avec AsyncStorage (crypté par iOS)
- Communication HTTPS recommandée pour la production
- Permissions HealthKit demandées explicitement à l'utilisateur

## 📱 Compatibilité

- iOS 14+
- iPhone avec HealthKit support
- Apple Watch data compatible
- Android support possible plus tard (Google Fit)

---

**✅ TOUTES les données de santé sont accessibles via expo-health !**
