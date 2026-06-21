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
npm run prisma:import
```

## Notes

- Le projet est initialise directement a la racine du dossier `blog/`.
- Le cahier technique et le suivi restent a la racine de ce dossier.
- La V1 cible un site public SEO, mobile-first, puis un admin simple.
- Les donnees applicatives sont stockees dans PostgreSQL via Prisma. Le fichier `data/content.json` est uniquement une sauvegarde legacy a importer une fois, jamais une source runtime.
- Pour initialiser une base neuve : configure `DATABASE_URL`, lance `npx prisma migrate deploy`, puis `npm run prisma:import`. L'import refuse une base non vide sans l'option explicite `--replace`.

## Production

Variables importantes :

- `AUTH_SECRET` : secret long, 32 caracteres minimum en production.
- `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` ou `ADMIN_PASSWORD` : requis pour le seed Prisma en production.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` : activent l'envoi email des messages contact.
- `NEXT_IMAGE_REMOTE_HOSTS` : allowlist des domaines servis par `next/image`.

La migration legacy des comptes sans hash de mot de passe desactive ces comptes par securite, sauf le compte dont l'email correspond a `ADMIN_EMAIL` et pour lequel `ADMIN_PASSWORD_HASH` ou `ADMIN_PASSWORD` est configure. Les mots de passe des autres comptes doivent etre redefinis depuis l'admin.

Securite deja activee :

- cookies admin `httpOnly`, `sameSite=strict`, limites au chemin `/admin` ;
- verification Origin sur les mutations sensibles ;
- rate limit login, contact, newsletter et temoignages ;
- upload local limite a jpg, png, webp, gif, mp4 et pdf jusqu'a 15 Mo ;
- refus des SVG uploades ;
- sanitation du contenu riche ;
- headers de securite, CSP et HSTS en production ;
- export CSV newsletter protege contre les formules injectees.
