type LibreTranslateResponse = {
  translatedText?: string;
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

function translationEndpoint() {
  const configured = process.env.LIBRETRANSLATE_URL?.trim() || "http://libretranslate:5000";

  const url = new URL("/translate", configured.endsWith("/") ? configured : `${configured}/`);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("LIBRETRANSLATE_URL must use HTTP or HTTPS.");
  }

  return url;
}

async function translate(value: string, format: "text" | "html") {
  if (!value.trim()) {
    return "";
  }

  const response = await fetch(translationEndpoint(), {
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

  if (!response.ok || typeof result.translatedText !== "string") {
    throw new Error(result.error || `LibreTranslate returned HTTP ${response.status}.`);
  }

  return result.translatedText.trim();
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
