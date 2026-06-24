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
      <div className="relative aspect-video">
        <video
          className="h-full w-full bg-black"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onEnded={(event) => syncProgress(event.currentTarget, true)}
          onLoadedMetadata={(event) => {
            if (initialPosition > 0 && initialPosition < event.currentTarget.duration) {
              event.currentTarget.currentTime = initialPosition;
            }
          }}
          onPause={(event) => syncProgress(event.currentTarget)}
          onTimeUpdate={(event) => syncProgress(event.currentTarget)}
          preload="metadata"
          src={`/api/videos/${lessonId}`}
          title={title}
        />
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/15 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
          watermark {watermark}
        </div>
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          lecteur protege
        </div>
      </div>
    </section>
  );
}
