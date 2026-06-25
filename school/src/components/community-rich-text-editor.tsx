"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type CommunityRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

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

function isDirectVideo(url: URL) {
  return /\.(mp4|webm|mov)$/i.test(url.pathname);
}

export function CommunityRichTextEditor({ value, onChange, placeholder }: CommunityRichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
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

  function appendMedia(kind: "image" | "video" | "audio") {
    const labels = {
      image: "Colle le lien HTTPS de l'image",
      video: "Colle le lien HTTPS de la video ou YouTube/Vimeo",
      audio: "Colle le lien HTTPS du fichier audio",
    };
    const url = getHttpsUrl(window.prompt(labels[kind]));

    if (!url) {
      window.alert("Lien HTTPS obligatoire.");
      return;
    }

    const safeUrl = escapeAttribute(url.toString());
    let html = "";

    if (kind === "image") {
      html = `<p><img src="${safeUrl}" alt="" loading="lazy" /></p>`;
    }

    if (kind === "audio") {
      html = `<p><audio controls src="${safeUrl}"></audio></p>`;
    }

    if (kind === "video") {
      const embedUrl = getVideoEmbedUrl(url);

      if (embedUrl) {
        html = `<p><iframe src="${escapeAttribute(embedUrl)}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></p>`;
      } else if (isDirectVideo(url)) {
        html = `<p><video controls src="${safeUrl}"></video></p>`;
      } else {
        window.alert("Pour une video, utilise YouTube, Vimeo, ou un fichier HTTPS .mp4/.webm/.mov.");
        return;
      }
    }

    onChange(`${value || ""}${value ? "\n" : ""}${html}`);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="min-h-9 rounded-full border border-line bg-surface px-3 text-xs font-black transition hover:bg-foreground/[0.04]"
          onClick={() => appendMedia("image")}
          type="button"
        >
          Ajouter image
        </button>
        <button
          className="min-h-9 rounded-full border border-line bg-surface px-3 text-xs font-black transition hover:bg-foreground/[0.04]"
          onClick={() => appendMedia("video")}
          type="button"
        >
          Ajouter video
        </button>
        <button
          className="min-h-9 rounded-full border border-line bg-surface px-3 text-xs font-black transition hover:bg-foreground/[0.04]"
          onClick={() => appendMedia("audio")}
          type="button"
        >
          Ajouter audio
        </button>
      </div>
      <ReactQuill
        className="w-full rounded-xl bg-background [&_.ql-container]:min-h-[180px] [&_.ql-editor]:min-h-[180px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl"
        formats={formats}
        modules={modules}
        onChange={onChange}
        placeholder={placeholder}
        theme="snow"
        value={value}
      />
      <p className="text-xs font-medium text-muted">
        Images, videos et audios doivent utiliser un lien HTTPS. Les videos YouTube/Vimeo sont integrees automatiquement.
      </p>
    </div>
  );
}
