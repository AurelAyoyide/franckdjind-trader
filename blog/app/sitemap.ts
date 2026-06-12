import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts: articles, categories, tags } = await getPublicData();
  const now = new Date();
  const staticRoutes = [
    "",
    "/blog",
    "/recherche",
    "/a-propos",
    "/formations",
    "/temoignages",
    "/contact",
    "/disclaimer",
    "/politique-confidentialite",
    "/conditions-utilisation"
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt)
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteConfig.url}/categorie/${category.slug}`,
    lastModified: now
  }));

  const tagRoutes = tags.map((tag) => ({
    url: `${siteConfig.url}/tag/${tag.slug}`,
    lastModified: now
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...tagRoutes];
}
