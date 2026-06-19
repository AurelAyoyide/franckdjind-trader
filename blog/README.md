# Blog trader

Projet Next.js fullstack pour un blog/vitrine de trader-formateur.

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Notes

- Le projet est initialise directement a la racine du dossier `blog/`.
- Le cahier technique et le suivi restent a la racine de ce dossier.
- La V1 cible un site public SEO, mobile-first, puis un admin simple.
- Les donnees applicatives courantes sont stockees dans `data/content.json`.
- Le schema Prisma/PostgreSQL est present et aligne pour une migration production, mais la bascule runtime vers PostgreSQL doit etre faite avec une migration de donnees controlee.

## Production

Variables importantes :

- `AUTH_SECRET` : secret long, 32 caracteres minimum en production.
- `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` ou `ADMIN_PASSWORD` : requis pour le seed Prisma en production.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` : activent l'envoi email des messages contact.
- `NEXT_IMAGE_REMOTE_HOSTS` : allowlist des domaines servis par `next/image`.

Securite deja activee :

- cookies admin `httpOnly`, `sameSite=strict`, limites au chemin `/admin` ;
- verification Origin sur les mutations sensibles ;
- rate limit login, contact, newsletter et temoignages ;
- upload local limite a jpg, png, webp, gif, mp4 et pdf jusqu'a 15 Mo ;
- refus des SVG uploades ;
- sanitation du contenu riche ;
- headers de securite, CSP et HSTS en production ;
- export CSV newsletter protege contre les formules injectees.
