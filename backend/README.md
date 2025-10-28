# GAIA Backend - AI Recommendations API

## 📋 Description

Backend API Flask pour générer des recommandations de santé et fitness personnalisées en utilisant Google Gemini AI.

## 🚀 Installation

1. **Créer un environnement virtuel** (recommandé) :
```bash
python -m venv venv
```

2. **Activer l'environnement virtuel** :
- Windows PowerShell :
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- Windows CMD :
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- Linux/Mac :
  ```bash
  source venv/bin/activate
  ```

3. **Installer les dépendances** :
```bash
pip install -r requirements.txt
```

4. **Configurer l'API Key Google** :
- Créer un fichier `.env` à la racine du dossier backend
- Ajouter votre clé API :
  ```
  GOOGLE_API_KEY=votre_cle_api_ici
  ```
- Ou configurer la variable d'environnement système

## 🏃 Lancer le serveur

```bash
python server.py
```

Le serveur démarre sur `http://localhost:5000`

## 📡 Endpoints API

### POST `/api/recommendations`

Génère des recommandations personnalisées basées sur les données utilisateur.

**Request Body** :
```json
{
  "personal": {
    "age": 30,
    "height": 175,
    "weight": 70
  },
  "healthAverages": {
    "heartBeat": 75,
    "tension": 118,
    "temperature": 36.8,
    "fatigue": 45,
    "cough": 15,
    "ambiance": 55
  }
}
```

**Response** :
```json
{
  "success": true,
  "recommendations": "... AI generated text ...",
  "userProfile": {
    "age": 30,
    "height": 175,
    "weight": 70
  }
}
```

### GET `/api/health`

Health check endpoint.

**Response** :
```json
{
  "status": "healthy",
  "service": "GAIA AI Recommendations API"
}
```

## 🧪 Tester les recommandations

Vous pouvez tester le module recommandations directement :

```bash
python recommandations.py
```

## 🔗 Intégration avec le Frontend

Le frontend React envoie automatiquement les données collectées à cet API.

Pour connecter le frontend au backend :
1. Le serveur backend doit être lancé sur `http://localhost:5000`
2. Décommenter le code d'appel API dans `AIRecommendations.jsx` (ligne ~67-71)
3. Le frontend enverra automatiquement les requêtes

## 📝 Notes

- L'API utilise **Google Gemini 2.0 Flash** pour générer des recommandations
- Les recommandations sont générées en temps réel
- CORS est activé pour permettre les requêtes depuis le frontend React
- Le serveur est en mode debug pour le développement

## 🔧 Configuration

Modèle AI utilisé : `gemini-2.0-flash-exp`

Pour changer le modèle, modifiez `recommandations.py` ligne 51 :
```python
model="gemini-2.0-flash-exp"  # Changez ici
```

## 🛡️ Sécurité

⚠️ **IMPORTANT** : Ne committez jamais votre `.env` avec votre clé API !

Ajoutez `.env` dans `.gitignore` :
```
.env
venv/
__pycache__/
*.pyc
```
