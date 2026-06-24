import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { EnglishTranslator } from "@/components/english-translator";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getRequestLocale } from "@/lib/i18n-server";
import "./globals.css";

const themeBootstrapScript = `
  try {
    const theme = window.localStorage.getItem("school-theme");
    document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
`;

export const metadata: Metadata = {
  title: {
    default: "School - Plateforme privee de formation",
    template: "%s | School",
  },
  description:
    "Plateforme privee de formation en ligne pour apprenants, formateurs et administrateurs.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <EnglishTranslator locale={locale} />
          <ThemeProvider>
            <SiteHeader locale={locale} />
            <main>{children}</main>
            <SiteFooter locale={locale} />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
