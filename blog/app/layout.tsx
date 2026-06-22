import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { FormSubmissionGuard } from "@/components/form-submission-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { LocaleDocument } from "@/components/locale-document";
import { NavigationFeedback } from "@/components/navigation-feedback";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata()
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050706"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-site-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <LocaleDocument />
          <NavigationFeedback />
          <FormSubmissionGuard />
          <SiteHeader />
          <main>{children}</main>
          {isAdminRoute ? null : <SiteFooter />}
        </ThemeProvider>
      </body>
    </html>
  );
}
