# AppLauncher 

> Lanceur d'applications de bureau avec système de thèmes personnalisables — développé avec Electron, React, Node.js et MongoDB.

![Version](https://img.shields.io/badge/version-1.0.0-6C63FF)
![Electron](https://img.shields.io/badge/Electron-v28-47848F)
![React](https://img.shields.io/badge/React-v18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-v18-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-v6-47A248)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table des matières

1. [Description du projet](#1-description-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Stack technologique](#3-stack-technologique)
4. [Modélisation de la base de données](#4-modélisation-de-la-base-de-données)
5. [Structure du projet](#5-structure-du-projet)
6. [Fonctionnalités](#6-fonctionnalités)
7. [Sécurité](#7-sécurité)
8. [Guide d'installation](#8-guide-dinstallation)
9. [API REST — Endpoints](#9-api-rest--endpoints)
10. [Choix de conception](#10-choix-de-conception)
11. [Perspectives d'amélioration](#11-perspectives-damélioration)

---

## 1. Description du projet

**AppLauncher** est un logiciel de bureau Windows développé avec **Electron** qui permet aux utilisateurs de centraliser, organiser et lancer toutes leurs applications depuis une interface unique et entièrement personnalisable.

### Problématique

Les utilisateurs disposent souvent de nombreuses applications installées sur leur PC (outils de développement, communication, design, multimédia…) mais aucun outil natif ne permet de les regrouper, les organiser et y accéder rapidement depuis un seul endroit avec une interface personnalisée.

### Solution apportée

AppLauncher répond à cette problématique en offrant :

-  Un **tableau de bord visuel** regroupant toutes les applications
-  Un **système de thèmes** personnalisables avec mode sombre/clair
-  Une **détection automatique** des applications populaires installées sur le PC
-  L'**ajout manuel** d'applications via un explorateur de fichiers natif Windows
-  Un **système de favoris** pour les applications fréquemment utilisées
-  La possibilité de **supprimer** les applications inutiles de sa liste
-  Une **authentification sécurisée** avec JWT

### Public cible

- Développeurs et professionnels du numérique
- Utilisateurs souhaitant organiser leur espace de travail
- Toute personne ayant de nombreuses applications installées sur son PC

---

## 2. Architecture technique

L'application suit une architecture **trois-tiers** adaptée à Electron :

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON (Bureau)                     │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────────────┐  │
│  │  Renderer Process│      │      Main Process         │  │
│  │   React.js (UI)  │◄────►│  Fenêtre + IPC + dialog  │  │
│  └────────┬─────────┘      └──────────────────────────┘  │
│           │ Axios HTTP                                    │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│               Node.js + Express (API REST)               │
│     Auth  │  Apps  │  Themes  │  Users                   │
└───────────┬─────────────────────────────────────────────┘
            │ Mongoose ODM
┌───────────▼─────────────────────────────────────────────┐
│                    MongoDB (Base de données)              │
│   Users │ Applications │ Themes │ Categories │ UserApps  │
└─────────────────────────────────────────────────────────┘
```

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Présentation | React.js + Electron | Interface utilisateur, fenêtre native Windows |
| Logique métier | Node.js + Express | API REST, authentification, traitement |
| Données | MongoDB + Mongoose | Persistance, schémas NoSQL |
| Communication OS | IPC Electron | Accès fichiers, lancement .exe, dialog |

---

## 3. Stack technologique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | React.js v18 | Composants réutilisables, Context API, hooks personnalisés |
| **Desktop** | Electron v28 | Encapsule React + Node.js en `.exe` autonome, accès API OS natif |
| **Backend** | Node.js + Express | JavaScript unifié front/back, performances I/O asynchrones |
| **Base de données** | MongoDB + Mongoose | Schémas flexibles, JSON natif, pas de jointures complexes |
| **Authentification** | JWT + bcryptjs | Stateless, compatible Electron, hachage sécurisé (salt 10) |
| **HTTP Client** | Axios | Intercepteurs JWT automatiques, gestion centralisée des erreurs |
| **Routing** | React Router v6 | Navigation SPA avec routes protégées via `PrivateRoute` |
| **Build** | Vite + electron-builder | Build rapide en dev, compilation `.exe` NSIS en production |

### Pourquoi MongoDB plutôt qu'une BDD relationnelle ?

- Les profils utilisateurs sont **flexibles** — chaque utilisateur a un nombre variable d'applications
- Les thèmes sont des **documents JSON complexes** naturellement stockables en NoSQL
- Pas de relations complexes nécessitant des jointures multiples
- **Scaling horizontal** facilité pour une future version cloud

### Pourquoi Electron ?

- Réutilise **100% du code React** sans refactoring
- Accès complet aux **API Windows natives** (`dialog`, `shell`, `child_process`)
- Distribution simple en **un seul fichier `.exe`**
- Technologie éprouvée : VS Code, Discord, Slack, Figma utilisent Electron

---

## 4. Modélisation de la base de données

> Le diagramme complet (draw.io) est disponible dans `docs/ModèleBDD_AppLauncher.drawio`

La base de données MongoDB est composée de **5 collections** principales avec les relations suivantes :

```
USERS ──────────────────────────── 1..N ──► THEMES
  │                                           (userId FK)
  │
  └──── 1..N ──► USER_APPS ◄──── 1..N ──── APPLICATIONS
                  (userId FK)  (appId FK)        │
                  [index unique]                  │
                                           N..1 ──► CATEGORIES
                                                  (categoryId FK)
```

### Collection : `users`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | **PK** auto | Identifiant unique généré par MongoDB |
| `email` | String | unique, requis | Adresse email — identifiant de connexion |
| `passwordHash` | String | requis | Mot de passe haché avec bcrypt (salt 10) |
| `displayName` | String | optionnel | Prénom affiché dans l'interface |
| `activeThemeId` | ObjectId | **FK** → themes | Référence au thème actif |
| `role` | String | enum | Rôle : `"user"` ou `"admin"` |
| `createdAt` | Date | auto | Timestamp Mongoose |
| `updatedAt` | Date | auto | Timestamp Mongoose |

### Collection : `applications`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | **PK** auto | Identifiant unique |
| `name` | String | requis, trim | Nom de l'application |
| `iconUrl` | String | optionnel | URL de l'icône |
| `launchUrl` | String | optionnel | URL pour les apps web |
| `exePath` | String | optionnel | Chemin vers le `.exe` (apps locales) |
| `isLocalApp` | Boolean | défaut: `false` | Application Windows locale |
| `description` | String | optionnel | Description courte |
| `categoryId` | ObjectId | **FK** → categories | Catégorie de l'application |
| `isGlobal` | Boolean | défaut: `false` | Visible par tous les utilisateurs |
| `createdBy` | ObjectId | **FK** → users | Utilisateur ayant créé l'entrée |
| `createdAt` | Date | auto | Timestamp Mongoose |

### Collection : `themes`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | **PK** auto | Identifiant unique |
| `userId` | ObjectId | **FK** → users, requis | Propriétaire du thème |
| `name` | String | requis, trim | Nom du thème (ex: `"Violet Nuit"`) |
| `primaryColor` | String | défaut: `#6C63FF` | Couleur primaire (hex) |
| `secondaryColor` | String | défaut: `#FF6584` | Couleur secondaire (hex) |
| `bgColor` | String | défaut: `#F7F8FC` | Couleur de fond (hex) |
| `fontFamily` | String | défaut: `Inter` | Police de caractères |
| `isDark` | Boolean | défaut: `false` | Mode sombre activé |
| `isDefault` | Boolean | défaut: `false` | Thème actif par défaut |
| `createdAt` | Date | auto | Timestamp Mongoose |

### Collection : `categories`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | **PK** auto | Identifiant unique |
| `name` | String | unique, requis | Nom (ex: `"Productivité"`, `"Jeux"`) |
| `color` | String | défaut: `#888888` | Couleur d'identification |
| `icon` | String | défaut: `grid` | Icône représentative |
| `order` | Number | défaut: `0` | Ordre d'affichage dans la sidebar |

### Collection : `userapps` *(table de jonction)*

> Gère la relation N-N entre `users` et `applications` avec les préférences individuelles de chaque utilisateur.

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | **PK** auto | Identifiant unique |
| `userId` | ObjectId | **FK** → users, requis | Référence à l'utilisateur |
| `appId` | ObjectId | **FK** → applications, requis | Référence à l'application |
| `position` | Number | défaut: `0` | Ordre dans la grille |
| `isPinned` | Boolean | défaut: `false` | Application épinglée en favoris |
| `lastUsed` | Date | optionnel | Date du dernier lancement |
| `usageCount` | Number | défaut: `0` | Nombre total de lancements |
| `createdAt` | Date | auto | Timestamp Mongoose |

> **Index unique :** `{ userId, appId }` — Un utilisateur ne peut avoir qu'une seule entrée par application, garantissant l'absence de doublons.

### Relations entre collections

| Relation | Cardinalité | Via | Description |
|----------|-------------|-----|-------------|
| `users` → `themes` | **1..N** | `themes.userId` | Un utilisateur peut créer plusieurs thèmes |
| `users` → `applications` | **N..N** | `userapps` | Via table de jonction avec préférences |
| `applications` → `categories` | **N..1** | `applications.categoryId` | Une app appartient à une catégorie |
| `users` → thème actif | **1..1** | `users.activeThemeId` | Un seul thème actif par utilisateur |

---

## 5. Structure du projet

```
AppLauncher/
│
├── electron/                        # Couche bureau (Electron)
│   ├── main.js                      # Point d'entrée + canaux IPC
│   ├── preload.js                   # ContextBridge sécurisé React ↔ OS
│   └── scanApps.js                  # Détection apps Windows installées
│
├── frontend/                        # Application React (Vite)
│   └── src/
│       ├── components/
│       │   ├── AppCard.jsx          # Carte d'application (favori, masquer)
│       │   ├── AppGrid.jsx          # Grille responsive d'applications
│       │   ├── AddAppModal.jsx      # Modal d'ajout (parcourir .exe / URL)
│       │   ├── Navbar.jsx           # Barre de navigation + recherche + thème
│       │   ├── Sidebar.jsx          # Menu latéral + catégories
│       │   ├── ThemeSwitcher.jsx    # Sélecteur de thème
│       │   └── PrivateRoute.jsx     # Protection des routes authentifiées
│       ├── pages/
│       │   ├── DashboardPage.jsx    # Tableau de bord principal
│       │   ├── FavoritesPage.jsx    # Applications épinglées
│       │   ├── LoginPage.jsx        # Connexion + Inscription
│       │   └── SettingsPage.jsx     # Gestion des thèmes
│       ├── context/
│       │   ├── AuthContext.jsx      # État global d'authentification
│       │   └── ThemeContext.jsx     # État global des thèmes
│       ├── hooks/
│       │   ├── useAuth.js           # Hook d'accès à AuthContext
│       │   └── useTheme.js          # Hook d'accès à ThemeContext
│       ├── services/
│       │   ├── api.js               # Instance Axios + intercepteurs JWT
│       │   ├── authService.js       # Appels API auth (login, register)
│       │   ├── appService.js        # Appels API applications
│       │   └── themeService.js      # Appels API thèmes
│       ├── styles/
│       │   ├── global.css           # Variables CSS + layout général
│       │   └── themes.css           # Styles mode sombre/clair
│       └── utils/
│           └── helpers.js           # formatDate, truncate, debounce
│
├── backend/                         # API Node.js + Express
│   ├── config/
│   │   └── db.js                    # Connexion MongoDB
│   ├── models/
│   │   ├── User.js                  # Schéma Mongoose Users
│   │   ├── Application.js           # Schéma Mongoose Applications
│   │   ├── Theme.js                 # Schéma Mongoose Themes
│   │   ├── Category.js              # Schéma Mongoose Categories
│   │   └── UserApp.js               # Schéma Mongoose UserApps
│   ├── routes/
│   │   ├── auth_routes.js           # POST /register, POST /login
│   │   ├── apps_routes.js           # CRUD apps + pin + scan + remove
│   │   ├── themes_routes.js         # CRUD thèmes + activate
│   │   └── users_routes.js          # Profil + mot de passe
│   ├── controllers/
│   │   ├── auth_controller.js       # register, login, updateProfile...
│   │   ├── apps_controller.js       # getMyApps, togglePin, scanAndSave...
│   │   └── themes_controller.js     # getAll, create, activate...
│   ├── middleware/
│   │   ├── auth_middleware.js       # protect (JWT), adminOnly
│   │   ├── error_middleware.js      # Gestion globale des erreurs
│   │   └── validate_middleware.js   # Validation Joi
│   ├── utils/
│   │   ├── jwt.utils.js             # signToken, verifyToken
│   │   └── hash.utils.js            # hashPassword, comparePassword
│   ├── app.js                       # Configuration Express
│   ├── server.js                    # Point d'entrée serveur
│   └── .env                         # Variables d'environnement (non versionné)
│
├── package.json                     # Config Electron + electron-builder
└── README.md
```

---

## 6. Fonctionnalités

###  Authentification
- Inscription avec email, mot de passe et prénom
- Connexion sécurisée — retourne un JWT (7 jours d'expiration)
- Déconnexion avec purge du `localStorage`
- Routes protégées via `PrivateRoute` (React Router v6)
- Création automatique d'un thème par défaut au premier login

###  Gestion des applications
- **Ajout via explorateur Windows** — `dialog.showOpenDialog()` ouvre un explorateur natif pour sélectionner un `.exe`
- **Ajout d'app web** — saisie manuelle d'une URL
- **Scan automatique** — détection des applications populaires installées (`Chrome`, `VLC`, `VS Code`, `Discord`…)
- **Suppression** — retire définitivement l'application de la liste de l'utilisateur
- **Lancement d'un `.exe`** via `child_process.exec`
- **Lancement d'une app web** via `window.open`

### ⭐ Favoris & organisation
- Épingler / désépingler une application en favoris (survol de la carte)
- Page dédiée aux applications favorites
- Compteur d'utilisation et date du dernier lancement enregistrés

###  Thèmes & personnalisation
- Création de thèmes personnalisés (couleur primaire, fond, police)
- **Basculement instantané ☀️ / 🌙** via boutons dans la navbar
- Application du thème en temps réel via variables CSS (`--color-primary`, `--color-bg`…)
- Persistance du thème actif en base de données
- Modification et suppression des thèmes depuis les paramètres

###  Recherche
- Barre de recherche en temps réel dans la navbar
- Filtrage instantané des applications par nom (debounce 300ms)

---

## 7. Sécurité

### JWT & Authentification
- Tokens signés avec `jsonwebtoken` (algorithme HS256)
- `JWT_SECRET` stocké en variable d'environnement, jamais dans le code
- Expiration configurable via `JWT_EXPIRES_IN`
- Intercepteur Axios côté frontend : injecte le token à chaque requête et redirige vers `/login` si 401

### Mots de passe
- Hachage avec `bcryptjs` — salt rounds = 10
- Le hash n'est jamais retourné par l'API (`toPublic()` l'exclut)
- Comparaison avec `bcrypt.compare` — pas de déchiffrement possible

### Electron
- `contextIsolation: true` — React ne peut pas accéder directement à Node.js
- `nodeIntegration: false` — isolation complète du renderer
- `contextBridge.exposeInMainWorld` — seules les fonctions explicitement exposées sont accessibles depuis React
- Canaux IPC nommés et explicites (`pick-file`, `launch-exe`, `scan-apps`)

### API
- Middleware `protect` sur toutes les routes sauf `/register` et `/login`
- Middleware `adminOnly` sur les routes de modification du catalogue global
- Middleware de validation Joi — données nettoyées avant traitement

---

## 8. Guide d'installation

### Prérequis

- **Node.js** v18 ou supérieur
- **MongoDB** v6 ou supérieur (local ou [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v9 ou supérieur

### Installation

**1. Cloner le dépôt**

```bash
git clone https://github.com/votre-username/applauncher.git
cd AppLauncher
```

**2. Installer les dépendances Electron (racine)**

```bash
npm install
```

**3. Installer les dépendances backend**

```bash
cd backend
npm install
```

**4. Configurer les variables d'environnement**

Créez le fichier `backend/.env` en copiant `.env.example` :

```bash
cp backend/.env.example backend/.env
```

Remplissez les valeurs :

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/applauncher
JWT_SECRET=remplacez_par_une_chaine_aleatoire_longue_et_complexe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**5. Installer les dépendances frontend**

```bash
cd frontend
npm install
```

### Lancer en développement

Ouvrez **3 terminaux** :

```bash
# Terminal 1 — MongoDB
mongod

# Terminal 2 — Backend
cd backend
npm run dev
# → Serveur démarré : http://localhost:5000

# Terminal 3 — Electron + Frontend
cd AppLauncher
npm run dev
# → Fenêtre Electron s'ouvre avec l'app React
```

### Compiler l'exécutable Windows

```bash
npm run build
# → dist-electron/AppLauncher Setup 1.0.0.exe
```

L'installeur NSIS permet à l'utilisateur de choisir son dossier d'installation et crée un raccourci dans le menu Démarrer.

---

## 9. API REST — Endpoints

Toutes les routes (sauf `/register` et `/login`) nécessitent le header :
```
Authorization: Bearer <token>
```

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Connexion — retourne un JWT |
| `POST` | `/api/auth/logout` | Déconnexion |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |
| `PUT` | `/api/users/profile` | Modifier le profil |
| `PUT` | `/api/users/password` | Changer le mot de passe |

### Applications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/apps/user/my` | Applications de l'utilisateur |
| `POST` | `/api/apps` | Ajouter une application |
| `POST` | `/api/apps/user/scan` | Sauvegarder les apps scannées |
| `POST` | `/api/apps/user/pin/:id` | Épingler / désépingler |
| `DELETE` | `/api/apps/user/remove/:id` | Supprimer une app de sa liste |
| `POST` | `/api/apps/:id/launch` | Enregistrer un lancement |
| `GET` | `/api/apps` | Catalogue global *(admin)* |
| `POST` | `/api/apps` | Ajouter au catalogue *(admin)* |
| `DELETE` | `/api/apps/:id` | Supprimer du catalogue *(admin)* |

### Thèmes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/themes` | Lister ses thèmes |
| `POST` | `/api/themes` | Créer un thème |
| `PUT` | `/api/themes/:id` | Modifier un thème |
| `PUT` | `/api/themes/:id/activate` | Activer un thème |
| `DELETE` | `/api/themes/:id` | Supprimer un thème |

---

## 10. Choix de conception

### Context API plutôt que Redux
L'application n'a que 2 états globaux (auth et thème). Redux aurait ajouté une complexité injustifiée (actions, reducers, store, selectors). Context + `useRef` résout les problèmes de re-render sans dépendances supplémentaires.

### JWT Stateless
L'authentification sans session serveur a été choisie pour :
- Compatibilité avec Electron (pas de cookies cross-origin)
- Scalabilité — le serveur ne stocke aucun état de session
- Vérification par signature cryptographique uniquement

### IPC Electron avec `contextBridge`
La communication React ↔ OS utilise le pattern IPC avec `contextIsolation: true` :
- `preload.js` expose uniquement les fonctions nécessaires
- `nodeIntegration: false` empêche l'accès direct à Node.js depuis React
- Chaque action OS est un canal IPC explicitement nommé

### Suppression définitive plutôt que masquage
Plutôt que de garder un flag `isHidden` en base, la suppression d'une app retire définitivement le lien `UserApp`. Cela simplifie les requêtes MongoDB et évite l'accumulation de données inutiles.

### `useCallback` + `useRef` pour la stabilité
`handleSearch` est mémorisé avec `useCallback(fn, [])` et lit les apps depuis un `useRef` au lieu du state. Cela évite de recréer la fonction debounce à chaque render, ce qui causait une boucle infinie `Navbar → DashboardPage → Navbar`.

---

## 11. Perspectives d'amélioration

- [ ] **Icônes automatiques** — extraire l'icône des `.exe` via `app.getFileIcon()` d'Electron
- [ ] **Drag & drop** — réorganiser les apps dans la grille par glisser-déposer
- [ ] **Catégories personnalisées** — permettre à l'utilisateur de créer ses propres catégories
- [ ] **Statistiques d'utilisation** — graphiques sur les apps les plus utilisées
- [ ] **Import/Export** — sauvegarder et restaurer sa configuration
- [ ] **Raccourcis clavier** — lancer une app depuis le clavier
- [ ] **Notifications** — rappels pour les apps non utilisées depuis longtemps
- [ ] **Version cloud** — synchroniser ses apps entre plusieurs PC via MongoDB Atlas
- [ ] **Tests automatisés** — Jest (backend) + React Testing Library (frontend)
- [ ] **Mode multi-utilisateur** — partager un catalogue d'apps en équipe

---

## Licence

MIT © 2026 — AppLauncher

---

*Documentation Technique v1.0.0 — Avril 2026*
