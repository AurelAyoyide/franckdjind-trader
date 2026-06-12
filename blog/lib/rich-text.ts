export function markdownLikeToHtml(value: string) {
  if (value.includes("<")) {
    return value;
  }

  return value
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();

      if (!trimmed) {
        return "";
      }

      if (trimmed.startsWith("### ")) {
        return `<h3>${trimmed.replace(/^###\s*/, "")}</h3>`;
      }

      if (trimmed.startsWith("## ")) {
        return `<h2>${trimmed.replace(/^##\s*/, "")}</h2>`;
      }

      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}
