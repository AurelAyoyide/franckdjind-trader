"use client";

import { Play } from "lucide-react";
import { useRef } from "react";

type VideoLessonPlayerProps = {
  lessonId: string;
  title: string;
  initialPosition: number;
  watermark: string;
  nextLessonUrl?: string | null;
};

export function VideoLessonPlayer({
  lessonId,
  title,
  initialPosition,
  watermark,
  nextLessonUrl,
}: VideoLessonPlayerProps) {
  const lastSyncAt = useRef(0);
  const watermarkLabel = watermark.trim() || "apprenant";
  const watermarkPositions = [
    "left-[8%] top-[14%] -rotate-12",
    "right-[7%] top-[24%] rotate-12",
    "left-[18%] top-[48%] rotate-6",
    "right-[16%] bottom-[24%] -rotate-6",
    "left-[7%] bottom-[12%] rotate-12",
  ];

  function syncProgress(video: HTMLVideoElement, forceSync = false) {
    const now = Date.now();
    if (!forceSync && now - lastSyncAt.current < 5000) {
      return;
    }

    lastSyncAt.current = now;
    void fetch(`/api/videos/${lessonId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoPosition: Math.floor(video.currentTime),
      }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          if (nextLessonUrl) {
            window.location.href = nextLessonUrl;
          } else {
            window.location.reload();
          }
        }
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-black text-white">
      <div className="relative aspect-video select-none" onContextMenu={(event) => event.preventDefault()}>
        <video
          className="h-full w-full bg-black"
          controls
          controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
          disablePictureInPicture
          draggable={false}
          onEnded={(event) => syncProgress(event.currentTarget, true)}
          onContextMenu={(event) => event.preventDefault()}
          onLoadedMetadata={(event) => {
            if (initialPosition > 0 && initialPosition < event.currentTarget.duration) {
              event.currentTarget.currentTime = initialPosition;
            }
          }}
          onPause={(event) => syncProgress(event.currentTarget)}
          onTimeUpdate={(event) => syncProgress(event.currentTarget)}
          playsInline
          preload="metadata"
          src={`/api/videos/${lessonId}`}
          title={title}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {watermarkPositions.map((position) => (
            <span
              aria-hidden="true"
              className={`absolute rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/30 shadow-sm ${position}`}
              key={position}
            >
              {watermarkLabel} - {lessonId.slice(0, 8)}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/15 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
          watermark {watermarkLabel}
        </div>
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          lecteur protege - acces trace
        </div>
      </div>
    </section>
  );
}
