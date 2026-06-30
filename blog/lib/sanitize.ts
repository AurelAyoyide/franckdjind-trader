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
      img: ["src", "alt", "title", "width", "height", "loading"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["https"]
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.href?.startsWith("/") ? {} : { target: "_blank" })
        }
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          alt: attribs.alt ?? "",
          loading: "lazy",
          src: attribs.src ?? "",
          ...(attribs.title ? { title: attribs.title } : {}),
          ...(attribs.width ? { width: attribs.width } : {}),
          ...(attribs.height ? { height: attribs.height } : {})
        }
      })
    }
  });
}

export { markdownLikeToHtml };
