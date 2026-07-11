import { SiteFooterContent } from "@/components/site-footer-content";
import { siteConfig } from "@/lib/content";
import { getPublicFooterCategories } from "@/lib/data-store";

export async function SiteFooter() {
  const categories = await getPublicFooterCategories();
  return <SiteFooterContent categories={categories} email={siteConfig.email} />;
}
