# Instructions de déploiement - Gaia

## 🚀 Déploiement sur GitHub Pages

Votre projet est maintenant optimisé pour le déploiement en ligne ! Voici comment procéder :

### Option 1: Déploiement automatique avec GitHub Actions (Recommandé)

1. **Pousser votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Configure deployment for GitHub Pages"
   git push origin main
   ```

2. **Activer GitHub Pages** :
   - Allez sur votre repository GitHub
   - Settings → Pages
   - Source: "GitHub Actions"
   - Le déploiement se fera automatiquement à chaque push sur main

3. **Votre site sera disponible à** :
   ```
   https://aminssutt.github.io/Gaia
   ```

### Option 2: Déploiement manuel

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Déployer manuellement** :
   ```bash
   npm run deploy
   ```

### Option 3: Déploiement manuel SANS GitHub Actions (branche gh-pages uniquement)

Si vous ne voulez pas utiliser GitHub Actions du tout et contrôler vous‑même le contenu publié :

1. Assurez-vous que votre branche principale est poussée :
   ```bash
   git checkout main
   git pull origin main
   ```
2. Installez les dépendances si ce n'est pas déjà fait :
   ```bash
   npm install
   ```
3. Construisez l'application (cela lancera aussi le script postbuild qui crée `404.html`) :
   ```bash
   npm run build
   ```
4. (Facultatif) Vérifiez le résultat localement :
   ```bash
   npm run preview
   ```
5. Publiez le dossier `dist` sur la branche `gh-pages` sans utiliser l'action :
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```
   Si `gh-pages` n'existe pas encore ou si vous rencontrez une erreur, utilisez :
   ```bash
   git push origin `git subtree split --prefix dist main`:gh-pages --force
   ```
6. Activez GitHub Pages (si pas encore fait) : Settings → Pages → Source = "gh-pages" → root.
7. Accédez à : `https://aminssutt.github.io/Gaia`

### Pourquoi une erreur 404 sur /src/main.jsx ?
Sur GitHub Pages (ou si vous ouvrez `index.html` directement depuis le système de fichiers), la balise :
```html
<script type="module" src="/src/main.jsx"></script>
```
cherche le fichier à la racine du domaine. En production Vite remplace ce chemin par des assets construits (ex: `/Gaia/assets/index-xxxxx.js`). Si vous voyez un 404 sur `/src/main.jsx`, c'est que vous visualisez soit :
- Le code source sans passer par le serveur de dev (`vite`), OU
- Un build qui n'a pas utilisé le bon `base`, OU
- Un fichier `index.html` copié sans son dossier `dist` complet.

Solution : toujours déployer le contenu du dossier `dist` généré par `npm run build` (ne pas déployer les fichiers sources directement).

### Fallback SPA (404.html)
GitHub Pages sert `404.html` pour les routes inconnues. Nous copions automatiquement `index.html` vers `404.html` (script `postbuild`) afin que la navigation côté client fonctionne pour les liens profonds.

### Résumé rapide (sans Actions)
```bash
npm install
npm run build
git push origin main
git subtree push --prefix dist origin gh-pages  # ou commande split alternative
```

> Après chaque modification de code : reconstruire (`npm run build`) puis repousser la nouvelle version du dossier `dist` via la même commande subtree.

### Option 4: Méthode `git worktree` (contourne l'erreur ENAMETOOLONG sous Windows)

Utilisez cette option si `npm run deploy` (gh-pages) échoue avec `spawn ENAMETOOLONG`.

1. Construire :
   ```bash
   npm run build
   ```
2. Déployer avec le script alternatif :
   ```bash
   npm run deploy:worktree
   ```
3. Configurer Pages : Source = `gh-pages` / root.

L'erreur `ENAMETOOLONG` provient de la commande git générée par le package `gh-pages` quand la longueur totale dépasse la limite sous Windows. La méthode worktree évite ce problème en utilisant un clone logique de la branche et un commit classique.

### Option 5: Dossier docs sur branche main (moins conseillé)

1. Ajouter un script qui construit vers `dist` puis copie vers `docs`.
2. Configurer Pages: Branch = `main`, dossier `/docs`.
3. Inconvénient: mélange code source et artefacts build dans la même branche.


## 🔧 Configurations ajoutées

### ✅ Vite Configuration
- **Base path** configuré pour GitHub Pages : `/Gaia/`
- **Build output** optimisé dans le dossier `dist`
- **Assets** correctement configurés

### ✅ Package.json
- **Homepage** : `https://aminssutt.github.io/Gaia`
- **Scripts de déploiement** : `predeploy` et `deploy`
- **gh-pages** ajouté aux devDependencies

### ✅ GitHub Actions
- **Workflow automatique** : `.github/workflows/deploy.yml`
- **Build et déploiement** automatiques sur chaque push
- **Node.js 18** avec cache npm pour des builds rapides

### ✅ Optimisations
- **`.nojekyll`** : Évite le traitement Jekyll par GitHub
- **Paths relatifs** : Tous les assets utilisent des chemins corrects

## 🌐 Plateformes supportées

Votre application fonctionnera parfaitement sur :
- **GitHub Pages** (configuration principale)
- **Netlify** (déployez le dossier `dist` après `npm run build`)
- **Vercel** (import direct du repository GitHub)
- **Surge.sh** (après build, `surge dist/`)

## 📱 Compatibilité

- ✅ **WebGL** : Navigateurs modernes supportés
- ✅ **Three.js** : Optimisé pour le web
- ✅ **Responsive** : Fonctionne sur desktop et mobile
- ✅ **HTTPS** : Compatible avec les domaines sécurisés

## 🔍 Vérifications post-déploiement

Une fois déployé, vérifiez que :
- [ ] Les modèles 3D se chargent correctement
- [ ] Les avatars masculin/féminin fonctionnent
- [ ] Les points interactifs sont cliquables
- [ ] Les vidéos d'exercices se lancent
- [ ] La navigation entre pages fonctionne
- [ ] Les popups de confirmation s'affichent

Votre application Gaia est prête pour le web ! 🎉