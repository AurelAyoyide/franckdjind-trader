import sanitizeHtml from "sanitize-html";
import { markdownLikeToHtml } from "@/lib/rich-text";

export function sanitizeRichHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "br",
      "strong",
      "em",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "hr",
      "code",
      "pre"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: attribs.href?.startsWith("/") ? "" : "_blank"
        }
      })
    }
  });
}

export { markdownLikeToHtml };
