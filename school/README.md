# School - Plateforme privee de formation

Projet Next.js cree directement a la racine du dossier `school` avec `create-next-app`.

## Commandes

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Lancer en local avec Next.js 16 :

```bash
npm run dev -- --hostname 127.0.0.1 --port 3002
```

Serveur de production local apres build :

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3002
```

## Configuration

Node.js recommande en local/prod : `20.19.0` ou plus recent. Les validations passent sur la machine actuelle,
mais certaines dependances de lint emettent un warning avec Node `20.12.0`.

Copier `.env.example` vers `.env`, puis renseigner. Prisma CLI lit `.env` pour `prisma migrate` et `prisma seed`.

- `DATABASE_URL` pour PostgreSQL.
- `SESSION_SECRET` pour les futures sessions signees.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` pour Google Analytics 4, au format `G-XXXXXXXXXX`. Laisser vide pour desactiver Analytics.
- `PRIVATE_UPLOAD_DIR` pour les videos et documents non publics.
- `MAX_PRIVATE_UPLOAD_MB` pour la taille maximale des fichiers prives.
- `PLATFORM_NAME`, `PLATFORM_LOGO_URL`, `PLATFORM_PRIMARY_COLOR` pour l'identite plateforme.
- `SMTP_*` pour les emails.
- `TRAINER_WHATSAPP_NUMBER` pour les demandes d'acces.
- `CRON_SECRET` pour la route de relance `/api/jobs/reminders`.
- `EMAIL_TOKEN_TTL_HOURS`, `RESET_PASSWORD_TOKEN_TTL_HOURS`, `REMINDERS_ENABLED`, `REMINDER_COOLDOWN_DAYS`, `REMINDER_MAX_EMAILS_PER_WEEK`, `CERTIFICATE_PREFIX` pour les parametres metier.
- `SECURITY_MAX_LOGIN_ATTEMPTS`, `SECURITY_LOGIN_WINDOW_MINUTES` pour la limite login.
- `INITIAL_ADMIN_EMAIL` pour l'adresse du premier super-admin. Elle doit etre definie avant l'initialisation de production.

## Comptes et donnees de demonstration

Il n'existe pas de mot de passe administrateur livre dans le depot. Cree le super-admin avec une adresse controlee et
la configuration SMTP/Resend renseignee :

```bash
npm run admin:bootstrap
```

La commande envoie un lien de definition de mot de passe a `INITIAL_ADMIN_EMAIL` (ou `CONTACT_TO_EMAIL`). Elle
desactive les anciens comptes de demonstration pour qu'ils ne soient jamais utilisables en production.

Les donnees de demonstration ne sont creees qu'en developpement, avec des variables explicites :

```bash
SEED_DEMO_DATA=true
SEED_DEMO_PASSWORD=un-mot-de-passe-local-solide
npm run prisma:seed
```

## Structure utile

- `cahier-des-charges-plateforme-formation.md`
- `annexe-technique-nextjs.md`
- `annexe-user-stories-acceptation.md`
- `suivi-realisation-school.md`
- `prisma/schema.prisma`
- `src/proxy.ts`
- `src/app/api/videos/[lessonId]/route.ts`
- `src/app/api/videos/[lessonId]/progress/route.ts`
- `src/app/api/documents/[lessonId]/route.ts`
- `src/app/api/jobs/reminders/route.ts`
- `src/app/api/certificates/[code]/pdf/route.ts`
- `src/app/api/exports/learners/route.ts`
- `src/app/api/exports/progress/route.ts`

## Notes

La version actuelle branche les principaux flux metier sur Prisma/PostgreSQL : inscription, validation email,
connexion par mot de passe hashe, demandes d'acces, attribution de formation, cours, notifications,
parametres, profil, quiz, progression, certificats, exports Excel, import Excel, creation formateur,
annonces live, calendrier d'appels, communaute, relances cron, uploads prives et streaming video prive.

Durcissements securite inclus : session revalidee en base, blocage des comptes suspendus, exports proteges,
limite de tentatives login, tokens hashes, reset password a usage unique, emails HTML echappes,
garde anti-spam des relances, logs d'audit, certificats revoques, suppression logique, invalidation des
anciennes sessions, headers de securite, routes documents/videos privees et verification MIME/extension/taille
des uploads. Les fichiers sont aussi controles par signature binaire. Pour les videos MP4, WebM et MOV, la duree
est lue depuis les metadonnees du fichier cote serveur ; `ffprobe` peut rester installe sur le VPS comme secours,
mais les conteneurs standards ne dependent plus uniquement de lui. La progression est ensuite bornee cote serveur
par le temps ecoule, sans faire confiance au pourcentage envoye par le navigateur.

Pour tester les flux dynamiques en developpement, appliquer le schema puis lancer le seed avec les deux variables
`SEED_DEMO_DATA=true` et `SEED_DEMO_PASSWORD` definies :

```bash
npm run prisma:migrate
npm run prisma:seed
```

## Verification effectuee

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run prisma:generate`
- `npm audit --audit-level=moderate --omit=dev`

Verification finale relancee le 2026-06-18 apres la derniere vague de durcissement : Prisma generate, lint,
typecheck et build passent.

Verification runtime relancee le 2026-06-19 apres migration PostgreSQL, seed, rotation des secrets et audit
dependances : smoke test connecte apprenant/formateur/admin OK, exports Excel OK, audit npm production a 0
vulnerabilite.

Verification de livraison relancee le 2026-06-24 : migration locale
`20260624000000_add_video_duration` appliquee, `npm run prisma:generate`, `npm run lint`, `npm run typecheck`,
`npm run build` et `npm audit --audit-level=moderate --omit=dev` passent. Le smoke HTTP de production locale
confirme les pages publiques, la redirection des espaces prives, `GET /logout` refuse (405), `POST /logout` qui
supprime la session, et les routes video/document privees refusees sans session. L'endpoint de progression refuse
une origine externe (403) avant toute ecriture.

Apres toute modification du schema Prisma, relancer dans cet ordre :

```bash
npm run prisma:generate
npm run lint
npm run typecheck
npm run build
```

En production, appliquer egalement les migrations avant le demarrage :

```bash
npx prisma migrate deploy
```

## Deploiement et sauvegardes

- Servir l'application derriere HTTPS.
- Utiliser PostgreSQL avec sauvegarde quotidienne de la base.
- Sauvegarder aussi `PRIVATE_UPLOAD_DIR`, car il contient videos, documents et futurs fichiers prives.
- Declencher les relances avec un cron `POST /api/jobs/reminders` et le header `Authorization: Bearer $CRON_SECRET`.
- Restaurer en important d'abord le dump PostgreSQL, puis le dossier prive d'uploads, puis relancer `npm run prisma:generate`.
- Garder `SESSION_SECRET`, `CRON_SECRET`, `SMTP_PASSWORD` et `DATABASE_URL` hors du depot.
