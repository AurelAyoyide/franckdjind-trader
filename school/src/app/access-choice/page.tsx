import { PageHero } from "@/components/page-hero";
import { AccessChoiceForm } from "@/components/access-choice-form";
import { requirePageSession } from "@/lib/authorization";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AccessChoicePage() {
  const session = await requirePageSession(["student"], "/access-choice");
  const [profile, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    }),
    prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      orderBy: { title: "asc" },
      select: { id: true, title: true, type: true },
    }),
  ]);
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={t("Demande d'acces")}
        title={t("Finalisez votre demande d'acces.")}
        description={t("Selectionnez le parcours qui vous a ete propose. Votre demande sera ensuite examinee avant l'ouverture de l'acces.")}
      />
      <section className="site-shell py-12 md:py-16">
        <AccessChoiceForm
          account={{
            name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : session.name,
            email: profile?.email ?? session.email,
            phone: profile?.phone ?? "",
          }}
          courses={courses}
        />
      </section>
    </>
  );
}
