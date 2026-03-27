# The BEES — Plateforme BDE

Site vitrine one-page (style épuré type Apple), fiches membres avec autobiographie structurée, suggestions/questions (e-mail pour les membres féminins, anonyme pour les autres), et dashboard d’administration. Backend **Node.js (Express)** et **MongoDB (Mongoose)**.

## Prérequis

- Node.js 18+
- MongoDB en local ou URI cloud (MongoDB Atlas)

## Installation

```bash
cd "/Users/valentino/The BEES"
npm install
npm run install:all
```

## Configuration

```bash
cp server/.env.example server/.env
```

Éditez `server/.env` :

- `MONGODB_URI` — connexion MongoDB
- `JWT_SECRET` — chaîne longue et secrète
- `ADMIN_PASSWORD_HASH` — hash admin à taper tel quel dans l’écran de connexion
- `ADMIN_2FA_EMAIL` — e-mail recevant le code OTP
- `CLIENT_URL` — en dev : `http://localhost:5173`
- `SMTP_*` + `MAIL_FROM` — SMTP pour l’envoi du code 2FA

## Lancer en développement

Terminal 1 — API (port 4000) :

```bash
npm run dev --prefix server
```

Terminal 2 — interface (port 5173, proxy vers l’API) :

```bash
npm run dev --prefix client
```

Ou tout d’un coup (après `npm install` à la racine pour `concurrently`) :

```bash
npm run dev
```

Ouvrez **http://localhost:5173**. Administration : route privée non exposée (voir constante `client/src/constants/adminPath.js`).

## Production (aperçu)

1. À la racine : `npm run install:all` puis `npm run build` (ou `npm run render-build` qui enchaîne les deux).
2. Démarrez : `npm start` — Express sert l’API (`/api/*`, `/uploads`) **et** le site React depuis `client/dist` (même origine : pas besoin de `VITE_API_URL`).
3. Si l’API est sur un **autre** domaine que le front, buildez avec par ex. `VITE_API_URL=https://api.exemple.fr npm run build --prefix client`.
4. Les fichiers uploadés sont dans `server/uploads` ; sur un PaaS sans disque persistant, prévoyez un stockage objet (S3, etc.) ou un **disque persistant** (Render Disk).

### Déploiement Render (Web Service)

1. Créez une base **MongoDB Atlas** (gratuite) et récupérez l’URI `mongodb+srv://...`.
2. Sur [Render](https://render.com) : **New → Web Service**, connectez le dépôt Git.
3. **Build Command** : `npm install && npm run render-build`  
   **Start Command** : `npm start`
4. Variables d’environnement (tableau de bord Render) :
   - `MONGODB_URI` — URI Atlas
   - `JWT_SECRET` — chaîne longue et secrète
  - `ADMIN_PASSWORD_HASH` — hash admin
  - `ADMIN_2FA_EMAIL` — e-mail OTP
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` — envoi du code 2FA
   - `PORT` — laissé géré par Render (ne pas fixer en dur si vous suivez le code actuel)
   - Optionnel : `CLIENT_URL` = URL publique du service (ex. `https://the-bees.onrender.com`) si vous restreignez le CORS plus tard
5. Optionnel : **Blueprint** via le fichier `render.yaml` à la racine du dépôt.
6. Pour que les uploads survivent aux redéploiements : **Disks** sur le service, monté sur le chemin utilisé par l’app pour `uploads` (voir `server/src/middleware/upload.js`).

## Fonctionnalités

- **Accueil** : hero (bannière par défaut ou image médiathèque), section **Esprit ruche** (texte + carte visuelle), membres, **footer jaune** (#F0C016).
- **Qui suis-je ?** : page par membre avec les 5 blocs d’autobiographie.
- **Suggestions** : pour un membre en **femme**, l’e-mail est obligatoire ; pour **homme** ou **autre**, envoi anonyme. Liste dans le dashboard.
- **Dashboard** : sidebar (Membres, Médias, Images du site, Suggestions), photos membres (survol → import), **médiathèque** (upload), choix des images **hero** et **section ruche**.
