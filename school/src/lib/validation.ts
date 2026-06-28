import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().min(2, "Prénom trop court").trim(),
    lastName: z.string().min(2, "Nom trop court").trim(),
    email: z.string().email("Email invalide").trim().toLowerCase(),
    phone: z.string().min(8, "Téléphone WhatsApp invalide").trim(),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Za-z]/, "Au moins une lettre")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(8, "Confirmation requise"),
    acceptedTerms: z.literal("on", { error: "Conditions requises" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide").trim().toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
  next: z.string().optional(),
  rememberMe: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Token invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Za-z]/, "Au moins une lettre")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(8, "Confirmation requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").trim(),
  lastName: z.string().min(2, "Nom trop court").trim(),
  phone: z.string().min(8, "WhatsApp requis").trim(),
});

export const trainerAccountSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").trim(),
  lastName: z.string().min(2, "Nom trop court").trim(),
  email: z.string().email("Email invalide").trim().toLowerCase(),
  phone: z.string().min(8, "WhatsApp requis").trim(),
  role: z.enum(["MAIN_TRAINER", "ASSISTANT_TRAINER"]),
});

const httpsUrlSchema = z
  .string()
  .url("Lien invalide")
  .trim()
  .refine((value) => new URL(value).protocol === "https:", "Utilise un lien HTTPS.");

export const liveAnnouncementSchema = z.object({
  title: z.string().min(4, "Titre trop court").trim(),
  body: z.string().min(10, "Description trop courte").trim(),
  externalUrl: httpsUrlSchema,
  scheduledAt: z.coerce.date(),
  courseId: z.string().optional(),
});

export const courseUpdateSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(4, "Titre trop court").trim(),
  type: z.enum(["FREE", "PAID"]),
  priceAmount: z.coerce.number().nonnegative("Prix invalide").optional(),
  priceCurrency: z.enum(["XOF", "EUR"]).optional(),
  durationValue: z.coerce.number().int().min(1).max(999).optional(),
  durationUnit: z.enum(["HOURS", "DAYS", "WEEKS", "MONTHS"]).optional(),
  description: z.string().min(20, "Description trop courte").trim(),
});

export const courseStatusSchema = z.object({
  courseId: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const moduleCreateSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(3, "Titre de module requis").trim(),
  description: z.string().trim().optional(),
});
export const moduleUpdateSchema = moduleCreateSchema.extend({ moduleId: z.string().min(1) }).omit({ courseId: true });
export const moduleDeleteSchema = z.object({ moduleId: z.string().min(1) });

export const lessonCreateSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(3, "Titre de leçon requis").trim(),
  type: z.enum(["VIDEO", "TEXT", "DOCUMENT", "QUIZ"]),
  content: z.string().trim().optional(),
  videoPath: z.string().trim().optional(),
  documentPath: z.string().trim().optional(),
  durationSeconds: z.coerce.number().int().min(1).max(24 * 60 * 60).optional(),
});
export const lessonUpdateSchema = z.object({ lessonId: z.string().min(1), title: z.string().min(3).trim(), content: z.string().trim().optional() });
export const lessonDeleteSchema = z.object({ lessonId: z.string().min(1) });

export const quizCreateSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(3, "Titre requis").trim(),
  minimumScore: z.coerce.number().min(0).max(100),
  maxAttempts: z.coerce.number().min(1).max(10),
  blocking: z.coerce.boolean().optional(),
  questionText: z.string().min(3, "Question requise").trim(),
  optionA: z.string().min(1, "Option A requise").trim(),
  optionB: z.string().min(1, "Option B requise").trim(),
  optionC: z.string().trim().optional(),
  correctOption: z.enum(["A", "B", "C"]),
});

export const quizQuestionCreateSchema = z.object({
  quizId: z.string().min(1),
  questionText: z.string().min(3, "Question requise").trim(),
  optionA: z.string().min(1, "Option A requise").trim(),
  optionB: z.string().min(1, "Option B requise").trim(),
  optionC: z.string().trim().optional(),
  correctOption: z.enum(["A", "B", "C"]),
});

export const quizQuestionDeleteSchema = z.object({
  questionId: z.string().min(1),
});

export const enrollmentStatusSchema = z.object({
  enrollmentId: z.string().min(1),
  status: z.enum(["ACTIVE", "REVOKED", "COMPLETED"]),
});

export const communityPostSchema = z.object({
  title: z.string().min(4, "Titre trop court").trim(),
  body: z.string().min(10, "Message trop court").trim(),
  courseId: z.string().optional(),
  pinned: z.coerce.boolean().optional(),
  commentsEnabled: z.coerce.boolean().optional(),
});
export const communityPostUpdateSchema = communityPostSchema.extend({ postId: z.string().min(1) });
export const communityPostDeleteSchema = z.object({ postId: z.string().min(1) });

export const communityCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(2, "Commentaire trop court").max(1000).trim(),
});

export const communityPostStatusSchema = z.object({
  postId: z.string().min(1),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export const communityCommentDeleteSchema = z.object({
  commentId: z.string().min(1),
});

export const callScheduleSchema = z.object({
  learnerId: z.string().min(1),
  title: z.string().min(3, "Titre requis").trim(),
  notes: z.string().trim().optional(),
  scheduledAt: z.coerce.date(),
});

export const callBatchScheduleSchema = callScheduleSchema.omit({ learnerId: true }).extend({
  learnerIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un apprenant"),
});

export const callUpdateSchema = callScheduleSchema.extend({
  callId: z.string().min(1),
});

export const callDeleteSchema = z.object({
  callId: z.string().min(1),
});

export const callStatusSchema = z.object({
  callId: z.string().min(1),
  status: z.enum(["SCHEDULED", "DONE", "MISSED", "CANCELLED"]),
});

export const liveAnnouncementUpdateSchema = liveAnnouncementSchema.extend({
  liveId: z.string().min(1),
});

export const liveAnnouncementDeleteSchema = z.object({
  liveId: z.string().min(1),
});

export const learnerAssignmentSchema = z.object({
  courseId: z.string().min(1),
  learnerId: z.string().min(1),
});

export const accessChoiceSchema = z.object({
  kind: z.enum(["free", "paid"]),
  courseId: z.string().min(1).optional(),
});

export const courseSchema = z.object({
  title: z.string().min(4, "Titre trop court").trim(),
  type: z.enum(["FREE", "PAID"]),
  priceAmount: z.coerce.number().nonnegative("Prix invalide").optional(),
  priceCurrency: z.enum(["XOF", "EUR"]).optional(),
  durationValue: z.coerce.number().int().min(1).max(999).optional(),
  durationUnit: z.enum(["HOURS", "DAYS", "WEEKS", "MONTHS"]).optional(),
  description: z.string().min(20, "Description trop courte").trim(),
});

export const notificationSchema = z.object({
  target: z.string().min(2, "Cible requise").trim(),
  channel: z.enum(["INTERNAL", "EMAIL", "BOTH"]),
  message: z.string().min(10, "Message trop court").trim(),
});

export const settingsSchema = z.object({
  platformName: z.string().min(2).max(80).trim(),
  platformLogoUrl: z.string().url("URL logo invalide").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale attendue"),
  smtpHost: z.string().trim().optional(),
  smtpFrom: z.string().email("Email expéditeur invalide").optional().or(z.literal("")),
  whatsappNumber: z.string().min(8, "Numéro WhatsApp invalide").trim(),
  legalPublisherName: z.string().min(2).max(160).trim(),
  legalContactEmail: z.string().email("Email légal invalide").optional().or(z.literal("")),
  legalAddress: z.string().min(2).max(240).trim(),
  legalRegistrationNumber: z.string().max(120).trim().optional(),
  hostingProvider: z.string().max(240).trim().optional(),
  emailTokenTtlHours: z.coerce.number().min(1).max(168),
  resetPasswordTokenTtlHours: z.coerce.number().min(1).max(24),
  remindersEnabled: z.enum(["true", "false"]),
  reminderCooldownDays: z.coerce.number().min(1).max(90),
  reminderMaxEmailsPerWeek: z.coerce.number().min(1).max(20),
  certificatePrefix: z.string().min(2).max(12).regex(/^[A-Z0-9_-]+$/i, "Préfixe invalide").trim(),
  maxPrivateUploadMb: z.coerce.number().min(1).max(2048),
  securityMaxLoginAttempts: z.coerce.number().min(1).max(20),
  securityLoginWindowMinutes: z.coerce.number().min(1).max(120),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TrainerAccountInput = z.infer<typeof trainerAccountSchema>;
export type LiveAnnouncementInput = z.infer<typeof liveAnnouncementSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type CourseStatusInput = z.infer<typeof courseStatusSchema>;
export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type QuizCreateInput = z.infer<typeof quizCreateSchema>;
export type QuizQuestionCreateInput = z.infer<typeof quizQuestionCreateSchema>;
export type EnrollmentStatusInput = z.infer<typeof enrollmentStatusSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommunityPostUpdateInput = z.infer<typeof communityPostUpdateSchema>;
export type CommunityCommentInput = z.infer<typeof communityCommentSchema>;
export type CommunityPostStatusInput = z.infer<typeof communityPostStatusSchema>;
export type CommunityCommentDeleteInput = z.infer<typeof communityCommentDeleteSchema>;
export type CallScheduleInput = z.infer<typeof callScheduleSchema>;
export type CallUpdateInput = z.infer<typeof callUpdateSchema>;
export type CallDeleteInput = z.infer<typeof callDeleteSchema>;
export type CallStatusInput = z.infer<typeof callStatusSchema>;
export type LiveAnnouncementUpdateInput = z.infer<typeof liveAnnouncementUpdateSchema>;
export type LiveAnnouncementDeleteInput = z.infer<typeof liveAnnouncementDeleteSchema>;
export type LearnerAssignmentInput = z.infer<typeof learnerAssignmentSchema>;
export type AccessChoiceInput = z.infer<typeof accessChoiceSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
