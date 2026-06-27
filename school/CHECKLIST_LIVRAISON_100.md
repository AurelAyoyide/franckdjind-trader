# Checklist de livraison 100 % — School

> Objectif : ne déclarer la plateforme prête au client qu’après avoir coché chaque point avec une preuve : capture, test réalisé, log, export ou commande réussie.
>
> Règle : **codé ≠ testé ≠ déployé**. Une fonction vaut « terminée » seulement si ses trois états sont validés.

## 0. Règle de sortie

La livraison est autorisée uniquement si :

- [ ] Toutes les sections 1 à 12 sont cochées.
- [ ] Aucun écran n’affiche une erreur serveur, une page blanche ou un lien mort.
- [ ] Les parcours admin, formateur principal, assistant et apprenant ont été joués dans un navigateur réel.
- [ ] Le build de production et la migration de production réussissent.
- [ ] Une sauvegarde restaurable de la base et des fichiers privés existe.
- [ ] Les secrets de production ne sont ni dans Git ni affichés au navigateur.

---

## 1. Préparation des comptes de test

Créer des comptes dédiés au test, jamais les comptes réels du client :

- [ ] Un super-admin actif.
- [ ] Un formateur principal actif, propriétaire d’au moins deux formations.
- [ ] Un assistant formateur actif.
- [ ] Deux apprenants actifs : un sans formation et un avec deux formations.
- [ ] Un apprenant suspendu.
- [ ] Une formation gratuite publiée.
- [ ] Une formation payante publiée.
- [ ] Une formation brouillon.
- [ ] Une formation archivée.
- [ ] Un cours avec vidéo, PDF/document, leçon texte et quiz à plusieurs questions.
- [ ] Une formation terminée permettant de vérifier le certificat.

Preuve : tableau interne des comptes de test, sans mots de passe dans le dépôt.

---

## 2. Authentification, session et rôles

### Inscription et validation

- [ ] Inscription avec champs obligatoires, validation claire et mot de passe robuste.
- [ ] Refus des emails déjà utilisés.
- [ ] Email de validation envoyé et journalisé.
- [ ] Lien de validation valide une seule fois.
- [ ] Lien expiré ou invalide affiche une erreur propre.
- [ ] Renvoi de validation limité contre le spam.

### Connexion et déconnexion

- [ ] Connexion fonctionne avec **et sans** « Rester connecté ».
- [ ] Identifiants erronés n’indiquent pas si l’email existe.
- [ ] Limitation des tentatives de connexion vérifiée.
- [ ] Super-admin → `/admin/dashboard`.
- [ ] Formateur → `/trainer/dashboard`.
- [ ] Apprenant → `/student/dashboard`.
- [ ] Assistant → espace autorisé uniquement.
- [ ] Une navigation normale ne déconnecte jamais l’utilisateur.
- [ ] `GET /logout` renvoie 405 ; seul le POST déconnecte.
- [ ] Déconnexion efface la session et ramène vers `/login`.
- [ ] Suspendre, archiver ou réinitialiser un compte invalide les sessions existantes.

### Autorisations

- [ ] Apprenant bloqué de tous les écrans admin/formateur par URL directe.
- [ ] Formateur bloqué des écrans admin par URL directe.
- [ ] Assistant bloqué des actions de gestion non autorisées, côté serveur.
- [ ] Formateur principal limité à ses formations, apprenants, demandes, appels et lives.
- [ ] Super-admin accède à toutes les données et outils métier.
- [ ] Aucune action sensible ne dépend uniquement d’un bouton caché : le serveur vérifie toujours le rôle et le propriétaire.

---

## 3. UX, navigation et mobile

- [ ] Navigation active visible sur tous les espaces privés.
- [ ] Navigation admin regroupe clairement Administration / Gestion des formations / Plateforme.
- [ ] Retour facile vers dashboard admin depuis tout outil formateur ouvert par l’admin.
- [ ] Badge de notifications non lues visible pour l’apprenant.
- [ ] Tous les boutons ont un libellé explicite : pas de deux actions ambiguës du type « Désactiver » / « Suspendre ».
- [ ] Tous les écrans fonctionnent en largeur mobile 360 px, tablette et desktop.
- [ ] Boutons actionnables au doigt (hauteur minimale 44 px).
- [ ] Les formulaires sont lisibles, avec labels, exemples, aide et messages d’erreur utiles.
- [ ] Aucune action destructive ne se produit sans modale de confirmation.
- [ ] État vide utile sur chaque liste (pas seulement « Aucun résultat »).
- [ ] Pagination présente dès qu’une liste peut dépasser une page ; elle conserve les filtres actifs.
- [ ] Aucun texte technique, stack trace ou code d’erreur brut visible au client.

---

## 4. Gestion des formations — parcours formateur

### Builder par étapes

- [ ] Étape 1 — informations : titre, type, description, montant numérique, devise contrôlée, durée numérique et unité.
- [ ] Étape 2 — modules et leçons : ajout, modification, ordre et retrait sécurisé.
- [ ] Étape 3 — quiz : création d’un quiz puis ajout de plusieurs questions.
- [ ] Étape 4 — publication et attribution apprenants.
- [ ] Le formateur voit clairement l’étape courante et peut revenir à une étape précédente.
- [ ] Les actions terminées affichent un retour explicite et la page se rafraîchit avec la donnée créée.

### CRUD formation

- [ ] Créer une formation en brouillon.
- [ ] Lire la structure complète de la formation.
- [ ] Modifier toutes les informations de la formation.
- [ ] Publier uniquement si les contenus sont complets.
- [ ] Archiver une formation sans détruire les données historiques.
- [ ] Retirer une formation : supprimer seulement si aucun apprenant/donnée liée n’existe ; sinon archiver.
- [ ] Confirmer le retrait dans une modale.
- [ ] Une formation brouillon ou archivée n’est jamais visible ni accessible à un apprenant.
- [ ] Refonte toute la partie formation.

### Modules et leçons

- [ ] Créer, lire, modifier et retirer un module vide.
- [ ] Créer, lire, modifier et retirer une leçon non suivie.
- [ ] Refuser explicitement la suppression d’une leçon ayant progression, tentative ou certificat lié.
- [ ] Réordonner les modules et les leçons (fonction à vérifier ou à ajouter si absente).
- [ ] Leçon texte : contenu requis et affichage propre côté apprenant.
- [ ] Leçon vidéo : upload privé, contrôle extension/MIME/signature, durée détectée automatiquement, reprise de lecture.
- [ ] Leçon document : PDF, Word, PowerPoint, Excel ou image autorisés selon les formats définis ; téléchargement protégé.
- [ ] Aucun chemin de fichier privé n’apparaît dans le HTML ou une URL publique.

### Quiz

- [ ] Création d’un quiz à partir d’une leçon Quiz.
- [ ] Ajout de plusieurs questions à un même quiz.
- [ ] Modification/suppression d’une question non encore tentée (à ajouter/vérifier).
- [ ] Questions à choix simple, choix multiple et texte : comportement défini et testé.
- [ ] Score minimum, nombre de tentatives et option bloquante compréhensibles.
- [ ] « Bloquant » signifie concrètement : la suite du parcours reste verrouillée tant que le score minimum n’est pas atteint.
- [ ] Tentatives maximales respectées côté serveur, y compris avec deux onglets ouverts.

---

## 5. Parcours apprenant

- [ ] Dashboard clair avec progression, notifications, certificats et prochain live.
- [ ] L’apprenant voit uniquement ses formations publiées avec accès actif.
- [ ] URL directe d’une autre formation → refus propre.
- [ ] URL directe d’une formation archivée/brouillon → refus propre.
- [ ] L’apprenant peut demander une nouvelle formation même s’il possède déjà un accès.
- [ ] Demande gratuite/payante avec formation ciblée, informations de compte lues côté serveur et lien WhatsApp propre.
- [ ] Demandes en double limitées sans empêcher une demande pour une autre formation.
- [ ] Progression séquentielle : impossible de sauter une leçon, quiz ou média verrouillé.
- [ ] Vidéo : lecture autorisée uniquement avec inscription active, watermark, reprise, progression sauvegardée.
- [ ] Document : accès seulement si inscrit et étape déverrouillée.
- [ ] Quiz : résultat, score, tentatives restantes et suite du parcours compréhensibles.
- [ ] Certificat visible/téléchargeable uniquement après formation réellement terminée.

---

## 6. Demandes, apprenants, appels, lives et Excel

### Demandes de formation

- [ ] Recherche, filtre et pagination des demandes.
- [ ] Admin/formateur autorisé peut consulter la demande, approuver, rejeter ou annuler de manière tracée.
- [ ] Approbation crée/active l’inscription, notification et email.
- [ ] Toute action de suppression/annulation demande confirmation.

### Apprenants et appels

- [ ] Recherche apprenant par nom/email dans les outils formateur.
- [ ] Liste apprenants paginée et limitée au formateur propriétaire.
- [ ] Créer un appel pour une personne.
- [ ] Créer le même appel pour plusieurs apprenants.
- [ ] Modifier, annuler, terminer, marquer raté et supprimer un appel.
- [ ] Couleurs distinctes : programmé, terminé, raté, annulé.
- [ ] Notification interne + email pour les appels programmés/modifiés/annulés.

### Lives

- [ ] Créer, modifier, annuler et supprimer un live selon les droits.
- [ ] URL HTTPS obligatoire.
- [ ] Ciblage global ou par formation.
- [ ] Lien « Rejoindre le live » réellement cliquable côté apprenant.
- [ ] Annulation notifie les personnes ciblées.

### Import/export

- [ ] Import Excel valide colonnes, taille, extension, contenu et doublons.
- [ ] Aperçu/rapport des lignes ignorées ou erronées.
- [ ] Exports apprenants et progression testés avec données réelles.
- [ ] Exports limités aux données du formateur, sauf super-admin.

---

## 7. Communauté riche

- [ ] Créer, lire, modifier, masquer/réafficher et supprimer une publication.
- [ ] Suppression confirmée par modale.
- [ ] Commentaires : créer, fermer/réouvrir, modérer et supprimer.
- [ ] Éditeur riche : gras, titres, listes, liens et texte formaté.
- [ ] Ajout d’image sécurisé : type/taille/signature, stockage privé ou contrôlé, suppression et autorisations.
- [ ] Le rendu apprenant est identique au rendu formateur, sans XSS.
- [ ] Les publications ciblées ne sont visibles que pour les apprenants inscrits à la formation concernée.

---

## 8. Notifications et emails

- [ ] Une notification interne peut être marquée comme lue, seule ou en masse.
- [ ] Badge non-lu cohérent dans la navigation.
- [ ] Chaque événement important a une règle explicite : interne, email, les deux ou aucun.
- [ ] Événements minimum : accès accordé, accès retiré, appel créé/modifié/annulé, live créé/modifié/annulé, certificat disponible/révoqué, demande traitée, notification manuelle, relance.
- [ ] Email de rappel indique qu’une notification est disponible et lie vers le bon écran.
- [ ] Tous les emails sont journalisés (`EmailLog`), sans faire échouer l’action métier si SMTP échoue.
- [ ] Test SMTP/Resend effectué avec une boîte réellement consultée.
- [ ] Quotas et limites de relance testés.

---

## 9. Certificats

- [ ] Génération automatique après validation complète du parcours.
- [ ] Admin peut émettre manuellement un certificat pour un apprenant éligible (fonction à ajouter/vérifier).
- [ ] Admin peut consulter un certificat et télécharger son PDF.
- [ ] Admin peut révoquer un certificat avec confirmation et audit.
- [ ] Suppression contrôlée uniquement si la règle métier le permet ; sinon révocation, pas effacement de preuve.
- [ ] Page publique de vérification par code.
- [ ] PDF ressemble à un certificat : bordure, marque, titre, nom, formation, date, code public, mention de vérification et copyright.
- [ ] PDF testée dans navigateur, téléphone et impression A4/paysage.

---

## 10. Sécurité et données

- [ ] Validation Zod de chaque action serveur et route API.
- [ ] Aucun prix, rôle, identifiant utilisateur, statut ou destinataire ne vient directement du client sans vérification serveur.
- [ ] Toutes les suppressions sensibles passent par autorisation + confirmation + audit.
- [ ] Cookies HTTP-only, SameSite et Secure en production.
- [ ] `SESSION_SECRET` et `CRON_SECRET` longs, uniques et hors Git.
- [ ] `APP_URL` pointe vers le domaine HTTPS final.
- [ ] Headers sécurité vérifiés sur le domaine final.
- [ ] Protection origine/CSRF testée sur les API mutables.
- [ ] Aucune vidéo/document accessible sans session ou inscription.
- [ ] Upload dangereux, MIME falsifié, extension falsifiée et dépassement de taille refusés.
- [ ] PostgreSQL : utilisateur non-superuser, mot de passe robuste, accès réseau limité.
- [ ] Audit logs consultables uniquement par admin.
- [ ] Politique de rétention des logs, fichiers et comptes définie.

---

## 11. Tests de recette obligatoires

### Tests manuels navigateur

- [ ] Parcours visiteur : accueil → inscription → validation email → demande.
- [ ] Parcours apprenant : demande supplémentaire → cours → vidéo → document → quiz → certificat → live → communauté.
- [ ] Parcours formateur principal : formation complète → module → média → quiz multi-questions → publication → attribution → appel groupé → live → export.
- [ ] Parcours assistant : accès limité selon la politique définie.
- [ ] Parcours admin : utilisateurs → demandes → opérations formation → certificats → paramètres → audit.
- [ ] Test mobile Android/iPhone virtuel en largeur 360 px.

### Tests d’erreur et sécurité

- [ ] Session expirée/supprimée/suspendue.
- [ ] Double-clic sur les actions de création et suppression.
- [ ] Requête URL directe vers une ressource interdite.
- [ ] Formulaire avec identifiants modifiés via DevTools.
- [ ] Fichier vidéo/document falsifié.
- [ ] Quiz envoyé deux fois simultanément.
- [ ] Révocation/suppression d’une ressource contenant données apprenant.
- [ ] Vérification visuelle qu’aucune page ne produit « This page couldn’t load ».

### Commandes de validation

```bash
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate --omit=dev
git status --short
```

Toutes doivent réussir, avec un `git status` propre.

---

## 12. Déploiement VPS

### Avant le déploiement

- [ ] Domaine configuré et DNS pointant vers le VPS.
- [ ] HTTPS configuré (Nginx/Caddy + certificat Let’s Encrypt).
- [ ] Node.js LTS installé, PostgreSQL installé ou base managée disponible.
- [ ] Répertoire privé des uploads hors du dossier servi publiquement.
- [ ] SMTP ou Resend configuré et testé.
- [ ] Cron sécurisé configuré pour les relances.
- [ ] Pare-feu : SSH, HTTP et HTTPS seulement ; PostgreSQL non exposé publiquement.

### `.env` de production

- [ ] `DATABASE_URL` production.
- [ ] `SESSION_SECRET` aléatoire ≥ 32 caractères.
- [ ] `CRON_SECRET` aléatoire ≥ 32 caractères.
- [ ] `APP_URL=https://votre-domaine.tld`.
- [ ] `PRIVATE_UPLOAD_DIR` absolu et sauvegardé.
- [ ] `FFPROBE_PATH` renseigné si la détection automatique de durée vidéo est utilisée.
- [ ] SMTP/Resend et expéditeur configurés.
- [ ] `TRAINER_WHATSAPP_NUMBER` réel.
- [ ] Aucun fichier `.env` ajouté à Git.

### Déploiement

- [ ] Sauvegarde de la base et des uploads avant intervention.
- [ ] Récupération du commit final sur le VPS.
- [ ] `npm ci --omit=dev`.
- [ ] `npx prisma migrate deploy`.
- [ ] `npm run build`.
- [ ] Démarrage avec un gestionnaire de processus (systemd ou PM2).
- [ ] Reverse proxy HTTPS vers l’application.
- [ ] Cron de relance : `POST /api/jobs/reminders` avec `Authorization: Bearer $CRON_SECRET`.

### Après déploiement

- [ ] Tester inscription, connexion, logout, média privé et certificat sur le vrai domaine HTTPS.
- [ ] Vérifier les logs applicatifs et reverse proxy pendant 24 h.
- [ ] Tester une sauvegarde/restauration dans un environnement de test.
- [ ] Noter la version Git déployée, la date et la personne responsable.

---

## Décision finale

Ne cocher **PRÊT VPS / 100 %** que si la dernière ligne est vraie :

- [ ] Je peux faire exécuter les tests de recette ci-dessus par une personne non technique, sans intervention développeur, sans écran d’erreur, sans donnée perdue et avec des droits respectés.

