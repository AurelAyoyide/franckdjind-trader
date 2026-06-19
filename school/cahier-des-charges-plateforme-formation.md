# Cahier des charges complet — Plateforme privée de formation en ligne

## 1. Présentation du projet

Le projet consiste à développer une plateforme web privée de formation en ligne pour un formateur ou une petite équipe de formateurs.

La plateforme doit permettre au formateur de créer des formations, structurer les contenus en chapitres et leçons, publier des vidéos, ajouter des quiz, suivre la progression des apprenants, attribuer manuellement les formations, envoyer des notifications, relancer automatiquement les apprenants inactifs, programmer des appels de suivi, annoncer des sessions live externes et générer des certificats de fin de formation.

La plateforme ne doit pas être une marketplace publique de cours. Elle doit fonctionner comme un espace privé, contrôlé par le formateur.

Le paiement en ligne n’est pas inclus dans cette version. Les paiements des formations payantes se font hors plateforme : Mobile Money, WhatsApp, cash, virement ou tout autre canal externe. Après vérification du paiement, le formateur attribue manuellement l’accès à la formation.

---

## 2. Objectif principal

L’objectif est de permettre au formateur de ne plus répéter manuellement la même formation à chaque nouvelle vague d’apprenants.

La plateforme doit devenir une machine complète de formation et de suivi :

* inscription des apprenants ;
* validation automatique de l’email ;
* demande d’accès via WhatsApp ;
* attribution manuelle des formations ;
* consultation des cours ;
* suivi de progression ;
* quiz ;
* relances automatiques ;
* certificats ;
* notifications ;
* appels de suivi ;
* annonces de lives externes ;
* mini-espace communautaire ;
* gestion mobile-first.

---

## 3. Stack technique obligatoire

Le projet doit être développé avec :

* Next.js ;
* TypeScript ;
* App Router ;
* PostgreSQL ;
* Prisma ORM ;
* Tailwind CSS ;
* Server Components quand c’est pertinent ;
* Server Actions ou API Routes selon les besoins ;
* Auth sécurisée par cookies HTTP-only ;
* stockage local des fichiers au départ ;
* système SMTP configurable pour les emails ;
* génération PDF pour les certificats ;
* import/export Excel ;
* tâches planifiées pour les relances automatiques.

Le backend et le frontend doivent être dans le même projet Next.js.

---

## 4. Contraintes importantes

### 4.1 Pas de paiement intégré

La plateforme ne doit pas intégrer Stripe, PayPal, Mobile Money API ou autre système de paiement en ligne dans cette première version.

Les formations payantes sont payées hors plateforme.

La plateforme doit seulement permettre :

* à l’apprenant de signaler qu’il a payé ;
* au formateur de vérifier manuellement ;
* au formateur d’attribuer l’accès après vérification.

### 4.2 Protection raisonnable des vidéos

Il est impossible de garantir qu’une vidéo visible dans un navigateur ne pourra jamais être récupérée.

Cependant, la plateforme doit empêcher le téléchargement facile.

Les vidéos ne doivent jamais être accessibles publiquement par une URL directe.

L’accès aux vidéos doit toujours passer par une vérification côté serveur.

### 4.3 Mobile-first

La plateforme doit être conçue prioritairement pour mobile.

Les apprenants utiliseront majoritairement leur téléphone.

Toutes les pages importantes doivent être parfaitement utilisables sur mobile.

### 4.4 Interface simple

La plateforme doit être claire, propre, rapide et agréable.

Elle ne doit pas ressembler à une usine compliquée.

Le formateur doit pouvoir gérer ses formations et ses élèves sans être perdu.

L’apprenant doit pouvoir comprendre immédiatement quoi faire.

---

## 5. Types d’utilisateurs

La plateforme doit gérer les rôles suivants :

### 5.1 Super Admin

Le Super Admin gère toute la plateforme.

Il peut :

* créer des formateurs ;
* modifier des formateurs ;
* suspendre des comptes ;
* voir tous les utilisateurs ;
* voir toutes les formations ;
* accéder aux paramètres globaux ;
* gérer les modèles d’emails ;
* gérer les paramètres SMTP ;
* gérer les paramètres WhatsApp ;
* consulter les logs ;
* gérer les paramètres de sécurité ;
* gérer les certificats ;
* activer ou désactiver certaines fonctionnalités.

### 5.2 Formateur principal

Le formateur principal est le client qui utilise la plateforme.

Il peut :

* créer une formation ;
* modifier une formation ;
* supprimer ou archiver une formation ;
* créer des chapitres ;
* créer des leçons ;
* uploader des vidéos ;
* ajouter des documents ;
* créer des quiz ;
* voir les apprenants ;
* attribuer une formation à un apprenant ;
* retirer l’accès à une formation ;
* voir les progressions ;
* voir les résultats des quiz ;
* envoyer des notifications ;
* créer des annonces de live externe ;
* planifier des appels ;
* générer ou consulter les certificats ;
* gérer le mini-espace communautaire ;
* importer ou exporter des apprenants.

### 5.3 Formateur secondaire

Le formateur secondaire est un assistant ou un autre formateur.

Il peut avoir des permissions limitées.

Il peut :

* voir les apprenants qui lui sont assignés ;
* voir certaines formations ;
* suivre la progression ;
* ajouter des notes internes ;
* planifier des appels ;
* répondre dans l’espace communautaire ;
* envoyer certaines notifications si autorisé.

Il ne doit pas forcément pouvoir :

* supprimer une formation ;
* modifier les paramètres globaux ;
* gérer les autres formateurs ;
* accéder aux logs sensibles.

### 5.4 Apprenant

L’apprenant peut :

* créer son compte ;
* valider son email ;
* choisir entre formation gratuite ou formation payante déjà payée ;
* contacter le formateur via WhatsApp avec un message prérempli ;
* accéder aux formations qui lui sont attribuées ;
* suivre les leçons ;
* regarder les vidéos ;
* faire les quiz ;
* voir sa progression ;
* recevoir des notifications ;
* recevoir des relances ;
* voir les annonces de live ;
* télécharger son certificat si la formation est terminée ;
* accéder au mini-espace communautaire si autorisé.

### 5.5 Utilisateur suspendu

Un utilisateur suspendu ne peut plus accéder aux formations.

Il doit voir une page claire :

> Votre compte est temporairement suspendu. Veuillez contacter le formateur.

---

## 6. Parcours complet d’un apprenant

### 6.1 Inscription

L’apprenant arrive sur le site et clique sur “Créer un compte”.

Le formulaire d’inscription doit contenir :

* prénom ;
* nom ;
* email ;
* numéro WhatsApp ;
* mot de passe ;
* confirmation du mot de passe ;
* acceptation des conditions d’utilisation.

Après inscription :

* le compte est créé ;
* le statut du compte est `EMAIL_PENDING` ;
* un email de validation est envoyé automatiquement ;
* l’apprenant est redirigé vers une page lui indiquant de vérifier sa boîte mail.

### 6.2 Validation email

L’email de validation contient un lien sécurisé.

Le lien doit avoir :

* un token unique ;
* une durée d’expiration ;
* une protection contre la réutilisation ;
* une redirection claire après validation.

Quand l’apprenant clique :

* le token est vérifié ;
* le compte passe à `EMAIL_VERIFIED` ;
* l’utilisateur est connecté ou invité à se connecter ;
* il arrive sur la page de choix de demande.

### 6.3 Page après validation

Après validation, l’apprenant doit voir une page avec deux choix :

1. Je veux accéder à une formation gratuite.
2. J’ai déjà payé une formation payante.

Chaque choix doit générer un message WhatsApp prérempli.

### 6.4 Demande de formation gratuite

Si l’apprenant choisit “formation gratuite”, le système doit :

* enregistrer une demande dans la base ;
* préparer un message WhatsApp ;
* ouvrir WhatsApp avec le message prérempli.

Message recommandé :

Bonjour, je viens de créer et valider mon compte sur la plateforme de formation.

Je souhaite accéder à la formation gratuite.

Voici mes informations :

* Nom : {{lastName}}
* Prénom : {{firstName}}
* Email : {{email}}
* Téléphone : {{phone}}

Merci de me donner accès à la formation gratuite.

### 6.5 Demande de formation payante

Si l’apprenant choisit “formation payante déjà payée”, le système doit :

* enregistrer une demande ;
* permettre de sélectionner une formation si nécessaire ;
* préparer un message WhatsApp ;
* ouvrir WhatsApp avec le message prérempli.

Message recommandé :

Bonjour, je viens de créer et valider mon compte sur la plateforme de formation.

J’ai déjà payé une formation payante et je souhaite obtenir mon accès.

Voici mes informations :

* Nom : {{lastName}}
* Prénom : {{firstName}}
* Email : {{email}}
* Téléphone : {{phone}}

Formation concernée : {{courseTitle}}

Merci de vérifier mon paiement et de m’attribuer l’accès à la formation.

### 6.6 Attribution par le formateur

Le formateur reçoit ou voit la demande dans son dashboard.

Il peut :

* consulter le profil de l’apprenant ;
* voir la demande ;
* vérifier le paiement ou la demande gratuite ;
* attribuer une formation ;
* rejeter la demande ;
* ajouter une note interne.

Après attribution :

* l’apprenant reçoit un email ;
* une notification apparaît dans son dashboard ;
* la formation devient accessible.

---

## 7. Authentification et sécurité des comptes

### 7.1 Méthode d’authentification

La plateforme doit utiliser une authentification sécurisée.

Exigences :

* email + mot de passe ;
* mot de passe hashé ;
* cookies HTTP-only ;
* sessions sécurisées ;
* expiration de session ;
* protection CSRF ;
* rate limit sur login ;
* rate limit sur inscription ;
* système de mot de passe oublié ;
* validation email obligatoire.

### 7.2 Statuts de compte

Un utilisateur peut avoir les statuts suivants :

* `EMAIL_PENDING` : email non validé ;
* `EMAIL_VERIFIED` : email validé mais aucun accès forcément attribué ;
* `ACTIVE` : compte actif ;
* `SUSPENDED` : compte suspendu ;
* `DELETED` : compte supprimé logiquement.

### 7.3 Mot de passe oublié

Le système doit permettre :

* demande de réinitialisation ;
* envoi d’un email ;
* lien temporaire ;
* création d’un nouveau mot de passe ;
* invalidation du token après utilisation.

### 7.4 Règles de mot de passe

Le mot de passe doit contenir au minimum :

* 8 caractères ;
* une lettre ;
* un chiffre.

Le développeur peut renforcer cette règle si nécessaire.

---

## 8. Gestion des formations

### 8.1 Création d’une formation

Le formateur doit pouvoir créer une formation avec :

* titre ;
* slug ;
* description courte ;
* description longue ;
* image de couverture ;
* catégorie ;
* niveau ;
* durée estimée ;
* type : gratuite ou payante externe ;
* statut : brouillon, publiée, archivée ;
* certificat activé ou non ;
* quiz final obligatoire ou non ;
* communauté activée ou non ;
* visibilité dans le catalogue public ou non.

### 8.2 Statuts d’une formation

Une formation peut être :

* `DRAFT` : brouillon ;
* `PUBLISHED` : publiée ;
* `ARCHIVED` : archivée.

### 8.3 Types de formation

Une formation peut être :

* gratuite ;
* payante hors plateforme.

La plateforme ne doit pas encaisser le paiement.

### 8.4 Catalogue public optionnel

Le formateur peut choisir d’afficher ou non une formation sur une page publique.

Même si une formation est visible publiquement, l’apprenant ne peut pas y accéder sans attribution.

---

## 9. Gestion des chapitres

Une formation contient plusieurs chapitres.

Chaque chapitre doit avoir :

* titre ;
* description ;
* ordre ;
* statut ;
* règle de déblocage.

### 9.1 Règles de déblocage

Le formateur doit pouvoir choisir :

* accès libre ;
* accès après chapitre précédent terminé ;
* accès après quiz réussi ;
* accès manuel ;
* accès après validation du formateur.

Le système ne doit pas imposer un déblocage par semaine.

Le déblocage doit être basé principalement sur l’avancement de l’apprenant.

---

## 10. Gestion des leçons

Un chapitre contient plusieurs leçons.

Une leçon peut être :

* vidéo ;
* texte ;
* document ;
* quiz ;
* mixte.

Chaque leçon doit contenir :

* titre ;
* description ;
* contenu ;
* ordre ;
* durée estimée ;
* statut ;
* obligatoire ou facultatif ;
* conditions de validation.

### 10.1 Leçon vidéo

Une leçon vidéo doit permettre :

* upload d’une vidéo ;
* lecture dans un lecteur intégré ;
* reprise là où l’apprenant s’est arrêté ;
* suivi de progression ;
* watermark affiché sur la vidéo ;
* validation manuelle ou automatique de la leçon.

### 10.2 Leçon texte

Une leçon texte doit permettre :

* contenu riche ;
* paragraphes ;
* images ;
* listes ;
* liens ;
* bouton “marquer comme terminé”.

### 10.3 Leçon document

Une leçon document doit permettre :

* ajout de fichiers PDF, Word, Excel ou images ;
* téléchargement autorisé ou interdit selon configuration ;
* affichage des documents si possible.

### 10.4 Leçon quiz

Une leçon quiz doit permettre :

* questions ;
* choix de réponses ;
* score ;
* validation ;
* correction selon configuration.

---

## 11. Protection des vidéos

### 11.1 Principe

Les vidéos ne doivent jamais être mises dans un dossier public accessible directement.

Elles doivent être stockées dans un dossier privé côté serveur.

L’accès vidéo doit passer par une route protégée.

### 11.2 Vérifications obligatoires avant lecture

Avant de servir une vidéo, le serveur doit vérifier :

* l’utilisateur est connecté ;
* son email est validé ;
* son compte n’est pas suspendu ;
* il a accès à la formation ;
* la formation est publiée ;
* la leçon appartient bien à cette formation ;
* l’accès n’a pas été retiré ;
* la date de fin d’accès n’est pas dépassée si une date existe.

### 11.3 Mesures anti-téléchargement facile

Le système doit prévoir :

* route vidéo protégée ;
* URL temporaire ou signée ;
* désactivation du bouton téléchargement du lecteur ;
* désactivation du clic droit sur le lecteur ;
* watermark dynamique ;
* logs de lecture ;
* limitation du nombre de sessions simultanées ;
* détection d’accès abusif ;
* impossibilité d’accéder au fichier par URL directe.

### 11.4 Watermark dynamique

Pendant la lecture vidéo, afficher sur la vidéo :

* prénom de l’apprenant ;
* email ;
* téléphone ;
* date ou heure ;
* identifiant utilisateur.

Le watermark doit pouvoir changer légèrement de position régulièrement.

Objectif :

* décourager les captures ;
* identifier la source en cas de fuite.

### 11.5 Limite à préciser

La plateforme doit être claire : sans DRM professionnel, il n’est pas possible de bloquer à 100% la récupération d’une vidéo.

L’objectif est de rendre le vol difficile pour un utilisateur normal.

---

## 12. Quiz et évaluations

### 12.1 Types de questions

Le système doit gérer :

* choix unique ;
* choix multiple ;
* vrai/faux ;
* réponse courte ;
* réponse ouverte corrigée manuellement.

### 12.2 Configuration d’un quiz

Le formateur doit pouvoir définir :

* titre ;
* description ;
* score minimum ;
* nombre maximal de tentatives ;
* affichage ou non des bonnes réponses ;
* quiz bloquant ou non ;
* quiz obligatoire ou facultatif ;
* ordre des questions ;
* points par question.

### 12.3 Résultats

Le système doit enregistrer :

* apprenant ;
* formation ;
* quiz ;
* réponses ;
* score ;
* réussite ou échec ;
* date ;
* temps passé.

### 12.4 Quiz bloquant

Si un quiz est bloquant :

* l’apprenant ne peut pas continuer tant qu’il n’a pas réussi ;
* ou la formation ne peut pas être marquée comme terminée.

Ce comportement doit être configurable.

---

## 13. Suivi de progression

### 13.1 Progression globale

Pour chaque apprenant et chaque formation, le système doit suivre :

* formation non commencée ;
* formation en cours ;
* formation terminée ;
* pourcentage de progression ;
* dernière activité ;
* dernière leçon consultée ;
* dernier chapitre consulté ;
* quiz réussis ;
* quiz échoués.

### 13.2 Progression par leçon

Chaque leçon peut avoir le statut :

* non commencée ;
* en cours ;
* terminée.

### 13.3 Reprise vidéo

Le système doit enregistrer :

* temps de lecture ;
* dernière position ;
* durée totale ;
* pourcentage regardé.

L’apprenant doit pouvoir reprendre là où il s’est arrêté.

### 13.4 Conditions de fin de formation

Une formation est terminée si :

* toutes les leçons obligatoires sont terminées ;
* les quiz obligatoires sont réussis ;
* les conditions définies par le formateur sont respectées.

---

## 14. Relances automatiques

### 14.1 Objectif

La plateforme ne doit pas laisser les apprenants créer leur compte ou commencer une formation puis disparaître.

Elle doit envoyer automatiquement des relances.

### 14.2 Cas de relance

Le système doit relancer :

* compte créé mais email non validé ;
* email validé mais aucune demande de formation ;
* demande WhatsApp faite mais aucun accès attribué ;
* accès attribué mais formation non commencée ;
* formation commencée puis abandonnée ;
* leçon commencée mais non terminée ;
* quiz échoué ;
* apprenant proche de la fin ;
* certificat disponible mais non téléchargé.

### 14.3 Fréquence configurable

Le formateur ou admin doit pouvoir configurer :

* relance après 1 jour ;
* relance après 3 jours ;
* relance après 7 jours ;
* relance après 14 jours ;
* nombre maximal de relances ;
* pause des relances pour un apprenant ;
* pause des relances pour une formation.

### 14.4 Anti-spam

Le système doit éviter d’envoyer trop d’emails.

Prévoir :

* maximum X emails par semaine ;
* historique des emails envoyés ;
* désactivation des relances ;
* vérification avant chaque envoi ;
* pas de doublon inutile.

### 14.5 Tâches planifiées

Le projet doit inclure un système de tâches planifiées.

Exemples :

* vérifier chaque jour les apprenants inactifs ;
* envoyer les relances prévues ;
* nettoyer les tokens expirés ;
* générer certains rapports ;
* envoyer un résumé au formateur.

---

## 15. Notifications

### 15.1 Notifications email

La plateforme doit envoyer des emails pour :

* validation email ;
* mot de passe oublié ;
* accès formation attribué ;
* accès retiré ;
* relance ;
* quiz échoué ;
* certificat disponible ;
* annonce live ;
* appel planifié ;
* notification manuelle du formateur.

### 15.2 Notifications internes

La plateforme doit afficher dans le dashboard apprenant :

* nouvel accès formation ;
* nouvelle annonce live ;
* rappel formation ;
* certificat disponible ;
* message du formateur ;
* appel planifié ;
* changement de statut.

### 15.3 Notifications manuelles

Le formateur doit pouvoir envoyer une notification à :

* tous les apprenants ;
* les apprenants d’une formation ;
* les apprenants gratuits ;
* les apprenants payants ;
* les apprenants actifs ;
* les apprenants inactifs ;
* un apprenant précis.

---

## 16. Annonces de sessions live externes

### 16.1 Principe

La plateforme ne doit pas héberger le live.

Le formateur doit pouvoir annoncer une session live qui se passe sur une autre plateforme.

Exemples :

* Zoom ;
* Google Meet ;
* WhatsApp ;
* YouTube Live ;
* Facebook Live ;
* autre.

### 16.2 Création d’une annonce live

Le formateur doit pouvoir renseigner :

* titre ;
* description ;
* date ;
* heure ;
* lien externe ;
* formation liée ;
* public ciblé ;
* image optionnelle ;
* statut.

### 16.3 Ciblage

Le formateur peut cibler :

* tous les apprenants ;
* apprenants gratuits ;
* apprenants payants ;
* apprenants d’une formation ;
* apprenants actifs ;
* apprenants inactifs ;
* apprenants ayant terminé une formation.

### 16.4 Diffusion

L’annonce doit être :

* visible dans le dashboard apprenant ;
* envoyée par email ;
* enregistrée dans l’historique ;
* affichée sur la page de formation si liée à une formation.

---

## 17. Calendrier d’appels

### 17.1 Objectif

Le calendrier d’appels permet au formateur de savoir qui appeler, pourquoi et quand.

### 17.2 Création d’un appel

Le formateur peut créer un appel avec :

* apprenant concerné ;
* formation concernée ;
* date ;
* heure ;
* motif ;
* statut ;
* note interne ;
* priorité ;
* rappel interne.

### 17.3 Statuts d’appel

Un appel peut être :

* à appeler ;
* planifié ;
* effectué ;
* absent ;
* à reprogrammer ;
* annulé.

### 17.4 Vues du calendrier

Prévoir :

* appels du jour ;
* appels à venir ;
* appels en retard ;
* vue liste ;
* vue calendrier simple ;
* filtre par formation ;
* filtre par statut ;
* filtre par formateur.

### 17.5 Suggestions automatiques

Le système peut suggérer un appel si :

* apprenant inactif ;
* formation payée mais non commencée ;
* quiz échoué plusieurs fois ;
* progression bloquée ;
* apprenant proche de la fin ;
* demande de formation payante récente.

---

## 18. Certificats

### 18.1 Génération

Le système doit générer un certificat quand l’apprenant termine une formation.

### 18.2 Conditions

Un certificat peut être généré si :

* les leçons obligatoires sont terminées ;
* les quiz obligatoires sont réussis ;
* le score minimum est atteint ;
* l’accès à la formation est encore valide ;
* le formateur n’a pas bloqué la génération.

### 18.3 Contenu du certificat

Le certificat doit contenir :

* nom complet de l’apprenant ;
* nom de la formation ;
* nom du formateur ;
* date d’obtention ;
* identifiant unique ;
* logo ;
* signature optionnelle ;
* QR code ou lien de vérification.

### 18.4 Vérification publique

Prévoir une page publique :

`/certificates/verify/[code]`

Elle affiche :

* certificat valide ou invalide ;
* nom de l’apprenant ;
* formation ;
* date d’obtention.

### 18.5 Téléchargement

L’apprenant peut télécharger son certificat en PDF.

Le formateur peut aussi télécharger les certificats des apprenants.

---

## 19. Mini-espace communautaire

### 19.1 Objectif

L’espace communautaire doit être simple.

Il ne doit pas devenir un réseau social complet.

### 19.2 Fonctionnalités

Prévoir :

* publications du formateur ;
* annonces ;
* questions des apprenants si autorisées ;
* réponses du formateur ;
* commentaires activables ou désactivables ;
* modération.

### 19.3 Types de communauté

Le formateur peut créer :

* communauté globale ;
* communauté par formation ;
* communauté réservée aux apprenants gratuits ;
* communauté réservée aux apprenants payants.

### 19.4 Modération

Le formateur peut :

* supprimer un message ;
* masquer un message ;
* bloquer un utilisateur ;
* fermer les commentaires ;
* désactiver la communauté.

Par défaut, seuls les formateurs publient. Les apprenants peuvent commenter seulement si l’option est activée.

---

## 20. Dashboard apprenant

Le dashboard apprenant doit afficher :

* formations accessibles ;
* progression globale ;
* prochaine leçon à suivre ;
* quiz à faire ;
* quiz échoués ;
* notifications ;
* annonces live ;
* certificats disponibles ;
* bouton WhatsApp pour contacter le formateur ;
* statut du compte ;
* historique d’activité.

Si l’apprenant n’a aucune formation, afficher :

> Votre compte est validé. Contactez le formateur pour obtenir l’accès à une formation.

Avec deux boutons :

* demander une formation gratuite ;
* signaler une formation payante déjà réglée.

---

## 21. Dashboard formateur

Le dashboard formateur doit afficher :

* nombre total d’apprenants ;
* nouveaux inscrits ;
* emails non validés ;
* demandes de formation ;
* apprenants actifs ;
* apprenants inactifs ;
* formations publiées ;
* formations en brouillon ;
* quiz échoués ;
* certificats générés ;
* appels du jour ;
* appels en retard ;
* annonces live à venir ;
* relances envoyées.

### 21.1 Actions rapides

Le dashboard doit proposer :

* créer une formation ;
* ajouter une leçon ;
* attribuer une formation ;
* créer une annonce live ;
* planifier un appel ;
* envoyer une notification ;
* importer des élèves ;
* exporter les progressions.

### 21.2 Alertes intelligentes

Afficher :

* élèves à relancer ;
* élèves bloqués ;
* demandes payantes à vérifier ;
* quiz échoués ;
* certificats à générer ;
* appels en retard ;
* comptes non validés.

---

## 22. Dashboard admin

Le dashboard admin doit permettre :

* gestion des utilisateurs ;
* gestion des formateurs ;
* gestion globale des formations ;
* consultation des logs ;
* configuration SMTP ;
* configuration WhatsApp ;
* configuration des emails ;
* configuration des certificats ;
* configuration des relances ;
* configuration de la sécurité ;
* consultation des statistiques globales.

---

## 23. Import/export Excel

### 23.1 Import

Le formateur doit pouvoir importer des apprenants via Excel.

Colonnes recommandées :

* prénom ;
* nom ;
* email ;
* téléphone ;
* formation à attribuer ;
* statut ;
* note interne.

Le système doit vérifier :

* doublons ;
* emails invalides ;
* formations inexistantes ;
* champs obligatoires ;
* lignes incorrectes.

### 23.2 Export

Le formateur doit pouvoir exporter :

* liste des apprenants ;
* progressions ;
* résultats quiz ;
* certificats ;
* appels ;
* demandes de formation ;
* relances ;
* inscriptions.

---

## 24. Pages à développer

### 24.1 Pages publiques

* page d’accueil ;
* page connexion ;
* page inscription ;
* page email envoyé ;
* page validation email réussie ;
* page validation email expirée ;
* page mot de passe oublié ;
* page reset password ;
* page choix formation gratuite/payante ;
* page vérification certificat ;
* page catalogue optionnelle ;
* page conditions d’utilisation ;
* page politique de confidentialité.

### 24.2 Pages apprenant

* dashboard ;
* mes formations ;
* détail formation ;
* détail chapitre ;
* leçon vidéo ;
* leçon texte ;
* leçon document ;
* quiz ;
* résultat quiz ;
* certificats ;
* notifications ;
* annonces live ;
* communauté ;
* profil ;
* contact formateur.

### 24.3 Pages formateur

* dashboard ;
* formations ;
* créer formation ;
* modifier formation ;
* chapitres ;
* leçons ;
* quiz ;
* apprenants ;
* fiche apprenant ;
* progression apprenant ;
* demandes de formation ;
* attribution formation ;
* appels ;
* calendrier ;
* annonces live ;
* notifications ;
* certificats ;
* communauté ;
* import Excel ;
* export ;
* paramètres.

### 24.4 Pages admin

* dashboard admin ;
* utilisateurs ;
* formateurs ;
* rôles et permissions ;
* paramètres plateforme ;
* paramètres SMTP ;
* paramètres WhatsApp ;
* modèles emails ;
* logs ;
* sécurité ;
* sauvegardes.

---

## 25. Architecture Next.js recommandée

Structure recommandée :

```txt
src/
  app/
    (public)/
      page.tsx
      login/
      register/
      verify-email/
      forgot-password/
      reset-password/
      certificates/verify/[code]/
    (student)/
      student/dashboard/
      student/courses/
      student/courses/[courseId]/
      student/lessons/[lessonId]/
      student/quizzes/[quizId]/
      student/certificates/
      student/notifications/
      student/community/
    (trainer)/
      trainer/dashboard/
      trainer/courses/
      trainer/courses/new/
      trainer/courses/[courseId]/edit/
      trainer/students/
      trainer/students/[studentId]/
      trainer/requests/
      trainer/calls/
      trainer/live-announcements/
      trainer/certificates/
      trainer/community/
      trainer/settings/
    (admin)/
      admin/dashboard/
      admin/users/
      admin/trainers/
      admin/settings/
      admin/logs/
    api/
      auth/
      uploads/
      videos/
      webhooks/
  components/
    ui/
    forms/
    dashboard/
    video/
    quiz/
    certificate/
  lib/
    auth.ts
    prisma.ts
    mail.ts
    permissions.ts
    validators.ts
    whatsapp.ts
    storage.ts
    security.ts
  server/
    actions/
    services/
    jobs/
  prisma/
    schema.prisma
    migrations/
  emails/
    templates/
  styles/
```

---

## 26. Modèle de données Prisma attendu

Le développeur doit créer un schéma Prisma couvrant au minimum les entités suivantes :

* User ;
* Course ;
* CourseModule ;
* Lesson ;
* Enrollment ;
* LessonProgress ;
* Quiz ;
* Question ;
* QuizAttempt ;
* Certificate ;
* TrainingRequest ;
* Notification ;
* EmailLog ;
* CallSchedule ;
* LiveAnnouncement ;
* CommunityPost ;
* CommunityComment ;
* FileAsset ;
* Setting ;
* AuditLog ;
* Session ;
* VerificationToken ;
* PasswordResetToken.

---

## 27. Tables principales

### 27.1 User

Champs minimum :

* id ;
* firstName ;
* lastName ;
* email ;
* phone ;
* passwordHash ;
* role ;
* status ;
* emailVerifiedAt ;
* lastLoginAt ;
* createdAt ;
* updatedAt.

### 27.2 Course

* id ;
* title ;
* slug ;
* shortDescription ;
* longDescription ;
* coverImage ;
* type ;
* level ;
* durationEstimate ;
* status ;
* certificateEnabled ;
* communityEnabled ;
* createdById ;
* createdAt ;
* updatedAt.

### 27.3 CourseModule

* id ;
* courseId ;
* title ;
* description ;
* order ;
* unlockMode ;
* status ;
* createdAt ;
* updatedAt.

### 27.4 Lesson

* id ;
* moduleId ;
* title ;
* description ;
* type ;
* content ;
* videoPath ;
* documentPath ;
* durationSeconds ;
* order ;
* isRequired ;
* status ;
* createdAt ;
* updatedAt.

### 27.5 Enrollment

* id ;
* userId ;
* courseId ;
* status ;
* grantedById ;
* grantedAt ;
* revokedAt ;
* accessEndsAt ;
* internalNote ;
* createdAt ;
* updatedAt.

### 27.6 LessonProgress

* id ;
* userId ;
* courseId ;
* moduleId ;
* lessonId ;
* status ;
* progressPercent ;
* lastPositionSeconds ;
* startedAt ;
* completedAt ;
* updatedAt.

### 27.7 Quiz

* id ;
* courseId ;
* moduleId ;
* lessonId ;
* title ;
* description ;
* passingScore ;
* maxAttempts ;
* isBlocking ;
* showCorrection ;
* createdAt ;
* updatedAt.

### 27.8 Question

* id ;
* quizId ;
* questionText ;
* type ;
* options ;
* correctAnswers ;
* points ;
* order.

### 27.9 QuizAttempt

* id ;
* quizId ;
* userId ;
* score ;
* passed ;
* answers ;
* startedAt ;
* submittedAt.

### 27.10 Certificate

* id ;
* userId ;
* courseId ;
* certificateCode ;
* pdfPath ;
* issuedAt ;
* revokedAt ;
* status.

### 27.11 TrainingRequest

* id ;
* userId ;
* requestType ;
* selectedCourseId ;
* status ;
* whatsappMessage ;
* clickedAt ;
* approvedAt ;
* rejectedAt ;
* handledById ;
* createdAt.

### 27.12 Notification

* id ;
* userId ;
* title ;
* message ;
* type ;
* readAt ;
* createdAt.

### 27.13 EmailLog

* id ;
* userId ;
* email ;
* subject ;
* type ;
* status ;
* sentAt ;
* errorMessage.

### 27.14 CallSchedule

* id ;
* studentId ;
* trainerId ;
* courseId ;
* title ;
* reason ;
* scheduledAt ;
* status ;
* priority ;
* notes ;
* createdAt ;
* updatedAt.

### 27.15 LiveAnnouncement

* id ;
* title ;
* description ;
* liveUrl ;
* scheduledAt ;
* targetType ;
* courseId ;
* createdById ;
* status ;
* createdAt.

### 27.16 CommunityPost

* id ;
* authorId ;
* courseId ;
* title ;
* content ;
* visibility ;
* commentsEnabled ;
* status ;
* createdAt ;
* updatedAt.

### 27.17 CommunityComment

* id ;
* postId ;
* authorId ;
* content ;
* status ;
* createdAt ;
* updatedAt.

### 27.18 FileAsset

* id ;
* ownerId ;
* fileName ;
* originalName ;
* mimeType ;
* size ;
* path ;
* visibility ;
* createdAt.

### 27.19 AuditLog

* id ;
* actorId ;
* action ;
* entityType ;
* entityId ;
* metadata ;
* ipAddress ;
* userAgent ;
* createdAt.

---

## 28. Permissions détaillées

### 28.1 Apprenant

Un apprenant peut :

* modifier son profil ;
* voir ses formations ;
* voir ses leçons ;
* voir ses quiz ;
* voir ses certificats ;
* voir ses notifications ;
* demander une formation ;
* contacter le formateur via WhatsApp ;
* publier dans la communauté si autorisé.

Un apprenant ne peut pas :

* voir les formations non attribuées ;
* voir les autres apprenants ;
* accéder aux vidéos sans autorisation ;
* accéder au dashboard formateur ;
* modifier une formation ;
* modifier un quiz ;
* générer un certificat sans avoir terminé ;
* contourner les règles de progression.

### 28.2 Formateur

Un formateur peut :

* gérer ses formations ;
* gérer ses apprenants ;
* attribuer des accès ;
* retirer des accès ;
* voir les progressions ;
* gérer les appels ;
* gérer les annonces live ;
* gérer les notifications ;
* consulter les certificats ;
* modérer la communauté.

Un formateur secondaire ne peut faire que ce que ses permissions autorisent.

### 28.3 Admin

L’admin peut tout gérer.

---

## 29. Sécurité obligatoire

Le développeur doit mettre en place :

* validation serveur de tous les formulaires ;
* protection CSRF ;
* cookies HTTP-only ;
* hash des mots de passe ;
* rate limiting ;
* validation des fichiers uploadés ;
* stockage privé des vidéos ;
* contrôle d’accès serveur sur toutes les routes sensibles ;
* logs des actions importantes ;
* protection contre XSS ;
* protection contre injection SQL via Prisma ;
* headers de sécurité ;
* nettoyage des entrées utilisateur ;
* gestion propre des erreurs ;
* aucune donnée sensible dans le frontend ;
* aucune clé secrète exposée côté client.

---

## 30. Uploads

### 30.1 Fichiers autorisés

Vidéos :

* mp4 ;
* webm ;
* mov si nécessaire.

Documents :

* pdf ;
* docx ;
* xlsx ;
* png ;
* jpg ;
* jpeg.

### 30.2 Règles

Le système doit :

* limiter la taille des fichiers ;
* vérifier le type MIME ;
* vérifier l’extension ;
* renommer les fichiers ;
* stocker les fichiers dans un dossier privé ;
* empêcher l’exécution de fichiers ;
* empêcher l’accès public direct.

---

## 31. Emails à prévoir

Templates obligatoires :

* validation de compte ;
* renvoi validation ;
* mot de passe oublié ;
* accès formation attribué ;
* accès retiré ;
* formation non commencée ;
* formation abandonnée ;
* quiz échoué ;
* formation presque terminée ;
* certificat disponible ;
* annonce live ;
* appel planifié ;
* notification personnalisée.

Chaque email doit être personnalisable.

Variables disponibles :

* prénom ;
* nom ;
* email ;
* téléphone ;
* nom formation ;
* progression ;
* lien dashboard ;
* lien WhatsApp ;
* date live ;
* lien live ;
* nom formateur ;
* lien certificat.

---

## 32. Paramètres configurables

Prévoir une table ou un système de paramètres pour :

* nom de la plateforme ;
* logo ;
* couleur principale ;
* email d’envoi ;
* configuration SMTP ;
* numéro WhatsApp du formateur ;
* message WhatsApp gratuit ;
* message WhatsApp payant ;
* durée token validation email ;
* durée token reset password ;
* fréquence relances ;
* limite emails par semaine ;
* taille max vidéo ;
* formats autorisés ;
* activation certificats ;
* activation communauté ;
* activation multi-formateur ;
* mentions légales ;
* politique de confidentialité.

---

## 33. Design attendu

Le design doit être :

* moderne ;
* propre ;
* mobile-first ;
* clair ;
* professionnel ;
* humain ;
* simple ;
* rassurant ;
* rapide.

### 33.1 UI mobile

Sur mobile :

* boutons larges ;
* textes lisibles ;
* navigation simple ;
* dashboard clair ;
* lecteur vidéo responsive ;
* progression visible ;
* CTA WhatsApp visible ;
* formulaires courts ;
* pas de surcharge visuelle.

### 33.2 UI formateur

Le formateur doit voir rapidement :

* qui avance ;
* qui bloque ;
* qui doit être appelé ;
* qui a demandé une formation ;
* qui n’a pas commencé ;
* qui a terminé ;
* quelles formations fonctionnent.

---

## 34. Logs et audit

Le système doit enregistrer :

* connexion ;
* échec connexion ;
* inscription ;
* validation email ;
* attribution formation ;
* retrait accès ;
* création formation ;
* modification formation ;
* suppression/archivage formation ;
* upload vidéo ;
* lecture vidéo ;
* tentative accès interdit ;
* génération certificat ;
* envoi email ;
* création annonce live ;
* création appel ;
* export données.

---

## 35. Critères d’acceptation

Le projet est terminé uniquement si :

* l’apprenant peut créer son compte ;
* l’apprenant reçoit un email de validation ;
* l’apprenant peut valider son email ;
* l’apprenant peut choisir formation gratuite ou payante ;
* le bouton WhatsApp génère un message propre ;
* la demande est enregistrée ;
* le formateur voit la demande ;
* le formateur peut attribuer une formation ;
* l’apprenant reçoit une notification ;
* l’apprenant voit uniquement ses formations ;
* l’apprenant peut suivre les vidéos ;
* les vidéos ne sont pas accessibles publiquement ;
* la progression est sauvegardée ;
* les quiz fonctionnent ;
* les relances automatiques fonctionnent ;
* les emails sont envoyés ;
* les certificats sont générés ;
* les annonces live fonctionnent ;
* le calendrier d’appels fonctionne ;
* les rôles sont respectés ;
* le dashboard formateur est utilisable ;
* le dashboard apprenant est mobile-first ;
* l’import/export Excel fonctionne ;
* les logs existent ;
* la sécurité de base est en place.

---

## 36. Livrables attendus du développeur

Le développeur doit livrer :

* code source complet ;
* projet Next.js fonctionnel ;
* schéma Prisma complet ;
* migrations Prisma ;
* fichier `.env.example` ;
* documentation d’installation ;
* documentation de déploiement ;
* documentation admin ;
* documentation formateur ;
* seed du premier admin ;
* templates emails ;
* système d’upload ;
* système vidéo protégé ;
* système de relances ;
* système de certificats ;
* système d’import/export Excel ;
* checklist de sécurité ;
* tests essentiels ;
* README complet.

---

## 37. Variables d’environnement attendues

Prévoir au minimum :

```env
DATABASE_URL=
NEXTAUTH_SECRET=
APP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
WHATSAPP_TRAINER_PHONE=
UPLOAD_MAX_SIZE=
VIDEO_MAX_SIZE=
EMAIL_VERIFICATION_TOKEN_EXPIRY=
PASSWORD_RESET_TOKEN_EXPIRY=
```

Si le développeur n’utilise pas NextAuth, remplacer `NEXTAUTH_SECRET` par une variable de session équivalente.

---

## 38. Tests à effectuer

### 38.1 Tests fonctionnels

Tester :

* inscription ;
* validation email ;
* connexion ;
* déconnexion ;
* mot de passe oublié ;
* demande WhatsApp ;
* création formation ;
* création chapitre ;
* création leçon ;
* upload vidéo ;
* attribution formation ;
* lecture vidéo ;
* progression ;
* quiz ;
* certificat ;
* annonce live ;
* calendrier d’appel ;
* communauté ;
* import Excel ;
* export Excel ;
* notifications ;
* relances.

### 38.2 Tests de sécurité

Tester :

* accès vidéo sans connexion ;
* accès vidéo sans formation attribuée ;
* accès formation d’un autre élève ;
* accès dashboard formateur depuis compte apprenant ;
* token email expiré ;
* token reset invalide ;
* upload fichier dangereux ;
* tentative brute force login ;
* manipulation URL ;
* compte suspendu ;
* accès direct fichier vidéo ;
* suppression non autorisée.

---

## 39. Ordre recommandé de développement

Même si toutes les fonctionnalités doivent être livrées, le développement doit suivre un ordre propre :

1. Initialisation Next.js + TypeScript.
2. Installation Prisma + PostgreSQL.
3. Modélisation base de données.
4. Authentification.
5. Validation email.
6. Rôles et permissions.
7. Layout public, apprenant, formateur, admin.
8. Dashboard formateur.
9. Gestion des formations.
10. Gestion des chapitres.
11. Gestion des leçons.
12. Upload vidéo sécurisé.
13. Espace apprenant.
14. Attribution formation.
15. Suivi de progression.
16. Quiz.
17. Notifications.
18. Emails.
19. Demandes WhatsApp.
20. Relances automatiques.
21. Certificats.
22. Annonces live externes.
23. Calendrier d’appels.
24. Mini-communauté.
25. Import/export Excel.
26. Logs.
27. Sécurité.
28. Tests.
29. Déploiement.
30. Documentation.

---

## 40. Résumé final du fonctionnement

Le fonctionnement final attendu est le suivant :

1. L’apprenant s’inscrit.
2. Il valide son email.
3. Il choisit formation gratuite ou formation payante déjà payée.
4. Il contacte le formateur via WhatsApp avec un message formaté.
5. La demande est enregistrée.
6. Le formateur vérifie.
7. Le formateur attribue la formation.
8. L’apprenant reçoit un email.
9. L’apprenant commence la formation.
10. La plateforme suit sa progression.
11. La plateforme le relance s’il devient inactif.
12. Le formateur voit son avancement.
13. Le formateur peut programmer un appel.
14. Le formateur peut annoncer un live externe.
15. L’apprenant termine les leçons et les quiz.
16. Le certificat est généré.
17. Le formateur garde une vue claire sur tous ses apprenants.

---

## 41. Point important pour le développeur

Le développeur ne doit pas construire une simple bibliothèque de vidéos.

Il doit construire une plateforme complète de formation, de suivi, de relance et d’accès contrôlé.

La valeur principale du système est dans :

* la structuration des cours ;
* le contrôle des accès ;
* le suivi des apprenants ;
* les relances automatiques ;
* les certificats ;
* les demandes WhatsApp ;
* les notifications ;
* le calendrier d’appels ;
* l’expérience mobile ;
* la simplicité pour le formateur.

Le projet doit être livré comme un système complet et cohérent, pas comme un assemblage de fonctionnalités isolées.
