"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type CommunityMediaKind = "image" | "video" | "audio";

type CommunityRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const mediaAccepts: Record<CommunityMediaKind, string> = {
  audio: "audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.ogg,.wav,.webm",
  image: "image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif",
  video: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
};

const uploadButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-market/20 bg-market/10 px-3 text-xs font-black text-market transition hover:bg-market/15 disabled:cursor-not-allowed disabled:opacity-60";
const linkButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-line bg-background px-3 text-xs font-black transition hover:border-market/40 hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-60";

function escapeAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function getHttpsUrl(rawUrl: string | null) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl.trim());
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function getVideoEmbedUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
  }

  if (host === "youtube.com") {
    const videoId = url.searchParams.get("v");
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
  }

  if (host === "vimeo.com") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}` : null;
  }

  return null;
}

function isDirectAudio(url: URL) {
  return /\.(mp3|m4a|ogg|wav|webm)$/i.test(url.pathname);
}

function isDirectVideo(url: URL) {
  return /\.(mp4|webm|mov)$/i.test(url.pathname);
}

function mediaHtml(kind: CommunityMediaKind, url: string) {
  const safeUrl = escapeAttribute(url);

  if (kind === "image") {
    return `<p><img src="${safeUrl}" alt="" loading="lazy" /></p>`;
  }

  if (kind === "audio") {
    return `<p><audio controls preload="metadata" src="${safeUrl}"></audio></p>`;
  }

  return `<p><video controls preload="metadata" src="${safeUrl}"></video></p>`;
}

export function CommunityRichTextEditor({ value, onChange, placeholder }: CommunityRichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKind, setUploadingKind] = useState<CommunityMediaKind | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  function appendHtml(html: string) {
    onChange(`${value || ""}${value?.trim() ? "\n" : ""}${html}`);
  }

  async function uploadMedia(kind: CommunityMediaKind, file: File) {
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);
    setUploadingKind(kind);

    try {
      const response = await fetch("/api/community/media", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Upload impossible.");
      }

      appendHtml(mediaHtml(kind, payload.url));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload impossible.");
    } finally {
      setUploadingKind(null);
    }
  }

  function handleFileChange(kind: CommunityMediaKind, file: File | undefined) {
    if (!file) {
      return;
    }

    void uploadMedia(kind, file);
  }

  function appendMediaFromUrl(kind: CommunityMediaKind) {
    const labels = {
      audio: "Colle le lien HTTPS du fichier audio (.mp3, .m4a, .ogg, .wav ou .webm)",
      image: "Colle le lien HTTPS de l'image",
      video: "Colle le lien HTTPS de la video, YouTube ou Vimeo",
    };
    const url = getHttpsUrl(window.prompt(labels[kind]));

    if (!url) {
      window.alert("Lien HTTPS obligatoire.");
      return;
    }

    if (kind === "image") {
      appendHtml(mediaHtml("image", url.toString()));
      return;
    }

    if (kind === "audio") {
      if (!isDirectAudio(url)) {
        window.alert("Pour un audio externe, utilise un lien direct .mp3, .m4a, .ogg, .wav ou .webm.");
        return;
      }

      appendHtml(mediaHtml("audio", url.toString()));
      return;
    }

    const embedUrl = getVideoEmbedUrl(url);

    if (embedUrl) {
      appendHtml(`<p><iframe src="${escapeAttribute(embedUrl)}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></p>`);
      return;
    }

    if (!isDirectVideo(url)) {
      window.alert("Pour une video externe, utilise YouTube, Vimeo, ou un fichier HTTPS .mp4/.webm/.mov.");
      return;
    }

    appendHtml(mediaHtml("video", url.toString()));
  }

  return (
    <div className="grid gap-3 rounded-[1.35rem] border border-line bg-surface/80 p-3 shadow-sm">
      <input
        ref={imageInputRef}
        accept={mediaAccepts.image}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          handleFileChange("image", file);
        }}
        type="file"
      />
      <input
        ref={videoInputRef}
        accept={mediaAccepts.video}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          handleFileChange("video", file);
        }}
        type="file"
      />
      <input
        ref={audioInputRef}
        accept={mediaAccepts.audio}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          handleFileChange("audio", file);
        }}
        type="file"
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-background/70 p-2">
        <span className="px-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted">Importer</span>
        <button className={uploadButtonClass} disabled={Boolean(uploadingKind)} onClick={() => imageInputRef.current?.click()} type="button">
          {uploadingKind === "image" ? "Image..." : "Image"}
        </button>
        <button className={uploadButtonClass} disabled={Boolean(uploadingKind)} onClick={() => videoInputRef.current?.click()} type="button">
          {uploadingKind === "video" ? "Video..." : "Video"}
        </button>
        <button className={uploadButtonClass} disabled={Boolean(uploadingKind)} onClick={() => audioInputRef.current?.click()} type="button">
          {uploadingKind === "audio" ? "Audio..." : "Audio"}
        </button>
        <span className="px-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted">Lien</span>
        <button className={linkButtonClass} disabled={Boolean(uploadingKind)} onClick={() => appendMediaFromUrl("image")} type="button">
          Image URL
        </button>
        <button className={linkButtonClass} disabled={Boolean(uploadingKind)} onClick={() => appendMediaFromUrl("video")} type="button">
          Video URL
        </button>
        <button className={linkButtonClass} disabled={Boolean(uploadingKind)} onClick={() => appendMediaFromUrl("audio")} type="button">
          Audio URL
        </button>
      </div>

      <ReactQuill
        className="w-full overflow-hidden rounded-2xl bg-background shadow-inner [&_.ql-container]:min-h-[210px] [&_.ql-container]:rounded-b-2xl [&_.ql-container]:border-line [&_.ql-editor]:min-h-[210px] [&_.ql-editor]:px-4 [&_.ql-editor]:py-4 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:rounded-t-2xl [&_.ql-toolbar]:border-line [&_.ql-toolbar]:bg-foreground/[0.03]"
        formats={formats}
        modules={modules}
        onChange={onChange}
        placeholder={placeholder}
        theme="snow"
        value={value}
      />
      <p className="px-1 text-xs font-medium text-muted">
        Tu peux importer une image, une video ou un audio depuis ton appareil, ou coller un lien HTTPS. Les apprenants verront le rendu directement dans la communaute.
      </p>
    </div>
  );
}
