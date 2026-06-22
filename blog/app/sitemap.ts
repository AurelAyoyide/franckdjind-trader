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

  const englishStaticRoutes = [
    "/en",
    "/en/blog",
    "/en/a-propos",
    "/en/formations",
    "/en/temoignages",
    "/en/contact",
    "/en/disclaimer",
    "/en/politique-confidentialite",
    "/en/conditions-utilisation"
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt)
  }));

  const englishArticleRoutes = articles.map((article) => ({
    url: `${siteConfig.url}/en/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt)
  }));

  const categoryRoutes = categories
    .filter((category) => articles.some((article) => article.category.slug === category.slug))
    .map((category) => ({
    url: `${siteConfig.url}/categorie/${category.slug}`,
    lastModified: now
    }));

  const englishCategoryRoutes = categories
    .filter((category) => articles.some((article) => article.category.slug === category.slug))
    .map((category) => ({
      url: `${siteConfig.url}/en/categorie/${category.slug}`,
      lastModified: now
    }));

  const tagRoutes = tags
    .filter((tag) => articles.some((article) => article.tags.some((articleTag) => articleTag.slug === tag.slug)))
    .map((tag) => ({
    url: `${siteConfig.url}/tag/${tag.slug}`,
    lastModified: now
    }));

  const englishTagRoutes = tags
    .filter((tag) => articles.some((article) => article.tags.some((articleTag) => articleTag.slug === tag.slug)))
    .map((tag) => ({
      url: `${siteConfig.url}/en/tag/${tag.slug}`,
      lastModified: now
    }));

  return [
    ...staticRoutes,
    ...englishStaticRoutes,
    ...articleRoutes,
    ...englishArticleRoutes,
    ...categoryRoutes,
    ...englishCategoryRoutes,
    ...tagRoutes,
    ...englishTagRoutes
  ];
}
