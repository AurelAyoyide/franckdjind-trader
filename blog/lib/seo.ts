import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/content";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  follow?: boolean;
};

export function buildMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.heroImage,
  noIndex = false,
  follow = true
}: SeoInput = {}): Metadata {
  const fullTitle = title === siteConfig.title ? title : `${title} | ${siteConfig.name}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url
    },
    robots: {
      index: !noIndex,
      follow: !noIndex && follow
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1600,
          height: 900,
          alt: siteConfig.name
        }
      ],
      locale: "fr_FR",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl]
    }
  };
}
