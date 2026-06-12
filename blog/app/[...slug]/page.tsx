import { notFound, redirect } from "next/navigation";
import { readData } from "@/lib/data-store";

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

  if (rule) {
    redirect(rule.destination);
  }

  notFound();
}
