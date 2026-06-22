export type SiteLocale = "fr" | "en";

export function localeFromPathname(pathname: string | null | undefined): SiteLocale {
  return pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "fr";
}

export function localizePath(pathname: string, locale: SiteLocale) {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const basePath = pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return locale === "en" ? (basePath === "/" ? "/en" : `/en${basePath}`) : basePath;
}

export const uiCopy = {
  fr: {
    blog: "Blog",
    search: "Recherche",
    formations: "Services",
    testimonials: "Témoignages",
    about: "À propos",
    contact: "Contact",
    join: "Rejoindre",
    traderTrainer: "Trader formateur",
    navigation: "Navigation",
    categories: "Catégories",
    legal: "Légal",
    privacy: "Confidentialité",
    terms: "Conditions",
    newsletter: "Newsletter",
    disclaimer: "Disclaimer trading",
    footerDescription: "Blog, formation et accompagnement pour apprendre à trader avec un cadre clair, une gestion du risque stricte et une lecture sobre du marché.",
    footerRisk: "Le trading comporte un risque de perte. Les contenus publiés sont éducatifs et ne constituent pas un conseil financier personnalisé.",
    allRights: "Tous droits réservés.",
    languageLabel: "Passer le site en anglais",
    languageShort: "EN"
  },
  en: {
    blog: "Blog",
    search: "Search",
    formations: "Services",
    testimonials: "Testimonials",
    about: "About",
    contact: "Contact",
    join: "Join",
    traderTrainer: "Trader & educator",
    navigation: "Navigation",
    categories: "Categories",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    newsletter: "Newsletter",
    disclaimer: "Trading disclaimer",
    footerDescription: "Articles, training and guidance for learning to trade with a clear framework, strict risk management and a measured view of markets.",
    footerRisk: "Trading involves a real risk of loss. All content is educational and is not personalised financial advice.",
    allRights: "All rights reserved.",
    languageLabel: "Switch site to French",
    languageShort: "FR"
  }
} as const;

export const englishCategoryLabels: Record<string, string> = {
  debuter: "Getting started",
  "risk-management": "Risk management",
  "indices-synthetiques": "Synthetic indices",
  psychologie: "Trading psychology",
  "analyse-technique": "Technical analysis",
  "journal-trading": "Trading journal",
  forex: "Forex and markets",
  "outils-trading": "Tools and methods"
};
