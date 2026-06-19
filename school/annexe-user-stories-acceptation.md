# Annexe — User stories et critères d’acceptation

## 1. Objectif

Cette annexe décrit les comportements attendus de la plateforme sous forme de user stories.

Chaque user story doit être comprise comme une exigence fonctionnelle.

Le développeur doit valider le projet à partir de ces scénarios.

---

# 2. User stories — Visiteur public

## US-001 — Voir la page d’accueil

En tant que visiteur, je veux accéder à une page d’accueil claire afin de comprendre ce que propose la plateforme.

### Critères d’acceptation

* La page d’accueil s’affiche sans connexion.
* Elle présente brièvement la plateforme.
* Elle contient un bouton “Créer un compte”.
* Elle contient un bouton “Se connecter”.
* Elle est responsive mobile.
* Elle ne donne accès à aucune vidéo protégée.

---

## US-002 — Créer un compte

En tant que visiteur, je veux créer un compte afin de demander l’accès à une formation.

### Critères d’acceptation

* Le formulaire demande prénom, nom, email, téléphone WhatsApp, mot de passe et confirmation.
* Le mot de passe doit respecter les règles de sécurité.
* L’email doit être unique.
* Les erreurs sont affichées clairement.
* Après inscription, le compte est créé avec le statut `EMAIL_PENDING`.
* Un email de validation est envoyé.
* L’utilisateur est redirigé vers une page “Vérifiez votre email”.

---

## US-003 — Valider son email

En tant qu’apprenant, je veux valider mon email afin d’activer mon compte.

### Critères d’acceptation

* Le lien de validation contient un token sécurisé.
* Le token expire après la durée configurée.
* Un token déjà utilisé ne peut pas être réutilisé.
* Si le token est valide, le compte passe à `EMAIL_VERIFIED`.
* L’utilisateur est redirigé vers la page de choix formation gratuite/payante.
* Si le token est invalide ou expiré, une page d’erreur claire s’affiche.
* L’utilisateur peut demander un nouveau lien.

---

## US-004 — Se connecter

En tant qu’utilisateur, je veux me connecter afin d’accéder à mon espace.

### Critères d’acceptation

* L’utilisateur peut se connecter avec email et mot de passe.
* Le système refuse les identifiants invalides.
* Les tentatives répétées sont limitées.
* La session est stockée dans un cookie HTTP-only.
* Un apprenant est redirigé vers `/student/dashboard`.
* Un formateur est redirigé vers `/trainer/dashboard`.
* Un admin est redirigé vers `/admin/dashboard`.
* Un compte suspendu ne peut pas accéder aux espaces privés.

---

## US-005 — Mot de passe oublié

En tant qu’utilisateur, je veux réinitialiser mon mot de passe si je l’ai oublié.

### Critères d’acceptation

* L’utilisateur peut demander un lien de réinitialisation.
* Le lien contient un token sécurisé et temporaire.
* Le token est stocké hashé en base.
* Le token expire après la durée configurée.
* Après modification, l’ancien token devient inutilisable.
* L’utilisateur peut se connecter avec le nouveau mot de passe.

---

# 3. User stories — Demande de formation

## US-006 — Choisir formation gratuite ou payante

En tant qu’apprenant ayant validé mon email, je veux choisir entre formation gratuite ou formation payante déjà réglée.

### Critères d’acceptation

* La page s’affiche après validation email.
* Deux choix sont proposés :

  * formation gratuite ;
  * formation payante déjà payée.
* Chaque choix crée une demande en base.
* Chaque choix prépare un message WhatsApp.
* Le bouton WhatsApp est visible sur mobile.
* Le message contient les informations de l’apprenant.

---

## US-007 — Demander une formation gratuite via WhatsApp

En tant qu’apprenant, je veux envoyer un message WhatsApp formaté pour demander l’accès gratuit.

### Critères d’acceptation

* Le message contient prénom, nom, email et téléphone.
* Le message est encodé correctement dans l’URL WhatsApp.
* Une `TrainingRequest` est créée avec le type `FREE_TRAINING`.
* La demande a le statut `PENDING`.
* Le formateur peut voir la demande dans son dashboard.

---

## US-008 — Signaler une formation payante déjà payée

En tant qu’apprenant, je veux signaler que j’ai déjà payé afin que le formateur m’attribue l’accès.

### Critères d’acceptation

* L’apprenant peut choisir ou indiquer la formation concernée si disponible.
* Le message WhatsApp contient les informations de l’apprenant.
* La demande est enregistrée avec le type `PAID_TRAINING`.
* La demande est visible par le formateur.
* Le formateur peut approuver ou rejeter la demande.

---

# 4. User stories — Dashboard apprenant

## US-009 — Voir son dashboard

En tant qu’apprenant, je veux voir mon tableau de bord afin de savoir quoi faire.

### Critères d’acceptation

* Le dashboard affiche les formations attribuées.
* Si aucune formation n’est attribuée, un message clair s’affiche.
* Le bouton WhatsApp de contact reste accessible.
* Les notifications sont visibles.
* Les annonces live sont visibles.
* La progression globale est visible.
* L’interface est optimisée mobile.

---

## US-010 — Voir ses formations

En tant qu’apprenant, je veux voir uniquement les formations auxquelles j’ai accès.

### Critères d’acceptation

* L’apprenant ne voit que ses enrollments actifs.
* Les formations non attribuées ne sont pas visibles.
* Une formation révoquée n’est plus accessible.
* Une formation expirée n’est plus accessible.
* Le système bloque toute tentative d’accès par URL directe.

---

## US-011 — Ouvrir une formation

En tant qu’apprenant, je veux ouvrir une formation afin de voir les chapitres et leçons.

### Critères d’acceptation

* La page formation affiche le titre, la description et la progression.
* Les chapitres sont affichés dans l’ordre.
* Les leçons sont affichées dans l’ordre.
* Les leçons bloquées sont indiquées.
* L’apprenant peut reprendre la dernière leçon commencée.
* Les règles de déblocage sont respectées.

---

## US-012 — Suivre une leçon vidéo

En tant qu’apprenant, je veux regarder une vidéo de formation.

### Critères d’acceptation

* La vidéo se charge seulement si l’apprenant a accès à la formation.
* La vidéo n’est pas accessible publiquement.
* Le lecteur est responsive.
* Le bouton téléchargement est désactivé.
* Un watermark avec les informations de l’apprenant est affiché.
* La progression vidéo est sauvegardée régulièrement.
* L’apprenant peut reprendre là où il s’est arrêté.
* La leçon peut être marquée terminée après le seuil configuré.

---

## US-013 — Suivre une leçon texte

En tant qu’apprenant, je veux lire une leçon texte.

### Critères d’acceptation

* Le contenu texte s’affiche proprement.
* Les images et liens s’affichent si présents.
* L’apprenant peut marquer la leçon comme terminée.
* La progression est mise à jour.
* La leçon respecte les conditions de déblocage.

---

## US-014 — Télécharger ou consulter un document

En tant qu’apprenant, je veux consulter les documents autorisés par le formateur.

### Critères d’acceptation

* Seuls les documents des formations attribuées sont accessibles.
* Si le téléchargement est autorisé, un bouton s’affiche.
* Si le téléchargement est interdit, le bouton n’apparaît pas.
* Les fichiers privés ne sont pas accessibles par URL directe.
* Les accès documents sont journalisés.

---

# 5. User stories — Quiz

## US-015 — Faire un quiz

En tant qu’apprenant, je veux faire un quiz afin de valider ma compréhension.

### Critères d’acceptation

* Le quiz s’affiche uniquement si l’apprenant a accès.
* Les questions sont affichées proprement.
* Les types de questions sont pris en charge.
* L’apprenant peut soumettre ses réponses.
* Le score est calculé.
* Le résultat est enregistré.
* Le système indique réussite ou échec.

---

## US-016 — Refaire un quiz échoué

En tant qu’apprenant, je veux pouvoir refaire un quiz si le formateur l’autorise.

### Critères d’acceptation

* Le nombre maximal de tentatives est respecté.
* Si les tentatives sont épuisées, un message clair s’affiche.
* Si une nouvelle tentative est autorisée, l’apprenant peut recommencer.
* Les anciennes tentatives restent enregistrées.
* Le formateur peut voir l’historique.

---

## US-017 — Bloquer la progression avec un quiz

En tant que formateur, je veux pouvoir rendre un quiz bloquant.

### Critères d’acceptation

* Si le quiz est bloquant, la suite reste verrouillée tant que le score minimum n’est pas atteint.
* Si le quiz n’est pas bloquant, l’apprenant peut continuer.
* Le comportement est configurable.
* L’apprenant comprend pourquoi une leçon est bloquée.

---

# 6. User stories — Certificats

## US-018 — Générer un certificat automatiquement

En tant qu’apprenant, je veux recevoir un certificat après avoir terminé une formation.

### Critères d’acceptation

* Le certificat est généré seulement si les conditions sont remplies.
* Les leçons obligatoires doivent être terminées.
* Les quiz obligatoires doivent être réussis.
* Le certificat contient un code unique.
* Le PDF est généré.
* L’apprenant reçoit une notification.
* L’apprenant reçoit un email.

---

## US-019 — Télécharger son certificat

En tant qu’apprenant, je veux télécharger mon certificat.

### Critères d’acceptation

* Le certificat est visible dans l’espace apprenant.
* Le téléchargement PDF fonctionne.
* Un certificat révoqué ne peut pas être téléchargé.
* Le fichier n’est pas accessible publiquement sans contrôle.

---

## US-020 — Vérifier un certificat publiquement

En tant que personne externe, je veux vérifier qu’un certificat est valide.

### Critères d’acceptation

* La page `/certificates/verify/[code]` est publique.
* La page affiche si le certificat est valide.
* La page affiche nom, formation et date d’obtention.
* La page n’affiche pas email, téléphone ou données privées.
* Un certificat révoqué apparaît comme invalide.

---

# 7. User stories — Dashboard formateur

## US-021 — Voir le dashboard formateur

En tant que formateur, je veux voir une vue globale de mes formations et apprenants.

### Critères d’acceptation

* Le dashboard affiche le nombre d’apprenants.
* Il affiche les demandes en attente.
* Il affiche les apprenants inactifs.
* Il affiche les appels du jour.
* Il affiche les quiz échoués.
* Il affiche les formations publiées.
* Il affiche les alertes importantes.
* L’interface est utilisable sur mobile et desktop.

---

## US-022 — Voir les demandes de formation

En tant que formateur, je veux voir les demandes gratuites et payantes.

### Critères d’acceptation

* Les demandes sont listées par date.
* Le type de demande est visible.
* Le statut est visible.
* Les informations apprenant sont visibles.
* Le formateur peut approuver.
* Le formateur peut rejeter.
* Le formateur peut attribuer une formation depuis la demande.

---

## US-023 — Attribuer une formation

En tant que formateur, je veux attribuer une formation à un apprenant.

### Critères d’acceptation

* Le formateur sélectionne un apprenant.
* Le formateur sélectionne une formation.
* Le système crée un enrollment actif.
* L’apprenant reçoit un email.
* L’apprenant reçoit une notification interne.
* L’action est journalisée.
* La formation apparaît dans l’espace apprenant.

---

## US-024 — Retirer un accès

En tant que formateur, je veux retirer l’accès d’un apprenant à une formation.

### Critères d’acceptation

* L’enrollment passe à `REVOKED`.
* La progression n’est pas supprimée.
* L’apprenant ne peut plus accéder à la formation.
* L’apprenant reçoit un email.
* L’action est journalisée.
* Le formateur peut voir l’historique.

---

## US-025 — Voir la fiche d’un apprenant

En tant que formateur, je veux consulter la fiche d’un apprenant.

### Critères d’acceptation

* La fiche affiche les informations de l’apprenant.
* Elle affiche ses formations.
* Elle affiche sa progression.
* Elle affiche ses quiz.
* Elle affiche ses certificats.
* Elle affiche les appels liés.
* Elle affiche les notes internes.
* Elle affiche la dernière activité.

---

# 8. User stories — Gestion des formations

## US-026 — Créer une formation

En tant que formateur, je veux créer une formation.

### Critères d’acceptation

* Le formulaire permet de saisir titre, description, type, niveau et image.
* Le slug est généré ou modifiable.
* La formation peut être enregistrée en brouillon.
* La formation peut être publiée.
* Les erreurs sont validées côté serveur.
* L’action est journalisée.

---

## US-027 — Modifier une formation

En tant que formateur, je veux modifier une formation existante.

### Critères d’acceptation

* Les champs existants sont préremplis.
* Les modifications sont sauvegardées.
* Le slug reste unique.
* Les apprenants déjà inscrits gardent leur progression.
* L’action est journalisée.

---

## US-028 — Archiver une formation

En tant que formateur, je veux archiver une formation.

### Critères d’acceptation

* La formation passe à `ARCHIVED`.
* Elle n’est plus attribuable par défaut.
* Les données restent conservées.
* Les progressions ne sont pas supprimées.
* L’action est journalisée.

---

## US-029 — Créer un chapitre

En tant que formateur, je veux organiser ma formation en chapitres.

### Critères d’acceptation

* Le formateur peut créer un chapitre.
* Il peut définir titre, description et ordre.
* Il peut choisir une règle de déblocage.
* Les chapitres sont affichés dans l’ordre.
* Le formateur peut réordonner les chapitres.

---

## US-030 — Créer une leçon

En tant que formateur, je veux créer une leçon dans un chapitre.

### Critères d’acceptation

* Le formateur peut choisir le type de leçon.
* Il peut ajouter texte, vidéo, document ou quiz.
* Il peut définir si la leçon est obligatoire.
* Il peut définir l’ordre.
* La leçon peut être brouillon ou publiée.
* L’apprenant ne voit que les leçons publiées.

---

## US-031 — Uploader une vidéo

En tant que formateur, je veux uploader une vidéo de formation.

### Critères d’acceptation

* Les formats autorisés sont vérifiés.
* La taille maximale est vérifiée.
* Le fichier est renommé.
* Le fichier est stocké hors du dossier public.
* Le chemin privé est sauvegardé.
* La vidéo est lisible uniquement via route protégée.
* L’upload échoue proprement si le fichier est invalide.

---

# 9. User stories — Relances automatiques

## US-032 — Relancer un compte email non validé

En tant que système, je veux relancer les utilisateurs qui n’ont pas validé leur email.

### Critères d’acceptation

* Le système détecte les comptes `EMAIL_PENDING`.
* Il vérifie l’âge du compte.
* Il envoie un rappel si les conditions sont remplies.
* Il respecte la limite anti-spam.
* L’email est enregistré dans `EmailLog`.

---

## US-033 — Relancer un compte validé sans demande

En tant que système, je veux relancer les apprenants qui ont validé leur email mais n’ont pas demandé de formation.

### Critères d’acceptation

* Le système détecte les comptes sans `TrainingRequest`.
* Il envoie un email avec lien vers la page de choix.
* Il respecte les limites configurées.
* L’action est journalisée.

---

## US-034 — Relancer une formation non commencée

En tant que système, je veux relancer les apprenants ayant accès à une formation mais ne l’ayant pas commencée.

### Critères d’acceptation

* Le système détecte les enrollments actifs sans progression.
* Il vérifie le délai configuré.
* Il envoie un email de relance.
* Il crée une notification interne.
* Il évite les doublons.

---

## US-035 — Relancer une formation abandonnée

En tant que système, je veux relancer les apprenants inactifs.

### Critères d’acceptation

* Le système détecte la dernière activité.
* Il compare avec le délai configuré.
* Il envoie un email.
* Il crée une notification.
* Il n’envoie pas si l’apprenant a repris récemment.

---

## US-036 — Relancer après quiz échoué

En tant que système, je veux relancer les apprenants qui ont échoué à un quiz.

### Critères d’acceptation

* Le système détecte les derniers quiz échoués.
* Il vérifie qu’aucune réussite n’a eu lieu depuis.
* Il envoie un email.
* Il respecte les limites anti-spam.

---

## US-037 — Relancer une formation presque terminée

En tant que système, je veux motiver les apprenants proches de la fin.

### Critères d’acceptation

* Le système détecte les progressions supérieures à 80%.
* Il vérifie que la formation n’est pas terminée.
* Il envoie un email.
* Il crée une notification interne.

---

# 10. User stories — Notifications

## US-038 — Recevoir une notification interne

En tant qu’apprenant, je veux voir mes notifications dans mon dashboard.

### Critères d’acceptation

* Les notifications sont listées par date.
* Les notifications non lues sont visibles.
* L’utilisateur peut marquer une notification comme lue.
* Les notifications d’un autre utilisateur ne sont jamais visibles.

---

## US-039 — Envoyer une notification manuelle

En tant que formateur, je veux envoyer une notification à un groupe d’apprenants.

### Critères d’acceptation

* Le formateur choisit la cible.
* Il saisit titre et message.
* Le système crée les notifications.
* Le système peut envoyer aussi un email.
* L’envoi est journalisé.

---

# 11. User stories — Annonces live externes

## US-040 — Créer une annonce live

En tant que formateur, je veux annoncer une session live externe.

### Critères d’acceptation

* Le formateur saisit titre, description, lien, date et cible.
* Le lien externe est validé.
* L’annonce peut être brouillon ou publiée.
* Le système envoie des notifications aux personnes ciblées.
* Le système envoie des emails si activé.

---

## US-041 — Voir une annonce live

En tant qu’apprenant, je veux voir les annonces live qui me concernent.

### Critères d’acceptation

* L’apprenant voit uniquement les annonces de son groupe.
* Le lien live est visible.
* La date et l’heure sont claires.
* Les annonces passées peuvent être affichées séparément.

---

# 12. User stories — Calendrier d’appels

## US-042 — Planifier un appel

En tant que formateur, je veux planifier un appel avec un apprenant.

### Critères d’acceptation

* Le formateur choisit l’apprenant.
* Il choisit date, heure, motif et priorité.
* L’appel apparaît dans le calendrier.
* L’appel apparaît sur la fiche apprenant.
* Une notification peut être envoyée.

---

## US-043 — Voir les appels du jour

En tant que formateur, je veux voir les appels prévus aujourd’hui.

### Critères d’acceptation

* Le dashboard affiche les appels du jour.
* Les appels en retard sont visibles.
* Le formateur peut changer le statut.
* Le formateur peut ajouter une note après l’appel.

---

## US-044 — Suggérer un appel automatiquement

En tant que système, je veux suggérer des appels pour les apprenants bloqués.

### Critères d’acceptation

* Le système identifie les apprenants inactifs.
* Le système identifie les quiz échoués plusieurs fois.
* Le système identifie les demandes payantes récentes.
* Les suggestions apparaissent dans le dashboard formateur.
* Le formateur reste libre de créer ou non l’appel.

---

# 13. User stories — Communauté

## US-045 — Publier une annonce communautaire

En tant que formateur, je veux publier un message dans la communauté.

### Critères d’acceptation

* Le formateur peut créer un post.
* Il choisit la visibilité.
* Il active ou désactive les commentaires.
* Le post est visible uniquement par la cible.
* L’action est journalisée.

---

## US-046 — Commenter si autorisé

En tant qu’apprenant, je veux commenter un post si le formateur l’autorise.

### Critères d’acceptation

* Le commentaire est possible uniquement si activé.
* L’apprenant doit être connecté.
* Le commentaire est lié au post.
* Le formateur peut masquer ou supprimer le commentaire.
* Un apprenant suspendu ne peut pas commenter.

---

# 14. User stories — Import/export

## US-047 — Importer des apprenants

En tant que formateur, je veux importer des apprenants depuis un fichier Excel.

### Critères d’acceptation

* Le fichier Excel est accepté.
* Les colonnes attendues sont documentées.
* Les emails invalides sont signalés.
* Les doublons sont signalés.
* Les utilisateurs valides sont créés.
* Une formation peut être attribuée via `courseSlug`.
* Un rapport d’import est affiché.

---

## US-048 — Exporter les apprenants

En tant que formateur, je veux exporter la liste des apprenants.

### Critères d’acceptation

* Le fichier exporté est au format Excel.
* Il contient les informations principales.
* Il respecte les permissions.
* L’export est journalisé.

---

## US-049 — Exporter les progressions

En tant que formateur, je veux exporter les progressions.

### Critères d’acceptation

* L’export contient apprenant, formation, progression, dernière activité et statut.
* Les filtres sont pris en compte.
* Le fichier est généré correctement.
* L’action est journalisée.

---

# 15. User stories — Admin

## US-050 — Créer un formateur

En tant qu’admin, je veux créer un compte formateur.

### Critères d’acceptation

* L’admin saisit les informations du formateur.
* Le rôle `TRAINER` est attribué.
* Le formateur reçoit un email.
* L’action est journalisée.

---

## US-051 — Suspendre un utilisateur

En tant qu’admin, je veux suspendre un utilisateur.

### Critères d’acceptation

* Le statut passe à `SUSPENDED`.
* L’utilisateur ne peut plus accéder aux espaces privés.
* Ses données ne sont pas supprimées.
* L’action est journalisée.

---

## US-052 — Configurer SMTP

En tant qu’admin, je veux configurer l’envoi d’emails.

### Critères d’acceptation

* Les champs SMTP sont configurables.
* Un email test peut être envoyé.
* Les erreurs SMTP sont affichées clairement.
* Les valeurs sensibles ne sont pas exposées inutilement.

---

## US-053 — Configurer WhatsApp

En tant qu’admin ou formateur autorisé, je veux configurer le numéro WhatsApp.

### Critères d’acceptation

* Le numéro est sauvegardé.
* Le format est validé.
* Les messages gratuits et payants sont personnalisables.
* Les variables dynamiques sont supportées.

---

## US-054 — Voir les logs

En tant qu’admin, je veux consulter les logs d’activité.

### Critères d’acceptation

* Les logs sont filtrables.
* Les actions sensibles sont enregistrées.
* Les logs affichent utilisateur, action, date, entité et détails.
* Les apprenants ne peuvent pas voir les logs.

---

# 16. User stories — Sécurité

## US-055 — Bloquer l’accès vidéo non autorisé

En tant que système, je veux empêcher un utilisateur non autorisé de lire une vidéo.

### Critères d’acceptation

* Sans connexion, l’accès est refusé.
* Sans enrollment actif, l’accès est refusé.
* Avec compte suspendu, l’accès est refusé.
* Avec accès révoqué, l’accès est refusé.
* Toute tentative est journalisée.

---

## US-056 — Bloquer l’accès aux dashboards interdits

En tant que système, je veux empêcher les utilisateurs d’accéder aux espaces qui ne correspondent pas à leur rôle.

### Critères d’acceptation

* Un apprenant ne peut pas accéder à `/trainer`.
* Un formateur ne peut pas accéder à `/admin`.
* Un utilisateur non connecté est redirigé vers login.
* Les contrôles sont faits côté serveur.

---

## US-057 — Protéger les uploads

En tant que système, je veux refuser les fichiers dangereux.

### Critères d’acceptation

* Les extensions interdites sont refusées.
* Les types MIME sont vérifiés.
* La taille maximale est respectée.
* Le fichier est renommé.
* Le fichier est stocké hors `/public`.

---

## US-058 — Journaliser les actions sensibles

En tant que système, je veux garder une trace des actions importantes.

### Critères d’acceptation

* Les connexions sont journalisées.
* Les échecs de connexion sont journalisés.
* Les attributions sont journalisées.
* Les retraits d’accès sont journalisés.
* Les uploads sont journalisés.
* Les exports sont journalisés.
* Les accès interdits sont journalisés.

---

# 17. User stories — Paramètres

## US-059 — Modifier les paramètres de la plateforme

En tant qu’admin, je veux modifier les paramètres globaux.

### Critères d’acceptation

* Le nom de la plateforme est modifiable.
* Le logo est modifiable.
* Les couleurs principales sont configurables.
* Les paramètres SMTP sont configurables.
* Les paramètres WhatsApp sont configurables.
* Les paramètres de relance sont configurables.
* Les changements sont sauvegardés.

---

## US-060 — Configurer les relances

En tant qu’admin ou formateur autorisé, je veux configurer les relances automatiques.

### Critères d’acceptation

* Les relances peuvent être activées ou désactivées.
* Le délai d’inactivité est configurable.
* Le nombre maximal d’emails par semaine est configurable.
* Les relances peuvent être désactivées pour une formation.
* Les relances peuvent être désactivées pour un apprenant.

---

# 18. User stories — Expérience mobile

## US-061 — Utiliser la plateforme sur mobile

En tant qu’apprenant, je veux utiliser toute la plateforme sur téléphone.

### Critères d’acceptation

* L’inscription est confortable sur mobile.
* La connexion est confortable sur mobile.
* Le dashboard est lisible.
* Les boutons sont assez grands.
* Les vidéos s’adaptent à l’écran.
* Les quiz sont faciles à remplir.
* Le bouton WhatsApp est visible.
* Les tableaux sont remplacés par des cartes si nécessaire.

---

## US-062 — Utiliser le dashboard formateur sur mobile

En tant que formateur, je veux gérer l’essentiel depuis mon téléphone.

### Critères d’acceptation

* Le formateur peut voir les demandes.
* Il peut attribuer une formation.
* Il peut voir une fiche apprenant.
* Il peut planifier un appel.
* Il peut envoyer une annonce simple.
* Les gros tableaux restent utilisables via filtres ou cartes.

---

# 19. User stories — Sauvegarde et exploitation

## US-063 — Sauvegarder les données

En tant qu’admin technique, je veux pouvoir sauvegarder la base et les fichiers.

### Critères d’acceptation

* Une procédure de sauvegarde PostgreSQL est documentée.
* Le dossier de stockage privé est sauvegardable.
* Une procédure de restauration est documentée.
* Les certificats et vidéos sont inclus dans la stratégie.

---

## US-064 — Déployer la plateforme

En tant que développeur, je veux pouvoir déployer la plateforme proprement.

### Critères d’acceptation

* Le README explique l’installation.
* Le fichier `.env.example` est complet.
* Les migrations Prisma fonctionnent.
* Le seed admin fonctionne.
* Le build production fonctionne.
* La configuration HTTPS est mentionnée.
* Les cron jobs sont documentés.

---

# 20. Checklist finale d’acceptation

Le projet ne peut pas être validé tant que tous les points suivants ne sont pas vrais :

* Inscription fonctionnelle.
* Validation email fonctionnelle.
* Connexion fonctionnelle.
* Mot de passe oublié fonctionnel.
* Rôles respectés.
* Dashboards séparés.
* Demande WhatsApp fonctionnelle.
* Demande enregistrée en base.
* Attribution formation fonctionnelle.
* Retrait d’accès fonctionnel.
* Formations CRUD.
* Chapitres CRUD.
* Leçons CRUD.
* Upload vidéo privé.
* Lecture vidéo protégée.
* Watermark vidéo visible.
* Progression enregistrée.
* Quiz fonctionnels.
* Certificats générés.
* Vérification certificat publique.
* Relances automatiques fonctionnelles.
* Notifications internes fonctionnelles.
* Emails fonctionnels.
* Annonces live fonctionnelles.
* Calendrier d’appels fonctionnel.
* Communauté simple fonctionnelle.
* Import Excel fonctionnel.
* Export Excel fonctionnel.
* Logs fonctionnels.
* Paramètres configurables.
* Sécurité de base respectée.
* Mobile-first respecté.
* Documentation livrée.
* Déploiement documenté.
* Sauvegarde documentée.

---

# 21. Conclusion

Ces user stories complètent le cahier des charges principal et l’annexe technique.

Le développeur doit considérer que chaque user story est une exigence à implémenter ou à traiter explicitement.

Si une user story ne peut pas être développée, le développeur doit le signaler avant le démarrage ou pendant la phase de cadrage, et non après livraison.

L’objectif est de livrer une plateforme complète, cohérente, sécurisée et réellement utilisable par le formateur et ses apprenants.
