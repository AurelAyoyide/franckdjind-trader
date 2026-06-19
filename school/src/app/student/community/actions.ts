"use server";

import { EnrollmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { communityCommentSchema } from "@/lib/validation";

export type CommunityCommentState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createCommunityCommentAction(
  _state: CommunityCommentState,
  formData: FormData,
): Promise<CommunityCommentState> {
  const session = await getAuthorizedSession(["student"]);
  if (!session) {
    return { ok: false, message: "Connexion apprenant requise." };
  }

  const parsed = communityCommentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Commentaire invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const post = await prisma.communityPost.findFirst({
    where: {
      id: parsed.data.postId,
      status: "PUBLISHED",
      commentsEnabled: true,
    },
    include: {
      course: {
        include: {
          enrollments: {
            where: {
              learnerId: session.userId,
              status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
              OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
            },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!post || (post.courseId && post.course?.enrollments.length === 0)) {
    return { ok: false, message: "Publication introuvable ou non autorisee." };
  }

  const comment = await prisma.communityComment.create({
    data: {
      postId: post.id,
      authorId: session.userId,
      body: parsed.data.body,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_COMMENT_CREATED",
      target: comment.id,
      metadata: { postId: post.id },
    },
  });

  revalidatePath("/student/community");
  revalidatePath("/trainer/community");

  return { ok: true, message: "Commentaire publie." };
}
