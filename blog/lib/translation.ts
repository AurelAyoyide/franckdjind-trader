type LibreTranslateResponse = {
  translatedText?: string | string[];
  error?: string;
};

export type ArticleTranslationSource = {
  title: string;
  excerpt: string;
  content: string;
};

export type ArticleEnglishTranslation = {
  titleEn: string;
  excerptEn: string;
  contentEn: string;
};

function translationEndpoints() {
  const configured = process.env.LIBRETRANSLATE_URL?.trim() || "http://libretranslate:5000";
  const candidates = [configured, "http://libretranslate:5000"];

  return [...new Set(candidates)].map((candidate) => {
    const url = new URL("/translate", candidate.endsWith("/") ? candidate : `${candidate}/`);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("LIBRETRANSLATE_URL must use HTTP or HTTPS.");
    }
    return url;
  });
}

async function translateRequest(value: string | string[], format: "text" | "html") {
  let lastError: unknown;

  for (const endpoint of translationEndpoints()) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: value,
          source: "fr",
          target: "en",
          format,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(120_000),
      });
      const result = await response.json() as LibreTranslateResponse;

      if (!response.ok || result.translatedText === undefined) {
        throw new Error(result.error || `LibreTranslate returned HTTP ${response.status}.`);
      }

      return result.translatedText;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("LibreTranslate is unavailable.");
}

async function translate(value: string, format: "text" | "html") {
  if (!value.trim()) {
    return "";
  }

  const translated = await translateRequest(value, format);
  if (typeof translated !== "string") {
    throw new Error("LibreTranslate returned an invalid single translation.");
  }
  return translated.trim();
}

async function translateMany(values: string[], format: "text" | "html") {
  if (!values.length) {
    return [];
  }

  const translated = await translateRequest(values, format);
  if (!Array.isArray(translated) || translated.length !== values.length) {
    throw new Error("LibreTranslate returned an invalid translation batch.");
  }
  return translated.map((value) => value.trim());
}

export async function translateArticleSummariesToEnglish(
  articles: Array<Pick<ArticleTranslationSource, "title" | "excerpt">>,
) {
  const [titles, excerpts] = await Promise.all([
    translateMany(articles.map((article) => article.title), "text"),
    translateMany(articles.map((article) => article.excerpt), "text"),
  ]);

  return articles.map((_, index) => ({
    titleEn: titles[index],
    excerptEn: excerpts[index],
  }));
}

export async function translateArticleContentToEnglish(content: string) {
  return translate(content, "html");
}

export async function translateArticleToEnglish(
  article: ArticleTranslationSource,
): Promise<ArticleEnglishTranslation> {
  const [titleEn, excerptEn, contentEn] = await Promise.all([
    translate(article.title, "text"),
    translate(article.excerpt, "text"),
    translate(article.content, "html"),
  ]);

  if (!titleEn || !contentEn) {
    throw new Error("LibreTranslate returned an incomplete article translation.");
  }

  return { titleEn, excerptEn, contentEn };
}
