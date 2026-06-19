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
- `PRIVATE_UPLOAD_DIR` pour les videos et documents non publics.
- `MAX_PRIVATE_UPLOAD_MB` pour la taille maximale des fichiers prives.
- `PLATFORM_NAME`, `PLATFORM_LOGO_URL`, `PLATFORM_PRIMARY_COLOR` pour l'identite plateforme.
- `SMTP_*` pour les emails.
- `TRAINER_WHATSAPP_NUMBER` pour les demandes d'acces.
- `CRON_SECRET` pour la route de relance `/api/jobs/reminders`.
- `EMAIL_TOKEN_TTL_HOURS`, `RESET_PASSWORD_TOKEN_TTL_HOURS`, `REMINDERS_ENABLED`, `REMINDER_COOLDOWN_DAYS`, `REMINDER_MAX_EMAILS_PER_WEEK`, `CERTIFICATE_PREFIX` pour les parametres metier.
- `SECURITY_MAX_LOGIN_ATTEMPTS`, `SECURITY_LOGIN_WINDOW_MINUTES` pour la limite login.

Comptes de seed :

- `apprenant@example.com` / `SchoolDemo2026`
- `formateur@example.com` / `SchoolDemo2026`
- `admin@example.com` / `SchoolDemo2026`

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
des uploads.

Pour tester les flux dynamiques, appliquer le schema sur PostgreSQL puis lancer le seed :

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

Apres toute modification du schema Prisma, relancer dans cet ordre :

```bash
npm run prisma:generate
npm run lint
npm run typecheck
npm run build
```

## Deploiement et sauvegardes

- Servir l'application derriere HTTPS.
- Utiliser PostgreSQL avec sauvegarde quotidienne de la base.
- Sauvegarder aussi `PRIVATE_UPLOAD_DIR`, car il contient videos, documents et futurs fichiers prives.
- Declencher les relances avec un cron `POST /api/jobs/reminders` et le header `Authorization: Bearer $CRON_SECRET`.
- Restaurer en important d'abord le dump PostgreSQL, puis le dossier prive d'uploads, puis relancer `npm run prisma:generate`.
- Garder `SESSION_SECRET`, `CRON_SECRET`, `SMTP_PASSWORD` et `DATABASE_URL` hors du depot.
