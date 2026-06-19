import { notFound, redirect } from "next/navigation";
import { readData } from "@/lib/data-store";
import { isSafeHttpUrl, isSafeInternalPath } from "@/lib/security";

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const source = `/${slug.join("/")}`;
  const data = await readData();
  const rule = data.redirects.find((redirectRule) => redirectRule.active && redirectRule.source === source);

  if (rule && (isSafeInternalPath(rule.destination) || isSafeHttpUrl(rule.destination))) {
    redirect(rule.destination);
  }

  notFound();
}
