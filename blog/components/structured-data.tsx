import { siteConfig } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

export function HomeStructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
      sameAs: [siteConfig.telegramUrl, siteConfig.whatsappUrl]
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteConfig.name,
      jobTitle: "Trader formateur",
      url: absoluteUrl("/"),
      sameAs: [siteConfig.telegramUrl, siteConfig.whatsappUrl]
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
