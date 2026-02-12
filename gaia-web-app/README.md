# GAIA Web App - Google Fit Integration

✅ **Application web pour synchroniser Google Fit avec le dashboard GAIA**

## 🚀 Comment ça marche

1. **L'utilisateur ouvre la page web** (même depuis son téléphone Android)
2. **Entre le code de pairing** du dashboard
3. **Se connecte avec Google** (OAuth)
4. **Clique sur "Sync"** → Les données Google Fit sont envoyées au dashboard

## 📋 Setup requis

### 1. Créer un projet Google Cloud

1. Va sur https://console.cloud.google.com
2. Crée un nouveau projet "GAIA Health Sync"
3. Active l'API **Google Fit API**
4. Crée des identifiants OAuth 2.0 :
   - Type : Application Web
   - Origines JavaScript autorisées : 
     - `http://localhost:3000`
     - `http://192.168.225.51:3000` (ton IP local)
   - URI de redirection autorisées : 
     - `http://localhost:3000`
     - `http://192.168.225.51:3000`

5. **Copie le Client ID** et remplace dans `app.js` :
   ```javascript
   const GOOGLE_CLIENT_ID = 'TON_CLIENT_ID_ICI';
   ```

### 2. Lancer l'application

```powershell
# Option A : Serveur simple avec Python
cd gaia-web-app
python -m http.server 3000

# Option B : Serveur simple avec Node.js
cd gaia-web-app
npx serve -p 3000
```

### 3. Ouvrir dans le navigateur

- Sur PC : http://localhost:3000
- Sur téléphone (même réseau WiFi) : http://192.168.225.51:3000

## 📱 Utilisation

### Étape 1 : Pairing
1. Ouvre le dashboard GAIA sur ton PC
2. Va dans "Connect Device"
3. Note le code à 6 caractères (ex: ABC123)
4. Entre ce code dans la web app

### Étape 2 : Google Sign-In
1. Clique sur "Sign in with Google"
2. Connecte-toi avec ton compte Google
3. **Autorise l'accès à Google Fit**

### Étape 3 : Sync
1. Clique sur "Sync Health Data to Dashboard"
2. Les données sont récupérées de Google Fit
3. Envoyées au dashboard GAIA
4. Affichées dans le dashboard

## 📊 Données disponibles

- ✅ **Heart Rate** (Fréquence cardiaque)
- ✅ **Steps** (Pas)
- ✅ **Calories** (Calories brûlées)
- ✅ **Distance** (Distance parcourue)
- ✅ **Stress Level** (Calculé à partir de la fréquence cardiaque)

⚠️ **Note** : Pour avoir ces données, il faut que Google Fit soit installé et actif sur ton téléphone Android avec les permissions nécessaires.

## 🔐 Sécurité

### En production, il faudrait :
1. **Backend proxy** : Ne jamais exposer les tokens Google côté client
2. **HTTPS** : Obligatoire pour OAuth en production
3. **Token refresh** : Gérer l'expiration des tokens
4. **Validation** : Vérifier les données avant envoi

### Architecture recommandée :
```
[Android Phone avec Google Fit]
         ↓ (sync auto)
   [Google Cloud]
         ↓ (OAuth)
   [Web App] ← utilisateur se connecte
         ↓ (envoie code)
   [Backend GAIA] ← échange code pour token
         ↓ (fetch data)
   [Google Fit API]
         ↓ (sync)
   [Dashboard GAIA]
```

## 🛠️ Améliorations possibles

1. **Ajouter plus de métriques** :
   - Sleep (sommeil)
   - Blood Pressure (si disponible dans Google Fit)
   - SpO2 (oxygénation)
   - Weight (poids)

2. **Sync automatique** :
   - Polling toutes les 5 minutes
   - WebSocket pour push temps réel

3. **Historique** :
   - Graphiques de tendances
   - Export des données

4. **Multi-utilisateurs** :
   - Plusieurs comptes Google
   - Partage familial

## 📝 Notes importantes

- **Google Fit doit être actif** sur le téléphone Android
- **Les données se synchronisent automatiquement** du téléphone vers Google Cloud
- **L'app web récupère les données depuis le cloud**, pas directement du téléphone
- **Fonctionne sur n'importe quel appareil** avec un navigateur web

## 🐛 Troubleshooting

### "No data available"
→ Vérifie que Google Fit est installé et a les permissions sur ton Android

### "OAuth error"
→ Vérifie que le Client ID est correct et les URLs autorisées

### "Connection error"
→ Vérifie que le backend Flask est démarré sur http://192.168.225.51:5000

### "Pairing failed"
→ Vérifie que le code du dashboard est correct et toujours valide

## ✅ Avantages de cette solution

- 🆓 **100% Gratuit**
- 📱 **Fonctionne sur n'importe quel appareil**
- 🔄 **Données réelles de Google Fit**
- ⚡ **Pas besoin d'installer d'app native**
- 🌐 **Accessible depuis n'importe où**
- 🔐 **Sécurisé avec OAuth Google**
