
# Cahier technique complet — Blog professionnel + vitrine pour trader/formateur

Version : 1.0  
Projet : Site blog/vitrine pour trader, formateur et affiliateur  
Stack recommandée : Next.js + TypeScript + PostgreSQL + Prisma + Tailwind CSS  
Objectif : Construire un site professionnel livrable à un client, centré sur le blog, le référencement, la crédibilité, la conversion et la prise de contact.

---

# 1. Vision générale du projet

## 1.1 Objectif du site

Le site doit permettre à un trader/formateur de :

- publier des articles de conseils pour débutants ;
- attirer du trafic depuis Google ;
- construire une image d’expert ;
- présenter son parcours et ses services ;
- présenter ses formations ;
- afficher des témoignages ;
- diriger les visiteurs vers des liens de contact, d’inscription, de formation ou d’affiliation ;
- recevoir des messages via une page contact ;
- gérer son contenu depuis une interface d’administration simple ;
- optimiser chaque page pour le référencement naturel ;
- garder un site rapide, sécurisé, responsive et professionnel.

Le site n’a pas vocation à devenir un CMS généraliste comme WordPress.  
Il doit rester un produit clair, ciblé, propre et livrable.

---

## 1.2 Nature du produit

Ce n’est pas seulement un blog.

C’est un site hybride :

```text
1. Blog SEO
2. Site vitrine professionnel
3. Tunnel léger de conversion
4. Plateforme de crédibilité
5. Point d’entrée vers formations / affiliation / contact
```

Le blog sert à attirer les visiteurs.  
Les pages vitrine servent à convertir les visiteurs en prospects.  
Les témoignages servent à renforcer la confiance.  
Les liens d’action servent à envoyer les visiteurs vers le trader, ses formations ou son système d’affiliation.

---

## 1.3 Ce qu’on développe dans la V1

La V1 doit contenir :

- page d’accueil ;
- page blog ;
- page article ;
- page catégorie ;
- page tag ;
- page recherche ;
- page à propos ;
- page services/formations ;
- page témoignages ;
- page contact ;
- page politique de confidentialité ;
- page conditions d’utilisation ou mentions légales ;
- page disclaimer trading/risques ;
- tableau de bord admin ;
- CRUD articles ;
- CRUD catégories ;
- CRUD tags ;
- CRUD pages ;
- CRUD témoignages ;
- gestion des médias ;
- gestion des redirections ;
- gestion des messages de contact ;
- gestion des paramètres du site ;
- gestion SEO ;
- sitemap dynamique ;
- robots.txt ;
- metadata dynamique ;
- Open Graph ;
- JSON-LD ;
- authentification admin ;
- rôles simples ;
- logs d’activité ;
- protection basique anti-spam ;
- déploiement.

---

## 1.4 Ce qu’on ne développe pas dans la V1

Pour éviter de créer un monstre :

- pas de marketplace ;
- pas de paiement intégré au début ;
- pas d’espace étudiant complet ;
- pas de système d’e-learning complet ;
- pas de système de campagnes email ;
- pas de CRM complexe ;
- pas de chat en direct ;
- pas d’API publique ;
- pas de builder de page complexe type Elementor ;
- pas de multilingue au départ, sauf si le client l’exige.

On peut prévoir les bases pour ajouter ces éléments plus tard, mais il ne faut pas les intégrer dès le départ.

---

# 2. Stack technique recommandée

## 2.1 Stack principale

```text
Frontend + Backend : Next.js
Langage : TypeScript
Base de données : PostgreSQL
ORM : Prisma
Styling : Tailwind CSS
UI Components : shadcn/ui ou composants custom
Authentification : Auth.js ou auth custom avec sessions
Validation : Zod
Formulaires : React Hook Form
Upload fichiers : Cloudflare R2, S3, Supabase Storage ou stockage local en développement
Emails transactionnels : Resend, Brevo, Mailgun ou SMTP
Déploiement : Vercel, Railway, Render, VPS ou Coolify
Monitoring : Sentry optionnel
Analytics : Plausible, Umami, Matomo ou Google Analytics
```

---

## 2.2 Pourquoi Next.js ?

Next.js est adapté car le site a besoin de :

- pages rapides ;
- SEO propre ;
- rendu serveur ;
- génération de metadata dynamique ;
- routes propres ;
- admin intégré ;
- server actions ;
- route handlers ;
- sitemap dynamique ;
- robots.txt ;
- gestion du frontend et backend dans un seul projet.

Le site n’a pas besoin d’un backend NestJS séparé au départ.

Architecture recommandée :

```text
Monolithe Next.js fullstack
```

Cela veut dire :

```text
Même projet pour :
- le site public ;
- l’administration ;
- les actions serveur ;
- les routes API nécessaires ;
- la connexion à Prisma ;
- la génération SEO.
```

---

## 2.3 Pourquoi PostgreSQL ?

PostgreSQL est adapté car il gère bien :

- relations complexes ;
- recherches ;
- index ;
- données JSON ;
- intégrité relationnelle ;
- évolutivité ;
- données SEO ;
- contenu structuré.

---

## 2.4 Pourquoi Prisma ?

Prisma permet :

- de modéliser la base clairement ;
- de générer un client TypeScript ;
- de gérer les migrations ;
- d’éviter beaucoup d’erreurs SQL ;
- de travailler plus rapidement avec Next.js ;
- de garder les relations lisibles.

---

# 3. Architecture fonctionnelle

## 3.1 Modules principaux

```text
1. Authentification
2. Utilisateurs / rôles
3. Articles
4. Catégories
5. Tags
6. Pages statiques
7. Médias
8. SEO
9. Témoignages
10. Services / formations
11. Liens d’action / affiliation
12. Messages de contact
13. Menus
14. Redirections
15. Paramètres du site
16. Logs d’activité
17. Commentaires optionnels
18. Recherche
19. Analytics léger
```

---

# 4. Pages publiques à créer

## 4.1 Page d’accueil `/`

Objectif : présenter rapidement qui est le trader, ce qu’il propose, ses meilleurs contenus et les appels à l’action.

Sections recommandées :

```text
1. Hero section
2. Présentation courte du trader
3. Proposition de valeur
4. Derniers articles
5. Catégories principales
6. Bloc formations/services
7. Témoignages
8. Bloc confiance/disclaimer
9. Appel à l’action principal
10. Footer
```

Contenu typique :

- titre principal ;
- phrase de positionnement ;
- bouton “Lire les conseils” ;
- bouton “Me contacter” ou “Rejoindre la formation” ;
- photo professionnelle ;
- derniers articles ;
- témoignages ;
- liens vers réseaux sociaux.

Exemple de structure :

```text
Hero :
"Apprenez les bases du trading avec une approche simple, encadrée et progressive."

CTA :
- Voir les articles
- Découvrir les formations
```

Attention : comme le site parle de trading, il faut éviter les promesses irréalistes comme :

```text
"Devenez riche rapidement"
"Doublez votre capital sans risque"
"Gagnez tous les jours"
```

Il faut plutôt utiliser :

```text
"Comprendre les bases"
"Apprendre à gérer le risque"
"Se former progressivement"
"Éviter les erreurs de débutant"
```

---

## 4.2 Page blog `/blog`

Objectif : afficher les articles publiés.

Éléments :

- titre ;
- description ;
- liste des articles ;
- filtres par catégorie ;
- pagination ;
- recherche rapide ;
- articles populaires ou mis en avant ;
- meta title ;
- meta description.

Structure :

```text
/blog
  - liste des articles publiés
  - pagination
  - sidebar optionnelle
```

Chaque carte article doit contenir :

```text
- image mise en avant
- titre
- extrait
- catégorie
- date de publication
- temps de lecture
- lien "Lire l’article"
```

---

## 4.3 Page article `/blog/[slug]`

Objectif : afficher un article optimisé SEO.

Éléments obligatoires :

```text
- H1 unique
- image mise en avant
- auteur
- date de publication
- date de mise à jour
- temps de lecture
- catégorie
- tags
- contenu
- table des matières si article long
- partage social
- articles liés
- bloc CTA
- disclaimer trading
- données structurées BlogPosting
- breadcrumb
```

Structure recommandée :

```text
Header article
Contenu principal
Sidebar optionnelle
CTA
Articles liés
Commentaires optionnels
```

Le bloc CTA peut être :

```text
"Vous débutez en trading ? Contactez-moi pour être orienté vers la bonne formation."
```

ou :

```text
"Rejoindre la communauté / Découvrir la formation"
```

---

## 4.4 Page catégorie `/categorie/[slug]`

Objectif : afficher les articles d’une catégorie.

Éléments :

- nom catégorie ;
- description ;
- articles de la catégorie ;
- pagination ;
- metadata SEO spécifique ;
- canonical ;
- breadcrumb.

Exemples de catégories possibles :

```text
Débuter en trading
Gestion du risque
Psychologie du trading
Analyse technique
Formations
Avis et conseils
Plateformes et outils
```

---

## 4.5 Page tag `/tag/[slug]`

Objectif : regrouper les articles liés à un mot-clé transversal.

Exemples :

```text
forex
crypto
risk management
débutant
analyse technique
psychologie
```

Attention : ne pas créer trop de tags vides.  
Un tag doit être indexable seulement s’il contient assez de contenu utile.

---

## 4.6 Page recherche `/recherche`

Objectif : permettre au visiteur de chercher un article.

Fonctions :

- champ de recherche ;
- recherche dans le titre ;
- recherche dans l’extrait ;
- recherche dans le contenu ;
- résultats paginés ;
- message si aucun résultat.

Option simple :

```text
Recherche PostgreSQL basique
```

Option avancée plus tard :

```text
Meilisearch
Typesense
Algolia
```

---

## 4.7 Page à propos `/a-propos`

Objectif : présenter le trader et créer la confiance.

Sections :

```text
1. Présentation personnelle
2. Parcours
3. Pourquoi il forme les débutants
4. Méthodologie
5. Valeurs
6. Avertissement sur les risques
7. CTA contact / formation
```

À inclure :

- photo ;
- bio ;
- expérience ;
- approche pédagogique ;
- réseaux sociaux ;
- CTA.

Important : éviter de présenter des résultats financiers impossibles à vérifier.

---

## 4.8 Page services/formations `/formations` ou `/services`

Objectif : présenter les offres sans forcément gérer le paiement.

Sections :

```text
1. Introduction
2. À qui s’adresse la formation
3. Ce qu’on apprend
4. Format
5. Bénéfices réalistes
6. Témoignages
7. FAQ
8. CTA
```

Types de CTA :

```text
- Me contacter sur WhatsApp
- Demander les informations
- Rejoindre via le lien partenaire
- Réserver un appel
```

Si le client utilise des liens d’affiliation, prévoir une table pour les CTA/liens.

---

## 4.9 Page témoignages `/temoignages`

Objectif : afficher la preuve sociale.

Éléments :

```text
- témoignages approuvés
- nom ou prénom
- photo optionnelle
- contexte
- date
- CTA
```

Attention : ne pas inventer de témoignages.  
Prévoir un champ `isApproved`.

---

## 4.10 Page contact `/contact`

Objectif : permettre aux visiteurs de contacter le trader.

Champs :

```text
- nom
- email
- téléphone optionnel
- sujet
- message
```

Protections :

```text
- validation Zod
- honeypot anti-spam
- rate limiting
- stockage en base
- notification email optionnelle
```

Après envoi :

```text
Message de confirmation clair
```

---

## 4.11 Page disclaimer `/disclaimer`

Objectif : expliquer les risques liés au trading.

Contenu à prévoir :

```text
- le trading comporte des risques
- les performances passées ne garantissent pas les résultats futurs
- le contenu est informatif/éducatif
- aucune promesse de gains
- chacun reste responsable de ses décisions
- consulter un professionnel si nécessaire
```

Cette page est importante pour un site dans le domaine trading/finance.

---

## 4.12 Page politique de confidentialité `/politique-confidentialite`

Objectif : expliquer les données collectées.

Contenu :

```text
- données collectées via formulaire
- cookies
- analytics
- durée de conservation
- droits de l’utilisateur
- contact
```

---

## 4.13 Page conditions d’utilisation `/conditions-utilisation`

Objectif : cadrer l’utilisation du site.

Contenu :

```text
- accès au site
- propriété intellectuelle
- responsabilité
- liens externes
- modification des contenus
- contact
```

---

## 4.14 Page 404 `/not-found`

Objectif : gérer les URLs inexistantes.

Éléments :

```text
- message simple
- lien retour accueil
- lien blog
- champ de recherche
```

---

# 5. Pages admin à créer

## 5.1 Dashboard `/admin`

Objectif : donner une vue globale.

Cartes :

```text
- nombre d’articles publiés
- brouillons
- messages de contact non lus
- commentaires à modérer
- derniers articles
- dernières activités
```

---

## 5.2 Admin articles `/admin/posts`

Fonctions :

```text
- lister les articles
- filtrer par statut
- filtrer par catégorie
- rechercher
- créer
- modifier
- supprimer soft delete
- publier
- dépublier
- programmer
- prévisualiser
```

Champs article :

```text
- titre
- slug
- extrait
- contenu
- catégorie
- tags
- image mise en avant
- statut
- visibilité
- date de publication
- SEO title
- SEO description
- canonical
- robots index/follow
- Open Graph image
- CTA associé
- autoriser commentaires
```

---

## 5.3 Admin catégories `/admin/categories`

Fonctions :

```text
- créer catégorie
- modifier catégorie
- supprimer
- activer/désactiver
- définir parent
- ajouter description SEO
```

---

## 5.4 Admin tags `/admin/tags`

Fonctions :

```text
- créer tag
- modifier tag
- supprimer
- activer/désactiver
```

---

## 5.5 Admin pages `/admin/pages`

Pour :

```text
- à propos
- contact contenu intro
- politique de confidentialité
- conditions
- disclaimer
- pages personnalisées
```

---

## 5.6 Admin médias `/admin/media`

Fonctions :

```text
- upload image
- lister médias
- supprimer soft delete
- modifier alt text
- modifier caption
- copier URL
```

Restrictions :

```text
- taille max
- types autorisés
- scan basique type MIME
```

---

## 5.7 Admin témoignages `/admin/testimonials`

Fonctions :

```text
- créer témoignage
- modifier
- approuver
- désapprouver
- supprimer
- mettre en avant
```

---

## 5.8 Admin services/formations `/admin/services`

Fonctions :

```text
- créer service
- modifier
- activer/désactiver
- définir CTA
- ajouter prix indicatif optionnel
- ajouter description
```

---

## 5.9 Admin liens CTA / affiliation `/admin/links`

Fonctions :

```text
- créer lien
- modifier lien
- désactiver lien
- suivre clics optionnel
- définir type de lien
```

Types :

```text
- WhatsApp
- Telegram
- Formation
- Affiliation
- Broker
- Calendly
- Page interne
- URL externe
```

---

## 5.10 Admin messages contact `/admin/contact-messages`

Fonctions :

```text
- voir messages
- marquer comme lu
- archiver
- marquer spam
- supprimer
```

---

## 5.11 Admin redirections `/admin/redirects`

Fonctions :

```text
- créer redirection 301
- modifier
- désactiver
- voir nombre de hits
```

---

## 5.12 Admin paramètres `/admin/settings`

Paramètres :

```text
- nom du site
- description
- logo
- favicon
- email de contact
- liens sociaux
- CTA global
- analytics ID
- paramètres SEO par défaut
- activation commentaires
```

---

## 5.13 Admin utilisateurs `/admin/users`

Fonctions :

```text
- créer utilisateur
- modifier rôle
- désactiver
- supprimer soft delete
```

Pour V1, on peut limiter à :

```text
Admin
Éditeur
Auteur
```

---

# 6. Modélisation de base de données

Base recommandée : PostgreSQL.  
ORM : Prisma.

---

# 7. Prisma schema complet recommandé

> Ce schéma est une base solide pour le projet. Il peut être légèrement ajusté selon les choix exacts de l’authentification et du stockage média.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
  BANNED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

enum Visibility {
  PUBLIC
  PRIVATE
  PASSWORD_PROTECTED
}

enum ContentFormat {
  MARKDOWN
  HTML
  BLOCKS
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM
  TRASH
}

enum ContactMessageStatus {
  NEW
  READ
  REPLIED
  ARCHIVED
  SPAM
}

enum LinkType {
  INTERNAL
  EXTERNAL
  WHATSAPP
  TELEGRAM
  AFFILIATE
  FORMATION
  BROKER
  CALENDLY
}

enum StorageDisk {
  LOCAL
  S3
  CLOUDFLARE_R2
  SUPABASE
}

enum MenuLocation {
  HEADER
  FOOTER
  SIDEBAR
  MOBILE
}

enum MenuItemType {
  CUSTOM_URL
  PAGE
  POST
  CATEGORY
  TAG
  SERVICE
}

enum SettingType {
  STRING
  TEXT
  BOOLEAN
  NUMBER
  JSON
  IMAGE
  URL
}

model User {
  id              String        @id @default(cuid())
  name            String
  email           String        @unique
  passwordHash    String?
  avatarId        String?
  bio             String?
  roleId          String?
  status          UserStatus    @default(ACTIVE)
  lastLoginAt     DateTime?
  emailVerifiedAt DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  role            Role?         @relation(fields: [roleId], references: [id])
  avatar          Media?        @relation("UserAvatar", fields: [avatarId], references: [id])

  posts           Post[]        @relation("PostAuthor")
  pages           Page[]        @relation("PageAuthor")
  uploadedMedia   Media[]       @relation("MediaUploader")
  comments        Comment[]
  activityLogs    ActivityLog[]
  redirects       Redirect[]    @relation("RedirectCreator")
  revisions       PostRevision[]

  @@index([roleId])
  @@index([status])
}

model Role {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  roles       RolePermission[]
}

model RolePermission {
  id           String      @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime    @default(now())

  role         Role        @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}

model SeoMetadata {
  id                 String   @id @default(cuid())
  metaTitle          String?
  metaDescription    String?
  metaKeywords       String?
  ogTitle            String?
  ogDescription      String?
  ogImageId          String?
  twitterTitle       String?
  twitterDescription String?
  twitterImageId     String?
  canonicalUrl       String?
  robotsIndex        Boolean  @default(true)
  robotsFollow       Boolean  @default(true)
  structuredData     Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  ogImage            Media?   @relation("SeoOgImage", fields: [ogImageId], references: [id])
  twitterImage       Media?   @relation("SeoTwitterImage", fields: [twitterImageId], references: [id])

  posts              Post[]
  pages              Page[]
  categories         Category[]
  tags               Tag[]
  services           Service[]

  @@index([robotsIndex])
}

model Media {
  id               String      @id @default(cuid())
  filename         String
  originalFilename String
  mimeType         String
  extension        String?
  size             Int
  width            Int?
  height           Int?
  url              String
  storageDisk      StorageDisk @default(LOCAL)
  altText          String?
  caption          String?
  description      String?
  uploadedById     String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  deletedAt        DateTime?

  uploadedBy        User?       @relation("MediaUploader", fields: [uploadedById], references: [id])

  userAvatars       User[]      @relation("UserAvatar")
  postFeatured      Post[]      @relation("PostFeaturedImage")
  pageFeatured      Page[]      @relation("PageFeaturedImage")
  categoryImages    Category[]  @relation("CategoryImage")
  testimonialPhotos Testimonial[] @relation("TestimonialPhoto")
  seoOgImages       SeoMetadata[] @relation("SeoOgImage")
  seoTwitterImages  SeoMetadata[] @relation("SeoTwitterImage")
  postMedia         PostMedia[]
  serviceImages     Service[]   @relation("ServiceImage")

  @@index([uploadedById])
  @@index([mimeType])
}

model Category {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique
  description String?
  parentId    String?
  seoId       String?
  imageId     String?
  sortOrder   Int          @default(0)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  parent      Category?    @relation("CategoryParent", fields: [parentId], references: [id])
  children    Category[]   @relation("CategoryParent")
  seo         SeoMetadata? @relation(fields: [seoId], references: [id])
  image       Media?       @relation("CategoryImage", fields: [imageId], references: [id])
  posts       Post[]

  @@index([slug])
  @@index([parentId])
  @@index([isActive])
}

model Tag {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique
  description String?
  seoId       String?
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  seo         SeoMetadata? @relation(fields: [seoId], references: [id])
  posts       PostTag[]

  @@index([slug])
  @@index([isActive])
}

model Post {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  excerpt         String?
  content         String
  contentFormat   ContentFormat @default(MARKDOWN)
  status          PostStatus    @default(DRAFT)
  visibility      Visibility    @default(PUBLIC)
  passwordHash    String?
  authorId        String
  categoryId      String?
  featuredImageId String?
  seoId           String?
  canonicalUrl    String?
  readingTime     Int?
  viewsCount      Int           @default(0)
  likesCount      Int           @default(0)
  commentsCount   Int           @default(0)
  isFeatured      Boolean       @default(false)
  allowComments   Boolean       @default(false)
  publishedAt     DateTime?
  scheduledAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  author          User          @relation("PostAuthor", fields: [authorId], references: [id])
  category        Category?     @relation(fields: [categoryId], references: [id])
  featuredImage   Media?        @relation("PostFeaturedImage", fields: [featuredImageId], references: [id])
  seo             SeoMetadata?  @relation(fields: [seoId], references: [id])

  tags            PostTag[]
  comments        Comment[]
  revisions       PostRevision[]
  media           PostMedia[]
  views           PostView[]
  reactions       PostReaction[]

  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([authorId])
  @@index([categoryId])
  @@index([isFeatured])
}

model PostTag {
  id        String   @id @default(cuid())
  postId    String
  tagId     String
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([postId, tagId])
  @@index([postId])
  @@index([tagId])
}

model PostRevision {
  id            String        @id @default(cuid())
  postId        String
  title         String
  excerpt       String?
  content       String
  contentFormat ContentFormat
  seoSnapshot   Json?
  createdById   String?
  createdAt     DateTime      @default(now())

  post          Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdBy     User?         @relation(fields: [createdById], references: [id])

  @@index([postId])
  @@index([createdById])
}

model PostMedia {
  id        String   @id @default(cuid())
  postId    String
  mediaId   String
  type      String
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  media     Media    @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([mediaId])
}

model Page {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  content         String
  contentFormat   ContentFormat @default(MARKDOWN)
  status          PostStatus    @default(DRAFT)
  visibility      Visibility    @default(PUBLIC)
  seoId           String?
  featuredImageId String?
  template        String        @default("default")
  authorId        String?
  publishedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  seo             SeoMetadata?  @relation(fields: [seoId], references: [id])
  featuredImage   Media?        @relation("PageFeaturedImage", fields: [featuredImageId], references: [id])
  author          User?         @relation("PageAuthor", fields: [authorId], references: [id])

  @@index([slug])
  @@index([status])
  @@index([template])
}

model Comment {
  id            String        @id @default(cuid())
  postId        String
  userId        String?
  parentId      String?
  authorName    String?
  authorEmail   String?
  authorWebsite String?
  content       String
  status        CommentStatus @default(PENDING)
  ipHash        String?
  userAgent     String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  post          Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  user          User?         @relation(fields: [userId], references: [id])
  parent        Comment?      @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[]     @relation("CommentReplies")

  @@index([postId])
  @@index([status])
  @@index([parentId])
}

model Service {
  id              String       @id @default(cuid())
  title           String
  slug            String       @unique
  shortDescription String?
  description     String
  imageId         String?
  seoId           String?
  isActive        Boolean      @default(true)
  isFeatured      Boolean      @default(false)
  sortOrder       Int          @default(0)
  ctaLabel        String?
  ctaUrl          String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  deletedAt       DateTime?

  image           Media?       @relation("ServiceImage", fields: [imageId], references: [id])
  seo             SeoMetadata? @relation(fields: [seoId], references: [id])

  @@index([slug])
  @@index([isActive])
  @@index([isFeatured])
}

model Testimonial {
  id          String    @id @default(cuid())
  name        String
  role        String?
  content     String
  photoId     String?
  rating      Int?
  isApproved  Boolean   @default(false)
  isFeatured  Boolean   @default(false)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  photo       Media?    @relation("TestimonialPhoto", fields: [photoId], references: [id])

  @@index([isApproved])
  @@index([isFeatured])
}

model ActionLink {
  id          String   @id @default(cuid())
  label       String
  slug        String   @unique
  type        LinkType
  url         String
  description String?
  isActive    Boolean  @default(true)
  isPrimary   Boolean  @default(false)
  clickCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  clicks      LinkClick[]

  @@index([slug])
  @@index([type])
  @@index([isActive])
}

model LinkClick {
  id          String     @id @default(cuid())
  actionLinkId String
  ipHash      String?
  userAgent   String?
  referrer    String?
  createdAt   DateTime   @default(now())

  actionLink   ActionLink @relation(fields: [actionLinkId], references: [id], onDelete: Cascade)

  @@index([actionLinkId])
  @@index([createdAt])
}

model ContactMessage {
  id        String               @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String
  status    ContactMessageStatus @default(NEW)
  ipHash    String?
  userAgent String?
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  @@index([status])
  @@index([createdAt])
}

model Menu {
  id        String       @id @default(cuid())
  name      String
  slug      String       @unique
  location  MenuLocation
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  items     MenuItem[]

  @@index([location])
}

model MenuItem {
  id          String       @id @default(cuid())
  menuId      String
  parentId    String?
  label       String
  url         String?
  target      String       @default("_self")
  type        MenuItemType @default(CUSTOM_URL)
  referenceId String?
  sortOrder   Int          @default(0)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  menu        Menu         @relation(fields: [menuId], references: [id], onDelete: Cascade)
  parent      MenuItem?    @relation("MenuItemChildren", fields: [parentId], references: [id])
  children    MenuItem[]   @relation("MenuItemChildren")

  @@index([menuId])
  @@index([parentId])
  @@index([isActive])
}

model Redirect {
  id          String   @id @default(cuid())
  sourcePath  String   @unique
  targetPath  String
  statusCode  Int      @default(301)
  isActive    Boolean  @default(true)
  hitCount    Int      @default(0)
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy   User?    @relation("RedirectCreator", fields: [createdById], references: [id])

  @@index([sourcePath])
  @@index([isActive])
}

model Setting {
  id        String      @id @default(cuid())
  key       String      @unique
  value     Json?
  type      SettingType @default(STRING)
  group     String      @default("general")
  isPublic  Boolean     @default(false)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([group])
  @@index([isPublic])
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String?
  entityId   String?
  oldValues  Json?
  newValues  Json?
  ipHash     String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
}

model PostView {
  id        String   @id @default(cuid())
  postId    String
  ipHash    String?
  userAgent String?
  referrer  String?
  country   String?
  device    String?
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([createdAt])
}

model PostReaction {
  id           String   @id @default(cuid())
  postId       String
  userId       String?
  ipHash       String?
  reactionType String
  createdAt    DateTime @default(now())

  post         Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([userId])
  @@index([reactionType])
}

model Subscriber {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  status      String    @default("PENDING")
  source      String?
  confirmedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([status])
}
```

---

# 8. Relations principales expliquées

## 8.1 User → Post

Un utilisateur peut écrire plusieurs articles.

```text
User 1 --- n Post
```

Dans Prisma :

```prisma
author User @relation("PostAuthor", fields: [authorId], references: [id])
```

---

## 8.2 Post → Category

Un article appartient à une catégorie principale.

```text
Category 1 --- n Post
```

Un article peut avoir une catégorie ou pas selon ton choix métier.

---

## 8.3 Post ↔ Tag

Un article peut avoir plusieurs tags.  
Un tag peut appartenir à plusieurs articles.

```text
Post n --- n Tag
```

Relation via table pivot :

```text
PostTag
```

---

## 8.4 Post → SeoMetadata

Un article peut avoir des métadonnées SEO spécifiques.

```text
Post 1 --- 1 SeoMetadata optionnel
```

On utilise un `seoId`.

---

## 8.5 Page → SeoMetadata

Chaque page importante peut avoir son SEO.

```text
Page 1 --- 1 SeoMetadata optionnel
```

---

## 8.6 Post → Media

Un article peut avoir :

- une image mise en avant ;
- plusieurs médias attachés.

```text
Post 1 --- 1 Media pour featured image
Post n --- n Media via PostMedia
```

---

## 8.7 Category parent/enfant

Une catégorie peut avoir une catégorie parent.

```text
Category 1 --- n Category
```

Cela permet :

```text
Trading
  Débutant
  Analyse technique
  Gestion du risque
```

---

## 8.8 Commentaires imbriqués

Un commentaire peut répondre à un autre commentaire.

```text
Comment 1 --- n Comment
```

Cette relation permet les threads.

---

## 8.9 Menus

Un menu contient plusieurs items.  
Un menu item peut avoir des enfants.

```text
Menu 1 --- n MenuItem
MenuItem 1 --- n MenuItem
```

---

## 8.10 Services/Formations

Les services sont séparés des pages pour pouvoir les afficher facilement :

```text
Service
  - titre
  - slug
  - description
  - CTA
  - image
  - SEO
```

---

## 8.11 ActionLink

Les liens importants sont centralisés.

Exemples :

```text
Lien WhatsApp principal
Lien Telegram
Lien affiliation broker
Lien formation
Lien calendrier
```

Cela évite de mettre des URLs partout dans le code.

---

# 9. Architecture de dossiers recommandée

```text
src/
  app/
    (public)/
      layout.tsx
      page.tsx
      blog/
        page.tsx
        [slug]/
          page.tsx
      categorie/
        [slug]/
          page.tsx
      tag/
        [slug]/
          page.tsx
      recherche/
        page.tsx
      a-propos/
        page.tsx
      formations/
        page.tsx
      temoignages/
        page.tsx
      contact/
        page.tsx
      disclaimer/
        page.tsx
      politique-confidentialite/
        page.tsx
      conditions-utilisation/
        page.tsx
    admin/
      layout.tsx
      page.tsx
      posts/
        page.tsx
        new/
          page.tsx
        [id]/
          edit/
            page.tsx
      categories/
      tags/
      pages/
      media/
      testimonials/
      services/
      links/
      contact-messages/
      redirects/
      settings/
      users/
    api/
      auth/
      upload/
      links/
        [slug]/
          route.ts
    sitemap.ts
    robots.ts
    not-found.tsx
  components/
    ui/
    public/
      Header.tsx
      Footer.tsx
      ArticleCard.tsx
      BlogList.tsx
      CTASection.tsx
      TestimonialCard.tsx
      Breadcrumbs.tsx
      SeoJsonLd.tsx
    admin/
      AdminSidebar.tsx
      AdminHeader.tsx
      DataTable.tsx
      PostForm.tsx
      MediaPicker.tsx
      SeoFields.tsx
      StatusBadge.tsx
  lib/
    prisma.ts
    auth.ts
    permissions.ts
    seo.ts
    slug.ts
    reading-time.ts
    sanitize.ts
    upload.ts
    mail.ts
    rate-limit.ts
    settings.ts
  actions/
    posts.actions.ts
    categories.actions.ts
    tags.actions.ts
    pages.actions.ts
    media.actions.ts
    testimonials.actions.ts
    services.actions.ts
    contact.actions.ts
    redirects.actions.ts
    settings.actions.ts
  validations/
    post.schema.ts
    category.schema.ts
    tag.schema.ts
    page.schema.ts
    contact.schema.ts
    service.schema.ts
    testimonial.schema.ts
    setting.schema.ts
  prisma/
    schema.prisma
    seed.ts
```

---

# 10. Règles métier importantes

## 10.1 Slugs

Chaque article doit avoir un slug unique.

Exemple :

```text
/comment-debuter-en-trading
```

Règles :

```text
- minuscule
- sans accents
- tirets entre les mots
- pas de caractères spéciaux
- unique
```

Si le slug existe déjà :

```text
comment-debuter-en-trading-2
```

---

## 10.2 Statuts d’article

```text
DRAFT = brouillon
PUBLISHED = publié
SCHEDULED = programmé
ARCHIVED = archivé
```

Règles :

```text
- seul PUBLISHED est visible publiquement
- SCHEDULED devient PUBLISHED à la date prévue
- ARCHIVED n’est pas visible publiquement
- DRAFT visible seulement en admin
```

---

## 10.3 Soft delete

Ne pas supprimer directement les contenus importants.

Utiliser :

```text
deletedAt
```

Avantages :

```text
- récupération possible
- moins de risque d’erreur
- historique conservé
```

---

## 10.4 SEO par page

Chaque contenu indexable doit pouvoir avoir :

```text
- metaTitle
- metaDescription
- canonicalUrl
- robotsIndex
- robotsFollow
- ogTitle
- ogDescription
- ogImage
```

Si un champ SEO est vide, utiliser une valeur par défaut.

---

## 10.5 Disclaimer trading

Sur les pages sensibles :

```text
- articles trading
- page formations
- page services
- page affiliation
```

Ajouter un rappel visible :

```text
Le trading comporte des risques. Le contenu publié sur ce site est fourni à titre éducatif et ne constitue pas un conseil financier personnalisé.
```

---

## 10.6 Liens externes / affiliation

Pour les liens d’affiliation :

```text
- ouvrir dans un nouvel onglet
- ajouter rel="nofollow sponsored noopener"
- idéalement passer par une route interne de tracking
```

Exemple :

```text
/go/nom-du-lien
```

Cette route peut :

```text
- vérifier que le lien est actif
- enregistrer le clic
- rediriger vers l’URL finale
```

---

# 11. Authentification

## 11.1 Besoin

Le site doit avoir une zone admin protégée.

Rôles V1 :

```text
ADMIN
EDITOR
AUTHOR
```

Permissions simples :

```text
ADMIN : tout
EDITOR : gérer articles/pages/commentaires
AUTHOR : créer/modifier ses articles
```

---

## 11.2 Pages auth

```text
/admin/login
/admin/logout
/admin/forgot-password
/admin/reset-password
```

En V1, si le client est seul, on peut commencer avec :

```text
/admin/login
/admin/logout
```

---

## 11.3 Sécurité auth

À prévoir :

```text
- hash des mots de passe
- sessions sécurisées
- cookies httpOnly
- protection routes admin
- limitation tentatives login
- logs de connexion
- mot de passe fort
```

---

# 12. SEO technique

## 12.1 Metadata dynamique

Chaque page publique doit générer :

```text
title
description
canonical
openGraph
twitter card
robots
```

Dans Next.js, utiliser :

```text
generateMetadata()
```

---

## 12.2 Sitemap

Créer :

```text
/app/sitemap.ts
```

Le sitemap doit inclure :

```text
- accueil
- blog
- articles publiés
- catégories actives
- tags actifs utiles
- pages publiées
- services actifs
```

Ne pas inclure :

```text
- admin
- brouillons
- pages privées
- tags vides
- archives inutiles
```

---

## 12.3 Robots

Créer :

```text
/app/robots.ts
```

Règles :

```text
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: https://domaine.com/sitemap.xml
```

---

## 12.4 JSON-LD

À prévoir :

```text
Organization
WebSite
BlogPosting
BreadcrumbList
Person
Service
FAQPage si FAQ réelle
```

---

## 12.5 URLs propres

Exemples :

```text
/
 /blog
 /blog/comment-debuter-en-trading
 /categorie/debuter-en-trading
 /tag/gestion-du-risque
 /a-propos
 /formations
 /contact
```

---

# 13. Frontend public

## 13.1 Design

Le site doit être :

```text
- professionnel
- rassurant
- moderne
- lisible
- responsive
- rapide
```

Style recommandé :

```text
- fond clair
- texte sombre
- accent couleur sobre
- cartes arrondies
- typographie propre
- espaces généreux
```

Pour un trader, éviter le style trop “get rich quick”.  
Préférer un style sérieux :

```text
- confiance
- pédagogie
- maîtrise
- discipline
```

---

## 13.2 Composants publics

```text
Header
Footer
ArticleCard
CategoryBadge
TagBadge
CTAButton
CTASection
HeroSection
TestimonialCard
ServiceCard
Breadcrumbs
TableOfContents
ShareButtons
RelatedPosts
DisclaimerBox
ContactForm
SearchBar
Pagination
```

---

## 13.3 Responsive

Breakpoints :

```text
mobile
tablet
desktop
large desktop
```

Tester :

```text
- iPhone SE
- iPhone standard
- Android standard
- tablette
- desktop
```

---

# 14. Admin frontend

## 14.1 Design admin

L’admin doit être simple :

```text
- sidebar
- header
- tableaux
- formulaires propres
- boutons visibles
- feedback succès/erreur
```

Pas besoin d’un admin trop sophistiqué.  
Le client doit pouvoir publier sans réfléchir.

---

## 14.2 Formulaire article

Champs regroupés :

```text
Onglet contenu :
- titre
- slug
- extrait
- contenu
- image mise en avant

Onglet organisation :
- catégorie
- tags
- statut
- date publication
- auteur
- commentaires activés

Onglet SEO :
- meta title
- meta description
- canonical
- robots
- Open Graph image

Onglet CTA :
- CTA personnalisé
- lien principal
```

---

# 15. Validation des données

Utiliser Zod.

Exemple logique :

```text
Article :
- title requis
- slug requis unique
- content requis
- status valide
- categoryId optionnel
- metaDescription max 160-180 caractères idéalement
```

Contact :

```text
- name requis
- email valide
- message requis
- honeypot vide
```

---

# 16. Emails transactionnels

Pas de campagnes email dans la V1.

Mais prévoir :

```text
- notification admin quand un message contact arrive
- reset password
- confirmation éventuelle si formulaire contact envoyé
```

Variables :

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
```

ou service :

```env
RESEND_API_KEY=
MAIL_FROM=
```

---

# 17. Sécurité

## 17.1 Général

À prévoir :

```text
- HTTPS
- variables d’environnement
- validation serveur
- protection admin
- rate limiting
- protection upload
- sanitization HTML
- cookies sécurisés
- logs
- backup base
```

---

## 17.2 Upload

Règles :

```text
- autoriser seulement images web
- limiter taille
- renommer les fichiers
- ne jamais faire confiance au nom original
- stocker MIME type
- stocker dimensions
```

---

## 17.3 Formulaires

Pour contact :

```text
- honeypot
- rate limit IP
- validation serveur
- message d’erreur générique
```

---

# 18. Performance

Objectifs :

```text
- LCP inférieur à 2.5s
- CLS inférieur à 0.1
- INP inférieur à 200ms
```

À faire :

```text
- optimiser images
- utiliser next/image
- éviter JS inutile
- SSR/SSG pour pages publiques
- cache
- fonts optimisées
- pagination
- requêtes Prisma optimisées
```

---

# 19. Déploiement

## 19.1 Environnements

```text
development
staging
production
```

Variables :

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
APP_URL=
STORAGE_DRIVER=
SMTP_*
ANALYTICS_ID=
```

---

## 19.2 Étapes déploiement

```text
1. Configurer domaine
2. Configurer DNS
3. Déployer app
4. Configurer base PostgreSQL
5. Lancer migrations Prisma
6. Créer utilisateur admin
7. Configurer stockage média
8. Configurer emails
9. Configurer Search Console
10. Soumettre sitemap
11. Tester routes publiques
12. Tester admin
13. Tester formulaire contact
14. Tester performance
```

---

# 20. Commandes de développement

```bash
npx create-next-app@latest trader-blog
cd trader-blog
npm install prisma @prisma/client
npx prisma init
npm install zod react-hook-form
npm install @hookform/resolvers
npm install bcryptjs
npm install slugify
npm install date-fns
npm install next-sitemap
```

Si Auth.js :

```bash
npm install next-auth
```

Si shadcn/ui :

```bash
npx shadcn@latest init
```

---

# 21. Plan de développement complet

## Phase 1 — Initialisation

```text
1. Créer projet Next.js TypeScript
2. Installer Tailwind
3. Installer Prisma
4. Configurer PostgreSQL
5. Créer schema.prisma
6. Créer première migration
7. Configurer prisma client
8. Créer seed admin
```

---

## Phase 2 — Auth/admin

```text
1. Créer page login
2. Créer session
3. Protéger /admin
4. Créer layout admin
5. Créer sidebar
6. Créer dashboard
7. Créer rôles de base
```

---

## Phase 3 — Articles

```text
1. Créer CRUD posts
2. Créer formulaire article
3. Ajouter slug automatique
4. Ajouter statuts
5. Ajouter aperçu
6. Ajouter publication
7. Ajouter page publique article
8. Ajouter page blog
9. Ajouter pagination
```

---

## Phase 4 — Taxonomies

```text
1. CRUD catégories
2. CRUD tags
3. Relations posts/tags
4. Pages publiques catégories
5. Pages publiques tags
```

---

## Phase 5 — Médias

```text
1. Upload image
2. Liste médias
3. Sélection image mise en avant
4. Alt text
5. Suppression soft
```

---

## Phase 6 — Pages vitrine

```text
1. Page à propos
2. Page formations/services
3. Page témoignages
4. Page contact
5. Page disclaimer
6. Pages légales
```

---

## Phase 7 — SEO

```text
1. SeoMetadata
2. generateMetadata
3. Open Graph
4. Twitter cards
5. canonical
6. sitemap.ts
7. robots.ts
8. JSON-LD
9. breadcrumbs
```

---

## Phase 8 — Conversion

```text
1. CTA global
2. Action links
3. Tracking clics
4. CTA dans articles
5. CTA sur homepage
6. CTA sur formations
```

---

## Phase 9 — Contact

```text
1. Formulaire contact
2. Validation
3. Stockage message
4. Notification email
5. Admin messages
6. Anti-spam
```

---

## Phase 10 — Finalisation

```text
1. Redirections
2. Logs activité
3. Paramètres site
4. Tests
5. Performance
6. Sécurité
7. Déploiement
8. Search Console
9. Analytics
```

---

# 22. Checklist de livraison client

## 22.1 Fonctionnel

```text
- Le client peut se connecter
- Le client peut créer un article
- Le client peut publier un article
- Le client peut modifier un article
- Le client peut ajouter une image
- Le client peut modifier le SEO d’un article
- Les visiteurs peuvent lire les articles
- Les visiteurs peuvent chercher
- Les visiteurs peuvent contacter le client
- Les CTA fonctionnent
- Les liens d’affiliation fonctionnent
```

---

## 22.2 SEO

```text
- Titles dynamiques
- Meta descriptions
- Canonical
- Sitemap
- Robots
- JSON-LD
- Open Graph
- Breadcrumb
- URLs propres
- Pages indexables seulement si utiles
```

---

## 22.3 Sécurité

```text
- Admin protégé
- Password hash
- Rate limit login
- Rate limit contact
- Upload sécurisé
- Validation serveur
- Variables secrètes non exposées
```

---

## 22.4 Performance

```text
- Images optimisées
- Pages rapides
- Lighthouse correct
- Mobile OK
- Pas de layout shift majeur
```

---

## 22.5 Contenu de départ

Avant livraison, prévoir :

```text
- page accueil remplie
- page à propos remplie
- page formations remplie
- page contact testée
- disclaimer publié
- politique confidentialité publiée
- au moins 5 articles publiés
- catégories propres
- témoignages si disponibles
```

---

# 23. Recommandation finale

Le bon choix pour ce projet est :

```text
Next.js fullstack
PostgreSQL
Prisma
Admin custom simple
SEO propre
Blog solide
Pages vitrine
CTA/affiliation
Contact
Témoignages
```

Il ne faut pas construire un WordPress complet.  
Il faut construire un système ciblé, professionnel, rapide et adapté au besoin du trader/formateur.

La priorité absolue :

```text
1. Blog SEO
2. Crédibilité
3. Contact / conversion
4. Simplicité admin
5. Performance
6. Sécurité
```

---

# 24. Sources techniques officielles utiles

- Next.js — Metadata API : https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Next.js — sitemap.ts : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js — robots.ts : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Prisma — documentation : https://www.prisma.io/docs
- Prisma avec Next.js : https://www.prisma.io/docs/guides/frameworks/nextjs
- Auth.js : https://authjs.dev/
- Google SEO Starter Guide : https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Structured Data : https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

---

# 25. Notes importantes pour le domaine trading

Le domaine du trading est sensible.

Le site doit éviter :

```text
- promesses de gains
- résultats garantis
- langage manipulateur
- témoignages inventés
- captures de gains non vérifiées
- incitation agressive
```

Le site doit privilégier :

```text
- pédagogie
- transparence
- gestion du risque
- progression
- avertissements
- contenus éducatifs
- preuves réelles
```

À vérifier avec un juriste selon le pays du client, surtout si le site parle d’affiliation, de formation payante ou de plateformes financières.

---

# 26. Résumé ultra-court

Le projet doit être construit comme ceci :

```text
Un site blog/vitrine professionnel pour trader-formateur,
avec un admin simple,
une base de données relationnelle solide,
un SEO propre,
des pages de conversion,
des CTA,
des témoignages,
un formulaire contact,
des liens d’affiliation contrôlés,
et une architecture évolutive sans devenir un CMS géant.
```


---

# 27. Renforcement V2 — Périmètre technique complet livrable

Cette section transforme le cahier technique initial en cahier de développement complet pour un site professionnel blog/vitrine destiné à un trader/formateur.

L’objectif de cette V2 est de couvrir tout ce qui est techniquement faisable dans le périmètre défini :

```text
- Blog professionnel
- Site vitrine
- Page à propos
- Page contact
- Formations/services
- Témoignages
- CTA
- Liens d’affiliation
- Admin simple
- SEO technique
- Sécurité applicative
- Sauvegarde
- Monitoring
- Tests
- Critères de livraison
```

Cette V2 ne garantit pas le succès commercial ou SEO automatiquement, car cela dépend aussi du contenu, de la stratégie, du marché et de la régularité.  
Mais elle couvre le périmètre technique nécessaire pour livrer un vrai produit propre.

---

# 28. Définition stricte du périmètre technique

## 28.1 Ce qui est inclus techniquement

Le système doit permettre :

```text
1. La publication d’articles optimisés SEO
2. La gestion des catégories
3. La gestion des tags
4. La gestion des pages vitrine
5. La gestion de la page À propos
6. La gestion des services/formations
7. La gestion des témoignages
8. La gestion des CTA
9. La gestion des liens d’affiliation
10. La gestion du formulaire contact
11. La gestion des messages reçus
12. La gestion des médias
13. La gestion du SEO par page
14. La génération sitemap.xml
15. La génération robots.txt
16. La génération JSON-LD
17. La gestion des redirections 301
18. La gestion des paramètres globaux du site
19. L’authentification admin
20. La gestion des utilisateurs admin
21. La gestion des rôles
22. La protection des routes admin
23. Les validations serveur
24. Les protections anti-spam
25. Les protections anti-abus
26. Les logs d’activité
27. La sauvegarde
28. La restauration
29. Le monitoring
30. Les tests de livraison
31. La checklist finale client
```

---

## 28.2 Ce qui n’est pas inclus techniquement dans cette V1

```text
1. Paiement en ligne complet
2. Espace étudiant complet
3. Visionnage de formations privées
4. Système de cours vidéo
5. Devoirs/examens/certificats
6. CRM avancé
7. Campagnes email marketing
8. Marketplace
9. Application mobile
10. API publique
11. Multi-tenant
12. Multilingue avancé
13. Builder visuel complexe
```

Ces éléments peuvent être ajoutés en V2/V3 produit, mais ils ne font pas partie du périmètre actuel.

---

# 29. Exigences de sécurité — niveau professionnel

La sécurité doit être pensée comme un ensemble de couches.  
Une seule protection ne suffit pas.

Principe central :

```text
Ne jamais faire confiance au frontend.
Tout doit être revérifié côté serveur.
```

---

## 29.1 Menaces principales à couvrir

Le site doit être protégé contre :

```text
1. Accès non autorisé à l’admin
2. Vol de session
3. Brute force login
4. Injection SQL
5. XSS
6. CSRF selon architecture
7. Upload malveillant
8. Suppression abusive de contenu
9. Modification abusive de contenu
10. Spam formulaire contact
11. Spam commentaires si activés
12. Enumeration utilisateurs
13. Exposition de données sensibles
14. Mauvaise gestion des permissions
15. Redirections ouvertes
16. Fuite de variables d’environnement
17. Mauvaise configuration CORS
18. Clickjacking
19. MIME sniffing
20. Dépendances vulnérables
```

---

## 29.2 Authentification admin

### Exigences

```text
- L’admin doit être inaccessible sans session valide.
- Les routes /admin doivent être protégées côté serveur.
- Les actions serveur doivent vérifier la session.
- Les permissions doivent être vérifiées côté serveur.
- Le mot de passe doit être hashé.
- Aucun mot de passe ne doit être stocké en clair.
- Les erreurs de login ne doivent pas révéler si l’email existe.
```

---

### Hash mot de passe

Utiliser :

```text
bcrypt
argon2
```

Recommandation :

```text
argon2id si possible
bcrypt acceptable
```

Exemple logique :

```text
password -> hash -> stockage DB
```

Jamais :

```text
password -> stockage DB
```

---

### Règles mot de passe

```text
- Minimum 10 à 12 caractères
- Mélange lettres/chiffres recommandé
- Refuser mots de passe trop faibles
- Possibilité de changer mot de passe
- Reset password avec token expirant
```

---

### Reset password

Prévoir une table si reset password activé :

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

Règles :

```text
- Stocker le hash du token, pas le token brut
- Expiration courte : 15 à 60 minutes
- Token utilisable une seule fois
- Message générique même si email inexistant
```

---

## 29.3 Sessions et cookies

Si session par cookie :

```text
- httpOnly
- secure en production
- sameSite=lax ou strict
- expiration raisonnable
- rotation de session après login
```

Règles :

```text
- Ne jamais stocker de secrets dans localStorage
- Ne jamais stocker de JWT sensible dans localStorage
- Ne jamais exposer les tokens au client si inutile
```

---

## 29.4 Autorisation et permissions

### Rôles recommandés

```text
ADMIN
EDITOR
AUTHOR
```

### Permissions minimales

```text
manage_users
manage_settings
manage_posts
create_posts
edit_own_posts
edit_all_posts
delete_posts
publish_posts
manage_categories
manage_tags
manage_pages
manage_media
manage_testimonials
manage_services
manage_links
manage_contact_messages
manage_redirects
view_activity_logs
```

---

### Règle fondamentale

Même si le bouton n’apparaît pas dans le frontend, l’action serveur doit vérifier la permission.

Mauvais :

```text
Le bouton supprimer est caché, donc c’est sécurisé.
```

Bon :

```text
Le bouton est caché + l’action deletePost vérifie la permission côté serveur.
```

---

### Helper recommandé

Créer :

```text
/lib/permissions.ts
```

Fonctions :

```ts
requireAuth()
requireRole(["ADMIN"])
requirePermission("manage_posts")
canEditPost(user, post)
canPublishPost(user)
```

---

## 29.5 Protection des routes admin

Toutes les routes admin doivent être protégées.

Exemples :

```text
/admin
/admin/posts
/admin/posts/new
/admin/posts/[id]/edit
/admin/settings
/admin/users
```

Protection :

```text
- middleware
- vérification session côté layout admin
- vérification côté server actions
```

---

## 29.6 Validation serveur

Toutes les entrées utilisateur doivent être validées côté serveur.

Même si le frontend utilise un formulaire propre, le backend doit revérifier.

Utiliser :

```text
Zod
```

À valider :

```text
- articles
- catégories
- tags
- pages
- services
- témoignages
- contacts
- commentaires
- paramètres
- redirections
- uploads
- utilisateurs
```

---

### Exemple de règles article

```text
title : obligatoire, longueur max
slug : obligatoire, format URL
excerpt : longueur max
content : obligatoire
status : enum valide
categoryId : existe en base si fourni
tags : tableau IDs existants
seo.metaTitle : longueur raisonnable
seo.metaDescription : longueur raisonnable
canonicalUrl : URL valide si fourni
```

---

## 29.7 Protection XSS

Le risque XSS est important car l’admin publie du contenu.

Si le contenu est en Markdown :

```text
- parser Markdown sécurisé
- désactiver HTML brut ou le sanitizer
```

Si le contenu accepte HTML :

```text
- sanitizer obligatoire
- whitelist de balises autorisées
- suppression scripts
- suppression attributs dangereux
```

Utiliser par exemple :

```text
DOMPurify côté serveur avec jsdom
sanitize-html
```

Règles :

```text
- Interdire <script>
- Interdire onerror/onload onclick inline
- Interdire javascript: dans href
- Interdire iframe sauf sources explicitement autorisées
```

---

## 29.8 Protection injection SQL

Avec Prisma, le risque est réduit si on utilise les méthodes Prisma classiques.

À éviter :

```ts
prisma.$queryRawUnsafe(...)
```

Si requête brute obligatoire :

```text
- utiliser queryRaw avec paramètres
- jamais concaténer une entrée utilisateur dans SQL
```

---

## 29.9 Protection CSRF

Si l’auth utilise cookies de session, il faut évaluer CSRF.

À prévoir :

```text
- sameSite=lax ou strict
- tokens CSRF pour actions sensibles si nécessaire
- vérifier Origin/Referer sur actions critiques
```

Actions sensibles :

```text
- suppression article
- création utilisateur
- modification mot de passe
- modification paramètres
- publication article
```

---

## 29.10 Rate limiting

Mettre un rate limit sur :

```text
- login
- reset password
- formulaire contact
- commentaires
- route tracking liens
- upload média
```

Exemples :

```text
login : 5 tentatives / 15 minutes / IP + email
contact : 3 à 5 messages / heure / IP
upload : limite stricte admin
reset password : 3 demandes / heure / email
```

Stockage possible :

```text
Upstash Redis
Redis
Base PostgreSQL
Middleware hébergeur
```

---

## 29.11 Protection anti-spam

Pour contact :

```text
- honeypot invisible
- délai minimum avant soumission
- rate limit
- validation email
- blocage mots suspects optionnel
```

Pour commentaires si activés :

```text
- modération par défaut
- statut PENDING
- rate limit
- honeypot
- interdiction liens multiples
```

---

## 29.12 Upload sécurisé

Risques :

```text
- upload fichier exécutable
- upload HTML/JS
- upload SVG malveillant
- fichier trop gros
- extension trompeuse
```

Règles :

```text
- autoriser seulement jpg, jpeg, png, webp, avif
- refuser svg sauf traitement strict
- vérifier MIME réel
- limiter taille fichier
- renommer fichier
- ne jamais utiliser le nom original comme chemin final
- stocker hors dossier exécutable
- servir via CDN ou route contrôlée
```

Limites recommandées :

```text
image : 2 à 5 MB max
largeur : redimensionner si trop grand
```

---

## 29.13 Headers de sécurité

Configurer les headers HTTP :

```text
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Exemple Next.js :

```ts
// next.config.ts
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

Pour HSTS :

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

À activer seulement quand HTTPS et domaine sont correctement configurés.

---

## 29.14 Content Security Policy

CSP réduit l’impact des XSS.

Exemple de base à adapter :

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

Attention : Next.js, analytics, fonts, images externes et outils de tracking peuvent nécessiter des règles supplémentaires.

---

## 29.15 Protection contre open redirect

La table `ActionLink` redirige vers des liens externes.

Règles :

```text
- ne jamais rediriger vers une URL fournie directement par query param sans validation
- rediriger uniquement vers les URLs stockées en base
- vérifier isActive
- ajouter rel nofollow/sponsored pour liens affiliés
```

Route recommandée :

```text
/go/[slug]
```

Process :

```text
1. Récupérer ActionLink par slug
2. Vérifier actif
3. Enregistrer clic
4. Rediriger vers url stockée
```

---

## 29.16 Protection des données sensibles

Ne jamais exposer publiquement :

```text
- passwordHash
- tokens
- emails admin
- logs internes
- variables d’environnement
- IP brutes
```

Pour IP :

```text
- stocker hash IP si possible
- éviter de stocker IP brute longtemps
```

---

## 29.17 Secrets et variables d’environnement

Tous les secrets doivent être dans `.env`.

Exemples :

```env
DATABASE_URL=
AUTH_SECRET=
APP_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
RESEND_API_KEY=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

Règles :

```text
- ne jamais commit .env
- fournir .env.example sans secrets
- utiliser des secrets différents entre dev/staging/prod
```

---

## 29.18 CORS

Si pas d’API publique :

```text
- pas besoin d’ouvrir CORS largement
```

Interdire :

```text
Access-Control-Allow-Origin: *
```

sauf cas spécifique parfaitement maîtrisé.

---

## 29.19 Logs de sécurité

Journaliser :

```text
- login réussi
- login échoué
- logout
- création article
- publication article
- suppression article
- changement paramètres
- création utilisateur
- suppression utilisateur
- upload média
- modification lien affiliation
```

Ne pas logger :

```text
- mots de passe
- tokens
- secrets
```

---

## 29.20 Dépendances

À prévoir :

```text
- npm audit
- pnpm audit si pnpm
- mise à jour dépendances
- verrouillage package-lock ou pnpm-lock
- suppression packages inutiles
```

---

# 30. Exigences conformité trading / affiliation

Le site parle de trading et de formation.  
Techniquement, il faut prévoir les éléments qui permettent au client de rester transparent.

---

## 30.1 Page disclaimer obligatoire

Créer :

```text
/disclaimer
```

Contenu à intégrer :

```text
- Le trading comporte des risques.
- Les pertes financières sont possibles.
- Les performances passées ne garantissent pas les performances futures.
- Le contenu du site est éducatif.
- Le contenu ne constitue pas un conseil financier personnalisé.
- Le visiteur reste responsable de ses décisions.
- Les liens externes peuvent mener vers des plateformes partenaires.
```

---

## 30.2 Bloc disclaimer réutilisable

Créer composant :

```text
/components/public/DisclaimerBox.tsx
```

À afficher sur :

```text
- articles trading
- page formations
- page services
- page affiliation
- footer optionnel
```

---

## 30.3 Divulgation affiliation

Créer un réglage :

```text
affiliate_disclosure_text
```

Exemple :

```text
Certains liens présents sur ce site peuvent être des liens d’affiliation. Cela signifie que le propriétaire du site peut recevoir une commission si vous utilisez ces liens, sans coût supplémentaire pour vous.
```

À afficher :

```text
- près des liens affiliés
- dans le footer
- sur une page dédiée si nécessaire
```

---

## 30.4 Attributs HTML liens affiliés

Pour les liens affiliés externes :

```html
rel="nofollow sponsored noopener"
target="_blank"
```

---

## 30.5 Interdictions éditoriales côté admin

Ajouter des rappels dans l’admin article :

```text
Évitez les promesses de gains garantis.
Évitez les formulations trompeuses.
Ajoutez un disclaimer si l’article parle de performance, stratégie ou plateforme.
```

---

# 31. Exigences SEO techniques renforcées

## 31.1 Indexation

Chaque page doit avoir une stratégie d’indexation.

Indexable :

```text
- accueil
- blog
- articles publiés
- catégories importantes
- pages vitrine
- formations/services
- témoignages si contenu utile
```

Noindex :

```text
- admin
- recherche interne si résultats pauvres
- tags vides
- pages privées
- brouillons
- previews
```

---

## 31.2 Canonical

Chaque page indexable doit avoir canonical.

Exemples :

```text
/blog/comment-debuter-en-trading
/categorie/debuter-en-trading
/a-propos
```

---

## 31.3 Pagination

Pour `/blog?page=2` :

```text
- URL stable
- canonical cohérent
- pas de duplication inutile
```

---

## 31.4 Données structurées

Implémenter :

```text
Organization
Person
WebSite
BlogPosting
BreadcrumbList
Service
FAQPage si FAQ réelle
```

---

## 31.5 Schema Person pour le trader

Créer des settings :

```text
trader_name
trader_job_title
trader_bio
trader_image
same_as_social_links
```

JSON-LD :

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nom du trader",
  "jobTitle": "Trader / Formateur",
  "url": "https://domaine.com/a-propos"
}
```

---

## 31.6 Schema BlogPosting

Chaque article doit générer :

```text
headline
description
image
author
publisher
datePublished
dateModified
mainEntityOfPage
```

---

## 31.7 Breadcrumb

Toutes les pages profondes doivent avoir un breadcrumb.

Exemple article :

```text
Accueil > Blog > Catégorie > Article
```

---

# 32. Exigences performance renforcées

## 32.1 Objectifs

```text
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

---

## 32.2 Images

```text
- next/image
- dimensions définies
- formats webp/avif
- lazy loading
- priorité uniquement pour hero image
```

---

## 32.3 Requêtes base

```text
- sélectionner uniquement les champs nécessaires
- utiliser pagination
- indexer slug/status/publishedAt
- éviter N+1 queries
```

---

## 32.4 Cache

Utiliser selon besoin :

```text
- ISR
- revalidate
- cache fetch
- CDN
```

Pour articles :

```text
- pages publiques cachables
- revalidation après publication/modification
```

---

# 33. Sauvegarde et restauration

## 33.1 Données à sauvegarder

```text
- base PostgreSQL
- médias uploadés
- variables d’environnement hors dépôt
- configuration déploiement
```

---

## 33.2 Fréquence

Minimum recommandé :

```text
- backup base : quotidien
- backup médias : quotidien ou continu
- rétention : 7 à 30 jours
```

---

## 33.3 Restauration

Il faut documenter :

```text
1. Comment restaurer la base
2. Comment restaurer les médias
3. Comment redéployer
4. Comment recréer un admin si nécessaire
```

---

## 33.4 Test de restauration

Avant livraison :

```text
- effectuer au moins un test de restauration en staging
```

---

# 34. Monitoring et exploitation

## 34.1 Monitoring erreurs

Installer optionnellement :

```text
Sentry
Logtail
Axiom
```

Surveiller :

```text
- erreurs serveur
- erreurs client
- erreurs formulaire contact
- erreurs upload
- erreurs auth
```

---

## 34.2 Uptime monitoring

Utiliser :

```text
UptimeRobot
Better Stack
Pingdom
```

Surveiller :

```text
/
 /blog
 /contact
```

---

## 34.3 Alertes

Prévoir alertes sur :

```text
- site down
- erreur 500 répétée
- formulaire contact cassé
- base inaccessible
```

---

# 35. Tests QA obligatoires

## 35.1 Tests fonctionnels admin

```text
- Login admin
- Logout admin
- Création article
- Modification article
- Suppression article
- Publication article
- Passage brouillon -> publié
- Upload image
- Ajout alt image
- Création catégorie
- Création tag
- Création page
- Création témoignage
- Création service
- Création lien CTA
- Création redirection
- Modification paramètres site
```

---

## 35.2 Tests publics

```text
- Accueil visible
- Blog visible
- Article visible
- Catégorie visible
- Tag visible
- À propos visible
- Formations visible
- Témoignages visible
- Contact visible
- Disclaimer visible
- 404 propre
```

---

## 35.3 Tests SEO

```text
- Title unique par page
- Meta description présente
- Canonical correcte
- Open Graph image correcte
- robots.txt accessible
- sitemap.xml accessible
- JSON-LD valide
- Pas d’admin dans sitemap
- Pas de brouillon public
- Pas de tag vide indexé
```

---

## 35.4 Tests sécurité

```text
- /admin inaccessible sans login
- server actions protégées
- utilisateur sans permission bloqué
- mauvais mot de passe refusé
- rate limit login actif
- formulaire contact rate limité
- upload exe refusé
- upload svg refusé ou nettoyé
- XSS dans commentaire/contenu neutralisé
- secrets non exposés au client
- headers sécurité présents
```

---

## 35.5 Tests responsive

Tester :

```text
- mobile petit écran
- mobile standard
- tablette
- desktop
```

Pages à tester :

```text
- accueil
- blog
- article
- contact
- admin posts
- formulaire article
```

---

## 35.6 Tests performance

```text
- Lighthouse mobile
- Lighthouse desktop
- PageSpeed Insights
- Core Web Vitals
```

Seuils de livraison :

```text
Performance : idéalement > 80
SEO : > 90
Accessibilité : > 85
Best Practices : > 85
```

---

# 36. Critères d’acceptation finale

Le projet est considéré techniquement livrable si :

```text
1. Le client peut se connecter à l’admin
2. Le client peut créer/modifier/publier des articles
3. Le client peut gérer catégories et tags
4. Le client peut modifier les pages vitrine
5. Le client peut gérer formations/services
6. Le client peut gérer témoignages
7. Le client peut gérer les CTA/liens importants
8. Les visiteurs peuvent lire les articles
9. Les visiteurs peuvent contacter le client
10. Le site est responsive
11. Les pages SEO sont générées correctement
12. Le sitemap fonctionne
13. Le robots.txt fonctionne
14. Les redirections fonctionnent
15. Les formulaires sont protégés
16. L’admin est protégé
17. Les permissions sont vérifiées côté serveur
18. Les uploads sont sécurisés
19. Les backups sont configurés
20. Le site est déployé en production avec HTTPS
21. Le client reçoit une mini documentation d’utilisation
```

---

# 37. Documentation client à fournir

Créer un document simple :

```text
1. Comment se connecter
2. Comment créer un article
3. Comment publier un article
4. Comment ajouter une image
5. Comment modifier le SEO
6. Comment gérer les témoignages
7. Comment gérer les formations
8. Comment voir les messages contact
9. Comment modifier les liens CTA
10. Bonnes pratiques éditoriales trading
```

---

# 38. Plan de contenu minimum avant mise en ligne

Pour que le site ne soit pas vide :

```text
- 1 page accueil complète
- 1 page à propos complète
- 1 page formations/services complète
- 1 page contact fonctionnelle
- 1 page disclaimer trading
- 1 politique de confidentialité
- 1 page conditions/mentions légales
- 5 articles minimum
- 3 catégories minimum
- 2 à 5 témoignages réels si disponibles
- 1 CTA principal
- 1 lien contact principal
```

---

# 39. Articles recommandés pour démarrage

Exemples d’articles adaptés au client :

```text
1. Comment débuter en trading sans brûler les étapes
2. Les erreurs fréquentes des débutants en trading
3. Pourquoi la gestion du risque est plus importante que la stratégie
4. Comment choisir une formation trading sérieuse
5. Trading : ce qu’il faut comprendre avant d’investir son argent
6. Psychologie du trading : pourquoi les émotions font perdre
7. Analyse technique : les bases à connaître
8. Comment éviter les fausses promesses dans le trading
```

---

# 40. Architecture finale validée

Architecture finale recommandée :

```text
Next.js fullstack
TypeScript
PostgreSQL
Prisma
Tailwind CSS
Admin custom
Auth sécurisée
SEO dynamique
Sitemap/robots dynamiques
Upload sécurisé
CTA/affiliation contrôlés
Monitoring
Backups
Tests QA
```

---

# 41. Conclusion V2

Cette V2 couvre le périmètre technique complet pour le projet décrit.

Si tout ce document est développé correctement, le résultat sera :

```text
- un vrai blog professionnel
- une vraie vitrine pour trader/formateur
- un admin utilisable
- une base de données structurée
- un SEO technique propre
- une sécurité sérieuse
- une gestion des contacts
- une gestion des CTA et affiliations
- une livraison client crédible
```

Ce document ne garantit pas :

```text
- que Google positionnera immédiatement le site
- que les visiteurs achèteront automatiquement
- que le client aura du trafic sans contenu régulier
- qu’il n’existera jamais aucune faille
```

Mais il couvre tout ce qui est contrôlable techniquement dans le périmètre défini.

---

# 42. Checklist technique finale absolue

## Produit

```text
[ ] Accueil
[ ] Blog
[ ] Article
[ ] Catégorie
[ ] Tag
[ ] Recherche
[ ] À propos
[ ] Formations/services
[ ] Témoignages
[ ] Contact
[ ] Disclaimer
[ ] Politique confidentialité
[ ] Conditions/mentions légales
[ ] 404
```

## Admin

```text
[ ] Login
[ ] Dashboard
[ ] Articles
[ ] Catégories
[ ] Tags
[ ] Pages
[ ] Médias
[ ] Témoignages
[ ] Services
[ ] Liens CTA
[ ] Contact messages
[ ] Redirections
[ ] Settings
[ ] Utilisateurs
[ ] Logs
```

## Base de données

```text
[ ] User
[ ] Role
[ ] Permission
[ ] RolePermission
[ ] SeoMetadata
[ ] Media
[ ] Category
[ ] Tag
[ ] Post
[ ] PostTag
[ ] PostRevision
[ ] PostMedia
[ ] Page
[ ] Comment
[ ] Service
[ ] Testimonial
[ ] ActionLink
[ ] LinkClick
[ ] ContactMessage
[ ] Menu
[ ] MenuItem
[ ] Redirect
[ ] Setting
[ ] ActivityLog
[ ] PostView
[ ] PostReaction
[ ] Subscriber optionnel
```

## Sécurité

```text
[ ] Hash password
[ ] Sessions sécurisées
[ ] Cookies httpOnly
[ ] Admin protégé
[ ] Permissions serveur
[ ] Validation Zod
[ ] Rate limit login
[ ] Rate limit contact
[ ] Upload sécurisé
[ ] XSS protégé
[ ] SQL injection évitée
[ ] CSRF évalué
[ ] Headers sécurité
[ ] CSP
[ ] Secrets en env
[ ] CORS fermé
[ ] Logs sécurité
[ ] Dépendances auditées
```

## SEO

```text
[ ] Metadata dynamique
[ ] Canonical
[ ] Open Graph
[ ] Twitter cards
[ ] Sitemap
[ ] Robots
[ ] JSON-LD
[ ] Breadcrumb
[ ] URLs propres
[ ] Noindex pages inutiles
```

## Production

```text
[ ] HTTPS
[ ] Domaine
[ ] DNS
[ ] Base production
[ ] Migrations
[ ] Seed admin
[ ] Storage médias
[ ] Emails transactionnels
[ ] Backups
[ ] Monitoring erreurs
[ ] Uptime monitoring
[ ] Analytics
[ ] Search Console
```

## Livraison

```text
[ ] Tests fonctionnels
[ ] Tests sécurité
[ ] Tests SEO
[ ] Tests responsive
[ ] Tests performance
[ ] Documentation client
[ ] Accès admin livré
[ ] Backup initial réalisé
[ ] Sitemap soumis
```

---

# 43. Décision finale

À partir de cette V2, le développement peut commencer.

La partie technique est cadrée à un niveau suffisant pour construire un produit professionnel dans le périmètre demandé.

Le développeur doit maintenant transformer ce document en :

```text
1. tâches GitHub / Trello / Linear
2. migrations Prisma
3. composants frontend
4. server actions
5. pages publiques
6. pages admin
7. tests
8. déploiement
```

Fin du cahier technique V2.
