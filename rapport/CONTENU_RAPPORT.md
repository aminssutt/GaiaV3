# Rapport de Stage - Développement d'un Assistant IA Embarqué

**Projet AIPA (AI Personal Assistant)**  
*Stage de fin d'études d'ingénieur - Renault Korea, Séoul*

---

## Introduction

### Contexte personnel et motivation

#### De VivaTech à la Corée du Sud

Mon parcours vers ce stage chez Renault Korea trouve son origine dans une découverte décisive : le salon VivaTech 2024 à Paris. En tant qu'étudiant ingénieur passionné par l'innovation technologique, j'ai été particulièrement marqué par la présence dynamique des startups sud-coréennes et l'écosystème d'innovation florissant qu'elles représentaient. Cette exposition m'a révélé un pays où la technologie n'est pas seulement un secteur économique, mais une culture à part entière.

Cette curiosité initiale s'est transformée en opportunité concrète lorsque j'ai réalisé un échange universitaire au KAIST (Korea Advanced Institute of Science and Technology) au semestre précédant ce stage. Durant ces mois d'immersion, j'ai pu observer de près l'excellence coréenne en matière d'innovation technologique, l'agilité des entreprises locales dans l'adoption de nouvelles technologies, et la synergie unique entre industrie automobile et technologies numériques. Cette expérience a confirmé mon intention de poursuivre mon développement professionnel dans ce pays.

#### Lien avec le projet professionnel

Ce stage s'inscrit dans une trajectoire professionnelle délibérée. Mon objectif est de compléter mon diplôme d'ingénieur par un **Master en Entrepreneuriat et Startups au KAIST**, afin de combiner expertise technique et compétences en création d'entreprise dans l'écosystème coréen. Ce stage chez Renault Korea représente une étape stratégique à plusieurs égards :

- **Acquisition d'une expérience industrielle internationale** dans un contexte interculturel franco-coréen
- **Développement de compétences en IA appliquée** sur un projet concret et déployable
- **Constitution d'un réseau professionnel** en Corée du Sud, essentiel pour un futur entrepreneurial
- **Validation de l'adéquation culturelle** avec l'environnement de travail coréen

L'opportunité de travailler sur un projet d'assistant IA embarqué conjugue parfaitement mes intérêts techniques (intelligence artificielle, développement full-stack) et mes ambitions entrepreneuriales (innovation produit, création de valeur utilisateur).

### Présentation de l'entreprise d'accueil

#### Renault Korea : une histoire unique dans l'automobile mondiale

Renault Korea représente un cas singulier dans l'industrie automobile mondiale, né de la convergence de deux géants : le groupe Samsung et Renault.

**Origines Samsung (1994-2000)** : En 1994, Lee Kun-hee, président du groupe Samsung, identifie l'industrie automobile comme le couronnement technologique permettant de fédérer les ressources du conglomérat. Samsung Motors est créée avec l'assistance technique de Nissan. L'usine de Busan, d'une capacité de 300 000 véhicules par an, entre en production en 1998. Cependant, la crise financière asiatique de 1997 fragilise mortellement cette jeune entreprise.

**L'ère Renault (2000-2022)** : En septembre 2000, Renault acquiert 70% des parts de Samsung Motors pour 560 millions de dollars, créant Renault Samsung Motors (RSM). Ce rachat s'inscrit dans la stratégie d'alliance Renault-Nissan, Samsung Motors ayant été développée sur base technique Nissan. RSM connaît un succès notable avec la SM5, notamment dans les flottes de taxis, atteignant 1,5 million d'unités vendues cumulées en 2015.

**Transformation récente (2022-présent)** : En mars 2022, l'entreprise devient Renault Korea Motors, abandonnant la marque Samsung. En décembre 2022, le constructeur chinois Geely acquiert 34% du capital dans le cadre d'un partenariat stratégique pour la production de véhicules électriques. En avril 2024, l'entreprise adopte son nom actuel : Renault Korea.

#### Structure et activités actuelles

| Caractéristique | Détails |
|-----------------|---------|
| **Siège social** | Yeoksam-dong, Séoul |
| **Usine de production** | Busan (1 650 000 m², 300 000 véhicules/an) |
| **Centre R&D** | Renault Technology Korea, Giheung (près de Séoul) |
| **Centre de test** | Daegu (véhicules autonomes et connectés) |
| **Effectifs** | ~3 600 employés (2022) |
| **Actionnariat** | Renault (52,9%), Geely (34%), Samsung Card (13,1%) |
| **Chiffre d'affaires** | ₩4 862 milliards (2022) |

**Gamme actuelle** : SUV Grand Koleos (sur base Geely CMA), Arkana, QM6, Scenic E-Tech électrique.

**Positionnement stratégique** : Renault Korea se distingue par sa capacité de production flexible (plusieurs modèles sur une ligne), son centre R&D Renault Design Asia qui supervise le design pour toute la région Asie-Pacifique, et son projet de centrale solaire de 20 MW, l'une des plus grandes installations industrielles solaires au monde.

### Objectifs du stage

Ce stage de 6 mois vise les objectifs suivants, définis selon la méthodologie SMART :

| Objectif | Spécifique | Mesurable | Atteignable | Réaliste | Temporel |
|----------|------------|-----------|-------------|----------|----------|
| **O1. Développer un prototype fonctionnel** | Assistant IA conversationnel pour le Grand Koleos | POC déployé et démontrable | Stack technique maîtrisée | Ressources cloud disponibles | 6 mois |
| **O2. Intégrer les services tiers** | Spotify, Google (Gmail, Calendar, Maps) | 4+ services connectés via OAuth | APIs documentées disponibles | Comptes développeur obtenus | Mois 2-4 |
| **O3. Implémenter le RAG véhicule** | Recherche sur manuel + base communautaire | >80% de pertinence sur tests | Données structurées disponibles | Accès au manuel officiel | Mois 1-3 |
| **O4. Déployer en production** | Application accessible publiquement | URL fonctionnelle 24/7 | Plateformes gratuites utilisables | Render + Vercel gratuits | Mois 5-6 |
| **O5. Documenter le projet** | Code commenté, architecture documentée | README + docs techniques complètes | Temps dédié prévu | Bonne pratique de développement | Continu |

### Structure du rapport

Ce rapport s'organise en trois grandes parties :

1. **Mission principale** : Développement de l'assistant IA AIPA
   - Analyse du contexte et de la problématique
   - Conception de l'architecture technique
   - Implémentation des fonctionnalités clés
   - Tests et validation

2. **Résultats et analyse**
   - Démonstration des fonctionnalités réalisées
   - Analyse des performances et limitations
   - Bilan des compétences acquises

3. **Perspectives et conclusion**
   - Évolutions envisagées pour le projet
   - Réflexion sur l'expérience de stage
   - Conclusion générale

---

# Partie Développement - Projet AIPA (AI Personal Assistant)

Ce document détaille la mission de développement de l'assistant personnel intelligent AIPA, réalisée dans le cadre du stage chez Renault Korea.

---

## Mission 1 : Développement d'un Assistant IA Embarqué pour Véhicule

### 1.1. Contexte & Problématique

#### Contexte de l'entreprise

Renault Korea développe actuellement le Grand Koleos, un SUV haut de gamme positionné comme le fer de lance de la marque sur le marché sud-coréen. Ce véhicule, construit sur la plateforme CMA de Geely, représente un tournant stratégique pour l'entreprise : il s'agit du premier modèle issu du partenariat avec le constructeur chinois et incarne la nouvelle direction de la marque en Asie.

Dans un secteur automobile en pleine mutation, l'expérience utilisateur embarquée est devenue un critère de différenciation majeur. Les études de marché montrent que les acheteurs de véhicules premium accordent désormais autant d'importance à l'interface digitale qu'aux performances mécaniques. Face à des concurrents locaux comme Hyundai avec son système Bluelink ou Kia avec Kia Connect, proposant des assistants vocaux intégrés et des services connectés avancés, Renault Korea ne peut se permettre de proposer une expérience d'infodivertissement datée.

C'est dans ce contexte que le département R&D a identifié le besoin de développer un assistant intelligent nouvelle génération. L'objectif n'est pas simplement de rattraper le retard sur la concurrence, mais de proposer une vision différenciante de l'interaction homme-machine à bord, en s'appuyant sur les avancées récentes en intelligence artificielle générative.

#### Problématique identifiée

L'analyse des systèmes d'infodivertissement actuels, tant chez Renault Korea que chez les concurrents, révèle plusieurs limitations structurelles qui dégradent l'expérience utilisateur.

La première limitation concerne la fragmentation des services. Le conducteur doit aujourd'hui jongler entre une multitude d'applications distinctes : Spotify ou Apple Music pour la musique, Google Maps ou Kakao Navi pour la navigation, l'application constructeur pour les informations véhicule, le téléphone natif pour les appels. Chaque changement de contexte nécessite plusieurs manipulations tactiles, autant de sources de distraction potentiellement dangereuses au volant. L'idéal serait une interface unifiée capable de comprendre des requêtes naturelles comme "Mets ma playlist road trip, affiche l'itinéraire vers Busan et rappelle-moi d'appeler maman à l'arrivée" sans que l'utilisateur ait à naviguer entre applications.

La deuxième limitation réside dans le manque d'intelligence contextuelle des assistants vocaux existants. Ces systèmes fonctionnent sur un modèle de commandes prédéfinies : "Appelle Jean", "Mets la radio", "Navigue vers maison". Ils échouent face à des formulations naturelles ou des requêtes nécessitant un raisonnement. Demander "Quand dois-je faire ma prochaine vidange ?" ou "Y a-t-il une station-service sur mon trajet ?" dépasse leurs capacités, obligeant l'utilisateur à reformuler ou à chercher l'information manuellement.

La troisième limitation touche à la connaissance du véhicule lui-même. Paradoxalement, les assistants embarqués actuels sont incapables de répondre aux questions concernant leur propre véhicule. Un nouveau propriétaire de Grand Koleos souhaitant comprendre le fonctionnement du régulateur de vitesse adaptatif ou interpréter un voyant d'alerte doit consulter le manuel papier ou appeler le service client. Cette situation est d'autant plus frustrante que l'information existe, mais n'est pas accessible de manière conversationnelle.

Enfin, la quatrième limitation concerne la barrière linguistique. Le marché sud-coréen est particulièrement exigeant en matière de support du coréen, une langue aux spécificités syntaxiques et aux niveaux de politesse multiples rarement bien gérés par les assistants occidentaux. Un assistant destiné au Grand Koleos doit non seulement comprendre le coréen, mais aussi s'adapter au registre de langue de l'utilisateur et pouvoir basculer vers l'anglais ou le français selon les préférences.

#### Enjeux pour l'organisme

Les enjeux associés à ce projet dépassent le simple développement d'une fonctionnalité technique. Pour Renault Korea, il s'agit d'une question de positionnement stratégique sur un marché ultra-compétitif.

Le premier enjeu est la différenciation concurrentielle. Sur le marché sud-coréen, Hyundai et Kia dominent avec plus de 70% de parts de marché cumulées. Pour attirer les clients vers une marque étrangère, Renault Korea doit proposer une valeur ajoutée tangible. Un assistant IA de nouvelle génération, capable de comprendre le langage naturel et d'exécuter des tâches complexes, constitue un argument de vente différenciant face aux systèmes standardisés de la concurrence.

Le deuxième enjeu concerne la réduction des coûts de support client. Une part significative des appels au service après-vente concerne des questions d'utilisation du véhicule : "Comment activer le mode éco ?", "Que signifie ce voyant ?", "Quand est ma prochaine révision ?". Un assistant capable de répondre à ces questions en temps réel réduit la charge du centre d'appels et améliore la satisfaction client en fournissant des réponses instantanées.

Le troisième enjeu touche à la modernisation de l'image de marque. Renault, perçu comme un constructeur traditionnel en Corée, peut renforcer son image d'innovation en intégrant les technologies IA de dernière génération. Cette démonstration de capacité technique rassure les clients potentiels sur la capacité de la marque à évoluer avec les tendances du marché.

---

### 1.2. Objectifs & Exigences

#### Définition des objectifs

La définition des objectifs du projet a résulté d'une série d'échanges avec les différentes parties prenantes : le responsable R&D, l'équipe marketing, et les représentants du service client. Cette approche collaborative a permis d'aligner les attentes techniques avec les besoins business réels.

L'objectif principal du projet est la création d'un assistant conversationnel unifié capable de fédérer l'ensemble des services actuellement fragmentés. Plutôt que de proposer une énième application parmi d'autres, l'ambition est de créer un point d'entrée unique où l'utilisateur peut exprimer ses besoins en langage naturel. Le succès de cet objectif se mesurera par la capacité de l'assistant à traiter des requêtes multi-domaines en une seule interaction, par exemple "Joue ma playlist préférée et montre-moi le chemin le plus rapide pour rentrer à la maison".

L'intégration du manuel du conducteur constitue le deuxième objectif critique. L'assistant doit être capable de répondre précisément aux questions concernant le véhicule, en citant les sources pertinentes du manuel officiel. Cette fonctionnalité répond directement au besoin identifié de réduire les appels au service client pour des questions d'utilisation courante. L'indicateur de succès retenu est un taux de précision supérieur à 80% sur un panel de questions représentatives.

La connexion aux services tiers représente le troisième objectif majeur. L'assistant doit pouvoir contrôler Spotify (lecture, playlists, recommandations), accéder à Gmail (lecture et rédaction d'emails), gérer Google Calendar (consultation et création d'événements), et utiliser Google Maps (recherche de lieux, calcul d'itinéraires). Chaque service doit être pleinement fonctionnel via l'interface conversationnelle, sans nécessiter de basculement vers les applications natives.

Le support multilingue s'est imposé comme un objectif de haute priorité compte tenu du contexte coréen. L'assistant doit fonctionner nativement en cinq langues : coréen, anglais, français, espagnol et japonais. Le terme "nativement" est important : il ne s'agit pas de traduire à la volée les réponses, mais de disposer d'un système véritablement multilingue où chaque langue bénéficie du même niveau de qualité.

Enfin, le développement d'une application mobile compagnon a été défini comme objectif de priorité moyenne. Cette application facilitera l'authentification OAuth aux différents services, particulièrement complexe à réaliser sur l'écran tactile du véhicule.

#### Exigences techniques

Au-delà des objectifs fonctionnels, le cahier des charges définit plusieurs exigences techniques non négociables.

La performance constitue la première exigence. Un temps de réponse supérieur à 5 secondes briserait le flux conversationnel et frustrerait l'utilisateur. Pour les requêtes simples comme "Quelle heure est-il ?" ou "Mets pause", la réponse doit être quasi-instantanée. Pour les requêtes complexes nécessitant plusieurs appels d'outils, le streaming des réponses permettra de maintenir l'engagement de l'utilisateur.

La disponibilité du service est également critique. L'assistant étant hébergé dans le cloud, une panne rendrait le système totalement inutilisable. L'objectif de 99% de disponibilité implique un choix rigoureux des plateformes d'hébergement et la mise en place de mécanismes de monitoring.

La sécurité ne peut être négligée, particulièrement concernant l'accès aux services tiers contenant des données personnelles (emails, calendrier). L'authentification OAuth 2.0 a été retenue comme standard pour tous les services, garantissant que les credentials de l'utilisateur ne sont jamais stockés par l'application.

La compatibilité multi-support impose une interface responsive fonctionnant aussi bien sur l'écran tactile 12.3 pouces du véhicule que sur un smartphone Android. Les éléments d'interface doivent être suffisamment grands pour une utilisation tactile sûre, tout en restant lisibles sur un écran mobile plus compact.

Enfin, l'extensibilité de l'architecture doit permettre l'ajout futur de nouveaux services sans refonte majeure. Cette exigence se traduit par une architecture modulaire où chaque outil est indépendant et peut être ajouté ou modifié sans impacter les autres.

#### Contraintes du projet

Le projet s'inscrit dans un cadre contraint qu'il convient de préciser pour contextualiser les choix techniques effectués.

La contrainte budgétaire est significative. En tant que projet de stage exploratoire, aucun budget dédié n'a été alloué pour l'infrastructure cloud ou les licences logicielles. Cette contrainte a orienté vers l'utilisation exclusive de services gratuits ou freemium : Render pour l'hébergement backend (tier gratuit avec limitations), Vercel pour le frontend (gratuit pour les projets personnels), et Google Gemini dans sa version gratuite avec quotas généreux.

La contrainte temporelle fixe la durée du développement à six mois, correspondant à la période du stage. Ce délai impose une priorisation rigoureuse des fonctionnalités et l'acceptation que certaines améliorations souhaitables ne pourront être réalisées.

Enfin, la contrainte organisationnelle place le développement principalement en autonomie, avec un encadrement technique ponctuel mais pas d'équipe dédiée. Cette situation exige une capacité d'auto-formation rapide et une rigueur particulière dans la documentation pour assurer la reprise du projet après le stage.

---

### 1.3. Méthode & Plan d'Action

#### Méthodologie adoptée

Face à un projet ambitieux mais aux contours évolutifs, j'ai opté pour une méthodologie Agile itérative adaptée au contexte d'un développeur solo. Plutôt que de suivre strictement un framework comme Scrum (conçu pour des équipes), j'ai conservé les principes fondamentaux de l'agilité : itérations courtes, livraisons fréquentes, adaptation continue aux retours.

Le projet a été découpé en sprints de deux semaines, chacun aboutissant à un incrément fonctionnel démontrable. Cette approche présente plusieurs avantages dans le contexte du stage. Elle permet d'abord de montrer régulièrement l'avancement au tuteur et aux parties prenantes, maintenant ainsi leur engagement dans le projet. Elle offre ensuite des points de recalibrage fréquents : si une fonctionnalité s'avère plus complexe que prévu, elle peut être redimensionnée ou reportée au sprint suivant sans compromettre l'ensemble du planning. Enfin, elle produit une série de jalons intermédiaires constituant autant de preuves tangibles du travail réalisé.

La planification initiale s'est organisée comme suit : les sprints 1 et 2 ont été consacrés à la mise en place de l'architecture et au développement d'un proof-of-concept validant la faisabilité technique. Les sprints 3 et 4 se sont concentrés sur l'intégration du système RAG pour le manuel véhicule, fonctionnalité considérée comme critique. Les sprints 5 et 6 ont permis de développer les clients pour les services externes (Spotify, Google). Les sprints 7 et 8 ont été dédiés au frontend et à l'expérience utilisateur. Les sprints 9 et 10 ont porté sur l'application Android compagnon. Enfin, les sprints 11 et 12 ont été réservés aux tests, optimisations et corrections des bugs identifiés.

En pratique, cette planification a connu des ajustements. Certaines fonctionnalités, comme l'intégration Spotify, se sont révélées plus complexes que prévu et ont débordé sur les sprints suivants. D'autres, comme le support multilingue, ont pu être réalisées plus rapidement grâce aux capacités natives du modèle Gemini.

#### Choix technologiques

Chaque choix technologique a été effectué en pesant les contraintes du projet : performance, coût, maintenabilité, et adéquation au cas d'usage.

Pour le backend, Python s'est imposé naturellement compte tenu de l'écosystème IA existant. Le framework FastAPI a été préféré à Flask ou Django pour sa performance native en mode asynchrone, particulièrement importante pour les appels aux APIs externes et au LLM, et pour sa génération automatique de documentation OpenAPI facilitant les tests et l'intégration.

L'orchestration de l'agent IA repose sur LangGraph, une extension de LangChain permettant de modéliser le comportement de l'agent sous forme de graphe d'états. Ce choix, plus complexe qu'une simple chaîne de prompts, se justifie par la nécessité de gérer des flux conversationnels non-linéaires où l'agent peut avoir besoin de revenir sur ses pas, de demander des clarifications, ou d'exécuter plusieurs outils en parallèle.

Le modèle de langage retenu est Google Gemini 2.0 Flash. Ce choix résulte d'un arbitrage entre qualité, coût et capacités multilingues. Les modèles OpenAI (GPT-4) offriraient des performances légèrement supérieures mais à un coût prohibitif pour le projet. Claude d'Anthropic a été envisagé mais son support du coréen était moins mature à la date de développement. Gemini propose un excellent compromis avec un tier gratuit généreux, des performances de haut niveau, et un support natif des cinq langues cibles.

Pour le frontend, React avec Vite offre un environnement de développement moderne et performant. TailwindCSS a été adopté pour le styling, permettant un développement rapide de l'interface sans gérer de fichiers CSS séparés. La communication avec le backend combine REST pour les opérations ponctuelles et WebSocket pour le streaming des réponses en temps réel.

Le système RAG a été implémenté de manière minimaliste, sans base de données vectorielle externe. Les documents sont stockés en JSON et les embeddings calculés à la demande. Ce choix, acceptable pour le volume de données actuel (moins de 2000 documents), devrait être reconsidéré en cas de mise à l'échelle.

Enfin, le déploiement utilise les plateformes Render (backend) et Vercel (frontend), toutes deux offrant des tiers gratuits suffisants pour un projet de démonstration, avec CI/CD intégré simplifiant les mises à jour.

#### Architecture du système

L'architecture globale du système suit un modèle client-serveur classique enrichi par des connexions aux services externes.

Le frontend React constitue la couche de présentation. Il communique avec le backend via deux canaux : des requêtes REST pour les opérations atomiques (authentification, contrôle Spotify direct, récupération d'état) et une connexion WebSocket persistante pour les échanges conversationnels avec l'agent IA. Cette dualité permet d'optimiser les performances : les actions simples bénéficient de la légèreté du REST, tandis que les conversations profitent du streaming temps réel du WebSocket.

Le backend FastAPI orchestre l'ensemble de la logique métier. Au cœur se trouve l'agent LangGraph qui reçoit les messages utilisateur, analyse l'intention, détermine les outils à invoquer, les exécute, et synthétise une réponse. Autour de l'agent gravitent les différents modules : le système RAG pour les connaissances véhicule, les clients MCP (Model Context Protocol) pour les services externes, les routes d'authentification OAuth, et les endpoints REST spécialisés.

Les services externes (Spotify, Google, GAIA pour la santé) sont accédés via leurs APIs respectives, chacun nécessitant une authentification OAuth préalable. Les tokens d'accès sont stockés côté backend et rafraîchis automatiquement à expiration.

Cette architecture présente l'avantage de la séparation des responsabilités : le frontend se concentre sur l'expérience utilisateur, le backend sur la logique et l'orchestration, et les services externes fournissent les fonctionnalités spécialisées. L'ajout d'un nouveau service se résume à développer un nouveau client et à l'enregistrer auprès de l'agent, sans modification des autres composants.

---

### 1.4. Travail Réalisé

Cette section détaille les différents composants développés au cours du stage, en expliquant les choix techniques effectués, les défis rencontrés et les solutions mises en œuvre.

#### A. Développement du Backend (Python/FastAPI)

Le cœur du système AIPA repose sur un backend Python construit avec le framework FastAPI. Ce choix s'est imposé pour plusieurs raisons : FastAPI offre d'excellentes performances grâce à son support natif de l'asynchrone, génère automatiquement une documentation OpenAPI interactive, et bénéficie d'un typage fort qui facilite la maintenance du code sur le long terme.

L'architecture du backend s'articule autour de plusieurs modules complémentaires. Le fichier principal `app.py` constitue le point d'entrée de l'application et gère à la fois les endpoints REST classiques et les connexions WebSocket pour la communication en temps réel. Cette dualité s'est avérée essentielle : les endpoints REST sont utilisés pour les opérations ponctuelles comme l'authentification OAuth ou le contrôle direct de Spotify, tandis que le WebSocket permet de streamer les réponses de l'agent IA caractère par caractère, offrant ainsi une expérience utilisateur plus fluide.

Le fichier `agent_langgraph.py`, avec ses quelque 1 500 lignes de code, représente le cerveau de l'assistant. Il utilise le framework LangGraph pour orchestrer les différents outils disponibles selon un graphe d'états. Concrètement, lorsqu'un utilisateur pose une question, l'agent analyse d'abord l'intention, détermine quels outils sont nécessaires, les exécute dans l'ordre approprié, puis synthétise une réponse cohérente. Par exemple, si l'utilisateur demande "Joue de la musique relaxante et affiche la prochaine vidange programmée", l'agent comprendra qu'il doit appeler séquentiellement l'outil Spotify puis l'outil de recherche dans le manuel, avant de formuler une réponse unifiée.

Le client Spotify (`spotify_mcp_client.py`), particulièrement volumineux avec ses 1 300 lignes, mérite une attention particulière. Plutôt que d'implémenter uniquement les commandes de base (lecture, pause, suivant), j'ai développé un ensemble complet de 15 outils permettant une interaction naturelle avec le service. L'utilisateur peut ainsi demander "Crée-moi une playlist pour le trajet vers Busan avec des chansons K-pop énergiques" et l'agent sera capable d'exécuter cette requête complexe en plusieurs étapes : rechercher des titres K-pop, créer une nouvelle playlist, y ajouter les morceaux sélectionnés, puis lancer la lecture.

Un défi technique particulier a concerné la recherche de playlists par nom. L'API Spotify requiert normalement un identifiant unique (URI) pour lancer une playlist, mais les utilisateurs préfèrent naturellement utiliser des noms comme "Ma playlist road trip". J'ai donc implémenté une fonction de correspondance floue qui parcourt les playlists de l'utilisateur et identifie la meilleure correspondance, même partielle :

```python
def _find_playlist_by_name(sp, playlist_name: str) -> Optional[dict]:
    """
    Recherche une playlist par son nom dans les playlists de l'utilisateur.
    Utilise une correspondance floue pour plus de flexibilité.
    """
    playlists = sp.current_user_playlists(limit=50)
    
    for playlist in playlists['items']:
        # Correspondance exacte (insensible à la casse)
        if playlist['name'].lower() == playlist_name.lower():
            return playlist
        # Correspondance partielle
        if playlist_name.lower() in playlist['name'].lower():
            return playlist
    
    return None
```

Cette approche pragmatique améliore considérablement l'expérience utilisateur en permettant des formulations naturelles sans nécessiter la connaissance exacte du nom de la playlist.

Les autres modules du backend incluent les systèmes RAG (décrits ci-après), les routes d'authentification OAuth, et le module de gestion des sessions utilisateur. L'ensemble forme une architecture modulaire où chaque composant peut évoluer indépendamment, facilitant ainsi la maintenance et l'extension future du système.

#### B. Système RAG (Retrieval-Augmented Generation)

L'une des fonctionnalités les plus valorisantes de l'assistant AIPA est sa capacité à répondre précisément aux questions concernant le véhicule. Pour y parvenir, j'ai implémenté un système de RAG (Retrieval-Augmented Generation) qui combine deux sources de connaissances complémentaires.

La première source est le manuel officiel du Grand Koleos 2024. Le document PDF original, dense et peu structuré, a été transformé en un fichier JSON hiérarchique contenant 157 sections indexées. Chaque section est catégorisée (Sécurité, Conduite, Maintenance, Multimédia, etc.) et enrichie de métadonnées permettant une recherche efficace. Ce travail de structuration, bien que chronophage, s'est révélé indispensable : un simple parsing du PDF aurait produit un texte brut difficile à exploiter par l'algorithme de recherche.

La seconde source, plus originale, provient du forum communautaire Naver Cafe des propriétaires Renault Korea. J'ai collecté et structuré 1 603 paires questions/réponses vérifiées par la communauté. Cette base apporte une valeur ajoutée considérable car elle contient des informations pratiques absentes du manuel officiel : astuces de conduite, retours d'expérience sur des problèmes courants, comparaisons avec les modèles précédents, etc. Par exemple, le manuel n'explique pas comment optimiser l'autonomie en conditions hivernales, mais plusieurs propriétaires ont partagé leurs techniques sur le forum.

L'algorithme de recherche adopte une approche hybride combinant deux méthodes. La recherche par mots-clés, basée sur une version simplifiée de TF-IDF, excelle pour les requêtes contenant des termes techniques précis comme "régulateur de vitesse adaptatif" ou "code erreur P0420". La recherche sémantique, utilisant des embeddings vectoriels, permet de retrouver des passages pertinents même lorsque l'utilisateur reformule sa question différemment du contenu indexé. Ainsi, une question sur "comment économiser du carburant" pourra matcher avec une section intitulée "Conduite éco-responsable" bien que les termes exacts diffèrent.

La fusion des résultats des deux méthodes, suivie d'un re-ranking par pertinence, produit des réponses de haute qualité. Lors des tests internes, le système a atteint un taux de précision de 87% sur un panel de 50 questions représentatives, dépassant l'objectif initial de 80%.

#### C. Intégration Spotify

L'intégration de Spotify représente l'une des fonctionnalités les plus utilisées de l'assistant et a nécessité de résoudre plusieurs défis techniques non triviaux.

Au-delà des commandes basiques de lecture, pause et navigation entre les pistes, j'ai développé un ensemble complet de fonctionnalités permettant une interaction naturelle. L'utilisateur peut rechercher de la musique par artiste, titre, album ou ambiance, créer et modifier ses playlists vocalement, obtenir des recommandations personnalisées basées sur son historique d'écoute, et contrôler le volume sans quitter la route des yeux.

Le défi le plus complexe a concerné la gestion des "devices" Spotify. Pour jouer de la musique, Spotify requiert qu'un appareil soit actif et enregistré (téléphone, enceinte connectée, navigateur web, etc.). Or, dans le contexte d'une application web, l'appareil peut devenir inactif après quelques minutes d'inactivité, provoquant des erreurs "No active device" frustrant pour l'utilisateur.

Pour résoudre ce problème, j'ai implémenté une stratégie de fallback intelligente dans la fonction `_ensure_active_device()`. Lorsqu'une commande de lecture est demandée, le système vérifie d'abord si un appareil est déjà actif et l'utilise le cas échéant. Sinon, il tente d'activer le "VIP Agent Web Player", un lecteur web que j'ai intégré à l'interface. En dernier recours, il transfère la lecture vers le premier appareil disponible (souvent le téléphone de l'utilisateur). Cette approche a porté le taux de réussite des commandes de lecture à 95%, contre environ 60% avant l'optimisation.

Une autre innovation concerne l'intégration du Web Playback SDK de Spotify directement dans l'interface web. Ce SDK permet de transformer le navigateur en un appareil Spotify à part entière, capable de jouer de la musique sans nécessiter l'application native. J'ai créé un composant React invisible (`SpotifyWebPlayer.jsx`) qui initialise le SDK au chargement de la page et s'enregistre automatiquement comme appareil disponible. L'utilisateur bénéficie ainsi d'une expérience audio intégrée, sans avoir à basculer entre applications.

#### D. Frontend React

L'interface utilisateur a été développée avec React et Vite, privilégiant une expérience épurée adaptée au contexte automobile. L'enjeu principal était de créer une interface utilisable les yeux sur la route, avec des éléments visuels suffisamment grands et contrastés, et une hiérarchie de l'information claire.

La page principale (`ChatPage.jsx`) s'organise autour de trois zones distinctes. La zone centrale, occupant la majorité de l'écran, affiche la conversation sous forme de bulles de messages alternées. J'ai opté pour un design inspiré des applications de messagerie modernes, familier pour la plupart des utilisateurs. La barre de saisie en bas de l'écran intègre un bouton de commande vocale particulièrement important dans le contexte automobile, où la saisie au clavier est à proscrire pendant la conduite.

Les sidebars gauche et droite, escamotables, offrent des fonctionnalités complémentaires. La sidebar gauche ("Knowledge Hub") affiche les sources utilisées par l'assistant pour formuler ses réponses : sections du manuel consultées, questions communautaires similaires, etc. Cette transparence renforce la confiance de l'utilisateur envers les informations fournies. La sidebar droite ("Actions Hub") propose des raccourcis vers les actions fréquentes : lancer une playlist, afficher l'itinéraire du jour, consulter les prochains rendez-vous.

Le support multilingue a été implémenté nativement dès la conception. Plutôt qu'une traduction à la volée (souvent approximative), chaque langue dispose de ses propres fichiers de traduction rédigés par des locuteurs natifs pour le coréen et le japonais. L'interface détecte automatiquement la langue du navigateur et s'adapte, tout en permettant à l'utilisateur de changer manuellement via les paramètres. Les cinq langues supportées (anglais, français, coréen, espagnol, japonais) couvrent les principaux marchés cibles de Renault Korea.

Les modales spécialisées enrichissent l'expérience pour des cas d'usage spécifiques. Le `SpotifyModal` affiche les informations du morceau en cours avec sa pochette d'album et des contrôles tactiles généreux. Le `MapModal` intègre Google Maps avec l'affichage de l'itinéraire actif et les points d'intérêt à proximité. Le `ProfileModal` centralise les connexions OAuth et les préférences utilisateur, incluant le choix de la langue et du thème (clair/sombre).

#### E. Application Android

Pour compléter l'écosystème AIPA et faciliter l'authentification aux services tiers, j'ai développé une application Android compagnon. Cette application répond à un besoin pratique : les flux OAuth (Spotify, Google) sont complexes à réaliser sur l'écran du véhicule, mais naturels sur un smartphone.

L'architecture de l'application repose sur une WebView embarquant l'interface AIPA principale. Ce choix technique, parfois critiqué pour ses performances, se justifie ici par la volonté de maintenir une expérience cohérente entre la version web (sur l'écran du véhicule) et la version mobile. Les mises à jour de l'interface sont instantanément reflétées sur les deux plateformes sans nécessiter de publication sur le Play Store.

La valeur ajoutée de l'application native réside dans sa gestion des deep links pour l'authentification OAuth. Lorsque l'utilisateur clique sur "Connecter Spotify" dans l'interface, l'application intercepte la redirection, ouvre le navigateur système pour le flux d'authentification, puis récupère le token d'accès via un schéma d'URL personnalisé. Ce token est ensuite synchronisé avec le backend via une API sécurisée, permettant à l'assistant sur l'écran du véhicule d'accéder aux services de l'utilisateur.

Des fonctionnalités supplémentaires tirent parti des capacités natives d'Android. Les notifications push, via Firebase Cloud Messaging, alertent l'utilisateur des rappels de maintenance ou des conditions de trafic exceptionnelles. L'intégration avec le système téléphonique permet de passer des appels ou d'envoyer des SMS via commande vocale à l'assistant, qui utilise alors les API Android correspondantes.

---

### 1.5. Résultats & Indicateurs

Cette section présente les résultats obtenus à l'issue des six mois de développement, en les confrontant aux objectifs initialement définis.

#### Évaluation des performances techniques

Le premier critère d'évaluation concerne le temps de réponse de l'assistant. L'objectif fixé était un délai inférieur à 5 secondes pour les requêtes simples, considérant qu'au-delà, l'expérience utilisateur se dégrade significativement. Les mesures réalisées sur un panel de 100 requêtes représentatives montrent un temps de réponse moyen de 2,3 secondes, bien en-deçà de l'objectif. Ce résultat s'explique par plusieurs optimisations mises en œuvre : streaming des réponses permettant d'afficher les premiers caractères avant la génération complète, mise en cache des résultats RAG fréquents, et parallélisation des appels outils lorsque possible.

Il convient toutefois de nuancer ces chiffres. Les requêtes complexes nécessitant plusieurs appels d'outils séquentiels peuvent atteindre 5 à 7 secondes. Par exemple, la demande "Crée une playlist avec des recommandations basées sur mes dernières écoutes et lance-la" implique trois appels API Spotify successifs (récupération de l'historique, génération des recommandations, création de la playlist) avant même la synthèse de la réponse. Dans ces cas, le streaming s'avère particulièrement précieux car l'utilisateur voit l'assistant "travailler" plutôt qu'un écran figé.

La précision du système RAG a été évaluée sur un panel de 50 questions concernant le véhicule, rédigées par des personnes non impliquées dans le développement. Chaque réponse a été notée sur trois critères : exactitude de l'information, pertinence des sources citées, et clarté de la formulation. Le score global atteint 87%, dépassant l'objectif de 80%. Les erreurs observées concernent principalement les questions ambiguës (par exemple "Comment fonctionne le mode éco ?" peut faire référence à plusieurs systèmes) ou les sujets à la frontière entre plusieurs sections du manuel.

Concernant le support multilingue, les cinq langues cibles (coréen, anglais, français, espagnol, japonais) sont opérationnelles. Des tests de compréhension et de génération ont été réalisés pour chaque langue avec des locuteurs natifs pour le coréen et le japonais. La qualité est jugée satisfaisante, bien que certaines nuances culturelles ou expressions idiomatiques ne soient pas toujours parfaitement restituées, limitation inhérente aux modèles de langage actuels.

Le nombre d'outils fonctionnels dépasse l'objectif initial de 30 pour atteindre 35 outils répartis entre les différentes catégories. Cette surperformance s'explique par l'architecture modulaire qui facilite l'ajout de nouvelles fonctionnalités une fois les fondations établies.

Le seul indicateur légèrement en-deçà de l'objectif concerne la disponibilité du service. L'uptime mesuré sur deux mois atteint 98,7% contre 99% visés. Les interruptions sont principalement dues aux limitations du tier gratuit de Render : le service entre en veille après 15 minutes d'inactivité et nécessite environ 30 secondes pour redémarrer au premier appel. Cette contrainte, acceptable pour un prototype de démonstration, devrait être levée dans le cadre d'un déploiement production avec un tier payant.

#### Couverture fonctionnelle par service

L'intégration Spotify dépasse les attentes avec 15 fonctionnalités implémentées contre 12 prévues. Au-delà des fonctions de base (lecture, pause, navigation), l'assistant peut désormais créer des playlists, ajouter des titres aux playlists existantes, générer des recommandations personnalisées, et contrôler le volume. Les trois fonctionnalités supplémentaires concernent la recherche de podcasts, la gestion des épisodes récents, et les statistiques d'écoute.

Les services Google (Gmail, Calendar, Maps) atteignent 100% de couverture selon les spécifications. L'utilisateur peut lire et envoyer des emails, consulter et créer des événements de calendrier, rechercher des lieux et obtenir des itinéraires. Ces fonctionnalités, bien qu'essentielles, se sont révélées moins complexes à implémenter que Spotify grâce aux excellentes bibliothèques Python disponibles (google-auth, googleapiclient).

Le module GAIA pour la santé, initialement conçu comme une démonstration des capacités d'extension, s'est avéré particulièrement apprécié lors des présentations. Il permet de calculer l'IMC, fournit des conseils généraux de santé, et propose une analyse de fatigue au volant basée sur la durée de conduite et l'heure de la journée.

#### Livrables produits

Au terme du stage, plusieurs livrables tangibles ont été produits. Le code source totalise environ 15 000 lignes réparties entre Python (backend, ~8 000 lignes), JavaScript/React (frontend, ~5 000 lignes) et Kotlin (application Android, ~2 000 lignes). Ce code est versionné sur GitHub avec un historique de commits détaillé facilitant la traçabilité des évolutions.

La documentation comprend 25 fichiers Markdown couvrant l'architecture technique, les guides d'installation et de déploiement, les références API, et les procédures de maintenance. Cette documentation exhaustive vise à permettre la reprise du projet par un autre développeur après le stage.

La base de données RAG contient 1 760 entrées : 157 sections extraites du manuel officiel et 1 603 paires questions/réponses issues de la communauté Naver Cafe. Cette base constitue un actif précieux pour l'entreprise, exploitable au-delà du seul projet AIPA.

L'application est déployée et accessible publiquement à l'adresse https://aipa-vip.vercel.app, permettant des démonstrations à distance sans installation préalable. L'APK Android est disponible pour installation sur les appareils des testeurs.

---

### 1.6. Difficultés Rencontrées & Solutions

Tout projet de développement rencontre des obstacles imprévus. Cette section analyse les difficultés majeures rencontrées et les solutions mises en œuvre pour les surmonter.

#### Problème 1 : Latence des appels LLM

Le premier obstacle significatif a concerné le temps de réponse de l'assistant. Lors des premiers tests, les requêtes complexes nécessitaient parfois plus de 8 secondes avant l'affichage de la première réponse, un délai inacceptable pour une utilisation en contexte automobile.

L'analyse du problème a révélé plusieurs causes cumulées. D'abord, les appels aux outils s'effectuaient séquentiellement, chaque outil attendant la fin du précédent même lorsqu'aucune dépendance n'existait entre eux. Ensuite, les prompts système, trop verbeux, allongeaient inutilement le temps de traitement par le LLM. Enfin, le système RAG recalculait les embeddings à chaque requête au lieu de les mettre en cache.

La solution a combiné plusieurs approches. L'implémentation du streaming via WebSocket a permis d'afficher la réponse caractère par caractère, réduisant la perception d'attente. L'optimisation des prompts système, en supprimant les instructions redondantes et en structurant mieux les informations, a réduit le temps de génération de 20%. La mise en cache des résultats RAG pour les requêtes fréquentes a éliminé les recalculs inutiles. Ces optimisations combinées ont ramené le temps de réponse moyen à 2,3 secondes.

#### Problème 2 : Authentification Spotify sur mobile

L'intégration du Web Playback SDK de Spotify s'est heurtée à une limitation technique majeure sur l'application Android. Le SDK repose sur le DRM Widevine pour protéger le contenu audio, mais les WebView Android standard ne supportent pas ce composant. En conséquence, la lecture audio fonctionnait parfaitement dans un navigateur classique mais échouait silencieusement dans l'application mobile.

Après avoir exploré plusieurs pistes (WebView alternatives, composants natifs), j'ai opté pour une solution hybride. L'interface intègre un SpotifyModal utilisant un iframe embed pour afficher les informations du morceau en cours. Les contrôles de lecture (play, pause, next) transitent par l'API REST du backend plutôt que par le SDK direct. En dernier recours, l'application peut déléguer la lecture à l'application Spotify native installée sur le téléphone de l'utilisateur via des intents Android.

Cette approche pragmatique sacrifie l'élégance d'une solution unifiée au profit de la fiabilité : quel que soit le contexte d'utilisation, l'utilisateur peut contrôler sa musique.

#### Problème 3 : Persistence des tokens OAuth sur Render

Un problème inattendu est apparu en production : après chaque déploiement sur Render, les utilisateurs devaient se reconnecter à tous les services (Spotify, Google). Cette expérience dégradée aurait été rédhibitoire pour un usage quotidien.

L'investigation a révélé la cause : Render utilise un système de fichiers éphémère qui est réinitialisé à chaque déploiement. Les tokens OAuth, stockés dans des fichiers locaux (.spotify_cache, credentials.json), étaient donc perdus.

La solution a consisté à encoder les fichiers de credentials en Base64 et à les stocker dans les variables d'environnement de Render, qui elles sont persistantes. Un script decode_credentials.py, exécuté au démarrage de l'application, reconstitue les fichiers à partir des variables d'environnement. Cette approche, bien que non idéale du point de vue de la sécurité (un vault serait préférable), résout le problème dans le contexte d'un prototype.

#### Problème 4 : Gestion des devices Spotify

L'API Spotify requiert qu'un "device" (appareil) soit actif pour exécuter les commandes de lecture. Or, le device Web Player créé par l'application devient automatiquement inactif après quelques minutes sans interaction, provoquant des erreurs "No active device" lors des commandes vocales.

J'ai développé une fonction _ensure_active_device() qui implémente une stratégie de fallback en plusieurs étapes. Lorsqu'une commande de lecture est demandée, le système vérifie d'abord si un device est déjà actif et l'utilise le cas échéant. Sinon, il recherche le Web Player de l'application et tente de le réactiver via la fonction transfer_playback. Si le Web Player n'est pas disponible, il se rabat sur le premier device trouvé, généralement le téléphone ou l'enceinte de l'utilisateur. Cette logique de fallback a porté le taux de réussite des commandes de lecture de 60% à 95%.

---

### 1.7. Analyse Critique

#### Points forts du projet

L'architecture modulaire constitue le principal atout technique du projet. L'utilisation de LangGraph pour orchestrer les outils permet d'ajouter de nouvelles fonctionnalités sans modifier le code existant. Concrètement, l'intégration d'un nouveau service se résume à créer une classe Python définissant les outils disponibles et à l'enregistrer auprès de l'agent. Cette modularité a permis d'ajouter le module GAIA en quelques jours seulement, démontrant la scalabilité de l'architecture.

L'expérience utilisateur a bénéficié d'une attention particulière. L'interface épurée, les temps de réponse optimisés, et le streaming des réponses créent une sensation de fluidité appréciée lors des démonstrations. Le support multilingue natif, plutôt qu'une traduction à la volée, garantit une qualité constante quelle que soit la langue choisie.

La documentation exhaustive produite facilitera la reprise du projet. Chaque module est documenté, les choix d'architecture sont justifiés, et les procédures de déploiement sont détaillées pas à pas. Cette rigueur documentaire, parfois perçue comme une perte de temps en entreprise, s'est avérée précieuse lors des présentations où des questions techniques pointues ont été posées.

#### Limites identifiées

La dépendance au cloud constitue la limite la plus significative. Sans connexion internet, l'assistant est totalement inutilisable. Cette contrainte est acceptable pour un prototype mais problématique pour un déploiement réel : les tunnels, les zones blanches, et les parkings souterrains sont autant de situations courantes où le conducteur pourrait avoir besoin de l'assistant sans y avoir accès.

Les coûts associés à l'utilisation intensive d'un LLM, bien que mitigés par le tier gratuit de Gemini, pourraient devenir significatifs à l'échelle. Une estimation grossière suggère un coût de quelques centimes par conversation complexe, ce qui, multiplié par des millions d'utilisateurs, représenterait un poste budgétaire conséquent.

La sécurité du stockage des tokens OAuth dans les variables d'environnement, bien que fonctionnelle, n'atteint pas les standards d'un système production. Un vault comme HashiCorp Vault ou AWS Secrets Manager serait recommandé pour un déploiement réel.

#### Hypothèses non vérifiées

Plusieurs hypothèses sous-jacentes au projet n'ont pas pu être validées dans le cadre du stage. La performance en conditions réelles de conduite reste théorique : les vibrations du véhicule, les variations de luminosité, et l'attention partagée du conducteur pourraient impacter l'utilisabilité d'une manière non anticipée.

Le comportement avec une connexion réseau instable n'a pas été testé de manière approfondie. Que se passe-t-il lorsque la connexion est perdue en cours de requête ? La gestion d'erreur actuelle affiche un message, mais une dégradation gracieuse vers des fonctionnalités hors-ligne serait préférable.

Enfin, l'acceptation utilisateur sur le marché coréen reste à valider. Les attentes culturelles en matière d'interface homme-machine peuvent différer significativement entre marchés occidentaux et asiatiques. Des tests utilisateurs avec des propriétaires de Grand Koleos seraient nécessaires pour affiner l'expérience.

---

### 1.8. Perspectives & Recommandations

Cette section propose des pistes d'évolution pour le projet AIPA, organisées par horizon temporel, ainsi que des recommandations pour la suite.

#### Évolutions à court terme (3-6 mois)

La priorité immédiate devrait être l'organisation de tests utilisateurs avec de véritables propriétaires de Grand Koleos. Ces tests permettraient de valider les hypothèses d'usage, d'identifier les fonctionnalités manquantes les plus demandées, et de recueillir des retours sur l'ergonomie de l'interface. Un panel de 10 à 15 utilisateurs, sélectionnés pour leur diversité (âge, familiarité technologique, langue), fournirait des insights précieux pour orienter les développements futurs.

L'implémentation d'un mode hors-ligne constitue la deuxième priorité. Dans un premier temps, un cache local des informations du manuel et des réponses fréquentes permettrait de répondre aux questions véhicule même sans connexion. À terme, l'embarquement d'un petit modèle de langage local pourrait maintenir des capacités conversationnelles basiques en mode dégradé.

L'intégration avec le bus CAN du véhicule ouvrirait des possibilités considérables. L'accès aux données temps réel (vitesse, niveau de carburant, codes erreur, température moteur) permettrait à l'assistant de fournir des informations contextuelles précieuses et des alertes proactives. Cette intégration nécessite cependant une collaboration étroite avec les équipes électronique et informatique embarquée.

#### Évolutions à moyen terme (6-12 mois)

Le déploiement d'un modèle de langage embarqué (edge computing) réduirait drastiquement la latence et la dépendance au cloud. Des modèles comme Phi-3 de Microsoft ou Gemma de Google, optimisés pour les ressources limitées, pourraient traiter localement les requêtes simples tout en délégant les requêtes complexes au cloud. Cette architecture hybride combinerait réactivité et puissance.

La personnalisation basée sur l'apprentissage des préférences utilisateur améliorerait significativement l'expérience. L'assistant pourrait mémoriser les stations radio favorites, les destinations fréquentes, les playlists préférées selon l'heure du jour, et adapter ses suggestions en conséquence. Cette personnalisation, optionnelle et transparente, renforcerait le sentiment d'un assistant véritablement personnel.

La création d'une marketplace d'outils permettrait aux utilisateurs avancés d'ajouter leurs propres intégrations. Un développeur pourrait par exemple créer un outil connectant son système domotique, permettant de contrôler le chauffage de sa maison depuis le véhicule. Cette ouverture, inspirée des app stores mobiles, démultiplierait les cas d'usage sans nécessiter de développement interne.

#### Vision à long terme (12-24 mois)

L'intégration native au système d'infodivertissement du véhicule représente l'aboutissement logique du projet. Plutôt qu'une surcouche applicative, l'assistant deviendrait le mode d'interaction principal avec le véhicule, accessible via les commandes au volant et l'écran central.

L'extension à l'écosystème Renault complet, au-delà du seul Grand Koleos, maximiserait le retour sur investissement du développement. L'architecture modulaire du projet facilite cette transposition : seules les bases RAG (manuels spécifiques) nécessiteraient une adaptation pour chaque modèle.

Enfin, l'évolution vers un assistant proactif, capable de faire des suggestions contextuelles sans sollicitation explicite, ouvrirait de nouvelles perspectives. L'assistant pourrait par exemple suggérer un détour vers une station-service lorsque le niveau de carburant devient faible sur un trajet long, ou proposer une pause lorsqu'il détecte des signes de fatigue. Cette proactivité, finement dosée pour ne pas devenir intrusive, représente le futur de l'interaction homme-machine automobile.

---

# Partie Développement - Projet GAIA (Gestionnaire d'Aide Intelligent et Adaptatif)

Ce document détaille la mission de développement du système de suivi santé et bien-être GAIA, réalisée en parallèle du projet AIPA dans le cadre du stage chez Renault Korea.

---

## Mission 2 : Développement d'une Plateforme de Suivi Santé et Bien-être pour Conducteurs

### 2.1. Contexte & Problématique

#### Contexte de l'émergence du projet

Le projet GAIA est né d'une observation complémentaire à AIPA : au-delà de l'assistance conversationnelle, les conducteurs passent plusieurs heures par jour dans leur véhicule, souvent dans des conditions peu propices à leur bien-être physique. La position assise prolongée, le stress de la conduite, et la fatigue accumulée constituent des facteurs de risque pour la santé à long terme.

Renault Korea, dans sa volonté de proposer une expérience premium différenciante, a identifié l'opportunité d'intégrer un suivi santé intelligent dans l'habitacle. L'idée n'est pas de remplacer un suivi médical professionnel, mais d'offrir au conducteur une conscience accrue de son état physiologique et des recommandations personnalisées pour améliorer son bien-être au quotidien.

Le projet s'inscrit également dans une tendance de fond de l'industrie automobile : l'intégration croissante des véhicules avec l'écosystème numérique personnel du conducteur. Les montres connectées, smartphones et applications de santé génèrent une quantité considérable de données que le véhicule pourrait exploiter pour personnaliser l'expérience de conduite.

#### Problématique identifiée

L'analyse des habitudes des conducteurs modernes révèle plusieurs problématiques interconnectées.

La première concerne le cloisonnement des données de santé. Les utilisateurs de montres connectées (Apple Watch, Samsung Galaxy Watch, Fitbit) et d'applications de santé accumulent des données précieuses sur leur rythme cardiaque, leur qualité de sommeil, leur activité physique et leur niveau de stress. Cependant, ces informations restent confinées dans des silos applicatifs et ne sont jamais exploitées dans le contexte de la conduite, alors même que la fatigue ou le stress peuvent significativement impacter la sécurité au volant.

La deuxième problématique touche à l'ergonomie prolongée. Les conducteurs professionnels comme les particuliers effectuant de longs trajets développent fréquemment des troubles musculo-squelettiques : douleurs cervicales, lombalgies, tensions dans les épaules. Ces problèmes, généralement prévenus par des exercices simples et des pauses régulières, sont souvent négligés faute de rappels appropriés.

La troisième problématique concerne le manque de personnalisation des conseils de bien-être. Les applications de santé généralistes fournissent des recommandations standardisées qui ne tiennent pas compte du contexte spécifique de la conduite automobile. Un conseil comme "faites 10 000 pas aujourd'hui" est peu pertinent pour quelqu'un qui va passer 4 heures au volant.

#### Enjeux pour l'organisme

Pour Renault Korea, le projet GAIA représente une opportunité de créer un écosystème intégré autour du véhicule.

Le premier enjeu est la fidélisation client. En proposant une plateforme qui agrège les données de santé et les exploite intelligemment dans le contexte véhicule, Renault Korea crée une valeur ajoutée difficile à répliquer par la concurrence. Un conducteur qui a configuré sa synchronisation Samsung Health avec son véhicule sera réticent à changer de marque.

Le deuxième enjeu concerne la sécurité routière. La détection proactive de la fatigue ou du stress élevé pourrait permettre au véhicule de suggérer des pauses ou d'adapter certains paramètres (climatisation, ambiance sonore) pour améliorer la vigilance du conducteur. Cette fonctionnalité, au-delà de son aspect pratique, renforce le positionnement de Renault Korea comme constructeur soucieux de la sécurité.

Le troisième enjeu touche au positionnement technologique. En intégrant des fonctionnalités de santé connectée avant ses concurrents directs sur le marché coréen, Renault Korea peut se positionner comme un innovateur plutôt qu'un suiveur, améliorant son image de marque auprès des consommateurs technophiles.

---

### 2.2. Objectifs & Exigences

#### Définition des objectifs

Les objectifs du projet GAIA ont été définis en complémentarité avec AIPA, visant à créer un écosystème cohérent autour du bien-être du conducteur.

L'objectif principal est le développement d'un dashboard santé interactif intégré à l'interface véhicule. Ce dashboard doit afficher en temps réel les métriques de santé essentielles (fréquence cardiaque, pression artérielle, qualité de sommeil, niveau de stress) dans un format adapté à la consultation rapide pendant les arrêts.

Le deuxième objectif concerne la création d'une application mobile compagnon permettant la collecte des données de santé depuis les plateformes natives (Apple HealthKit, Samsung Health, Google Fit). Cette application doit synchroniser automatiquement les données avec le backend, créant ainsi un pont entre l'écosystème mobile de l'utilisateur et son véhicule.

Le troisième objectif est l'implémentation d'un système de recommandations IA personnalisées. En combinant le profil utilisateur (âge, taille, poids, genre) avec les métriques de santé collectées, l'assistant GAIA doit pouvoir générer des conseils adaptés répartis en trois catégories : santé générale, activité physique, et lifestyle.

Le quatrième objectif porte sur l'intégration d'un module d'exercices et d'étirements. Le système doit proposer des exercices ciblés par zone corporelle (cou, dos, épaules, poignets, jambes) particulièrement adaptés aux contraintes de la position de conduite, avec des tutoriels vidéo guidés.

Enfin, le cinquième objectif vise la création d'un avatar 3D interactif représentant le corps humain, permettant une navigation intuitive vers les exercices par simple clic sur la zone concernée.

#### Exigences techniques

Les exigences techniques de GAIA reflètent la double nature du projet : une application web pour le véhicule et une application mobile pour la collecte de données.

Pour le frontend véhicule, l'interface doit être optimisée pour un écran tactile de 1800x720 pixels (format typique des systèmes d'infodivertissement modernes). Les éléments interactifs doivent être suffisamment grands pour une manipulation tactile sûre, et les animations suffisamment fluides pour ne pas distraire le conducteur.

L'intégration 3D constitue une exigence spécifique. L'avatar interactif doit être rendu en temps réel avec des performances acceptables (minimum 30 FPS) sur le matériel embarqué du véhicule. Les modèles 3D doivent être optimisés en termes de polygones tout en conservant un rendu esthétique satisfaisant.

Pour l'application mobile, la compatibilité multiplateforme est requise (iOS et Android). L'accès aux APIs de santé natives (HealthKit pour iOS, Samsung Health et Google Fit pour Android) doit être implémenté avec gestion appropriée des permissions utilisateur.

La synchronisation des données doit fonctionner en mode background avec une fréquence configurable (temps réel, toutes les 15 minutes, ou horaire). Un mode offline avec file d'attente de synchronisation est nécessaire pour gérer les cas de perte de connectivité.

La sécurité des données de santé, par nature sensibles, impose un chiffrement des communications (HTTPS/TLS 1.3) et des données au repos (AES-256 pour le stockage local).

#### Contraintes spécifiques

Au-delà des contraintes budgétaires et temporelles partagées avec AIPA, GAIA présente des contraintes spécifiques.

L'accès aux APIs de santé nécessite des processus d'approbation. Samsung Health requiert l'enregistrement d'un compte développeur et l'obtention de clés API spécifiques. Apple HealthKit impose des entitlements particuliers et un provisioning profile approprié, ce qui complique les tests sur appareils réels.

La fragmentation des plateformes de santé constitue une autre contrainte. Samsung Health, Google Fit et Apple HealthKit ne collectent pas exactement les mêmes données et ne les structurent pas de la même manière. Un travail d'harmonisation est nécessaire pour présenter une interface unifiée indépendamment de la source des données.

Enfin, les régulations sur les données de santé (RGPD en Europe, lois similaires en Corée) imposent une transparence totale sur la collecte et l'utilisation des données, ainsi que des mécanismes permettant à l'utilisateur d'exporter ou supprimer ses données.

---

### 2.3. Méthode & Plan d'Action

#### Méthodologie adoptée

Le développement de GAIA a suivi la même méthodologie itérative que AIPA, mais avec une particularité : les deux projets ont été menés en parallèle, partageant certaines ressources (le backend Flask, l'expertise en React) tout en conservant leur indépendance fonctionnelle.

Cette approche a permis de créer des synergies : les learnings d'un projet ont pu être appliqués à l'autre, et certains composants (système d'authentification, intégration Google Gemini) ont été mutualisés.

La planification s'est organisée comme suit : les premiers sprints ont porté sur le frontend React avec l'avatar 3D et le module d'exercices, considérés comme les éléments les plus visuels et démonstratifs. Les sprints suivants ont abordé l'intégration HealthKit/Google Fit et le système de recommandations IA. Les derniers sprints ont été consacrés à la synchronisation mobile-backend et aux optimisations.

#### Choix technologiques

Le frontend GAIA utilise la même stack que AIPA (React 18, Vite, TailwindCSS) par souci de cohérence et de mutualisation des compétences. L'ajout majeur concerne l'intégration 3D.

Three.js a été retenu comme moteur de rendu 3D, encapsulé dans React Three Fiber pour une intégration naturelle avec l'écosystème React. Ce choix permet d'écrire les scènes 3D en JSX, simplifiant considérablement le développement par rapport à l'API Three.js native.

Les modèles 3D des avatars (masculin et féminin) sont au format GLTF/GLB, standard ouvert offrant un excellent compromis entre qualité visuelle et poids des fichiers. Les modèles ont été optimisés pour maintenir un nombre de polygones raisonnable (~50k faces) tout en préservant les détails anatomiques nécessaires à l'identification des zones corporelles.

Pour l'application mobile, deux approches ont été explorées. La première utilise React Native avec Expo, permettant de capitaliser sur les compétences React existantes. La librairie expo-health fournit un accès unifié aux APIs de santé natives. La seconde approche utilise Kotlin natif pour Android, offrant une intégration plus directe avec Samsung Health SDK. Les deux implémentations coexistent dans le projet, permettant de comparer leurs avantages respectifs.

Le backend Flask est partagé avec AIPA, avec des endpoints dédiés à GAIA pour la synchronisation des données de santé (`/api/sync-health`), la récupération des dernières métriques (`/api/health/latest`), et le pairing mobile-véhicule (`/api/verify-pairing`).

Le stockage des données de santé utilise actuellement une structure en mémoire (dictionnaire Python), suffisante pour le prototype mais à remplacer par une base de données persistante (PostgreSQL ou SQLite) pour une mise en production.

#### Architecture du système

L'architecture GAIA se distingue par sa nature distribuée, impliquant trois composants principaux interconnectés.

L'application mobile (GAIA Mobile) constitue le point de collecte des données. Elle s'interface avec Samsung Health SDK et/ou Apple HealthKit pour récupérer les métriques de santé. Un service de synchronisation (SyncWorker) s'exécute en arrière-plan et envoie périodiquement les données au backend via des appels REST sécurisés.

Le backend Flask centralise le stockage et le traitement des données. Il reçoit les données de santé des applications mobiles, les agrège par utilisateur, et les expose aux dashboards véhicule. Le module de recommandations IA (Google Gemini) est invoqué à la demande pour générer des conseils personnalisés.

Le dashboard véhicule (React) récupère les données depuis le backend via polling régulier (toutes les 10 secondes) et les affiche dans une interface optimisée pour l'écran d'infodivertissement. L'avatar 3D interactif permet de naviguer intuitivement vers les exercices, tandis que le module de recommandations IA fournit des conseils contextualisés.

Un système de pairing par code à 6 caractères permet d'associer un téléphone mobile à un véhicule sans nécessiter de compte utilisateur complexe. Le code, affiché sur l'écran du véhicule, est saisi sur le téléphone pour établir la connexion.

#### Diagrammes d'Architecture et de Séquences

##### Diagramme d'Architecture Globale GAIA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ÉCOSYSTÈME GAIA                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐                           ┌──────────────────┐
    │   📱 SMARTPHONE  │                           │   🚗 VÉHICULE    │
    │                  │                           │                  │
    │  ┌────────────┐  │                           │  ┌────────────┐  │
    │  │ Samsung    │  │                           │  │ Dashboard  │  │
    │  │ Health     │──┼──┐                        │  │ React      │  │
    │  └────────────┘  │  │                        │  └─────┬──────┘  │
    │                  │  │                        │        │         │
    │  ┌────────────┐  │  │    ┌──────────────┐    │  ┌─────▼──────┐  │
    │  │ Apple      │──┼──┼───▶│   Backend    │◀───┼──│ Avatar 3D  │  │
    │  │ HealthKit  │  │  │    │   Flask      │    │  │ Three.js   │  │
    │  └────────────┘  │  │    │              │    │  └────────────┘  │
    │                  │  │    │  ┌────────┐  │    │                  │
    │  ┌────────────┐  │  │    │  │ Google │  │    │  ┌────────────┐  │
    │  │ Google     │──┼──┘    │  │ Gemini │  │    │  │ Exercices  │  │
    │  │ Fit        │  │       │  │   IA   │  │    │  │ Vidéos     │  │
    │  └────────────┘  │       │  └────────┘  │    │  └────────────┘  │
    │                  │       └──────────────┘    │                  │
    │  ┌────────────┐  │              ▲            │  ┌────────────┐  │
    │  │ GAIA       │  │              │            │  │ Recommand. │  │
    │  │ Mobile App │──┼──────────────┘            │  │ IA         │  │
    │  └────────────┘  │     HTTPS/REST            │  └────────────┘  │
    └──────────────────┘                           └──────────────────┘
```

##### Diagramme de Flux de Données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUX DE DONNÉES GAIA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ÉTAPE 1 : COLLECTE              ÉTAPE 2 : SYNC              ÉTAPE 3 : AFFICHAGE
  ═══════════════════             ════════════════            ═══════════════════

  ┌─────────────────┐             ┌─────────────────┐         ┌─────────────────┐
  │ 🏃 Activité     │             │                 │         │ ❤️ 72 bpm       │
  │   Steps: 8543   │────────────▶│                 │────────▶│ 🩺 120/80 mmHg  │
  │   Calories: 420 │             │                 │         │ 🚶 8543 pas     │
  │   Distance: 6km │             │   BACKEND       │         │ 😴 7.5h sommeil │
  └─────────────────┘             │   FLASK         │         └─────────────────┘
                                  │                 │                  │
  ┌─────────────────┐             │   ┌─────────┐   │                  │
  │ 💓 Santé        │             │   │ Storage │   │                  ▼
  │   Heart: 72bpm  │────────────▶│   │  Dict   │   │         ┌─────────────────┐
  │   BP: 120/80    │             │   └─────────┘   │         │   🤖 IA GEMINI  │
  │   SpO2: 98%     │             │                 │         │                 │
  └─────────────────┘             │                 │         │  Recommandations│
                                  │                 │         │  personnalisées │
  ┌─────────────────┐             │                 │         └─────────────────┘
  │ 😴 Sommeil      │             │                 │
  │   Durée: 7.5h   │────────────▶│                 │
  │   Qualité: bon  │             │                 │
  └─────────────────┘             └─────────────────┘
```

##### Diagramme de Séquence : Synchronisation Mobile → Véhicule

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SÉQUENCE DE SYNCHRONISATION DES DONNÉES                        │
└─────────────────────────────────────────────────────────────────────────────┘

  SMARTPHONE              BACKEND FLASK           DASHBOARD VÉHICULE
       │                        │                        │
       │                        │                        │
  ┌────┴────┐                   │                        │
  │ Collecte│                   │                        │
  │ Samsung │                   │                        │
  │ Health  │                   │                        │
  └────┬────┘                   │                        │
       │                        │                        │
       │  POST /api/sync-health │                        │
       │  {userId, heartRate,   │                        │
       │   steps, sleep...}     │                        │
       │───────────────────────▶│                        │
       │                        │                        │
       │                        │  ┌─────────────────┐   │
       │                        │  │ Stockage données│   │
       │                        │  │ health_data_    │   │
       │                        │  │ store[userId]   │   │
       │                        │  └─────────────────┘   │
       │                        │                        │
       │  {"success": true}     │                        │
       │◀───────────────────────│                        │
       │                        │                        │
       │                        │   GET /api/health/     │
       │                        │   latest?userId=xxx    │
       │                        │◀───────────────────────│
       │                        │                        │
       │                        │  ┌─────────────────┐   │
       │                        │  │ Formatage pour  │   │
       │                        │  │ l'affichage     │   │
       │                        │  └─────────────────┘   │
       │                        │                        │
       │                        │   {"success": true,    │
       │                        │    "data": {...}}      │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │                   ┌────┴────┐
       │                        │                   │ Mise à  │
       │                        │                   │ jour UI │
       │                        │                   │ Avatar  │
       │                        │                   └────┬────┘
       │                        │                        │
       ▼                        ▼                        ▼
```

##### Diagramme de Séquence : Pairing Mobile-Véhicule

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SÉQUENCE DE PAIRING (APPAIRAGE)                                │
└─────────────────────────────────────────────────────────────────────────────┘

  DASHBOARD VÉHICULE           BACKEND FLASK            SMARTPHONE
         │                           │                        │
         │                           │                        │
    ┌────┴────┐                      │                        │
    │ Génère  │                      │                        │
    │ code    │                      │                        │
    │ ABC123  │                      │                        │
    └────┬────┘                      │                        │
         │                           │                        │
         │   Affiche code à          │                        │
         │   l'écran: "ABC123"       │                        │
         │                           │                        │
         │   (polling toutes les 2s) │                        │
         │   GET /api/check-pairing  │                        │
         │   ?pairingCode=ABC123     │                        │
         │──────────────────────────▶│                        │
         │                           │                        │
         │   {"connected": false}    │                   ┌────┴────┐
         │◀──────────────────────────│                   │ User    │
         │                           │                   │ saisit  │
         │   (continue polling...)   │                   │ ABC123  │
         │                           │                   └────┬────┘
         │                           │                        │
         │                           │   POST /api/verify-    │
         │                           │   pairing              │
         │                           │   {pairingCode, userId}│
         │                           │◀───────────────────────│
         │                           │                        │
         │                           │  ┌──────────────────┐  │
         │                           │  │ Enregistrement   │  │
         │                           │  │ pairing_         │  │
         │                           │  │ connections      │  │
         │                           │  └──────────────────┘  │
         │                           │                        │
         │                           │   {"success": true}    │
         │                           │───────────────────────▶│
         │                           │                        │
         │   GET /api/check-pairing  │                   ┌────┴────┐
         │   ?pairingCode=ABC123     │                   │ ✅      │
         │──────────────────────────▶│                   │ Connecté│
         │                           │                   └─────────┘
         │   {"connected": true,     │
         │    "userId": "user_123"}  │
         │◀──────────────────────────│
         │                           │
    ┌────┴────┐                      │
    │ ✅      │                      │
    │ Pairing │                      │
    │ réussi! │                      │
    └────┬────┘                      │
         │                           │
         ▼                           ▼
```

##### Diagramme de Séquence : Génération de Recommandations IA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SÉQUENCE DE GÉNÉRATION DES RECOMMANDATIONS IA                  │
└─────────────────────────────────────────────────────────────────────────────┘

  UTILISATEUR          DASHBOARD REACT         BACKEND FLASK         GOOGLE GEMINI
       │                      │                      │                      │
       │                      │                      │                      │
       │   Clique "🤖 AI     │                      │                      │
       │   Recommendations"   │                      │                      │
       │─────────────────────▶│                      │                      │
       │                      │                      │                      │
       │                 ┌────┴────┐                 │                      │
       │                 │ Charge  │                 │                      │
       │                 │ profil  │                 │                      │
       │                 │ + moyennes│               │                      │
       │                 └────┬────┘                 │                      │
       │                      │                      │                      │
       │   Clique "Generate"  │                      │                      │
       │─────────────────────▶│                      │                      │
       │                      │                      │                      │
       │                      │  POST /api/          │                      │
       │                      │  recommendations     │                      │
       │                      │  {personal: {...},   │                      │
       │                      │   healthAverages}    │                      │
       │                      │─────────────────────▶│                      │
       │                      │                      │                      │
       │                      │                 ┌────┴────┐                 │
       │                      │                 │ Construit│                │
       │                      │                 │ prompt   │                │
       │                      │                 │ détaillé │                │
       │                      │                 └────┬────┘                 │
       │                      │                      │                      │
       │                      │                      │  generate_content()  │
       │                      │                      │  "Gemini 2.0 Flash"  │
       │                      │                      │─────────────────────▶│
       │                      │                      │                      │
       │                      │                      │                 ┌────┴────┐
       │                      │                      │                 │ Analyse │
       │                      │                      │                 │ profil  │
       │                      │                      │                 │ & santé │
       │                      │                      │                 └────┬────┘
       │                      │                      │                      │
       │                      │                      │  HEALTH:             │
       │                      │                      │  • Conseil 1         │
       │                      │                      │  FITNESS:            │
       │                      │                      │  • Conseil 2         │
       │                      │                      │  LIFESTYLE:          │
       │                      │                      │  • Conseil 3         │
       │                      │                      │◀─────────────────────│
       │                      │                      │                      │
       │                      │  {"success": true,   │                      │
       │                      │   "recommendations"} │                      │
       │                      │◀─────────────────────│                      │
       │                      │                      │                      │
       │                 ┌────┴────┐                 │                      │
       │                 │ Parse & │                 │                      │
       │                 │ affiche │                 │                      │
       │                 │ 3 cards │                 │                      │
       │                 └────┬────┘                 │                      │
       │                      │                      │                      │
       │   ┌─────────────────────────────────────┐   │                      │
       │   │ 🏥 Health     │ 💪 Fitness │ 🌟 Life│   │                      │
       │   │ • Conseil    │ • Conseil  │ • Conseil  │                      │
       │   └─────────────────────────────────────┘   │                      │
       │◀─────────────────────│                      │                      │
       ▼                      ▼                      ▼                      ▼
```

##### Diagramme de Navigation de l'Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              NAVIGATION DANS L'APPLICATION GAIA                             │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────────┐
                            │     PAGE ACCUEIL    │
                            │       MainPage      │
                            │                     │
                            │  ┌───┐ ┌───┐ ┌───┐  │
                            │  │ 🏃│ │ ❤️│ │ 🛒│  │
                            │  └───┘ └───┘ └───┘  │
                            └─────────┬───────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│    EXERCICES     │      │   HEALTH CHECK   │      │   ACCESSOIRES    │
│   Exercises.jsx  │      │  HealthCheck.jsx │      │  Accessories.jsx │
│                  │      │                  │      │                  │
│ ┌──┐┌──┐┌──┐┌──┐ │      │ ┌────┐  ┌────┐   │      │ ┌──┐┌──┐┌──┐┌──┐ │
│ │Cou││Dos││...││ │      │ │Data│  │Data│   │      │ │🛏️││🌸││💨││👟│ │
│ └──┘└──┘└──┘└──┘ │      │ └────┘  └────┘   │      │ └──┘└──┘└──┘└──┘ │
└────────┬─────────┘      │                  │      └────────┬─────────┘
         │                │    ┌────────┐    │               │
         │                │    │ AVATAR │    │               │
         ▼                │    │   3D   │    │               ▼
┌──────────────────┐      │    │  🧍    │    │      ┌──────────────────┐
│  DÉTAIL EXERCICE │      │    └────┬───┘    │      │ DÉTAIL ACCESSOIRE│
│ ExerciseDetail   │      │         │        │      │ AccessoryDetail  │
│                  │      │ ┌────┐  ┌────┐   │      │                  │
│ ┌──────────────┐ │      │ │Data│  │Data│   │      │  ┌────────────┐  │
│ │ 🎥 VIDÉO     │ │      │ └────┘  └────┘   │      │  │   Image    │  │
│ │   YouTube    │ │      └────────┬─────────┘      │  │   Produit  │  │
│ └──────────────┘ │               │                │  └────────────┘  │
│                  │      ┌────────┴────────┐       │                  │
│ ┌──────────────┐ │      │                 │       │  ┌────────────┐  │
│ │ Instructions │ │      ▼                 ▼       │  │   Ajouter  │  │
│ │ détaillées   │ │  ┌────────┐      ┌────────┐    │  │  au panier │  │
│ └──────────────┘ │  │History │      │   IA   │    │  └────────────┘  │
└──────────────────┘  │  📊    │      │ Recom. │    └──────────────────┘
                      └────────┘      │  🤖    │
                                      └────────┘
```

##### Diagramme des Composants Frontend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              ARCHITECTURE DES COMPOSANTS REACT                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │     App.jsx     │
                              │  (Router/State) │
                              └────────┬────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        │              │               │               │              │
        ▼              ▼               ▼               ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐
│  MainPage    │ │ HealthCheck  │ │  Exercises   │ │ AIRecommend. │ │ ...    │
│              │ │              │ │              │ │              │ │        │
└──────────────┘ └──────┬───────┘ └──────┬───────┘ └──────────────┘ └────────┘
                        │                │
         ┌──────────────┼────────────────┤
         │              │                │
         ▼              ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ AvatarViewer │ │  HealthData  │ │ UserInfoPopup│
│   (Three.js) │ │   (Carte)    │ │  (Formulaire)│
│              │ │              │ │              │
│ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │
│ │Interactive│ │ │ │  Titre  │ │ │ │  Age     │ │
│ │  Point   │ │ │ │  Valeur │ │ │ │  Taille  │ │
│ │  (Clic)  │ │ │ │  Unité  │ │ │ │  Poids   │ │
│ └──────────┘ │ │ │  Barre  │ │ │ └──────────┘ │
└──────────────┘ │ └──────────┘ │ └──────────────┘
                 └──────────────┘

                        POPUPS & MODALES
        ┌───────────────────────────────────────────┐
        │                                           │
        ▼                   ▼                       ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Confirmation │   │Recommendation│   │HistoryPopup      │
│    Popup     │   │    Popup     │   │                  │
│              │   │              │   │ ┌──────────────┐ │
│  "Voir les   │   │ "Votre       │   │ │ Graphiques   │ │
│  exercices?" │   │ tension..."  │   │ │ historique   │ │
│              │   │              │   │ └──────────────┘ │
│ [Oui] [Non]  │   │    [OK]      │   └──────────────────┘
└──────────────┘   └──────────────┘
```

##### Diagramme des Endpoints API

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              ENDPOINTS API BACKEND FLASK                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │         BACKEND FLASK           │
                    │      http://localhost:5000      │
                    └─────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   RECOMMANDATIONS │   │      SANTÉ        │   │   AUTHENTIF.      │
└───────────────────┘   └───────────────────┘   └───────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ POST /api/        │   │ POST /api/        │   │ POST /api/        │
│ recommendations   │   │ sync-health       │   │ verify-pairing    │
│                   │   │                   │   │                   │
│ Entrée:           │   │ Entrée:           │   │ Entrée:           │
│ • personal        │   │ • userId          │   │ • pairingCode     │
│ • healthAverages  │   │ • timestamp       │   │ • userId          │
│                   │   │ • healthData      │   │                   │
│ Sortie:           │   │                   │   │ Sortie:           │
│ • recommendations │   │ Sortie:           │   │ • success         │
│ • userProfile     │   │ • success         │   │ • userId          │
└───────────────────┘   │ • syncId          │   └───────────────────┘
                        └───────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ GET /api/         │   │ GET /api/         │   │ POST /api/        │
│ health            │   │ health/latest     │   │ auth/login        │
│                   │   │                   │   │                   │
│ (Health check)    │   │ Entrée:           │   │ Entrée:           │
│                   │   │ • userId (query)  │   │ • email           │
│ Sortie:           │   │                   │   │ • password        │
│ • status: healthy │   │ Sortie:           │   │                   │
│ • service: GAIA   │   │ • heartRate       │   │ Sortie:           │
│                   │   │ • bloodPressure   │   │ • token           │
│                   │   │ • steps           │   │ • userId          │
│                   │   │ • sleepDuration   │   │ • expiresIn       │
│                   │   │ • ...             │   │                   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

### 2.4. Travail Réalisé

#### A. Dashboard Santé Interactif (React/Three.js)

Le dashboard santé GAIA constitue l'interface principale visible par le conducteur. Son développement a nécessité de concilier trois exigences parfois contradictoires : richesse fonctionnelle, clarté visuelle, et performance de rendu.

La page principale `HealthCheck.jsx` s'organise autour de trois zones distinctes. À gauche et à droite, des panneaux de métriques affichent les données de santé en temps réel : fréquence cardiaque, pression artérielle, durée de sommeil, nombre de pas, calories brûlées et distance parcourue. Chaque métrique est présentée dans un composant `HealthData` stylisé avec un code couleur intuitif (vert pour normal, orange pour attention requise).

Au centre, l'avatar 3D constitue l'élément visuel principal. Le composant `AvatarViewer.jsx` charge dynamiquement le modèle masculin ou féminin selon le genre sélectionné par l'utilisateur et le rend dans un canvas Three.js. Des points interactifs (`InteractivePoint`) sont positionnés sur les zones corporelles clés : cou, épaules, bras, poignets, dos, jambes, et respiration.

L'implémentation de l'interactivité 3D a présenté des défis techniques intéressants. La détection des clics sur l'avatar utilise le raycasting de Three.js pour identifier quel point interactif a été touché. Un système de confirmation par popup (`ConfirmationPopup`) évite les actions accidentelles : lorsque l'utilisateur clique sur une zone, une fenêtre lui demande de confirmer s'il souhaite voir les exercices correspondants.

```jsx
const handleShowConfirmation = (label) => {
  const pointsData = {
    male: [
      { id: 'breathing', label: 'Breathing' },
      { id: 'neck', label: 'Neck' },
      { id: 'shoulders', label: 'Shoulders' },
      // ... autres points
    ],
    // ... configuration femme
  };
  
  setSelectedBodyPart(label);
  setSelectedPartId(pointsData[gender].find(point => point.label === label)?.id);
  setShowConfirmation(true);
};
```

Le système de synchronisation temps réel interroge le backend toutes les 10 secondes pour récupérer les dernières données de santé. Cette approche par polling, bien que moins élégante qu'une connexion WebSocket, s'est avérée plus robuste dans le contexte d'une connexion réseau potentiellement instable. Un indicateur visuel "Last synced: Xm ago" informe l'utilisateur de la fraîcheur des données affichées.

#### B. Module d'Exercices et Étirements

Le module d'exercices répond au besoin de proposer des solutions concrètes aux problèmes musculo-squelettiques liés à la conduite prolongée. Sept catégories d'exercices ont été implémentées, chacune ciblant une zone corporelle spécifique.

La page `Exercises.jsx` présente les catégories sous forme de carrousel interactif. Chaque carte affiche une icône emoji personnalisée, le nom de la zone corporelle et une brève description. Un système de navigation par flèches permet de parcourir les catégories, avec une animation de glissement fluide.

Au premier accès, un popup `UserInfoPopup` collecte les informations personnelles de l'utilisateur (âge, taille, poids) nécessaires au calcul du BMI et à la personnalisation des recommandations. Ces données sont stockées dans le localStorage pour les sessions ultérieures.

La page de détail `ExerciseDetail.jsx` contient pour chaque zone corporelle un tutoriel vidéo YouTube intégré et des instructions textuelles détaillées. Par exemple, pour les exercices du cou :

```javascript
neck: {
  title: 'Neck Relief Stretches',
  videoUrl: 'https://www.youtube.com/embed/X3-gKPNyrTA',
  description: 'These gentle stretches are designed to relieve tension...',
  instructions: [
    'Neck Tilt: Gently tilt your head towards your right shoulder, hold for 15-30 seconds.',
    'Neck Turn: Slowly turn your head to the right, hold for 15-30 seconds.',
    'Forward and Backward Tilt: Tilt your head down, then look up towards ceiling.',
    'Shoulder Rolls: Roll your shoulders backwards and forwards 5 times each way.'
  ]
}
```

Cette approche pédagogique combine démonstration visuelle (vidéo) et rappel textuel (instructions), permettant à l'utilisateur de s'entraîner efficacement même sans audio.

#### C. Système de Recommandations IA

Le système de recommandations IA de GAIA utilise Google Gemini pour générer des conseils personnalisés basés sur le profil utilisateur et les données de santé collectées.

La page `AIRecommendations.jsx` centralise cette fonctionnalité. Elle affiche d'abord un récapitulatif du profil utilisateur (âge, taille, poids, BMI calculé) puis les moyennes des métriques de santé sur la période récente. Un bouton "Generate AI Recommendations" déclenche l'appel au backend.

Le fichier `recommandations.py` construit un prompt détaillé pour Gemini incluant toutes les données contextuelles :

```python
prompt = f"""Based on the following user data from Google Fit:

USER PROFILE:
- Gender: {gender_label}
- Age: {age} years old
- Height: {height} cm
- Weight: {weight} kg
- BMI: {bmi:.1f}

GOOGLE FIT ACTIVITY METRICS (last 24 hours average):
- Daily Steps: {steps:,} steps (Recommended: 10,000 steps/day)
- Calories Burned: {calories} kcal
- Sleep Duration: {sleep_duration} hours (Recommended: 7-9 hours)
- Heart Rate: {heart_rate} bpm (Normal: 60-100 bpm)

Please provide personalized recommendations in THREE categories:
HEALTH RECOMMENDATIONS, FITNESS RECOMMENDATIONS, LIFESTYLE RECOMMENDATIONS
"""
```

Un aspect important est la prise en compte du genre dans les recommandations. Le prompt inclut un contexte différencié : "Women typically need more iron, calcium, and specific hormonal health considerations" versus "Men typically need more cardiovascular focus and muscle mass maintenance". Cette personnalisation améliore la pertinence des conseils générés.

Le format de sortie est contraint pour s'adapter à l'affichage sur l'écran véhicule : maximum 3-4 bullet points par catégorie, chaque point limité à une phrase courte et actionnable. Cette contrainte évite les réponses verbeuses inadaptées à une consultation rapide.

En cas d'indisponibilité du backend, un système de fallback génère des recommandations simulées basées sur des règles logiques :

```javascript
const generateFallbackRecommendations = (userInfo, healthAverages) => {
  const recommendations = { health: [], fitness: [], lifestyle: [] };
  
  const bmi = userInfo.weight / Math.pow(userInfo.height / 100, 2);
  
  if (bmi < 18.5) {
    recommendations.fitness.push('BMI low. Focus on strength training and nutrition.');
  } else if (bmi > 25) {
    recommendations.fitness.push('Consider 150 min/week moderate cardio for weight management.');
  } else {
    recommendations.fitness.push('BMI healthy. Mix cardio and strength training weekly.');
  }
  // ... autres règles
  
  return recommendations;
};
```

#### D. Application Mobile (Expo/React Native)

L'application mobile GAIA Mobile, développée avec Expo, constitue le pont entre les plateformes de santé natives et le dashboard véhicule.

Le service `HealthKitService.ts` encapsule toute la logique d'accès aux données de santé. Il utilise la librairie `expo-health` qui fournit une abstraction unifiée au-dessus de HealthKit (iOS) et Health Connect (Android).

L'initialisation du service demande les permissions nécessaires pour chaque type de donnée :

```typescript
async initialize(): Promise<boolean> {
  const isAvailable = await ExpoHealth.isHealthDataAvailable();
  if (!isAvailable) return false;

  const permissions = [
    { type: ExpoHealth.HealthDataType.HeartRate, accessType: ExpoHealth.HealthPermission.Read },
    { type: ExpoHealth.HealthDataType.StepCount, accessType: ExpoHealth.HealthPermission.Read },
    { type: ExpoHealth.HealthDataType.SleepAnalysis, accessType: ExpoHealth.HealthPermission.Read },
    { type: ExpoHealth.HealthDataType.BloodPressureSystolic, accessType: ExpoHealth.HealthPermission.Read },
    { type: ExpoHealth.HealthDataType.BloodPressureDiastolic, accessType: ExpoHealth.HealthPermission.Read },
    { type: ExpoHealth.HealthDataType.OxygenSaturation, accessType: ExpoHealth.HealthPermission.Read },
  ];

  return await ExpoHealth.requestHealthDataAccessAsync(permissions);
}
```

Les méthodes de récupération des données sont spécialisées par métrique. Par exemple, `getSteps()` agrège tous les enregistrements de pas de la journée en cours, tandis que `getHeartRate()` récupère la mesure la plus récente des dernières 24 heures.

Le service `ApiService.ts` gère la communication avec le backend. La fonction de synchronisation envoie un payload structuré contenant toutes les métriques collectées :

```typescript
async syncHealthData(metrics: HealthMetrics): Promise<SyncResult> {
  const userId = await AsyncStorage.getItem('gaia:userId');
  
  const response = await fetch(`${API_BASE_URL}/api/sync-health`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      timestamp: Date.now(),
      heartRate: metrics.heartRate,
      bloodPressureSystolic: metrics.bloodPressureSystolic,
      bloodPressureDiastolic: metrics.bloodPressureDiastolic,
      steps: metrics.steps,
      sleepDuration: metrics.sleepDuration,
      oxygenSaturation: metrics.oxygenSaturation,
      stressLevel: metrics.stressLevel,
    }),
  });
  
  return response.json();
}
```

L'interface utilisateur de l'application mobile est volontairement minimaliste. Elle présente un écran de pairing (saisie du code 6 caractères affiché sur le véhicule), un bouton de synchronisation manuelle, et un affichage récapitulatif des dernières métriques synchronisées.

#### E. Backend Flask Unifié

Le backend Flask, partagé entre AIPA et GAIA, a été enrichi avec des endpoints dédiés à la synchronisation santé.

L'endpoint `/api/sync-health` reçoit les données de l'application mobile et les stocke dans un dictionnaire en mémoire indexé par userId. La structure accepte deux formats de payload (flat et nested) pour faciliter l'évolution de l'API :

```python
@app.route('/api/sync-health', methods=['POST'])
def sync_health_data():
    data = request.get_json()
    user_id = data['userId']
    
    # Support des deux formats
    if 'healthData' in data:
        health_data = data['healthData']
    else:
        health_data = {
            'heartRate': {'value': data.get('heartRate'), 'unit': 'bpm'},
            'bloodPressure': {'systolic': data.get('bloodPressureSystolic'), 'diastolic': data.get('bloodPressureDiastolic')},
            # ... autres métriques
        }
    
    health_data_store[user_id] = {
        'healthData': health_data,
        'lastUpdated': data.get('timestamp'),
    }
    
    return jsonify({'success': True, 'message': 'Health data synced successfully'})
```

L'endpoint `/api/health/latest` permet au dashboard véhicule de récupérer les dernières données synchronisées pour un utilisateur donné. Les données sont reformatées pour correspondre à la structure attendue par le frontend.

Le système de pairing utilise deux endpoints complémentaires. `/api/verify-pairing` est appelé par l'application mobile pour valider un code de pairing. `/api/check-pairing` est interrogé par le dashboard véhicule pour vérifier si un téléphone s'est connecté avec le code affiché.

---

### 2.5. Résultats & Indicateurs

#### Couverture fonctionnelle

Le dashboard santé affiche avec succès les 9 métriques prévues : fréquence cardiaque, pression artérielle (systolique/diastolique), température, niveau de stress/fatigue, nombre de pas, calories brûlées, distance parcourue, durée de sommeil, et saturation en oxygène.

L'avatar 3D interactif couvre les 7 zones corporelles définies (cou, épaules, bras, poignets, dos, jambes, respiration). Chaque zone dispose d'un tutoriel vidéo fonctionnel et d'instructions détaillées.

Le système de recommandations IA génère avec succès des conseils personnalisés dans les trois catégories (santé, fitness, lifestyle). La prise en compte du genre améliore la pertinence des recommandations.

L'application mobile synchronise correctement les données de santé via l'API expo-health. Les tests sur iPhone avec HealthKit ont validé la récupération de toutes les métriques supportées.

#### Performance technique

Le rendu 3D de l'avatar maintient un framerate stable de 45-60 FPS sur navigateur desktop, dépassant l'objectif de 30 FPS. Les modèles GLB optimisés (~50k polygones) représentent un bon compromis qualité/performance.

La synchronisation mobile-backend s'effectue en moins de 500ms pour un payload typique. Le polling du dashboard toutes les 10 secondes n'impacte pas les performances du frontend.

L'intégration Google Gemini pour les recommandations génère une réponse en 2-4 secondes, comparable aux performances observées avec AIPA.

#### Limitations identifiées

La principale limitation concerne le stockage en mémoire des données de santé. Un redémarrage du serveur Flask entraîne la perte de toutes les données synchronisées. Cette limitation, acceptable pour un prototype, devrait être résolue par l'intégration d'une base de données persistante.

L'application mobile Expo ne peut pas accéder à HealthKit via Expo Go (limitation technique). Les tests nécessitent un build EAS (Expo Application Services), ce qui allonge le cycle de développement.

L'intégration Samsung Health, bien que documentée, n'a pas pu être pleinement testée faute d'appareil Samsung disponible. L'implémentation reste théorique pour cette plateforme.

---

### 2.6. Difficultés Rencontrées & Solutions

#### Problème 1 : Accès aux données HealthKit sur iOS

Les données de santé sur iOS sont fortement protégées. L'accès via Expo Go est impossible car le SDK HealthKit nécessite des entitlements spécifiques qui ne peuvent être ajoutés qu'aux applications buildées nativement.

La solution a consisté à utiliser EAS Build pour générer des IPA de développement. Le fichier `app.json` a été configuré avec les entitlements HealthKit appropriés et les messages de demande de permission personnalisés :

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.access": []
      },
      "infoPlist": {
        "NSHealthShareUsageDescription": "GAIA needs access to your health data to provide personalized recommendations."
      }
    }
  }
}
```

#### Problème 2 : Synchronisation en arrière-plan

Sur mobile, maintenir une synchronisation active en arrière-plan est un défi technique. iOS et Android limitent strictement les processus background pour préserver la batterie.

La solution adoptée utilise les mécanismes natifs de chaque plateforme. Sur Android, WorkManager permet de planifier des tâches récurrentes (toutes les 15 minutes minimum). Sur iOS, les background app refresh sont utilisés, bien que leur déclenchement soit à la discrétion du système.

En complément, une synchronisation manuelle est toujours disponible pour les cas où la synchronisation automatique n'aurait pas eu lieu récemment.

#### Problème 3 : Fragmentation des formats de données

Samsung Health, Google Fit et Apple HealthKit utilisent des structures de données différentes pour représenter les mêmes métriques. Par exemple, la pression artérielle peut être deux valeurs séparées (systolique, diastolique) ou un objet composite.

La solution a été de définir un format canonique côté backend et de transformer les données à la réception. L'endpoint `/api/sync-health` accepte plusieurs formats de payload et les normalise en structure interne unifiée :

```python
if 'healthData' in data:
    health_data = data['healthData']  # Format nested
else:
    health_data = self._convert_flat_to_nested(data)  # Format flat
```

---

### 2.7. Analyse Critique

#### Points forts du projet

L'intégration 3D constitue un élément différenciant fort. La possibilité de cliquer directement sur une zone du corps pour accéder aux exercices correspondants offre une expérience intuitive rarement vue dans les applications de bien-être traditionnelles.

L'architecture distribuée (mobile → backend → dashboard) permet une grande flexibilité. Un utilisateur peut synchroniser ses données depuis son téléphone personnel et les consulter sur n'importe quel véhicule équipé, sans configuration complexe.

La complémentarité avec AIPA crée un écosystème cohérent. L'utilisateur peut demander à l'assistant AIPA "Comment va ma santé aujourd'hui ?" et recevoir une synthèse des données GAIA, unifiant les deux expériences.

#### Limites identifiées

La dépendance aux plateformes de santé tierces constitue un risque. Si Samsung Health ou Apple HealthKit modifient leurs APIs, l'application mobile devra être mise à jour. Cette fragilité est inhérente à l'approche d'intégration choisie.

L'absence de tests utilisateurs réels avec des conducteurs limite la validation de l'ergonomie. Les exercices proposés, bien que pertinents, n'ont pas été évalués par des kinésithérapeutes spécialisés en santé au travail.

Le prototype ne gère pas les multi-utilisateurs sur un même véhicule. Dans le cas d'un véhicule partagé (couple, famille), un seul profil peut être actif à la fois.

#### Hypothèses non vérifiées

L'impact réel sur le bien-être des conducteurs reste à mesurer. Une étude longitudinale serait nécessaire pour valider que les recommandations GAIA améliorent effectivement les indicateurs de santé des utilisateurs réguliers.

La fiabilité des données de santé collectées par les montres connectées n'a pas été vérifiée. Ces appareils grand public présentent des marges d'erreur significatives par rapport aux équipements médicaux professionnels.

---

### 2.8. Perspectives & Recommandations

#### Évolutions à court terme (3-6 mois)

L'intégration d'une base de données persistante (PostgreSQL ou SQLite) est prioritaire pour permettre un historique long terme des données de santé. Cet historique pourrait alimenter des visualisations de tendances (graphiques d'évolution du rythme cardiaque, du sommeil, etc.).

L'ajout de la détection de fatigue basée sur les patterns de données serait une fonctionnalité à haute valeur ajoutée. En corrélant la durée de sommeil de la nuit précédente, l'heure actuelle, et la durée de conduite, le système pourrait alerter proactivement le conducteur lorsqu'un risque de somnolence est détecté.

Le déploiement d'une version Android native avec Samsung Health SDK permettrait de valider l'intégration sur cette plateforme très répandue en Corée du Sud.

#### Évolutions à moyen terme (6-12 mois)

L'intégration avec les capteurs du véhicule ouvrirait de nouvelles possibilités. Des capteurs de pression dans le siège pourraient détecter une mauvaise posture. Des caméras intérieures pourraient analyser les signes de fatigue (clignements des yeux, bâillements).

Le développement d'un mode "pause active" permettrait au véhicule de suggérer un arrêt sur une aire de repos et de guider le conducteur à travers une séquence d'exercices adaptés à la durée de la pause et aux zones de tension identifiées.

L'extension du système de recommandations avec du machine learning embarqué permettrait de personnaliser les conseils en fonction de l'historique de l'utilisateur, identifiant les recommandations effectivement suivies et leurs effets mesurables.

#### Vision à long terme (12-24 mois)

L'interconnexion avec les services de santé professionnels pourrait permettre de partager les données collectées (avec consentement) avec le médecin traitant de l'utilisateur, facilitant le suivi médical préventif.

L'extension à l'ensemble de la gamme Renault transformerait GAIA en plateforme transversale, créant un avantage compétitif significatif pour le groupe.

---

## Synthèse des Missions

### Complémentarité AIPA-GAIA

Les projets AIPA et GAIA, bien que développés en parallèle, forment un écosystème cohérent autour de l'expérience conducteur premium.

AIPA répond au besoin d'assistance conversationnelle unifiée : contrôle des services (Spotify, Calendar, Gmail), accès aux connaissances véhicule, et exécution de tâches complexes par commande vocale.

GAIA répond au besoin de suivi santé et bien-être : collecte de données depuis les plateformes mobiles, visualisation sur le dashboard véhicule, recommandations personnalisées, et guidance pour les exercices.

Les deux projets partagent des composants techniques (backend Flask, frontend React, intégration Gemini) ce qui a permis des synergies de développement et une cohérence d'expérience utilisateur.

### Bilan des compétences acquises

Ce stage a permis de développer des compétences techniques variées :

- **Full-stack development** : Backend Python/Flask, Frontend React, Mobile React Native/Expo
- **Intelligence artificielle** : Intégration de LLMs (Google Gemini), RAG, prompt engineering
- **Graphisme 3D** : Three.js, React Three Fiber, optimisation de modèles GLTF
- **Intégrations tierces** : OAuth 2.0 (Spotify, Google), APIs de santé (HealthKit, Samsung Health)
- **Architecture distribuée** : Communication client-serveur, synchronisation de données, gestion des états

Au-delà des compétences techniques, l'autonomie requise par ce stage a développé des soft skills essentielles : capacité d'auto-formation, rigueur documentaire, communication avec des interlocuteurs non-techniques (présentation des demos), et gestion de projet en contexte contraint.

### Contribution à l'organisme

Les deux projets constituent des prototypes fonctionnels démontrant la faisabilité de nouvelles fonctionnalités d'infodivertissement. Ils peuvent servir de :

- **Démonstrateurs commerciaux** : Présentations aux clients et partenaires potentiels
- **Base technique** : Point de départ pour des développements ultérieurs par l'équipe R&D
- **Documentation** : Référence technique pour les futurs projets IA embarquée

Le code source, entièrement documenté et versionné sur GitHub, assure la pérennité du travail réalisé au-delà de la durée du stage.

---

## Annexes Techniques

### A. Stack Technique Détaillée - AIPA

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Runtime | Python | 3.11 | Backend |
| Framework API | FastAPI | 0.104 | REST + WebSocket |
| Agent IA | LangGraph | 0.2 | Orchestration |
| LLM | Google Gemini | 2.0 Flash | Génération de texte |
| Frontend | React | 18.2 | Interface utilisateur |
| Build tool | Vite | 5.0 | Bundling |
| Styling | TailwindCSS | 3.4 | CSS utilitaire |
| Mobile | Android (Kotlin) | API 24+ | App compagnon |
| Déploiement | Render / Vercel | - | Hébergement |

### B. Stack Technique Détaillée - GAIA

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Runtime | Python | 3.10+ | Backend partagé |
| Framework API | Flask | 3.0.0 | REST API |
| LLM | Google Gemini | 2.0 Flash | Recommandations IA |
| Frontend | React | 18.2 | Dashboard véhicule |
| 3D Engine | Three.js | - | Rendu avatar |
| 3D Integration | React Three Fiber | - | Bridge React/Three.js |
| Build tool | Vite | 5.0 | Bundling |
| Mobile (iOS) | Expo / React Native | SDK 54 | App compagnon |
| Mobile (Android) | Kotlin | API 26+ | App compagnon alternative |
| Health APIs | expo-health | - | Accès HealthKit/Health Connect |
| Styling | CSS3 | - | Gradients, animations |

### C. Arborescence du Projet AIPA

```
aipa/
├── app/                          # Backend Python
│   ├── app.py                    # Point d'entrée FastAPI
│   ├── agent_langgraph.py        # Agent IA (1500 lignes)
│   ├── spotify_mcp_client.py     # Client Spotify (1300 lignes)
│   ├── car_manual_rag.py         # RAG manuel véhicule
│   ├── community_qa_rag.py       # RAG communautaire
│   ├── auth_routes.py            # OAuth Google/Spotify
│   ├── spotify_routes.py         # API Spotify REST
│   └── i18n/                     # Traductions
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/           # Composants UI
│   │   ├── pages/                # Pages principales
│   │   ├── stores/               # État global (Zustand)
│   │   └── hooks/                # Hooks personnalisés
│   └── public/                   # Assets statiques
├── data/                         # Bases de données RAG
│   ├── grand_koleos_manual.json  # Manuel (157 sections)
│   └── rag_ai_qa_knowledge_base.json  # Q&A (1603 entrées)
├── testBench/                    # Application Android
│   └── app/src/main/
└── docs/                         # Documentation
```

### D. Arborescence du Projet GAIA

```
GaiaV2/
├── backend/                      # Backend Flask (partagé AIPA/GAIA)
│   ├── server.py                 # API Flask (329 lignes)
│   ├── recommandations.py        # Module IA Gemini (154 lignes)
│   ├── requirements.txt          # Dépendances Python
│   ├── supabase_client.py        # Client Supabase (optionnel)
│   ├── google_fit_proxy.py       # Proxy Google Fit
│   └── test_recommendations.py   # Tests unitaires
│
├── Gaia/                         # Frontend React (Dashboard véhicule)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MainPage.jsx          # Page d'accueil
│   │   │   ├── HealthCheck.jsx       # Dashboard santé (320 lignes)
│   │   │   ├── AIRecommendations.jsx # Recommandations IA
│   │   │   ├── Exercises.jsx         # Catalogue exercices
│   │   │   ├── ExerciseDetail.jsx    # Détail exercice + vidéo
│   │   │   ├── ConnectDevice.jsx     # Pairing mobile
│   │   │   ├── Accessories.jsx       # Boutique accessoires
│   │   │   └── History.jsx           # Historique données
│   │   ├── components/
│   │   │   ├── AvatarViewer.jsx      # Avatar 3D interactif
│   │   │   ├── InteractivePoint.jsx  # Points cliquables 3D
│   │   │   ├── HealthData.jsx        # Carte métrique santé
│   │   │   ├── UserInfoPopup.jsx     # Formulaire profil
│   │   │   ├── ConfirmationPopup.jsx # Popup confirmation
│   │   │   └── VideoPlayer.jsx       # Lecteur vidéo YouTube
│   │   ├── utils/
│   │   │   └── userDataUtils.js      # Gestion localStorage
│   │   └── data/                     # Données exercices
│   ├── public/
│   │   └── avatars/                  # Modèles 3D GLTF
│   └── package.json
│
├── GaiaExpo/                     # App Mobile Expo (iOS/Android)
│   ├── src/
│   │   └── services/
│   │       ├── HealthKitService.ts   # Accès HealthKit (246 lignes)
│   │       └── ApiService.ts         # Communication backend
│   ├── App.tsx                   # Composant principal
│   ├── app.json                  # Configuration Expo
│   └── eas.json                  # Configuration EAS Build
│
├── GaiaMobile/                   # App Mobile React Native CLI
│   ├── src/
│   │   └── services/
│   │       ├── HealthKitService.ts
│   │       └── ApiService.ts
│   ├── android/                  # Configuration Android native
│   └── ios/                      # Configuration iOS native
│
├── gaia-mobile/                  # App Android Kotlin (alternative)
│   ├── app/
│   │   └── src/main/
│   │       └── java/com/gaia/mobile/
│   └── build.gradle.kts
│
└── rapport/                      # Documentation rapport
    ├── CONTENU_RAPPORT.md
    └── 4._Attendus_rapport_de_stage.pdf
```

### E. Références Théoriques

- **RAG (Retrieval-Augmented Generation)** : Lewis et al., 2020 - "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
- **LangGraph** : Framework d'orchestration d'agents IA basé sur des graphes d'état
- **Model Context Protocol (MCP)** : Protocole standardisé pour connecter des LLM à des outils externes (Anthropic, 2024)
- **OAuth 2.0** : RFC 6749 - Framework d'autorisation pour APIs tierces
- **Three.js / React Three Fiber** : Bibliothèque JavaScript pour le rendu 3D dans le navigateur
- **HealthKit / Health Connect** : Frameworks Apple/Google pour l'accès aux données de santé
- **Expo Health** : Abstraction unifiée pour l'accès aux APIs de santé sur iOS et Android

### F. Métriques de Santé Collectées par GAIA

| Métrique | Source | Unité | Plage normale |
|----------|--------|-------|---------------|
| Fréquence cardiaque | HealthKit/Samsung Health | bpm | 60-100 |
| Pression artérielle systolique | HealthKit/Samsung Health | mmHg | 90-120 |
| Pression artérielle diastolique | HealthKit/Samsung Health | mmHg | 60-80 |
| Température corporelle | Capteurs wearables | °C | 36.1-37.2 |
| Nombre de pas | Google Fit/HealthKit | steps | 7,000-10,000/jour |
| Calories brûlées | Google Fit/HealthKit | kcal | Variable |
| Distance parcourue | Google Fit/HealthKit | km | Variable |
| Durée de sommeil | HealthKit/Samsung Health | heures | 7-9 |
| Saturation en oxygène | Capteurs SpO2 | % | 95-100 |
| Niveau de stress | HRV analysis | % | <50 optimal |

### G. Endpoints API GAIA

| Méthode | Endpoint | Description | Statut |
|---------|----------|-------------|--------|
| POST | `/api/recommendations` | Génération recommandations IA | ✅ |
| GET | `/api/health` | Health check API | ✅ |
| POST | `/api/sync-health` | Sync données mobile → backend | ✅ |
| GET | `/api/health/latest?userId=xxx` | Récupération dernières données | ✅ |
| POST | `/api/verify-pairing` | Validation code pairing | ✅ |
| GET | `/api/check-pairing?code=xxx` | Vérification connexion | ✅ |
| POST | `/api/auth/login` | Authentification utilisateur | ✅ |

---

*Ce document constitue la partie technique du rapport de stage. Il peut être complété par des captures d'écran, des diagrammes UML et des extraits de logs pour illustrer les réalisations.*
