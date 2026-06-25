import { sanitizeCommunityHtml } from "@/lib/community-content";

export function CommunityPostBody({ html }: { html: string }) {
  return (
    <div
      className="mt-3 text-sm leading-7 text-muted [&_a]:font-bold [&_a]:text-market [&_audio]:mt-3 [&_audio]:w-full [&_blockquote]:border-l-4 [&_blockquote]:border-market/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-foreground/[0.08] [&_code]:px-1 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_iframe]:mt-3 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_img]:mt-3 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-xl [&_img]:object-contain [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-foreground/[0.08] [&_pre]:p-3 [&_ul]:ml-5 [&_ul]:list-disc [&_video]:mt-3 [&_video]:w-full [&_video]:rounded-xl"
      dangerouslySetInnerHTML={{ __html: sanitizeCommunityHtml(html) }}
    />
  );
}
