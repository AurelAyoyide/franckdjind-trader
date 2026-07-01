"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Upload,
  Undo2
} from "lucide-react";
import { markdownLikeToHtml } from "@/lib/rich-text";
import { formatUploadLimit, maxImageUploadBytes } from "@/lib/upload-limits";
import { cn } from "@/lib/utils";

type MediaOption = { url: string; title: string };

type RichEditorProps = {
  name: string;
  initialValue: string;
  media?: MediaOption[];
  placeholder?: string;
  uploadEndpoint?: string;
};

type EditorButtonProps = {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function EditorButton({ active, label, onClick, children }: EditorButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line bg-background text-muted transition hover:border-line-strong hover:text-foreground",
        active && "border-market bg-market/10 text-market"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichEditor({ name, initialValue, media = [], placeholder, uploadEndpoint = "/admin/media/upload" }: RichEditorProps) {
  const [html, setHtml] = useState(markdownLikeToHtml(initialValue));
  const [uploadingImage, setUploadingImage] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank"
        }
      }),
      Image,
      Placeholder.configure({
        placeholder: placeholder ?? "Ecris le contenu ici..."
      })
    ],
    content: markdownLikeToHtml(initialValue),
    editorProps: {
      attributes: {
        class:
          "rich-editor-content min-h-[320px] rounded-b-lg bg-background px-4 py-4 text-foreground outline-none"
      }
    },
    immediatelyRender: false,
    onUpdate({ editor: currentEditor }) {
      setHtml(currentEditor.getHTML());
    }
  });

  useEffect(() => {
    setHtml(markdownLikeToHtml(initialValue));
  }, [initialValue]);

  useEffect(() => {
    hiddenInputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [html]);

  function setLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function addImage() {
    if (!editor) {
      return;
    }

    const url = window.prompt("URL de l'image", "/hero-trading-desk.png");

    if (url) {
      insertImage(url.trim());
    }
  }

  function insertImage(url: string) {
    if (!editor || !url) {
      return;
    }

    editor.chain().focus().setImage({ src: url, alt: "" }).run();
  }

  async function uploadImage(file: File | undefined) {
    if (!file) {
      return;
    }

    if (file.size > maxImageUploadBytes) {
      window.alert(`Image trop lourde. Choisis une image de ${formatUploadLimit()} maximum.`);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setUploadingImage(true);

    try {
      const response = await fetch(uploadEndpoint, {
        body: formData,
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Import image impossible.");
      }

      insertImage(payload.url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Import image impossible.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (!editor) {
    return (
      <textarea
        className="min-h-72 rounded-md border border-line bg-background px-4 py-3 text-foreground"
        defaultValue={initialValue}
        name={name}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <input name={name} ref={hiddenInputRef} type="hidden" value={html} />
      <input
        ref={imageInputRef}
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void uploadImage(file);
        }}
        type="file"
      />
      <div className="flex flex-wrap gap-2 border-b border-line bg-surface-strong p-2">
        <EditorButton active={editor.isActive("bold")} label="Gras" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("italic")} label="Italique" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("strike")} label="Barre" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("heading", { level: 2 })} label="Titre 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("heading", { level: 3 })} label="Titre 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("bulletList")} label="Liste" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("orderedList")} label="Liste ordonnee" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("blockquote")} label="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </EditorButton>
        <EditorButton active={editor.isActive("link")} label="Lien" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </EditorButton>
        <EditorButton label="Importer une image" onClick={() => imageInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
        </EditorButton>
        <EditorButton label="Image par URL" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </EditorButton>
        {media.length ? (
          <select
            aria-label="Insérer une image de la médiathèque"
            className="h-9 max-w-56 rounded-md border border-line bg-background px-2 text-xs font-semibold text-foreground outline-none transition focus:border-market"
            disabled={uploadingImage}
            onChange={(event) => {
              insertImage(event.target.value);
              event.target.value = "";
            }}
            value=""
          >
            <option value="">Médiathèque</option>
            {media.map((item) => (
              <option key={item.url} value={item.url}>
                {item.title}
              </option>
            ))}
          </select>
        ) : null}
        <EditorButton label="Annuler" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </EditorButton>
        <EditorButton label="Retablir" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </EditorButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
