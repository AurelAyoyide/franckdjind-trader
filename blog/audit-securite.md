# Audit securite - Blog Trader

Date : 2026-06-18

## Corrections appliquees

- [x] Audit dependances npm : aucune vulnerabilite moderee ou plus haute detectee.
- [x] Verification Origin sur les mutations publiques et admin.
- [x] Rate limit login par IP/email.
- [x] Rate limit contact, newsletter et temoignages.
- [x] Cookies admin `httpOnly`, `sameSite=strict`, limites au chemin `/admin`.
- [x] Rejet des cookies de session malformes sans erreur serveur.
- [x] Secret admin obligatoire et long en production.
- [x] Upload local limite a jpg, png, webp, gif, mp4 et pdf.
- [x] SVG uploades refuses.
- [x] Taille upload limitee a 15 Mo.
- [x] URLs de redirection, CTA, medias et liens d'action filtrees cote serveur.
- [x] JSON-LD echappe avant injection dans les scripts.
- [x] Contenu riche sanitise avant rendu.
- [x] Export CSV newsletter protege contre les formules injectees.
- [x] Headers de securite ajoutes, dont CSP et HSTS en production.
- [x] Permissions admin appliquees aux pages, actions serveur, navbar, dashboard et export.
- [x] Envoi email contact optionnel via Resend si les variables sont configurees.
- [x] Persistance runtime migree vers PostgreSQL via Prisma ; aucune lecture ou ecriture applicative ne depend de `data/content.json`.
- [x] Migration SQL versionnee et import legacy protege contre l'ecrasement accidentel d'une base non vide.
- [x] Comptes legacy sans hash de mot de passe desactives a l'import, sauf administrateur explicitement configure.
- [x] Suppression de comptes admin desactivee dans l'interface pour eviter de perdre le dernier acces administrateur.

## Points de production a confirmer

- [ ] Configurer `AUTH_SECRET` avec au moins 32 caracteres.
- [ ] Configurer `CONTACT_TO_EMAIL`, lancer le seed, puis choisir le mot de passe depuis « Mot de passe oublié ».
- [ ] Configurer `RESEND_API_KEY`, `CONTACT_TO_EMAIL` et `CONTACT_FROM_EMAIL` pour l'envoi email.
- [ ] Configurer `NEXT_IMAGE_REMOTE_HOSTS` pour les domaines d'images optimises par Next.
- [ ] Fournir et configurer la vraie `DATABASE_URL`, puis executer la migration et l'import PostgreSQL.
- [ ] Remplacer les contenus de demo et finaliser les textes legaux avec les informations reelles du client.
