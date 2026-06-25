import sanitizeHtml from "sanitize-html";

export function sanitizeCommunityHtml(dirtyHtml: string) {
  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "img",
      "iframe",
      "video",
      "audio",
      "source",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      audio: ["controls", "src", "preload"],
      blockquote: ["class"],
      code: ["class"],
      iframe: ["allow", "allowfullscreen", "frameborder", "src", "title"],
      img: ["alt", "height", "loading", "src", "title", "width"],
      li: ["class"],
      ol: ["class"],
      p: ["class"],
      source: ["src", "type"],
      span: ["class"],
      ul: ["class"],
      video: ["controls", "height", "poster", "preload", "src", "width"],
    },
    allowedClasses: {
      "*": ["ql-align-left", "ql-align-center", "ql-align-right", "ql-align-justify", "ql-indent-*", "ql-syntax"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowedSchemes: ["https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true),
      iframe: sanitizeHtml.simpleTransform(
        "iframe",
        {
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "",
          frameborder: "0",
        },
        true,
      ),
    },
  }).trim();
}

export function communityPlainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
