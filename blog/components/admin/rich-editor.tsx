"use client";

import { useEffect, useState } from "react";
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
  Undo2
} from "lucide-react";
import { markdownLikeToHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichEditorProps = {
  name: string;
  initialValue: string;
  placeholder?: string;
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

export function RichEditor({ name, initialValue, placeholder }: RichEditorProps) {
  const [html, setHtml] = useState(markdownLikeToHtml(initialValue));
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
      editor.chain().focus().setImage({ src: url.trim(), alt: "" }).run();
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
      <input name={name} type="hidden" value={html} />
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
        <EditorButton label="Image" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </EditorButton>
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
