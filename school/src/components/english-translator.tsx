"use client";

import { useEffect } from "react";
import { englishPhrases } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const translatableAttributes = ["aria-label", "placeholder", "title"] as const;

function translateValue(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const source = value.trim();
  return englishPhrases[source] ? `${leading}${englishPhrases[source]}${trailing}` : value;
}

function translateElement(element: Element) {
  if (element.closest("[data-no-translate], script, style, code, pre")) {
    return;
  }

  for (const attribute of translatableAttributes) {
    const value = element.getAttribute(attribute);
    if (value) element.setAttribute(attribute, translateValue(value));
  }

  if (element.matches("input, textarea, select")) {
    return;
  }

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) node.textContent = translateValue(node.textContent);
  }
}

export function EnglishTranslator({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    if (locale !== "en") return;

    const apply = (root: ParentNode) => {
      if (root instanceof Element) translateElement(root);
      root.querySelectorAll?.("*").forEach(translateElement);
    };

    apply(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) if (node instanceof Element) apply(node);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
