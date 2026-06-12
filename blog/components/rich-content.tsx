import { sanitizeRichHtml, markdownLikeToHtml } from "@/lib/sanitize";

export function RichContent({ content }: { content: string }) {
  const html = sanitizeRichHtml(markdownLikeToHtml(content));

  return (
    <div
      className="rich-content"
      dangerouslySetInnerHTML={{
        __html: html
      }}
    />
  );
}
