import { SiteFooterContent } from "@/components/site-footer-content";
import { siteConfig } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";

export async function SiteFooter() {
  const { categories } = await getPublicData();
  return <SiteFooterContent categories={categories} email={siteConfig.email} />;
}
