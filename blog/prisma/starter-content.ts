import type { BlogData, StoredArticle } from "@/lib/data-store";

type StarterAdmin = {
  email: string;
  passwordHash: string;
};

const author = "Bono Trading";

const categories = [
  ["category_debuter", "Débuter en trading", "debuter", "Des repères simples pour construire des bases solides avant de risquer son capital."],
  ["category_risk-management", "Gestion du risque", "risk-management", "Des règles concrètes pour protéger le capital, dimensionner une position et durer."],
  ["category_indices-synthetiques", "Indices synthétiques", "indices-synthetiques", "Lire la volatilité, préparer ses niveaux et adapter son exécution aux indices synthétiques."],
  ["category_psychologie", "Psychologie du trading", "psychologie", "Patience, discipline et lucidité : ce qui change la qualité des décisions."],
  ["category_analyse-technique", "Analyse technique", "analyse-technique", "Structure de marché, niveaux et scénarios, sans chercher une méthode magique."],
  ["category_journal-trading", "Journal de trading", "journal-trading", "Transformer ses décisions en données utiles pour progresser semaine après semaine."],
  ["category_forex", "Forex et marchés", "forex", "Repères pédagogiques pour comprendre les devises, les sessions et le contexte macroéconomique."],
  ["category_outils", "Outils et méthodes", "outils-trading", "Check-lists, routines et outils pratiques pour mieux préparer une séance de trading."]
] as const;

const tags = [
  ["tag_plan-trading", "Plan de trading", "plan-de-trading"],
  ["tag_risk-reward", "Risk/reward", "risk-reward"],
  ["tag_stop-loss", "Stop loss", "stop-loss"],
  ["tag_capital", "Capital", "capital"],
  ["tag_routine", "Routine", "routine"],
  ["tag_journal", "Journal", "journal"],
  ["tag_volatilite", "Volatilité", "volatilite"],
  ["tag_indice-synthetique", "Indice synthétique", "indice-synthetique"],
  ["tag_psychologie", "Psychologie", "psychologie"],
  ["tag_discipline", "Discipline", "discipline"],
  ["tag_price-action", "Price action", "price-action"],
  ["tag_support-resistance", "Supports et résistances", "supports-resistances"],
  ["tag_backtesting", "Backtesting", "backtesting"],
  ["tag_position-sizing", "Taille de position", "taille-position"],
  ["tag_session-londres", "Session de Londres", "session-londres"],
  ["tag_session-new-york", "Session de New York", "session-new-york"],
  ["tag_broker", "Broker", "broker"],
  ["tag_formation", "Formation trading", "formation-trading"],
  ["tag_check-list", "Check-list", "check-list"],
  ["tag_prop-firm", "Prop firm", "prop-firm"]
] as const;

function rich(sections: Array<[string, string]>) {
  return sections.map(([heading, body]) => `<h2>${heading}</h2><p>${body}</p>`).join("");
}

function article({
  id,
  title,
  slug,
  excerpt,
  categorySlug,
  tagSlugs,
  image,
  readTime,
  featured = false,
  publishedAt,
  sections
}: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  tagSlugs: string[];
  image: string;
  readTime: string;
  featured?: boolean;
  publishedAt: string;
  sections: Array<[string, string]>;
}): StoredArticle {
  const category = categories.find((entry) => entry[2] === categorySlug);
  if (!category) throw new Error(`Unknown starter category: ${categorySlug}`);
  const content = rich(sections);

  return {
    id,
    title,
    slug,
    excerpt,
    content,
    status: "PUBLISHED",
    author,
    publishedAt,
    image,
    seoTitle: title,
    seoDescription: excerpt,
    robotsIndex: true,
    robotsFollow: true,
    category: { title: category[1], slug: category[2], description: category[3] },
    tags: tagSlugs.map((tagSlug) => {
      const tag = tags.find((entry) => entry[2] === tagSlug);
      if (!tag) throw new Error(`Unknown starter tag: ${tagSlug}`);
      return { title: tag[1], slug: tag[2] };
    }),
    sections: sections.map(([heading, body]) => ({ heading, body })),
    featured,
    readTime
  };
}

export function buildStarterContent(admin: StarterAdmin): BlogData {
  const starterPosts: StoredArticle[] = [
    article({
      id: "post_plan-trading-avant-position",
      title: "Construire un plan de trading avant de prendre position",
      slug: "construire-plan-trading",
      excerpt: "Un plan clair transforme une idée de marché en décision contrôlée : contexte, entrée, invalidation et risque.",
      categorySlug: "debuter",
      tagSlugs: ["plan-de-trading", "check-list", "capital"],
      image: "/trading-plan-discipline.png",
      readTime: "6 min",
      featured: true,
      publishedAt: "2026-05-30",
      sections: [
        ["Partir d’un scénario, pas d’une envie", "Avant de chercher un point d’entrée, décris ce que le marché doit montrer. Une zone, une structure et une condition d’invalidation donnent une raison mesurable d’agir — ou de ne rien faire."],
        ["Fixer la perte acceptable avant l’ordre", "Le stop loss et la taille de position ne sont pas des réglages de dernière minute. Ils définissent le montant que tu acceptes de perdre si le scénario est invalidé. Cette limite protège autant le capital que la qualité du jugement."],
        ["Relire la séance avec honnêteté", "Après la séance, note le contexte, la décision et le respect du plan. Une perte peut être saine si le processus a été respecté ; un gain peut cacher une mauvaise habitude. Le journal sert à faire cette différence."]
      ]
    }),
    article({
      id: "post_routine-trading-quotidienne",
      title: "La routine de trading qui évite de courir après le marché",
      slug: "routine-trading-quotidienne",
      excerpt: "Une routine de préparation, d’exécution et de revue pour réduire les décisions impulsives pendant la séance.",
      categorySlug: "outils-trading",
      tagSlugs: ["routine", "check-list", "discipline"],
      image: "/hero-trading-desk.png",
      readTime: "7 min",
      publishedAt: "2026-05-22",
      sections: [
        ["Préparer trois informations utiles", "Avant l’ouverture, identifie le biais du marché, les niveaux importants et les événements susceptibles d’augmenter la volatilité. Une préparation courte vaut mieux qu’une accumulation d’indicateurs contradictoires."],
        ["Définir des fenêtres d’exécution", "Choisis les horaires où ta méthode est réellement testée. En dehors de ces fenêtres, tu observes ou tu fermes la plateforme. Cette règle simple réduit les trades pris par ennui."],
        ["Terminer par une revue de cinq minutes", "Conserve une capture, le motif d’entrée et une phrase sur ton état mental. Ce rituel rend les erreurs visibles avant qu’elles deviennent un coût récurrent."]
      ]
    }),
    article({
      id: "post_risk-management-perte",
      title: "Gestion du risque : pourquoi une perte contrôlée peut être une bonne décision",
      slug: "risk-management-perte-controlee",
      excerpt: "La perte fait partie du trading. Le problème n’est pas de perdre, mais de perdre sans limite ni processus.",
      categorySlug: "risk-management",
      tagSlugs: ["risk-reward", "stop-loss", "taille-position", "capital"],
      image: "/trading-plan-discipline.png",
      readTime: "8 min",
      publishedAt: "2026-05-14",
      sections: [
        ["Le capital est l’outil de travail", "Un capital préservé laisse du temps pour apprendre. Le premier objectif d’un trader en progression n’est pas d’impressionner par un gain isolé : c’est de rester suffisamment longtemps dans le jeu pour améliorer son exécution."],
        ["La taille de position vient après le stop", "Commence par le niveau où ton scénario n’est plus valide. Calcule ensuite la taille qui respecte le risque choisi. Inverser cet ordre conduit souvent à déplacer un stop pour justifier une taille trop grande."],
        ["Penser en série de décisions", "Aucune position ne décide d’une carrière. Un risque constant et un ratio cohérent permettent d’évaluer une méthode sur une série de trades, au lieu de réagir émotionnellement à une seule perte."]
      ]
    }),
    article({
      id: "post_indices-synthetiques-volatilite",
      title: "Indices synthétiques : lire la volatilité avant de chercher un signal",
      slug: "indices-synthetiques-lire-volatilite",
      excerpt: "Sur un marché rapide, le timing, le niveau d’invalidation et la taille de position comptent plus que la précipitation.",
      categorySlug: "indices-synthetiques",
      tagSlugs: ["indice-synthetique", "volatilite", "stop-loss"],
      image: "/trading-analysis-focus.png",
      readTime: "8 min",
      publishedAt: "2026-05-05",
      sections: [
        ["La vitesse ne remplace pas le contexte", "Les indices synthétiques peuvent donner l’impression qu’une opportunité disparaît en quelques secondes. Cette sensation pousse à entrer hors plan. Reviens toujours à une zone et à une condition de confirmation prévues."],
        ["Adapter le risque à l’amplitude", "Un produit qui bouge davantage demande une taille de position plus petite ou un stop plus large, jamais un risque global plus élevé. Le pourcentage risqué reste la référence, pas le nombre de points."],
        ["Éviter le sur-trading après un mouvement", "Après une impulsion forte, attendre une structure ou une consolidation est souvent plus utile que tenter de rattraper le prix. Rater un trade est moins coûteux que poursuivre un marché déjà étendu."]
      ]
    }),
    article({
      id: "post_psychologie-attente",
      title: "La psychologie du trading commence par la capacité à attendre",
      slug: "psychologie-trading-capacite-attendre",
      excerpt: "La discipline ne consiste pas à ne rien ressentir : elle consiste à laisser les règles guider l’action malgré l’émotion.",
      categorySlug: "psychologie",
      tagSlugs: ["psychologie", "discipline", "routine"],
      image: "/trading-analysis-focus.png",
      readTime: "6 min",
      publishedAt: "2026-04-26",
      sections: [
        ["L’impatience ressemble souvent à une analyse", "Quand le marché bouge, le cerveau cherche une justification immédiate pour participer. Une check-list oblige à séparer ce que tu observes de ce que tu espères."],
        ["Réduire les décisions pendant la séance", "Prépare en avance les niveaux, le risque et le nombre maximum de tentatives. Moins tu dois improviser, plus il devient facile de respecter une méthode quand la pression augmente."],
        ["Traiter les écarts comme des données", "Si tu as ignoré une règle, ne te contente pas de promettre de faire mieux. Note ce qui a déclenché l’écart : fatigue, frustration, envie de se refaire ou simple absence de plan. La correction devient alors concrète."]
      ]
    }),
    article({
      id: "post_support-resistance",
      title: "Supports et résistances : les utiliser sans les transformer en certitudes",
      slug: "supports-resistances-sans-certitudes",
      excerpt: "Les niveaux servent à préparer un scénario. Ils ne promettent ni rebond ni cassure automatique.",
      categorySlug: "analyse-technique",
      tagSlugs: ["supports-resistances", "price-action", "plan-de-trading"],
      image: "/hero-trading-desk.png",
      readTime: "7 min",
      publishedAt: "2026-04-18",
      sections: [
        ["Un niveau est une zone de décision", "Trace les niveaux où le prix a déjà provoqué une réaction visible, puis demande-toi ce que tu attendras si le prix y revient. Le niveau n’est pas un ordre d’achat ou de vente ; c’est une zone à observer."],
        ["Chercher une confirmation lisible", "Une clôture, un rejet ou un changement de structure peuvent donner un contexte. Entrer uniquement parce que le prix touche une ligne revient à ignorer la façon dont le marché y arrive."],
        ["Prévoir l’invalidation", "Si la réaction attendue n’apparaît pas, la position ne doit pas être défendue par l’espoir. Définis à l’avance ce qui invalide ton idée et ce que tu feras dans ce cas."]
      ]
    }),
    article({
      id: "post_journal-trading",
      title: "Un journal de trading utile tient sur une page par séance",
      slug: "journal-trading-utile",
      excerpt: "Les bonnes données ne sont pas nombreuses : elles doivent surtout être cohérentes et faciles à relire.",
      categorySlug: "journal-trading",
      tagSlugs: ["journal", "backtesting", "discipline"],
      image: "/trading-plan-discipline.png",
      readTime: "5 min",
      publishedAt: "2026-04-09",
      sections: [
        ["Noter le contexte avant le résultat", "Pour chaque position, conserve le setup, le niveau d’entrée, le risque et une capture. Le résultat financier vient ensuite : il ne doit pas écraser la qualité de la décision."],
        ["Utiliser des catégories d’erreurs", "Crée quelques catégories stables : entrée anticipée, risque dépassé, sortie hors plan, trade hors horaire. Après plusieurs semaines, les répétitions deviennent plus visibles qu’avec un journal uniquement narratif."],
        ["Faire une revue hebdomadaire", "Une fois par semaine, choisis un comportement à conserver et un seul point à corriger. Cette cadence évite de changer toute la méthode après une mauvaise journée."]
      ]
    }),
    article({
      id: "post_sessions-forex",
      title: "Comprendre les sessions Forex avant de choisir ses horaires de trading",
      slug: "sessions-forex-horaires-trading",
      excerpt: "Le comportement d’une paire peut changer selon les sessions. Connaître ses horaires aide à mieux filtrer les conditions.",
      categorySlug: "forex",
      tagSlugs: ["session-londres", "session-new-york", "volatilite"],
      image: "/trading-analysis-focus.png",
      readTime: "7 min",
      publishedAt: "2026-03-29",
      sections: [
        ["Chaque session a son rythme", "Les périodes de Londres et de New York concentrent souvent davantage de liquidité sur les principales devises. Cela ne crée pas automatiquement un signal, mais cela aide à anticiper les moments où le marché peut accélérer."],
        ["Choisir un créneau réaliste", "Il vaut mieux travailler un créneau court, répété et compatible avec ton emploi du temps que surveiller le marché toute la journée. Une méthode stable a besoin de conditions stables."],
        ["Surveiller les annonces sans deviner", "Les publications économiques peuvent augmenter la volatilité et les écarts. Si tu ne maîtrises pas une stratégie dédiée aux annonces, la décision la plus professionnelle peut être de rester à l’écart."]
      ]
    })
  ];

  return {
    posts: starterPosts,
    categories: categories.map(([id, title, slug, description]) => ({ id, title, slug, description, seoTitle: title, seoDescription: description })),
    tags: tags.map(([id, title, slug]) => ({ id, title, slug, description: `Articles pédagogiques sur ${title.toLowerCase()}.`, seoTitle: title, seoDescription: `Guides et méthodes autour de ${title.toLowerCase()}.` })),
    pages: [
      {
        id: "page_a-propos",
        title: "À propos de Bono Trading",
        slug: "a-propos",
        excerpt: "Une pédagogie de trading centrée sur le processus, la discipline et la gestion du risque.",
        content: rich([
          ["Une pédagogie utile avant tout", "Bono Trading partage des repères concrets pour aider les traders à structurer leur apprentissage. Le but n’est pas de promettre un résultat ; c’est d’expliquer comment préparer une décision, la mesurer et la remettre en question."],
          ["Une méthode avant une opinion", "Chaque contenu part d’un principe simple : définir le contexte, le risque et l’invalidation avant l’exécution. Cette approche aide à sortir du bruit, à mieux journaliser et à construire une routine reproductible."],
          ["Une communauté qui apprend", "Les échanges, les accompagnements et les contenus ont vocation à faire progresser dans un cadre responsable. Les performances, les situations personnelles et les marchés évoluent : la prudence reste donc indispensable."]
        ]),
        status: "PUBLISHED",
        robotsIndex: true,
        robotsFollow: true,
        seoTitle: "À propos de Bono Trading",
        seoDescription: "Une pédagogie de trading centrée sur le processus, la discipline et la gestion du risque."
      },
      {
        id: "page_contact",
        title: "Contact Bono Trading",
        slug: "contact",
        excerpt: "Une question sur un contenu, un accompagnement ou un partenariat ?",
        content: "<p>Utilise le formulaire pour poser une question précise. Une demande claire permet de recevoir une orientation plus utile.</p>",
        status: "PUBLISHED",
        robotsIndex: true,
        robotsFollow: true,
        seoTitle: "Contacter Bono Trading",
        seoDescription: "Poser une question à Bono Trading sur les contenus, services et accompagnements."
      }
    ],
    services: [
      { id: "service_1", title: "Session d’orientation trading", slug: "coaching-de-demarrage", description: "Faire le point sur ton niveau, ta disponibilité et tes priorités avant de choisir une méthode ou un accompagnement.", content: "<p>Une séance structurée pour clarifier ton objectif, tes contraintes et les premières actions réalistes à mettre en place.</p>", priceLabel: "Sur demande", ctaLabel: "Demander une orientation", ctaUrl: "/contact", order: 1, published: true },
      { id: "service_2", title: "Fondations du trading", slug: "formation-indices-synthetiques", description: "Comprendre le risque, la structure d’un plan et la routine qui permet de progresser sans brûler les étapes.", content: "<p>Pour les personnes qui veulent construire des bases avant d’augmenter leur exposition au marché.</p>", priceLabel: "Sur demande", ctaLabel: "Parler de mon niveau", ctaUrl: "/contact", order: 2, published: true },
      { id: "service_3", title: "Méthode indices synthétiques", slug: "accompagnement-discipline", description: "Préparer ses niveaux, gérer la volatilité et adapter le risque à un marché qui peut se déplacer rapidement.", content: "<p>Un accompagnement axé sur la lecture du contexte, l’exécution et la protection du capital.</p>", priceLabel: "Sur demande", ctaLabel: "Découvrir le parcours", ctaUrl: "/contact", order: 3, published: true },
      { id: "service_journal-revue", title: "Journal et revue de performance", slug: "journal-revue-performance", description: "Mettre en place un journal simple pour identifier les erreurs répétitives et suivre les progrès utiles.", content: "<p>Un cadre de revue hebdomadaire pour transformer les décisions en apprentissages concrets.</p>", priceLabel: "Sur demande", ctaLabel: "Améliorer mon journal", ctaUrl: "/contact", order: 4, published: true },
      { id: "service_discipline", title: "Accompagnement discipline", slug: "accompagnement-discipline", description: "Réduire le sur-trading, installer des règles d’arrêt et construire une exécution plus régulière.", content: "<p>Pour les traders qui connaissent déjà leur méthode mais veulent mieux la respecter en conditions réelles.</p>", priceLabel: "Sur demande", ctaLabel: "Échanger sur mon blocage", ctaUrl: "/contact", order: 5, published: true },
      { id: "service_atelier-plan", title: "Atelier plan de trading", slug: "atelier-plan-trading", description: "Structurer un plan personnel : conditions d’entrée, invalidation, risque, objectifs et revue de séance.", content: "<p>Un atelier pratique pour repartir avec un document de travail clair et évolutif.</p>", priceLabel: "Sur demande", ctaLabel: "Réserver un échange", ctaUrl: "/contact", order: 6, published: true }
    ],
    testimonials: [
      { id: "testimonial_example_amina", name: "Amina K. — exemple", role: "Avis de démonstration à remplacer", quote: "Le format d’exemple montre le type de retour utile attendu : concret, centré sur la méthode et sans promesse de gain.", rating: 4.8, published: true, order: 1, createdAt: "2026-06-01T10:00:00.000Z" },
      { id: "testimonial_example_daniel", name: "Daniel T. — exemple", role: "Avis de démonstration à remplacer", quote: "Un bon avis explique ce qui a été compris ou amélioré, par exemple la routine, le journal ou la gestion du risque.", rating: 4.6, published: true, order: 2, createdAt: "2026-06-02T10:00:00.000Z" },
      { id: "testimonial_example_fatou", name: "Fatou S. — exemple", role: "Avis de démonstration à remplacer", quote: "Les témoignages vérifiés des utilisateurs peuvent ensuite être publiés directement et désactivés depuis l’administration si nécessaire.", rating: 4.9, published: true, order: 3, createdAt: "2026-06-03T10:00:00.000Z" }
    ],
    actionLinks: [
      { id: "link_telegram", label: "Rejoindre la communauté Telegram", slug: "telegram", url: "https://t.me/Bonotrading", type: "SOCIAL", description: "Recevoir les publications, les repères pédagogiques et les informations de la communauté Bono Trading.", ctaLabel: "Ouvrir Telegram", brandColor: "#229ED9", placement: "ARTICLE_BOTH", noFollow: true, sponsored: false, active: true },
      { id: "link_whatsapp", label: "Écrire sur WhatsApp", slug: "whatsapp", url: "https://wa.me/22961835529", type: "CONTACT", description: "Poser une question courte ou demander une première orientation sur les parcours proposés.", ctaLabel: "Ouvrir WhatsApp", brandColor: "#25D366", placement: "ARTICLE_BOTTOM", noFollow: true, sponsored: false, active: true }
    ],
    media: [
      { id: "media_hero", title: "Bureau de trading moderne pour article de trading", url: "/hero-trading-desk.png", alt: "Bureau de trading avec ordinateur, graphique de marché et carnet de notes", type: "IMAGE", createdAt: "2026-06-01T09:00:00.000Z" },
      { id: "media_plan_discipline", title: "Plan de trading et journal de discipline", url: "/trading-plan-discipline.png", alt: "Trader relisant un plan de trading manuscrit devant un ordinateur affichant un graphique", type: "IMAGE", createdAt: "2026-06-01T09:05:00.000Z" },
      { id: "media_analysis_focus", title: "Analyse de marché et préparation de séance", url: "/trading-analysis-focus.png", alt: "Trader analysant un plan de marché et une tablette avec graphique de prix", type: "IMAGE", createdAt: "2026-06-01T09:10:00.000Z" }
    ],
    contactMessages: [],
    redirects: [],
    settings: [
      { id: "setting_site_name", key: "siteName", value: "Bono Trading", group: "site" },
      { id: "setting_contact_email", key: "contactEmail", value: process.env.CONTACT_TO_EMAIL || admin.email, group: "contact" },
      { id: "setting_default_seo_title", key: "defaultSeoTitle", value: "Bono Trading — apprendre le trading avec méthode", group: "seo" },
      { id: "setting_default_seo_description", key: "defaultSeoDescription", value: "Articles, méthodes et accompagnements pour apprendre le trading avec un cadre clair et une gestion du risque responsable.", group: "seo" }
    ],
    users: [{ id: "user_admin", name: "Administrateur", email: admin.email, passwordHash: admin.passwordHash, role: "ADMIN", status: "ACTIVE" }],
    activityLogs: [],
    linkClicks: [],
    subscribers: []
  };
}
