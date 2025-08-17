# ECORIDE 2025 – Plateforme de covoiturage durable

Projet complet React + Symfony développé dans le cadre d’un examen ECF de Développeur Web.  
L'application permet la mise en relation de covoitureurs, avec une interface moderne et une API sécurisée.

---

## 📁 Structure du projet

/frontend # Application React (Vite)
└── /src
└── /pages
└── /components
└── /context
└── /utils
└── App.jsx
└── main.jsx

/backend # Application Symfony
└── /src
└── /config
└── /public
└── /migrations
└── .env

## ⚙️ Technologies utilisées

### Frontend (React + Vite)

- React 18
- React Router DOM
- Bootstrap 5
- JWT Auth avec localStorage
- Vite + dotenv (`.env.production`)
- OpenRouteService API (calcul d'itinéraires)

### Backend (Symfony)

- Symfony 6.x
- API Platform
- JWT Authentication (LexikJWTAuthenticationBundle)
- Doctrine ORM + PostgreSQL (ou MySQL)
- CORS configuré pour autoriser le frontend
- OpenAPI (Swagger) auto-documentation

---

## 🚀 Installation locale

### 🔧 Prérequis

- PHP >= 8.1
- Composer
- Node.js >= 18 + npm
- Symfony CLI (optionnel)
- Base de données (PostgreSQL ou MySQL)

---

### 1. Cloner le projet

```bash
git clone https://github.com/ton-repo/ecoride2025.git
cd ecoride2025

cd backend


2. Backend – Symfony
# Installer les dépendances PHP
composer install

# Copier la config d'environnement
cp .env .env.local

# Générer les clés JWT
mkdir -p config/jwt
openssl genrsa -out config/jwt/private.pem -aes256 4096
openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem

# Générer la BDD
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Lancer le serveur Symfony
symfony server:start -d
✅ L’API est disponible sur http://127.0.0.1:8000



3. Frontend – React
cd ../frontend

# Installer les dépendances JS
npm install

# Fichier d’environnement
cp .env.production .env

# Démarrer le serveur de dev
npm run dev
✅ Le frontend est accessible sur http://localhost:5173


🔐 Authentification
Basée sur JWT
Stockée dans le localStorage
Redirection automatique si le token est expiré (PrivateRoute)

Rôles : Utilisateur / Employé / Administrateur


🔒 Pages protégées
Certaines routes sont protégées à l’aide d’un composant PrivateRoute.
L’accès est bloqué sans token JWT valide :

<Route path="/compteutilisateur" element={
  <PrivateRoute> <CompteUtilisateur /> </PrivateRoute>
} />


🧪 Tests manuels
Connexion / déconnexion

Redirection automatique si token expiré

Création d’utilisateur

Simulation de trajets (API OpenRoute)

Affichage conditionnel selon le rôle

📦 Déploiement
Sur AlwaysData (gratuit)
Backend
Déployer Symfony dans /www

Créer un Virtual Host

Configurer Apache pour public/ comme racine

PHP 8.2, COMPOSER_ALLOW_SUPERUSER=1

Frontend
Construire le projet :

bash
Copier
Modifier
npm run build
Déployer le dossier dist/ dans /www/frontend

Apache doit pointer vers dist/index.html

Variables d’environnement
Dans .env.production (frontend) :
VITE_API_URL=https://ecoride2025.alwaysdata.net


📚 Ressources utiles
- API Platform Docs
- JWT Auth in Symfony
- Vite
- React Router DOM


👨💻 Vincent L
Projet réalisé pour la session 2025
Formation Développeur Web – STUDI
