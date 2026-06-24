# Suivi de realisation - School

Derniere mise a jour : 2026-06-19

## Socle projet

- [x] Creer le projet Next.js directement a la racine du dossier `school`.
- [x] Copier les trois documents de specification a la racine.
- [x] Ajouter l'image hero issue du design `blog`.
- [x] Installer les dependances principales de la plateforme.
- [x] Aligner Prisma sur une version compatible avec Node local.

## Design et experience

- [x] Reprendre le systeme visuel du dossier `blog` : grille, surfaces, accent vert, cyan et ambre.
- [x] Creer le layout racine, header, menu mobile, theme sombre/clair et composants UI.
- [x] Verifier l'app localement par HTTP sur `http://127.0.0.1:3002`.
- [x] Reprendre l'UI publique pour enlever les textes techniques et renforcer la direction produit.
- [x] Ajouter un footer global avec liens utiles, certificat, WhatsApp et copyright.
- [x] Corriger la navigation publique vers une vraie recherche de certificat.
- [x] Auditer les micro-retours UI : actions silencieuses remplacees par bandeaux de confirmation.

## Fonctionnel public

- [x] Page d'accueil mobile-first.
- [x] Inscription avec validation Zod, hash mot de passe, token email hashe, EmailLog et audit.
- [x] Acceptation obligatoire des conditions a l'inscription.
- [x] Renvoi de validation email sans enumeration publique et avec limitation de frequence.
- [x] Connexion reelle par email/mot de passe hashe, statut de compte et session signee.
- [x] Validation email par token hashe et usage unique.
- [x] Mot de passe oublie avec token hashe, page de reset et token consomme.
- [x] Ajouter liens d'aller-retour inscription/connexion/mot de passe oublie dans l'UI.
- [x] Ajouter affichage/masquage du mot de passe dans connexion, inscription et reset.
- [x] Ajouter l'option `Rester connecte` avec duree de session adaptee.
- [x] Ajouter une page publique `/certificates/verify` avec champ de recherche.
- [x] Corriger les etats lecon video/document/texte pour eviter les liens morts et textes incoherents.
- [x] Choix d'acces avec creation de TrainingRequest et lien WhatsApp hors plateforme.
- [x] Pages legales.

## Espaces prives

- [x] Dashboard apprenant.
- [x] Pages formations, lecons, quiz, certificats, notifications, lives, communaute et profil branchees sur Prisma.
- [x] Progression lecon et soumission quiz avec QuizAttempt, score, LessonProgress et certificat si parcours termine.
- [x] Verrouillage sequentiel des lecons/quiz et blocage serveur des acces directs verrouilles.
- [x] Lecteur video protege avec watermark, reprise de position et sauvegarde reguliere.
- [x] Route document privee protegee pour eviter l'exposition des chemins fichiers.
- [x] Notifications apprenant : marquer une notification ou tout marquer comme lu.
- [x] Dashboard formateur.
- [x] Pages demandes, apprenants, calendrier, lives, communaute, imports/exports et notifications branchees sur Prisma.
- [x] Attribution/refus des demandes avec Enrollment, activation compte, notification et audit.
- [x] Attribution manuelle d'une formation depuis le builder avec email, notification et audit.
- [x] Retrait/reactivation d'acces sans suppression de progression, avec email si retrait.
- [x] Builder formation : modification, publication, archivage, modules, lecons, quiz, upload video/document prive.
- [x] Calendrier : creation d'appel, notes, changement de statut et notification.
- [x] Communaute : publication ciblee, commentaires apprenants, fermeture commentaires et moderation.
- [x] Import Excel apprenants avec creation/mise a jour des comptes et inscriptions.
- [x] Dashboard admin.
- [x] Pages utilisateurs, certificats, parametres et logs branchees sur Prisma.
- [x] Suspension/reactivation utilisateur avec audit.
- [x] Suppression logique utilisateur avec statut `DELETED` et invalidation de session.
- [x] Revocation admin des certificats avec audit.

## Backend et securite

- [x] Schema Prisma complet.
- [x] Proxy Next.js 16 pour les routes protegees.
- [x] Helpers session cookies HTTP-only avec JWT signe par `jose`.
- [x] Route video privee controlee cote serveur.
- [x] Route video privee avec verification session, statut compte, inscription active, dossier prive et Range headers.
- [x] Route document privee avec verification session, statut compte, inscription active/completed et dossier prive.
- [x] Bloquer la publication d'une formation tant que ses lecons ou quiz ne sont pas complets.
- [x] Verifier la signature binaire des uploads et servir les documents avec telechargement securise.
- [x] Enregistrer la duree video et borner la progression cote serveur par le temps ecoule.
- [x] Refuser les mutations JSON de progression depuis une origine externe.
- [x] Route cron pour les relances automatiques depuis les vrais etats apprenants.
- [x] Generation PDF des certificats depuis la table Certificate.
- [x] Export Excel apprenants et progressions depuis Prisma.
- [x] Seed Prisma enrichi : admin, formateur, apprenant, formation, modules, lecons, quiz, live, communaute.
- [x] Creation formateur par admin avec lien temporaire de definition du mot de passe.
- [x] Creation d'annonces live avec cible, notifications et emails journalises.
- [x] Documentation d'exploitation dans le README.

## Corrections apres audit

- [x] Remplacer le cookie role brut par une session signee.
- [x] Centraliser les schemas Zod dans `src/lib/validation.ts`.
- [x] Corriger le `ThemeProvider` signale par ESLint.
- [x] Corriger les apostrophes JSX non echappees.
- [x] Corriger la commande Next 16 : utiliser `--hostname`, pas `--host`.
- [x] Verifier que le port `3000` ne servait pas ce projet et lancer School sur `3002`.
- [x] Supprimer les imports `demo-data` des espaces prives et routes metier.
- [x] Corriger le warning Turbopack de la route video.
- [x] Proteger les exports Excel par session formateur/admin et audit.
- [x] Revalider les sessions privees contre la base : role reel, statut suspendu, email non valide.
- [x] Ajouter limite de tentatives login avec table `LoginAttempt`.
- [x] Bloquer le fallback `SESSION_SECRET` en production.
- [x] Echapper les contenus injectes dans les emails HTML.
- [x] Limiter les demandes de reset password et invalider les anciens tokens.
- [x] Invalider les anciennes sessions apres reset password ou changement de statut.
- [x] Ajouter gardes anti-spam pour les relances.
- [x] Journaliser les tentatives video non autorisees.
- [x] Journaliser les acces video/document autorises sans exposer les fichiers publiquement.
- [x] Empecher une demande d'acces pour l'email d'un autre compte.
- [x] Limiter les demandes WhatsApp repetees en attente.
- [x] Gerer les certificats revoques avec `Certificate.revokedAt`.
- [x] Limiter la taille d'import Excel.
- [x] Verifier extension/MIME des imports Excel.
- [x] Verifier extension/MIME/taille des uploads de lecons et renommer les fichiers.
- [x] Ajouter headers de securite Next.js.
- [x] Distinguer formateur principal et assistant pour les actions sensibles.
- [x] Ajouter parametres configurables : identite plateforme, TTL reset, relances, quota email, upload max, securite.
- [x] Journaliser les connexions reussies, echouees et bloquees.
- [x] Documenter deploiement, cron et sauvegardes PostgreSQL/uploads.
- [x] Corriger la configuration locale : `SESSION_SECRET` et `CRON_SECRET` ne sont plus les valeurs par defaut.
- [x] Aligner `APP_URL` local sur `http://127.0.0.1:3002`.
- [x] Remplacer `xlsx` par `exceljs` pour supprimer les vulnerabilites hautes sans correctif.
- [x] Mettre a jour `nodemailer` et verrouiller `postcss`/`uuid` via overrides de securite.

## Verification

- [x] `npm run lint` avant reprise securite.
- [x] `npm run typecheck` avant reprise securite.
- [x] `npm run build` avant reprise securite.
- [x] `npm run prisma:generate` avant reprise securite.
- [x] Relancer `npm run prisma:generate` apres ajouts `LoginAttempt`, `Certificate.revokedAt`, `AccountStatus.DELETED`, `User.sessionInvalidatedAt`.
- [x] Relancer `npm run lint`.
- [x] Relancer `npm run typecheck`.
- [x] Relancer `npm run build`.
- [x] Appliquer la migration PostgreSQL locale `20260618221339_init_school_platform`.
- [x] Appliquer la migration PostgreSQL locale `20260624000000_add_video_duration`.
- [x] Relancer `npm run prisma:seed`.
- [x] Demarrer le serveur dev sur `http://127.0.0.1:3002`.
- [x] Verifier la page d'accueil dans le navigateur integre.
- [x] Verifier les routes publiques/protegees sans session par HTTP.
- [x] Redemarrer le serveur dev apres rotation des secrets `.env`.
- [x] Smoke test connecte final avec les comptes seed.
- [x] `npm audit --audit-level=moderate --omit=dev` : 0 vulnerabilite.
- [x] Smoke test exports Excel apres remplacement de `xlsx`.
- [x] Verification navigateur des pages publiques : accueil, connexion, inscription, recherche certificat.
- [x] Smoke HTTP des pages publiques : accueil, login, register, forgot password, certificat lookup/result.
- [x] Smoke HTTP connecte des bandeaux d'action : notifications, profil, lecon, demandes, calendrier, communaute, builder, utilisateurs, certificats.
- [ ] Test navigateur manuel complet apprenant/formateur/admin.

Note verification 2026-06-18 : `npm run prisma:generate`, `npm run lint`, `npm run typecheck` et `npm run build` passent apres corrections.
Note runtime 2026-06-18 : PostgreSQL local est migre et seed, le serveur dev a demarre sur `3002`. Une faille de configuration locale a ete corrigee apres coup : les secrets `.env` doivent etre recharges par redemarrage du serveur avant le smoke connecte final.
Note runtime 2026-06-19 : apres redemarrage du serveur, smoke test connecte OK sur `3002` : pages apprenant, formateur, admin, exports autorises, blocages inter-espaces, protections sans session et cron sans secret.
Note securite 2026-06-19 : audit npm production corrige. `xlsx` retire, exports/imports passes sur `exceljs`, `nodemailer` mis a jour, overrides `postcss` et `uuid` appliques. Build final OK.
Note UI 2026-06-19 : accueil simplifie, faux catalogue public retire, footer ajoute, recherche certificat ajoutee, liens auth complets, bouton voir/masquer mot de passe et option rester connecte ajoutes. Lint, typecheck, build et audit OK.
Note UX 2026-06-19 : audit des actions directes complete. Les actions de statut/moderation/lecture/profil affichent maintenant un retour clair apres clic. Smoke connecte des pages avec notices OK.
Note livraison 2026-06-24 : correction de session appliquee. Le traitement du login sans case "Rester connecte" est corrige, la deconnexion ne repond plus au GET (donc aucun prechargement ne peut effacer la session), et les boutons utilisent POST. Navigation admin unifiee avec les operations formateur. Lint, typecheck, build, generation Prisma et audit npm production sont valides. Smoke HTTP production : accueil/login OK, espace prive redirige sans session, GET logout 405, POST logout supprime le cookie, video/document prives refuses sans session et progression video protegee contre origine externe.
