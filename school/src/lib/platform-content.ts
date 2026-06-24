import {
  Activity,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LockKeyhole,
  MessageCircle,
  Radio,
  Settings,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section?: string;
};

export const siteConfig = {
  name: "School",
  tagline: "Formation privee",
  heroImage: "/hero-trading-desk.png",
  whatsappNumber: process.env.CONTACT_WHATSAPP_NUMBER ?? process.env.TRAINER_WHATSAPP_NUMBER ?? "22961835529",
  whatsappUrl: process.env.CONTACT_WHATSAPP_URL ?? "https://wa.me/22961835529",
  telegramUrl: process.env.TELEGRAM_URL ?? "https://t.me/Bonotrading",
};

export const publicMetrics = [
  { value: "Prive", label: "espace securise" },
  { value: "24/7", label: "suivi en ligne" },
  { value: "Quiz", label: "validation des acquis" },
  { value: "PDF", label: "certificat verifiable" },
];

export const publicCourseHighlights = [
  {
    id: "trading-fondations",
    title: "Fondations trading prive",
    type: "Gratuite",
    status: "PUBLIEE",
    level: "Debutant",
    progress: 68,
    lessons: 18,
    modules: 5,
    duration: "4 semaines",
    description:
      "Comprendre le marche, structurer une routine et eviter les erreurs qui coutent cher.",
  },
  {
    id: "discipline-risque",
    title: "Discipline et gestion du risque",
    type: "Payante",
    status: "PUBLIEE",
    level: "Intermediaire",
    progress: 34,
    lessons: 24,
    modules: 6,
    duration: "6 semaines",
    description:
      "Un parcours cadre pour travailler les plans, la taille de position et les bilans.",
  },
  {
    id: "coaching-live",
    title: "Coaching live et suivi",
    type: "Payante",
    status: "BROUILLON",
    level: "Avance",
    progress: 0,
    lessons: 12,
    modules: 3,
    duration: "8 semaines",
    description:
      "Sessions externes, appels programmes et feedback sur les executions.",
  },
];

export const studentNav: NavigationItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "Formations", icon: LibraryBig },
  { href: "/student/certificates", label: "Certificats", icon: BadgeCheck },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/live-announcements", label: "Lives", icon: Radio },
  { href: "/student/community", label: "Communaute", icon: MessageCircle },
  { href: "/student/profile", label: "Profil", icon: Settings },
];

export const trainerNav: NavigationItem[] = [
  { href: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainer/courses", label: "Formations", icon: BookOpen },
  { href: "/trainer/requests", label: "Demandes", icon: ShieldCheck },
  { href: "/trainer/students", label: "Apprenants", icon: UsersRound },
  { href: "/trainer/calendar", label: "Appels", icon: CalendarDays },
  { href: "/trainer/lives", label: "Lives", icon: Radio },
  { href: "/trainer/community", label: "Communaute", icon: MessageCircle },
  { href: "/trainer/import-export", label: "Excel", icon: FileSpreadsheet },
  { href: "/trainer/notifications", label: "Notifications", icon: Bell },
];

export const assistantTrainerNav: NavigationItem[] = [
  { href: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainer/community", label: "Communaute", icon: MessageCircle },
];

export const adminNav: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Administration" },
  { href: "/admin/users", label: "Utilisateurs", icon: UsersRound, section: "Administration" },
  { href: "/trainer/dashboard", label: "Vue operations", icon: LayoutDashboard, section: "Gestion des formations" },
  { href: "/trainer/courses", label: "Formations", icon: BookOpen, section: "Gestion des formations" },
  { href: "/trainer/requests", label: "Demandes", icon: ShieldCheck, section: "Gestion des formations" },
  { href: "/trainer/students", label: "Apprenants", icon: UsersRound, section: "Gestion des formations" },
  { href: "/trainer/calendar", label: "Appels", icon: CalendarDays, section: "Gestion des formations" },
  { href: "/trainer/lives", label: "Lives", icon: Radio, section: "Gestion des formations" },
  { href: "/trainer/community", label: "Communaute", icon: MessageCircle, section: "Gestion des formations" },
  { href: "/trainer/import-export", label: "Excel", icon: FileSpreadsheet, section: "Gestion des formations" },
  { href: "/trainer/notifications", label: "Notifications", icon: Bell, section: "Gestion des formations" },
  { href: "/admin/certificates", label: "Certificats", icon: BadgeCheck, section: "Plateforme" },
  { href: "/admin/settings", label: "Parametres", icon: Settings, section: "Plateforme" },
  { href: "/admin/logs", label: "Audit", icon: Activity, section: "Plateforme" },
];

export const roleCards = [
  { title: "Apprenant", href: "/student/dashboard", icon: GraduationCap, text: "Cours, quiz, progression et certificats." },
  { title: "Formateur", href: "/trainer/dashboard", icon: BookOpen, text: "Demandes, contenus, relances et appels." },
  { title: "Admin", href: "/admin/dashboard", icon: LockKeyhole, text: "Utilisateurs, securite, parametres et logs." },
];
