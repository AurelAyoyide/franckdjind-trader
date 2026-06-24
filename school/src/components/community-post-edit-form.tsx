"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import { updateCommunityPostAction } from "@/app/trainer/community/actions";

type CourseOption = { id: string; title: string };
type PostShape = { id: string; title: string; body: string; courseId: string | null; pinned: boolean; commentsEnabled: boolean };

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <button className="min-h-10 rounded-lg bg-market px-3 text-sm font-black text-on-market disabled:opacity-60" disabled={pending} type="submit">
            {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
    );
}

export function CommunityPostEditForm({ post, courses }: { post: PostShape; courses: CourseOption[] }) {
    const [body, setBody] = useState(post.body);

    return (
        <form action={updateCommunityPostAction} className="mt-4 grid gap-3">
            <input name="postId" type="hidden" value={post.id} />
            <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm font-black" defaultValue={post.title} name="title" required />

            <input type="hidden" name="body" value={body} />
            <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                className="w-full bg-background [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed"
            />

            <select className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm" defaultValue={post.courseId ?? ""} name="courseId">
                <option value="">Tous les apprenants</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <label className="flex gap-2 text-sm font-black">
                <input defaultChecked={post.pinned} name="pinned" type="checkbox" />
                Epingler
            </label>
            <label className="flex gap-2 text-sm font-black">
                <input defaultChecked={post.commentsEnabled} name="commentsEnabled" type="checkbox" />
                Autoriser les commentaires
            </label>

            <SubmitBtn />
        </form>
    );
}
