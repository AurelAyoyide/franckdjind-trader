"use server";

import { CommunityPostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { communityPlainText, hasCommunityMedia, sanitizeCommunityHtml } from "@/lib/community-content";
import { prisma } from "@/lib/prisma";
import {
  communityCommentDeleteSchema,
  communityPostSchema,
  communityPostStatusSchema,
  communityPostUpdateSchema,
  communityPostDeleteSchema,
} from "@/lib/validation";

export type CommunityPostState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

async function requireModerator() {
  return getAuthorizedSession(["trainer", "admin"]);
}

async function canModeratePost(postId: string, userId: string, role: "student" | "trainer" | "admin") {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: { course: { select: { trainerId: true } } },
  });

  if (!post) {
    return null;
  }

  if (role === "admin" || post.authorId === userId || post.course?.trainerId === userId) {
    return post;
  }

  return null;
}

export async function createCommunityPostAction(
  _state: CommunityPostState,
  formData: FormData,
): Promise<CommunityPostState> {
  const session = await requireModerator();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = communityPostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    courseId: formData.get("courseId") || undefined,
    pinned: formData.get("pinned") === "on",
    commentsEnabled: formData.get("commentsEnabled") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Publication invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const cleanBody = sanitizeCommunityHtml(parsed.data.body);

  if (communityPlainText(cleanBody).length < 10 && !hasCommunityMedia(cleanBody)) {
    return {
      ok: false,
      message: "Publication invalide.",
      errors: { body: ["Message trop court"] },
    };
  }

  if (parsed.data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { trainerId: true },
    });

    if (!course || (session.role !== "admin" && course.trainerId !== session.userId)) {
      return { ok: false, message: "Formation non autorisee." };
    }
  }

  const post = await prisma.communityPost.create({
    data: {
      title: parsed.data.title,
      body: cleanBody,
      courseId: parsed.data.courseId || null,
      pinned: Boolean(parsed.data.pinned),
      commentsEnabled: parsed.data.commentsEnabled !== false,
      status: CommunityPostStatus.PUBLISHED,
      authorId: session.userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_POST_CREATED",
      target: post.id,
      metadata: { courseId: post.courseId, pinned: post.pinned },
    },
  });

  revalidatePath("/trainer/community");
  revalidatePath("/student/community");

  return { ok: true, message: "Publication envoyee dans la communaute." };
}

export async function setCommunityPostStatusAction(formData: FormData) {
  const session = await requireModerator();
  if (!session) {
    return;
  }

  const parsed = communityPostStatusSchema.safeParse({
    postId: formData.get("postId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const post = await canModeratePost(parsed.data.postId, session.userId, session.role);
  if (!post) {
    return;
  }

  await prisma.communityPost.update({
    where: { id: post.id },
    data: { status: parsed.data.status },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_POST_STATUS_UPDATED",
      target: post.id,
      metadata: { status: parsed.data.status },
    },
  });

  revalidatePath("/trainer/community");
  revalidatePath("/student/community");
  redirect("/trainer/community?notice=post-status");
}

export async function updateCommunityPostAction(formData: FormData) {
  const session = await requireModerator();
  const parsed = communityPostUpdateSchema.safeParse({ postId: formData.get("postId"), title: formData.get("title"), body: formData.get("body"), courseId: formData.get("courseId") || undefined, pinned: formData.get("pinned") === "on", commentsEnabled: formData.get("commentsEnabled") === "on" });
  if (!session || !parsed.success) return;
  const cleanBody = sanitizeCommunityHtml(parsed.data.body);
  if (communityPlainText(cleanBody).length < 10 && !hasCommunityMedia(cleanBody)) return;
  const post = await canModeratePost(parsed.data.postId, session.userId, session.role);
  if (!post) return;
  if (parsed.data.courseId) {
    const course = await prisma.course.findFirst({ where: { id: parsed.data.courseId, ...(session.role !== "admin" ? { trainerId: session.userId } : {}) }, select: { id: true } });
    if (!course) return;
  }
  await prisma.communityPost.update({ where: { id: post.id }, data: { title: parsed.data.title, body: cleanBody, courseId: parsed.data.courseId || null, pinned: Boolean(parsed.data.pinned), commentsEnabled: parsed.data.commentsEnabled !== false } });
  await prisma.auditLog.create({ data: { actorId: session.userId, action: "COMMUNITY_POST_UPDATED", target: post.id } });
  revalidatePath("/trainer/community"); revalidatePath("/student/community"); redirect("/trainer/community?notice=post-updated");
}

export async function deleteCommunityPostAction(formData: FormData) {
  const session = await requireModerator(); const parsed = communityPostDeleteSchema.safeParse({ postId: formData.get("postId") });
  if (!session || !parsed.success) return;
  const post = await canModeratePost(parsed.data.postId, session.userId, session.role); if (!post) return;
  await prisma.$transaction([prisma.communityPost.delete({ where: { id: post.id } }), prisma.auditLog.create({ data: { actorId: session.userId, action: "COMMUNITY_POST_DELETED", target: post.id } })]);
  revalidatePath("/trainer/community"); revalidatePath("/student/community"); redirect("/trainer/community?notice=post-deleted");
}

export async function toggleCommunityCommentsAction(formData: FormData) {
  const session = await requireModerator();
  if (!session) {
    return;
  }

  const postId = String(formData.get("postId") ?? "");
  const commentsEnabled = formData.get("commentsEnabled") === "true";
  const post = await canModeratePost(postId, session.userId, session.role);

  if (!post) {
    return;
  }

  await prisma.communityPost.update({
    where: { id: post.id },
    data: { commentsEnabled },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_COMMENTS_TOGGLED",
      target: post.id,
      metadata: { commentsEnabled },
    },
  });

  revalidatePath("/trainer/community");
  revalidatePath("/student/community");
  redirect("/trainer/community?notice=comments");
}

export async function deleteCommunityCommentAction(formData: FormData) {
  const session = await requireModerator();
  if (!session) {
    return;
  }

  const parsed = communityCommentDeleteSchema.safeParse({
    commentId: formData.get("commentId"),
  });

  if (!parsed.success) {
    return;
  }

  const comment = await prisma.communityComment.findUnique({
    where: { id: parsed.data.commentId },
    include: {
      post: {
        include: { course: { select: { trainerId: true } } },
      },
    },
  });

  if (
    !comment ||
    (session.role !== "admin" &&
      comment.post.authorId !== session.userId &&
      comment.post.course?.trainerId !== session.userId)
  ) {
    return;
  }

  await prisma.communityComment.delete({
    where: { id: comment.id },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_COMMENT_DELETED",
      target: comment.id,
      metadata: { postId: comment.postId, authorId: comment.authorId },
    },
  });

  revalidatePath("/trainer/community");
  revalidatePath("/student/community");
  redirect("/trainer/community?notice=comment-deleted");
}
