import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CourseForm } from "@/components/course-form";
import { requirePageSession } from "@/lib/authorization";

export default async function NewCoursePage() {
  const session = await requirePageSession(["trainer", "admin"], "/trainer/courses/new");

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }

  return (
    <DashboardShell role={session.role} title="Nouvelle formation" description="Prepare le titre, le type d'acces et la description du parcours.">
      <CourseForm />
    </DashboardShell>
  );
}
