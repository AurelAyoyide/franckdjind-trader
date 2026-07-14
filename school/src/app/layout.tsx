import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRequestLocale } from "@/lib/i18n-server";
import "./globals.css";

const themeBootstrapScript = `
  (() => {
    const applyTheme = (theme) => {
      const resolvedTheme = theme === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
      try {
        window.localStorage.setItem("school-theme", resolvedTheme);
      } catch {}
    };

    try {
      applyTheme(window.localStorage.getItem("school-theme"));
    } catch {
      applyTheme("light");
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-theme-toggle]")) {
        return;
      }

      const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  })();
`;

const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const analyticsEnabled = Boolean(analyticsId && /^G-[A-Z0-9]+$/i.test(analyticsId));

function metadataBaseUrl() {
  try {
    return new URL(process.env.APP_URL ?? "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "Bono School - Plateforme privee de formation",
    template: "%s | Bono School",
  },
  description:
    "Plateforme privee de formation en ligne pour apprenants, formateurs et administrateurs.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bono School - Plateforme privee de formation",
    description: "Plateforme privee de formation en ligne pour apprenants, formateurs et administrateurs.",
    siteName: "Bono School",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bono School" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bono School - Plateforme privee de formation",
    description: "Plateforme privee de formation en ligne pour apprenants, formateurs et administrateurs.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const Translator = locale === "en" ? (await import("@/components/english-translator")).EnglishTranslator : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {analyticsEnabled ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${analyticsId}');
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        {Translator ? <Translator locale={locale} /> : null}
        <SiteHeader locale={locale} />
        <main>{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
