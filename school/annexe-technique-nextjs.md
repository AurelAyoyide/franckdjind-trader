# Annexe technique — Spécifications développeur Next.js

## 1. Objectif de cette annexe

Cette annexe complète le cahier des charges principal.

Elle sert à préciser exactement ce que le développeur doit mettre en place techniquement pour éviter les zones floues.

Le projet doit être développé comme une application complète Next.js, avec backend et frontend dans le même codebase.

Le développeur doit livrer une plateforme stable, sécurisée, mobile-first, prête à être utilisée par un formateur et ses apprenants.

---

# 2. Architecture technique globale

## 2.1 Stack obligatoire

Le projet doit utiliser :

* Next.js ;
* TypeScript ;
* App Router ;
* Prisma ORM ;
* PostgreSQL ;
* Tailwind CSS ;
* Zod pour la validation ;
* React Hook Form ou équivalent pour les formulaires ;
* bcrypt ou argon2 pour les mots de passe ;
* cookies HTTP-only pour les sessions ;
* Nodemailer ou équivalent pour les emails SMTP ;
* une librairie PDF pour les certificats ;
* une librairie Excel pour import/export ;
* un système de jobs planifiés pour les relances.

## 2.2 Principe général

Le projet doit être monolithique.

Cela signifie :

* le frontend est dans Next.js ;
* les pages publiques sont dans Next.js ;
* les dashboards sont dans Next.js ;
* les endpoints API sont dans Next.js ;
* les traitements serveur sont dans Next.js ;
* la base de données est gérée via Prisma ;
* les fichiers sont stockés localement dans un dossier privé au départ.

---

# 3. Structure de dossier recommandée

```txt
src/
  app/
    (public)/
      page.tsx
      login/
        page.tsx
      register/
        page.tsx
      verify-email/
        page.tsx
      verify-email/[token]/
        page.tsx
      forgot-password/
        page.tsx
      reset-password/[token]/
        page.tsx
      certificates/
        verify/[code]/
          page.tsx
      privacy-policy/
        page.tsx
      terms/
        page.tsx

    (student)/
      student/
        dashboard/
          page.tsx
        courses/
          page.tsx
          [courseId]/
            page.tsx
        lessons/
          [lessonId]/
            page.tsx
        quizzes/
          [quizId]/
            page.tsx
        certificates/
          page.tsx
        notifications/
          page.tsx
        live-announcements/
          page.tsx
        community/
          page.tsx
        profile/
          page.tsx

    (trainer)/
      trainer/
        dashboard/
          page.tsx
        courses/
          page.tsx
          new/
            page.tsx
          [courseId]/
            edit/
              page.tsx
            modules/
              page.tsx
            lessons/
              page.tsx
            quizzes/
              page.tsx
        students/
          page.tsx
          [studentId]/
            page.tsx
        requests/
          page.tsx
        enrollments/
          page.tsx
        calls/
          page.tsx
        live-announcements/
          page.tsx
        certificates/
          page.tsx
        community/
          page.tsx
        notifications/
          page.tsx
        imports/
          page.tsx
        exports/
          page.tsx
        settings/
          page.tsx

    (admin)/
      admin/
        dashboard/
          page.tsx
        users/
          page.tsx
        trainers/
          page.tsx
        settings/
          page.tsx
        email-templates/
          page.tsx
        logs/
          page.tsx
        security/
          page.tsx

    api/
      auth/
        login/
          route.ts
        logout/
          route.ts
        register/
          route.ts
        forgot-password/
          route.ts
        reset-password/
          route.ts
        resend-verification/
          route.ts
      uploads/
        route.ts
      videos/
        [lessonId]/
          route.ts
      certificates/
        generate/
          route.ts
      jobs/
        reminders/
          route.ts

  components/
    ui/
    forms/
    layout/
    dashboard/
    video/
    quiz/
    tables/
    modals/
    certificate/
    notifications/

  lib/
    prisma.ts
    auth.ts
    session.ts
    password.ts
    permissions.ts
    mail.ts
    whatsapp.ts
    storage.ts
    video-access.ts
    certificate.ts
    validators.ts
    rate-limit.ts
    audit.ts
    settings.ts
    dates.ts

  server/
    actions/
      auth.actions.ts
      course.actions.ts
      lesson.actions.ts
      quiz.actions.ts
      enrollment.actions.ts
      notification.actions.ts
      certificate.actions.ts
      call.actions.ts
      community.actions.ts
    services/
      auth.service.ts
      user.service.ts
      course.service.ts
      lesson.service.ts
      quiz.service.ts
      progress.service.ts
      enrollment.service.ts
      email.service.ts
      reminder.service.ts
      certificate.service.ts
      call.service.ts
      live.service.ts
      community.service.ts
      audit.service.ts
    jobs/
      send-reminders.job.ts
      clean-expired-tokens.job.ts
      daily-trainer-summary.job.ts

  prisma/
    schema.prisma
    seed.ts

  emails/
    templates/
      verify-email.html
      forgot-password.html
      course-access-granted.html
      course-access-revoked.html
      reminder-inactive.html
      reminder-not-started.html
      quiz-failed.html
      certificate-ready.html
      live-announcement.html
      call-scheduled.html

  storage/
    private/
      videos/
      documents/
      certificates/
      images/

  styles/
    globals.css
```

---

# 4. Schéma Prisma complet attendu

Le développeur doit créer un schéma Prisma complet.

## 4.1 Enums

```prisma
enum UserRole {
  SUPER_ADMIN
  TRAINER
  ASSISTANT_TRAINER
  STUDENT
}

enum UserStatus {
  EMAIL_PENDING
  EMAIL_VERIFIED
  ACTIVE
  SUSPENDED
  DELETED
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum CourseType {
  FREE
  PAID_EXTERNAL
}

enum ModuleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum LessonType {
  VIDEO
  TEXT
  DOCUMENT
  QUIZ
  MIXED
}

enum LessonStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum UnlockMode {
  FREE_ACCESS
  AFTER_PREVIOUS_MODULE
  AFTER_QUIZ_SUCCESS
  MANUAL
  TRAINER_VALIDATION
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  REVOKED
  SUSPENDED
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  OPEN_TEXT
}

enum TrainingRequestType {
  FREE_TRAINING
  PAID_TRAINING
}

enum TrainingRequestStatus {
  PENDING
  CONTACTED
  APPROVED
  REJECTED
}

enum NotificationType {
  SYSTEM
  COURSE
  REMINDER
  LIVE
  CERTIFICATE
  CALL
  CUSTOM
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}

enum CallStatus {
  TO_CALL
  SCHEDULED
  DONE
  MISSED
  TO_RESCHEDULE
  CANCELLED
}

enum CallPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum LiveAnnouncementStatus {
  DRAFT
  SCHEDULED
  SENT
  CANCELLED
}

enum CommunityVisibility {
  GLOBAL
  COURSE_ONLY
  FREE_STUDENTS
  PAID_STUDENTS
}

enum CommunityPostStatus {
  PUBLISHED
  HIDDEN
  DELETED
}

enum CertificateStatus {
  ACTIVE
  REVOKED
}

enum FileVisibility {
  PRIVATE
  PROTECTED
  PUBLIC
}
```

---

## 4.2 User

```prisma
model User {
  id              String     @id @default(cuid())
  firstName       String
  lastName        String
  email           String     @unique
  phone           String?
  passwordHash    String
  role            UserRole   @default(STUDENT)
  status          UserStatus @default(EMAIL_PENDING)
  emailVerifiedAt DateTime?
  lastLoginAt     DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  createdCourses      Course[]       @relation("CourseCreator")
  enrollments         Enrollment[]
  lessonProgresses    LessonProgress[]
  quizAttempts        QuizAttempt[]
  certificates        Certificate[]
  trainingRequests    TrainingRequest[]
  notifications       Notification[]
  emailLogs           EmailLog[]
  studentCalls        CallSchedule[] @relation("StudentCalls")
  trainerCalls        CallSchedule[] @relation("TrainerCalls")
  communityPosts      CommunityPost[]
  communityComments   CommunityComment[]
  auditLogs           AuditLog[]     @relation("AuditActor")
  files               FileAsset[]
}
```

---

## 4.3 Course

```prisma
model Course {
  id                 String       @id @default(cuid())
  title              String
  slug               String       @unique
  shortDescription   String?
  longDescription    String?
  coverImage         String?
  type               CourseType   @default(FREE)
  level              String?
  durationEstimate   String?
  status             CourseStatus @default(DRAFT)
  certificateEnabled Boolean      @default(false)
  communityEnabled   Boolean      @default(false)
  isPublicCatalog    Boolean      @default(false)
  createdById        String
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  createdBy          User         @relation("CourseCreator", fields: [createdById], references: [id])
  modules            CourseModule[]
  lessons            Lesson[]
  enrollments        Enrollment[]
  quizzes            Quiz[]
  certificates       Certificate[]
  trainingRequests   TrainingRequest[]
  liveAnnouncements  LiveAnnouncement[]
  communityPosts     CommunityPost[]
}
```

---

## 4.4 CourseModule

```prisma
model CourseModule {
  id          String       @id @default(cuid())
  courseId    String
  title       String
  description String?
  order       Int
  unlockMode  UnlockMode   @default(FREE_ACCESS)
  status      ModuleStatus @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  course      Course       @relation(fields: [courseId], references: [id])
  lessons     Lesson[]
  quizzes     Quiz[]
}
```

---

## 4.5 Lesson

```prisma
model Lesson {
  id              String       @id @default(cuid())
  courseId        String
  moduleId        String
  title           String
  description     String?
  type            LessonType
  content         String?
  videoPath       String?
  documentPath    String?
  durationSeconds Int?
  order           Int
  isRequired      Boolean      @default(true)
  status          LessonStatus @default(DRAFT)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  course          Course       @relation(fields: [courseId], references: [id])
  module          CourseModule @relation(fields: [moduleId], references: [id])
  progresses      LessonProgress[]
  quizzes         Quiz[]
}
```

---

## 4.6 Enrollment

```prisma
model Enrollment {
  id           String           @id @default(cuid())
  userId       String
  courseId     String
  status       EnrollmentStatus @default(ACTIVE)
  grantedById  String?
  grantedAt    DateTime         @default(now())
  revokedAt    DateTime?
  accessEndsAt DateTime?
  internalNote String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  user         User             @relation(fields: [userId], references: [id])
  course       Course           @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

---

## 4.7 LessonProgress

```prisma
model LessonProgress {
  id                  String         @id @default(cuid())
  userId              String
  courseId            String
  moduleId            String
  lessonId            String
  status              ProgressStatus @default(NOT_STARTED)
  progressPercent     Int            @default(0)
  lastPositionSeconds Int            @default(0)
  startedAt           DateTime?
  completedAt         DateTime?
  updatedAt           DateTime       @updatedAt

  user                User           @relation(fields: [userId], references: [id])
  lesson              Lesson         @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
}
```

---

## 4.8 Quiz

```prisma
model Quiz {
  id             String   @id @default(cuid())
  courseId       String
  moduleId       String?
  lessonId       String?
  title          String
  description    String?
  passingScore   Int      @default(70)
  maxAttempts    Int?
  isBlocking     Boolean  @default(false)
  isRequired     Boolean  @default(false)
  showCorrection Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  course         Course        @relation(fields: [courseId], references: [id])
  module         CourseModule? @relation(fields: [moduleId], references: [id])
  lesson         Lesson?       @relation(fields: [lessonId], references: [id])
  questions      Question[]
  attempts       QuizAttempt[]
}
```

---

## 4.9 Question

```prisma
model Question {
  id             String       @id @default(cuid())
  quizId          String
  questionText    String
  type            QuestionType
  options         Json?
  correctAnswers  Json?
  points          Int          @default(1)
  order           Int

  quiz            Quiz         @relation(fields: [quizId], references: [id])
}
```

---

## 4.10 QuizAttempt

```prisma
model QuizAttempt {
  id          String   @id @default(cuid())
  quizId      String
  userId      String
  score       Int
  passed      Boolean
  answers     Json
  startedAt   DateTime @default(now())
  submittedAt DateTime?

  quiz        Quiz     @relation(fields: [quizId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 4.11 TrainingRequest

```prisma
model TrainingRequest {
  id               String                @id @default(cuid())
  userId           String
  requestType      TrainingRequestType
  selectedCourseId String?
  status           TrainingRequestStatus @default(PENDING)
  whatsappMessage  String
  clickedAt        DateTime?
  approvedAt       DateTime?
  rejectedAt       DateTime?
  handledById      String?
  createdAt        DateTime              @default(now())

  user             User                  @relation(fields: [userId], references: [id])
  selectedCourse   Course?               @relation(fields: [selectedCourseId], references: [id])
}
```

---

## 4.12 Certificate

```prisma
model Certificate {
  id              String            @id @default(cuid())
  userId          String
  courseId        String
  certificateCode String            @unique
  pdfPath         String?
  issuedAt        DateTime          @default(now())
  revokedAt       DateTime?
  status          CertificateStatus @default(ACTIVE)

  user            User              @relation(fields: [userId], references: [id])
  course          Course            @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

---

## 4.13 Notification

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id])
}
```

---

## 4.14 EmailLog

```prisma
model EmailLog {
  id           String      @id @default(cuid())
  userId       String?
  email        String
  subject      String
  type         String
  status       EmailStatus @default(PENDING)
  sentAt       DateTime?
  errorMessage String?
  createdAt    DateTime    @default(now())

  user         User?       @relation(fields: [userId], references: [id])
}
```

---

## 4.15 CallSchedule

```prisma
model CallSchedule {
  id          String       @id @default(cuid())
  studentId   String
  trainerId   String
  courseId    String?
  title       String
  reason      String?
  scheduledAt DateTime
  status      CallStatus   @default(TO_CALL)
  priority    CallPriority @default(NORMAL)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  student     User         @relation("StudentCalls", fields: [studentId], references: [id])
  trainer     User         @relation("TrainerCalls", fields: [trainerId], references: [id])
}
```

---

## 4.16 LiveAnnouncement

```prisma
model LiveAnnouncement {
  id          String                 @id @default(cuid())
  title       String
  description String?
  liveUrl     String
  scheduledAt DateTime
  targetType  String
  courseId    String?
  createdById String
  status      LiveAnnouncementStatus @default(DRAFT)
  createdAt   DateTime               @default(now())

  course      Course?                @relation(fields: [courseId], references: [id])
}
```

---

## 4.17 CommunityPost

```prisma
model CommunityPost {
  id              String              @id @default(cuid())
  authorId        String
  courseId        String?
  title           String
  content         String
  visibility      CommunityVisibility @default(GLOBAL)
  commentsEnabled Boolean             @default(false)
  status          CommunityPostStatus @default(PUBLISHED)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  author          User                @relation(fields: [authorId], references: [id])
  course          Course?             @relation(fields: [courseId], references: [id])
  comments        CommunityComment[]
}
```

---

## 4.18 CommunityComment

```prisma
model CommunityComment {
  id        String              @id @default(cuid())
  postId    String
  authorId  String
  content   String
  status    CommunityPostStatus @default(PUBLISHED)
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  post      CommunityPost       @relation(fields: [postId], references: [id])
  author    User                @relation(fields: [authorId], references: [id])
}
```

---

## 4.19 FileAsset

```prisma
model FileAsset {
  id           String         @id @default(cuid())
  ownerId      String?
  fileName     String
  originalName String
  mimeType     String
  size         Int
  path         String
  visibility   FileVisibility @default(PRIVATE)
  createdAt    DateTime       @default(now())

  owner        User?          @relation(fields: [ownerId], references: [id])
}
```

---

## 4.20 VerificationToken

```prisma
model VerificationToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

---

## 4.21 PasswordResetToken

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

---

## 4.22 Setting

```prisma
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4.23 AuditLog

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  actor      User?    @relation("AuditActor", fields: [actorId], references: [id])
}
```

---

# 5. Routes principales attendues

## 5.1 Routes publiques

```txt
GET  /
GET  /login
GET  /register
GET  /verify-email
GET  /verify-email/[token]
GET  /forgot-password
GET  /reset-password/[token]
GET  /certificates/verify/[code]
GET  /terms
GET  /privacy-policy
```

---

## 5.2 Routes apprenant

```txt
GET  /student/dashboard
GET  /student/courses
GET  /student/courses/[courseId]
GET  /student/lessons/[lessonId]
GET  /student/quizzes/[quizId]
GET  /student/certificates
GET  /student/notifications
GET  /student/live-announcements
GET  /student/community
GET  /student/profile
```

---

## 5.3 Routes formateur

```txt
GET  /trainer/dashboard
GET  /trainer/courses
GET  /trainer/courses/new
GET  /trainer/courses/[courseId]/edit
GET  /trainer/courses/[courseId]/modules
GET  /trainer/courses/[courseId]/lessons
GET  /trainer/courses/[courseId]/quizzes
GET  /trainer/students
GET  /trainer/students/[studentId]
GET  /trainer/requests
GET  /trainer/enrollments
GET  /trainer/calls
GET  /trainer/live-announcements
GET  /trainer/certificates
GET  /trainer/community
GET  /trainer/notifications
GET  /trainer/imports
GET  /trainer/exports
GET  /trainer/settings
```

---

## 5.4 Routes admin

```txt
GET  /admin/dashboard
GET  /admin/users
GET  /admin/trainers
GET  /admin/settings
GET  /admin/email-templates
GET  /admin/logs
GET  /admin/security
```

---

## 5.5 API routes ou Server Actions

Le développeur peut utiliser Server Actions ou API routes.

Mais les opérations sensibles doivent toujours être exécutées côté serveur.

Actions attendues :

```txt
registerUser
loginUser
logoutUser
sendVerificationEmail
verifyEmailToken
requestPasswordReset
resetPassword

createCourse
updateCourse
archiveCourse
deleteCourse

createModule
updateModule
reorderModules
archiveModule

createLesson
updateLesson
uploadLessonVideo
uploadLessonDocument
reorderLessons
archiveLesson

createQuiz
updateQuiz
createQuestion
updateQuestion
submitQuizAttempt

createTrainingRequest
approveTrainingRequest
rejectTrainingRequest

grantCourseAccess
revokeCourseAccess

updateLessonProgress
markLessonCompleted
getStudentProgress

createLiveAnnouncement
sendLiveAnnouncement

createCallSchedule
updateCallScheduleStatus

generateCertificate
verifyCertificate

createCommunityPost
createCommunityComment
moderateCommunityContent

sendManualNotification
markNotificationAsRead

importStudentsFromExcel
exportStudentsToExcel
exportProgressToExcel

updateSettings
createAuditLog
```

---

# 6. Middleware et protection des routes

## 6.1 Middleware global

Le projet doit avoir un middleware qui :

* lit la session ;
* vérifie si l’utilisateur est connecté ;
* protège les routes privées ;
* redirige selon le rôle ;
* bloque les comptes suspendus ;
* empêche l’accès aux comptes non validés si nécessaire.

## 6.2 Règles de redirection

Si l’utilisateur n’est pas connecté :

* accès aux routes privées interdit ;
* redirection vers `/login`.

Si l’utilisateur est apprenant et essaie d’aller sur `/trainer` :

* accès refusé ;
* redirection vers `/student/dashboard`.

Si l’utilisateur est formateur et essaie d’aller sur `/admin` :

* accès refusé ;
* redirection vers `/trainer/dashboard`.

Si l’utilisateur est suspendu :

* redirection vers `/account-suspended`.

Si l’email n’est pas validé :

* redirection vers `/verify-email`.

---

# 7. Tableau des permissions

## 7.1 Super Admin

| Fonction                          | Permission |
| --------------------------------- | ---------- |
| Voir tous les utilisateurs        | Oui        |
| Créer formateur                   | Oui        |
| Modifier formateur                | Oui        |
| Suspendre utilisateur             | Oui        |
| Supprimer logiquement utilisateur | Oui        |
| Voir toutes les formations        | Oui        |
| Modifier toutes les formations    | Oui        |
| Gérer paramètres globaux          | Oui        |
| Gérer SMTP                        | Oui        |
| Gérer templates email             | Oui        |
| Gérer sécurité                    | Oui        |
| Voir logs                         | Oui        |

## 7.2 Formateur principal

| Fonction                 | Permission     |
| ------------------------ | -------------- |
| Créer formation          | Oui            |
| Modifier ses formations  | Oui            |
| Archiver ses formations  | Oui            |
| Supprimer définitivement | Non recommandé |
| Ajouter chapitres        | Oui            |
| Ajouter leçons           | Oui            |
| Ajouter vidéos           | Oui            |
| Ajouter quiz             | Oui            |
| Voir apprenants          | Oui            |
| Attribuer formation      | Oui            |
| Retirer accès            | Oui            |
| Voir progression         | Oui            |
| Créer annonce live       | Oui            |
| Créer appel              | Oui            |
| Envoyer notification     | Oui            |
| Générer certificat       | Oui            |
| Exporter données         | Oui            |
| Gérer paramètres globaux | Non            |

## 7.3 Formateur secondaire

| Fonction                  | Permission       |
| ------------------------- | ---------------- |
| Voir apprenants assignés  | Oui              |
| Voir formations assignées | Oui              |
| Modifier formation        | Selon permission |
| Attribuer formation       | Selon permission |
| Voir progression          | Oui              |
| Créer appel               | Oui              |
| Envoyer notification      | Selon permission |
| Supprimer formation       | Non              |
| Gérer paramètres          | Non              |

## 7.4 Apprenant

| Fonction                     | Permission |
| ---------------------------- | ---------- |
| Créer compte                 | Oui        |
| Valider email                | Oui        |
| Demander formation           | Oui        |
| Voir ses formations          | Oui        |
| Voir formation non attribuée | Non        |
| Regarder ses vidéos          | Oui        |
| Télécharger vidéo            | Non        |
| Faire quiz                   | Oui        |
| Voir certificat              | Oui        |
| Voir autres apprenants       | Non        |
| Accéder dashboard formateur  | Non        |
| Modifier formation           | Non        |

---

# 8. Logique de validation email

## 8.1 Création du token

Quand un utilisateur s’inscrit :

* générer un token aléatoire ;
* stocker uniquement le hash du token ;
* définir une expiration ;
* envoyer le token brut par email dans un lien ;
* ne jamais stocker le token brut.

## 8.2 Validation du token

Quand l’utilisateur clique :

* récupérer le token ;
* hasher le token ;
* chercher le hash en base ;
* vérifier qu’il existe ;
* vérifier qu’il n’est pas expiré ;
* vérifier qu’il n’a pas déjà été utilisé ;
* marquer `usedAt` ;
* mettre `emailVerifiedAt` ;
* mettre le statut utilisateur à `EMAIL_VERIFIED`.

## 8.3 Expiration

Si le token est expiré :

* afficher une page claire ;
* proposer de renvoyer un email de validation.

---

# 9. Logique WhatsApp

## 9.1 Configuration

Le numéro WhatsApp du formateur doit être configurable dans les paramètres.

Format attendu :

```txt
229XXXXXXXX
```

Sans `+`, sans espace.

## 9.2 Génération du lien

La fonction doit générer :

```txt
https://wa.me/{phone}?text={encodedMessage}
```

Le message doit être encodé proprement avec `encodeURIComponent`.

## 9.3 Enregistrement de la demande

Avant ou au moment du clic WhatsApp :

* créer une `TrainingRequest` ;
* stocker le type de demande ;
* stocker le message généré ;
* stocker l’utilisateur ;
* stocker la formation sélectionnée si applicable ;
* mettre le statut `PENDING`.

---

# 10. Logique d’attribution des formations

## 10.1 Attribution

Quand le formateur attribue une formation :

* vérifier que l’utilisateur existe ;
* vérifier qu’il est apprenant ;
* vérifier que la formation existe ;
* vérifier que la formation est publiée ou autorisée ;
* créer ou réactiver un `Enrollment` ;
* mettre statut `ACTIVE` ;
* enregistrer `grantedById` ;
* envoyer email d’accès ;
* créer notification interne ;
* écrire un audit log.

## 10.2 Retrait d’accès

Quand le formateur retire l’accès :

* ne pas supprimer l’enrollment ;
* mettre statut `REVOKED` ;
* enregistrer `revokedAt` ;
* garder la progression ;
* envoyer email ;
* écrire audit log.

## 10.3 Accès avec date de fin

Si `accessEndsAt` est défini :

* l’accès est refusé après cette date ;
* la progression reste stockée ;
* le formateur peut prolonger l’accès.

---

# 11. Logique vidéo sécurisée

## 11.1 Stockage

Les vidéos doivent être stockées dans :

```txt
storage/private/videos/
```

Elles ne doivent pas être dans `/public`.

## 11.2 Lecture

La lecture se fait via une route protégée :

```txt
GET /api/videos/[lessonId]
```

Cette route doit :

* vérifier la session ;
* vérifier le rôle ;
* vérifier l’accès à la formation ;
* vérifier l’enrollment ;
* vérifier que la leçon est publiée ;
* vérifier que le fichier existe ;
* envoyer le flux vidéo ;
* supporter les range requests ;
* écrire un log de lecture.

## 11.3 Lecteur vidéo

Le lecteur doit :

* être responsive ;
* désactiver le bouton download ;
* afficher le watermark ;
* sauvegarder la progression régulièrement ;
* envoyer la position toutes les X secondes ;
* permettre de reprendre la vidéo.

## 11.4 Progression vidéo

Toutes les 10 à 20 secondes :

* envoyer `lessonId` ;
* envoyer `currentTime` ;
* envoyer `duration` ;
* calculer le pourcentage ;
* mettre à jour `LessonProgress`.

Si la vidéo dépasse un seuil, par exemple 90%, la leçon peut être marquée comme terminée.

---

# 12. Logique des quiz

## 12.1 Création

Le formateur peut créer un quiz avec plusieurs questions.

Chaque question peut avoir :

* une ou plusieurs réponses possibles ;
* une bonne réponse ;
* un nombre de points.

## 12.2 Soumission

Quand l’apprenant soumet :

* vérifier son accès ;
* vérifier le nombre de tentatives ;
* corriger automatiquement si possible ;
* calculer le score ;
* enregistrer `QuizAttempt` ;
* déterminer `passed`.

## 12.3 Questions ouvertes

Si le quiz contient une question ouverte :

* soit le quiz est marqué “à corriger” ;
* soit la question ouverte est informative et non bloquante.

Le comportement doit être défini clairement par le développeur et documenté.

---

# 13. Logique de progression

## 13.1 Progression d’une leçon

Une leçon passe à :

* `NOT_STARTED` au départ ;
* `IN_PROGRESS` dès ouverture ;
* `COMPLETED` si la condition est remplie.

## 13.2 Progression d’une formation

Le pourcentage global est calculé ainsi :

```txt
nombre de leçons obligatoires terminées / nombre total de leçons obligatoires
```

Les quiz obligatoires doivent aussi être pris en compte.

## 13.3 Formation terminée

Une formation est terminée si :

* toutes les leçons obligatoires sont terminées ;
* tous les quiz obligatoires sont réussis ;
* aucun blocage formateur n’existe.

Quand une formation est terminée :

* mettre enrollment à `COMPLETED` ;
* générer certificat si activé ;
* envoyer email ;
* créer notification.

---

# 14. Logique des relances automatiques

## 14.1 Objectif

Les relances doivent éviter que les apprenants dorment.

## 14.2 Types de relances

Le système doit gérer :

### Relance email non validé

Condition :

* compte créé ;
* email non validé ;
* délai supérieur à X heures/jours.

Action :

* renvoyer email de validation ou rappel.

### Relance compte validé sans demande

Condition :

* email validé ;
* aucune TrainingRequest ;
* délai supérieur à X jours.

Action :

* email invitant à choisir formation gratuite ou payante.

### Relance accès donné mais formation non commencée

Condition :

* enrollment actif ;
* aucune progression ;
* délai supérieur à X jours.

Action :

* email “Votre formation vous attend”.

### Relance formation commencée mais abandonnée

Condition :

* progression en cours ;
* dernière activité supérieure à X jours.

Action :

* email “Continuez votre formation”.

### Relance quiz échoué

Condition :

* dernier quiz échoué ;
* pas de réussite après X jours.

Action :

* email “Vous pouvez reprendre le quiz”.

### Relance presque terminé

Condition :

* progression supérieure à 80% ;
* formation non terminée ;
* inactivité depuis X jours.

Action :

* email “Vous êtes proche de la fin”.

### Relance certificat disponible

Condition :

* certificat généré ;
* non téléchargé ;
* délai supérieur à X jours.

Action :

* email “Votre certificat est disponible”.

---

## 14.3 Anti-spam

Le système doit vérifier avant chaque email :

* combien d’emails ont été envoyés à cet utilisateur cette semaine ;
* si le même type de relance a déjà été envoyé récemment ;
* si les relances sont activées pour cet utilisateur ;
* si les relances sont activées pour cette formation.

## 14.4 Historique

Chaque relance doit créer :

* un `EmailLog` ;
* une `Notification` interne si nécessaire ;
* un `AuditLog`.

---

# 15. Certificats

## 15.1 Génération automatique

Quand une formation est terminée :

* vérifier si certificat activé ;
* générer code unique ;
* générer PDF ;
* stocker PDF dans dossier privé ;
* créer entrée `Certificate` ;
* envoyer email ;
* créer notification.

## 15.2 Code certificat

Le code doit être unique.

Format possible :

```txt
CERT-2026-XXXXXX
```

## 15.3 Vérification publique

La page publique doit permettre de vérifier un certificat sans exposer trop de données.

Afficher :

* statut valide/invalide ;
* nom complet ;
* formation ;
* date.

Ne pas afficher :

* email ;
* téléphone ;
* données privées.

---

# 16. Calendrier d’appels

## 16.1 Création manuelle

Le formateur peut créer un appel depuis :

* fiche apprenant ;
* dashboard ;
* page progression ;
* demande formation.

## 16.2 Suggestions automatiques

Le système doit afficher des suggestions d’appel pour :

* apprenant inactif ;
* apprenant bloqué ;
* quiz échoué plusieurs fois ;
* demande payante ;
* formation presque terminée.

## 16.3 Notification

Quand un appel est planifié :

* notification interne formateur ;
* notification interne apprenant optionnelle ;
* email apprenant optionnel.

---

# 17. Annonces live externes

## 17.1 Création

Le formateur crée :

* titre ;
* description ;
* lien ;
* date ;
* heure ;
* cible.

## 17.2 Ciblage

Les cibles possibles :

* tous ;
* gratuits ;
* payants ;
* formation précise ;
* actifs ;
* inactifs ;
* terminés.

## 17.3 Envoi

À la publication :

* créer notifications ;
* envoyer emails ;
* afficher dans dashboard apprenant ;
* écrire logs.

---

# 18. Mini-communauté

## 18.1 Fonctionnement par défaut

Par défaut :

* le formateur peut publier ;
* les apprenants peuvent lire ;
* les commentaires sont désactivés sauf si activés.

## 18.2 Si commentaires activés

L’apprenant peut commenter.

Le formateur peut :

* masquer ;
* supprimer ;
* bloquer ;
* fermer commentaires.

## 18.3 Pas de chat temps réel

Le projet ne doit pas inclure de chat temps réel complexe.

---

# 19. Notifications internes

## 19.1 Création

Créer une notification quand :

* accès attribué ;
* accès retiré ;
* live annoncé ;
* certificat prêt ;
* appel planifié ;
* relance importante ;
* message formateur.

## 19.2 Lecture

L’utilisateur peut :

* voir ses notifications ;
* marquer comme lu ;
* marquer tout comme lu.

---

# 20. Import/export Excel

## 20.1 Import apprenants

Le développeur doit permettre l’import Excel.

Colonnes acceptées :

```txt
firstName
lastName
email
phone
courseSlug
status
internalNote
```

## 20.2 Règles import

* vérifier email ;
* vérifier doublons ;
* vérifier courseSlug ;
* créer l’utilisateur si absent ;
* attribuer la formation si courseSlug fourni ;
* générer mot de passe temporaire si nécessaire ;
* envoyer email si option cochée.

## 20.3 Export

Exports attendus :

* apprenants ;
* progressions ;
* quiz ;
* certificats ;
* appels ;
* demandes ;
* relances.

---

# 21. Emails obligatoires

## 21.1 Validation de compte

Sujet :

```txt
Validez votre compte
```

## 21.2 Mot de passe oublié

Sujet :

```txt
Réinitialisation de votre mot de passe
```

## 21.3 Accès formation attribué

Sujet :

```txt
Votre accès à la formation est activé
```

## 21.4 Accès retiré

Sujet :

```txt
Votre accès à une formation a été modifié
```

## 21.5 Formation non commencée

Sujet :

```txt
Votre formation vous attend
```

## 21.6 Formation abandonnée

Sujet :

```txt
Continuez votre formation
```

## 21.7 Quiz échoué

Sujet :

```txt
Vous pouvez reprendre votre quiz
```

## 21.8 Formation presque terminée

Sujet :

```txt
Vous êtes proche de la fin
```

## 21.9 Certificat disponible

Sujet :

```txt
Votre certificat est disponible
```

## 21.10 Annonce live

Sujet :

```txt
Nouvelle session live annoncée
```

## 21.11 Appel planifié

Sujet :

```txt
Un appel de suivi est planifié
```

---

# 22. Paramètres globaux

Le système doit permettre de configurer :

```txt
platform.name
platform.logo
platform.primaryColor
platform.supportEmail
smtp.host
smtp.port
smtp.user
smtp.password
smtp.from
whatsapp.trainerPhone
whatsapp.freeMessageTemplate
whatsapp.paidMessageTemplate
security.maxLoginAttempts
security.sessionDuration
tokens.emailVerificationExpiry
tokens.passwordResetExpiry
uploads.maxVideoSize
uploads.maxDocumentSize
uploads.allowedVideoTypes
uploads.allowedDocumentTypes
reminders.enabled
reminders.maxEmailsPerWeek
reminders.inactiveAfterDays
certificates.enabled
community.enabled
multiTrainer.enabled
```

---

# 23. Variables d’environnement

Le fichier `.env.example` doit contenir :

```env
DATABASE_URL=

APP_URL=
APP_NAME=

SESSION_SECRET=
COOKIE_NAME=
COOKIE_SECURE=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

WHATSAPP_TRAINER_PHONE=

UPLOAD_DIR=
MAX_VIDEO_SIZE=
MAX_DOCUMENT_SIZE=

EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS=
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=

CRON_SECRET=

NODE_ENV=
```

---

# 24. Sécurité obligatoire

## 24.1 Auth

* mot de passe hashé ;
* cookies HTTP-only ;
* secure cookies en production ;
* SameSite configuré ;
* expiration session ;
* logout détruit la session ;
* rate limit login ;
* rate limit register ;
* tokens hashés en base.

## 24.2 Autorisation

Ne jamais faire confiance au frontend.

Chaque action serveur doit vérifier :

* utilisateur connecté ;
* rôle ;
* statut ;
* permission ;
* ownership ;
* accès réel à la ressource.

## 24.3 Upload

* vérifier extension ;
* vérifier MIME ;
* limiter taille ;
* renommer fichier ;
* stocker hors public ;
* refuser fichiers exécutables ;
* générer chemin unique.

## 24.4 Vidéo

* pas de vidéo dans `/public` ;
* route protégée ;
* contrôle enrollment ;
* range requests ;
* watermark ;
* logs.

## 24.5 XSS et injections

* validation Zod ;
* échappement des contenus ;
* nettoyage HTML si éditeur riche ;
* Prisma pour SQL ;
* aucun raw query non maîtrisé.

## 24.6 Logs

Logger :

* login ;
* login failed ;
* register ;
* verify email ;
* reset password ;
* grant access ;
* revoke access ;
* video access ;
* forbidden access ;
* upload ;
* export ;
* certificate generation.

---

# 25. Expérience mobile

Toutes les pages doivent être testées sur mobile.

Exigences :

* menu simple ;
* boutons larges ;
* textes lisibles ;
* formulaires courts ;
* dashboard non surchargé ;
* vidéos responsive ;
* progression claire ;
* WhatsApp visible ;
* pas de tableaux inutilisables sur mobile ;
* filtres accessibles ;
* cartes au lieu de gros tableaux quand nécessaire.

---

# 26. Critères d’acceptation techniques

Le développeur ne peut pas considérer le projet terminé tant que :

* l’inscription fonctionne ;
* la validation email fonctionne ;
* les tokens expirent ;
* le login fonctionne ;
* les rôles sont respectés ;
* les dashboards sont séparés ;
* les formations sont CRUD ;
* les modules sont CRUD ;
* les leçons sont CRUD ;
* les vidéos uploadées sont privées ;
* les vidéos sont lisibles seulement avec accès ;
* la progression vidéo est enregistrée ;
* les quiz fonctionnent ;
* les certificats sont générés ;
* les demandes WhatsApp sont enregistrées ;
* les relances automatiques fonctionnent ;
* les annonces live fonctionnent ;
* le calendrier d’appels fonctionne ;
* les notifications fonctionnent ;
* l’import Excel fonctionne ;
* l’export Excel fonctionne ;
* les logs existent ;
* les paramètres sont configurables ;
* l’interface mobile est propre ;
* la documentation est livrée.

---

# 27. Tests obligatoires

## 27.1 Tests utilisateur apprenant

Scénario complet :

1. Créer un compte.
2. Recevoir email.
3. Valider email.
4. Choisir formation gratuite.
5. Cliquer WhatsApp.
6. Voir demande enregistrée.
7. Attendre attribution.
8. Recevoir email accès.
9. Ouvrir dashboard.
10. Suivre vidéo.
11. Faire quiz.
12. Terminer formation.
13. Télécharger certificat.

## 27.2 Tests formateur

1. Créer formation.
2. Créer chapitre.
3. Créer leçon vidéo.
4. Créer quiz.
5. Voir demande.
6. Attribuer formation.
7. Voir progression.
8. Planifier appel.
9. Envoyer annonce live.
10. Exporter progressions.

## 27.3 Tests sécurité

1. Accéder vidéo sans compte.
2. Accéder vidéo sans formation.
3. Accéder dashboard formateur comme élève.
4. Accéder admin comme formateur.
5. Utiliser token expiré.
6. Upload fichier dangereux.
7. Modifier URL d’une ressource.
8. Télécharger vidéo directement.
9. Faire trop de tentatives login.
10. Compte suspendu tente de se connecter.

---

# 28. Documentation attendue

Le développeur doit fournir :

## 28.1 README

Contenu :

* présentation ;
* installation ;
* configuration `.env` ;
* migration base ;
* seed admin ;
* lancement dev ;
* build production ;
* commandes utiles.

## 28.2 Documentation admin

Expliquer :

* créer formateur ;
* configurer SMTP ;
* configurer WhatsApp ;
* configurer relances ;
* voir logs ;
* gérer sécurité.

## 28.3 Documentation formateur

Expliquer :

* créer formation ;
* créer chapitre ;
* ajouter vidéo ;
* ajouter quiz ;
* attribuer formation ;
* suivre apprenant ;
* envoyer annonce ;
* programmer appel ;
* générer certificat ;
* exporter données.

## 28.4 Documentation déploiement

Expliquer :

* serveur recommandé ;
* variables d’environnement ;
* PostgreSQL ;
* dossier stockage ;
* sauvegarde ;
* HTTPS ;
* cron jobs ;
* configuration email.

---

# 29. Déploiement attendu

## 29.1 Serveur

Le projet peut être déployé sur :

* VPS ;
* serveur Node.js ;
* plateforme compatible Next.js.

## 29.2 Obligatoire en production

* HTTPS ;
* PostgreSQL ;
* variables d’environnement ;
* dossier privé pour uploads ;
* sauvegarde base ;
* sauvegarde fichiers ;
* logs ;
* monitoring minimum.

## 29.3 Cron jobs

Prévoir une protection par secret.

Exemple :

```txt
/api/jobs/reminders?secret=CRON_SECRET
```

La route doit refuser toute requête sans secret valide.

---

# 30. Sauvegardes

Le développeur doit prévoir une stratégie de sauvegarde :

* sauvegarde quotidienne PostgreSQL ;
* sauvegarde du dossier storage ;
* procédure de restauration ;
* documentation claire.

---

# 31. Performance

Le système doit :

* paginer les listes ;
* optimiser les requêtes Prisma ;
* éviter de charger toutes les vidéos ;
* utiliser des index ;
* compresser les images ;
* limiter les uploads ;
* éviter les pages trop lourdes ;
* être fluide sur mobile.

Index recommandés :

```txt
User.email
Course.slug
Enrollment.userId
Enrollment.courseId
LessonProgress.userId
LessonProgress.lessonId
QuizAttempt.userId
TrainingRequest.status
Notification.userId
AuditLog.actorId
AuditLog.createdAt
```

---

# 32. Ce qui ne doit pas être fait

Le développeur ne doit pas :

* mettre les vidéos dans `/public` ;
* stocker les mots de passe en clair ;
* faire confiance au frontend pour les permissions ;
* intégrer un paiement en ligne non demandé ;
* créer une usine à gaz inutile ;
* oublier le mobile ;
* oublier les emails ;
* oublier les relances ;
* oublier les logs ;
* oublier la documentation ;
* livrer sans tests ;
* supprimer définitivement les progressions ;
* exposer les données privées dans la page certificat publique.

---

# 33. Résultat final attendu

À la fin, le client doit avoir une plateforme complète où :

* un apprenant s’inscrit ;
* valide son email ;
* contacte le formateur via WhatsApp ;
* reçoit un accès ;
* suit une formation ;
* est relancé automatiquement ;
* passe des quiz ;
* obtient un certificat ;
* reçoit des annonces ;
* peut être suivi par appel.

Et où le formateur peut :

* créer ses formations ;
* gérer ses élèves ;
* suivre les progressions ;
* attribuer les accès ;
* envoyer des annonces ;
* planifier des appels ;
* générer des certificats ;
* exporter ses données ;
* garder le contrôle total.

Cette annexe fait partie intégrante du cahier des charges.
