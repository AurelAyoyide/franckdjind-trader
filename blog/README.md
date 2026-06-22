# Blog trader

Projet Next.js fullstack pour un blog/vitrine de trader-formateur.

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Le serveur de développement utilise `http://127.0.0.1:3001` afin d'éviter les services locaux déjà présents sur le port 3000.

## Notes

- Le projet est initialise directement a la racine du dossier `blog/`.
- Le cahier technique et le suivi restent a la racine de ce dossier.
- La V1 cible un site public SEO, mobile-first, puis un admin simple.
- Les donnees applicatives sont stockees dans PostgreSQL via Prisma. Le fichier `data/content.json` est uniquement une sauvegarde legacy a importer une fois, jamais une source runtime.
- Pour initialiser une base neuve : configure `DATABASE_URL`, `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH`, puis lance `npx prisma migrate deploy` et `npm run prisma:seed`. Le seed crée uniquement l’administrateur configuré et installe le contenu éditorial de départ (articles, services, catégories, tags et médias), sans faux contacts ni abonnés.
- `npm run prisma:import` est réservé à l’import exceptionnel d’une sauvegarde legacy. Il refuse une base non vide sans l’option explicite `--replace`.

## Production

Variables importantes :

- `AUTH_SECRET` : secret long, 32 caracteres minimum en production.
- `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` ou `ADMIN_PASSWORD` : requis pour le seed Prisma en production.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` : activent l'envoi email des messages contact et la réinitialisation de mot de passe. `CONTACT_FROM_EMAIL` doit utiliser un domaine vérifié dans Resend.
- `NEXT_IMAGE_REMOTE_HOSTS` : allowlist des domaines servis par `next/image`.

La migration legacy des comptes sans hash de mot de passe desactive ces comptes par securite, sauf le compte dont l'email correspond a `ADMIN_EMAIL` et pour lequel `ADMIN_PASSWORD_HASH` ou `ADMIN_PASSWORD` est configure. Les mots de passe des autres comptes doivent etre redefinis depuis l'admin.

### Deploiement VPS

Le projet est prevu pour tourner derriere un proxy inverse (Nginx ou Caddy) : Next ecoute uniquement sur `127.0.0.1:3001` et le proxy expose le domaine en HTTPS.

1. Copiez `.env.example` vers `.env` et renseignez toutes les variables de production, notamment `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, les adresses email et les identifiants Resend.
2. Installez les dépendances et préparez la base : `npm ci`, `npm run prisma:generate`, `npx prisma migrate deploy`, puis `npm run prisma:seed`. Cette commande doit être exécutée une fois sur une base neuve ; elle ne crée pas de compte de démonstration ni de message factice.
3. Validez et construisez : `npm run typecheck`, `npm run lint`, `npm run build`.
4. Lancez `npm run start` avec un gestionnaire de processus (systemd ou PM2) et configurez le proxy HTTPS vers `http://127.0.0.1:3001`.

Des modèles prêts à adapter sont disponibles dans `deploy/bonotrading.service.example` et `deploy/nginx-bonotrading.conf.example`. Conservez `public/uploads` sur un stockage persistant et incluez-le dans les sauvegardes du VPS, au même titre que PostgreSQL.

Ne copiez jamais le fichier `.env` local sur le VPS sans remplacer ses valeurs par des secrets de production. Apres deploiement, testez le contact, la newsletter et la reinitialisation de mot de passe avec une vraie boite mail.

Securite deja activee :

- cookies admin `httpOnly`, `sameSite=strict`, limites au chemin `/admin` ;
- verification Origin sur les mutations sensibles ;
- rate limit login, contact, newsletter et temoignages ;
- upload local limite aux images JPG, PNG, WebP et AVIF, verifiees par signature de fichier et limitees a 5 Mo ;
- refus des SVG uploades ;
- sanitation du contenu riche ;
- headers de securite, CSP et HSTS en production ;
- export CSV newsletter protege contre les formules injectees.
