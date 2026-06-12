import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Bono Trading",
  title: "Bono Trading - Blog trading, formation et discipline de marche",
  description:
    "Un blog professionnel pour apprendre le trading avec methode, prudence et clarte. Articles, formations, temoignages et contact.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  telegramUrl: "https://t.me/Bonotrading",
  whatsappUrl: "https://wa.me/22961835529",
  telegramPath: "/go/telegram",
  whatsappPath: "/go/whatsapp",
  email: process.env.CONTACT_TO_EMAIL ?? "contact@example.com",
  heroImage: "/hero-trading-desk.png"
};

export type Category = {
  title: string;
  slug: string;
  description: string;
};

export type Tag = {
  title: string;
  slug: string;
};

export type Article = {
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  tags: Tag[];
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  image: string;
  author: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const categories: Category[] = [
  {
    title: "Debuter",
    slug: "debuter",
    description: "Les bases pour comprendre le marche sans se perdre dans le bruit."
  },
  {
    title: "Risk management",
    slug: "risk-management",
    description: "Les reflexes qui protegent le capital avant de chercher la performance."
  },
  {
    title: "Indices synthetiques",
    slug: "indices-synthetiques",
    description: "Lecture, volatilite et routines specifiques aux indices synthetiques."
  },
  {
    title: "Psychologie",
    slug: "psychologie",
    description: "Discipline, patience et gestion de soi dans les decisions de marche."
  }
];

export const tags: Tag[] = [
  { title: "Volatilite", slug: "volatilite" },
  { title: "Plan de trading", slug: "plan-de-trading" },
  { title: "Capital", slug: "capital" },
  { title: "Routine", slug: "routine" },
  { title: "Formation", slug: "formation" }
];

const heroImage = siteConfig.heroImage;

export const articles: Article[] = [
  {
    title: "Comment structurer une journee de trading sans courir apres le marche",
    slug: "structurer-journee-trading",
    excerpt:
      "Une routine simple pour analyser, attendre, executer et sortir sans transformer chaque mouvement en urgence.",
    category: categories[0],
    tags: [tags[1], tags[3], tags[4]],
    publishedAt: "2026-05-18",
    readTime: "7 min",
    featured: true,
    image: heroImage,
    author: "Bono Trading",
    sections: [
      {
        heading: "Commencer par le contexte",
        body:
          "Avant de chercher une entree, le trader doit savoir dans quel type de session il se trouve. Marche nerveux, range lent, impulsion claire ou simple bruit : le contexte evite beaucoup de trades inutiles."
      },
      {
        heading: "Limiter le nombre de decisions",
        body:
          "Une bonne journee ne se mesure pas au nombre d'ordres passes. Elle se mesure a la qualite des decisions prises et a la capacite de rester hors du marche lorsque les conditions ne sont pas reunies."
      },
      {
        heading: "Journaliser sans se mentir",
        body:
          "Le journal de trading ne sert pas a decorer une strategie. Il sert a identifier les erreurs repetitives, les horaires faibles et les setups qui meritent vraiment d'etre conserves."
      }
    ]
  },
  {
    title: "Risk management : la regle qui change la lecture d'une perte",
    slug: "risk-management-lecture-perte",
    excerpt:
      "Comprendre pourquoi une perte controlee peut etre une bonne decision, et pourquoi un gain improvise peut cacher un mauvais processus.",
    category: categories[1],
    tags: [tags[2], tags[1]],
    publishedAt: "2026-05-08",
    readTime: "6 min",
    image: heroImage,
    author: "Bono Trading",
    sections: [
      {
        heading: "Une perte n'est pas toujours une erreur",
        body:
          "Si le scenario etait clair, le risque connu et la sortie respectee, la perte fait partie du metier. Le danger commence lorsque le trader change la taille ou le plan pour effacer l'inconfort."
      },
      {
        heading: "Le capital est l'outil de travail",
        body:
          "Sans capital, il n'y a plus d'apprentissage en conditions reelles. Le premier objectif d'un plan serieux est donc de rester dans le jeu assez longtemps pour progresser."
      }
    ]
  },
  {
    title: "Indices synthetiques : lire la volatilite avant de chercher un signal",
    slug: "indices-synthetiques-lire-volatilite",
    excerpt:
      "Les indices synthetiques peuvent bouger vite. Cette vitesse impose une lecture stricte des zones, du timing et du risque.",
    category: categories[2],
    tags: [tags[0], tags[3]],
    publishedAt: "2026-04-27",
    readTime: "8 min",
    image: heroImage,
    author: "Bono Trading",
    sections: [
      {
        heading: "La volatilite n'est pas un raccourci",
        body:
          "Un marche rapide amplifie les erreurs autant que les bonnes decisions. La discipline consiste a attendre les zones prevues, meme lorsque le mouvement donne l'impression de partir sans vous."
      },
      {
        heading: "Adapter l'execution",
        body:
          "La taille, le stop, le timing et la prise de profit doivent etre adaptes au produit traite. Copier une methode sans ajustement expose a des resultats instables."
      }
    ]
  },
  {
    title: "Pourquoi la psychologie pese plus lourd quand la strategie semble simple",
    slug: "psychologie-strategie-simple",
    excerpt:
      "Plus une methode parait simple, plus l'execution revele les faiblesses de patience, d'ego et de gestion emotionnelle.",
    category: categories[3],
    tags: [tags[3], tags[1]],
    publishedAt: "2026-04-12",
    readTime: "5 min",
    image: heroImage,
    author: "Bono Trading",
    sections: [
      {
        heading: "La simplicite ne supprime pas l'effort",
        body:
          "Un plan simple oblige a assumer l'attente. C'est souvent la partie la plus difficile, car le trader veut transformer l'analyse en action immediatement."
      },
      {
        heading: "Construire une repetition fiable",
        body:
          "La psychologie se travaille avec des regles, des limites et un environnement qui reduit les decisions impulsives. Le but est de rendre la bonne action plus facile a repeter."
      }
    ]
  }
];

export const services = [
  {
    title: "Coaching de demarrage",
    description:
      "Clarifier les bases, eviter les erreurs couteuses et mettre en place une routine de travail mesurable.",
    accent: "market"
  },
  {
    title: "Formation indices synthetiques",
    description:
      "Comprendre les mouvements rapides, filtrer les conditions et construire des setups coherents.",
    accent: "cyan"
  },
  {
    title: "Accompagnement discipline",
    description:
      "Ameliorer le journal, le risk management et la prise de decision sous pression.",
    accent: "amber"
  }
];

export const testimonials = [
  {
    name: "M. A.",
    role: "Apprenant debutant",
    quote:
      "J'ai surtout compris comment arreter de prendre des trades par impatience. La methode m'a donne un cadre simple."
  },
  {
    name: "Sarah K.",
    role: "Trader particulier",
    quote:
      "Les explications sont directes. On parle de risque, de routine et de discipline, pas seulement de signaux."
  },
  {
    name: "Daniel T.",
    role: "Membre communaute",
    quote:
      "Le contenu m'aide a relire mes erreurs sans me chercher d'excuses. C'est sobre et utile."
  }
];

export const marketPairs = [
  { name: "Volatility 75", value: "12 750.42", change: "+2.45%" },
  { name: "Boom 1000", value: "11 204.10", change: "+1.18%" },
  { name: "Crash 500", value: "8 450.80", change: "-0.62%" },
  { name: "V25 1s", value: "320.45", change: "+0.31%" },
  { name: "Risk desk", value: "1.00%", change: "max/trade" }
];

export function getFeaturedArticle() {
  return articles.find((article) => article.featured) ?? articles[0];
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getTagBySlug(slug: string) {
  return tags.find((tag) => tag.slug === slug);
}

export function getArticlesByCategory(slug: string) {
  return articles.filter((article) => article.category.slug === slug);
}

export function getArticlesByTag(slug: string) {
  return articles.filter((article) => article.tags.some((tag) => tag.slug === slug));
}

export function searchArticles(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return articles;
  }

  return articles.filter((article) =>
    [
      article.title,
      article.excerpt,
      article.category.title,
      ...article.tags.map((tag) => tag.title)
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: absoluteUrl(article.image),
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name
    }
  };
}
