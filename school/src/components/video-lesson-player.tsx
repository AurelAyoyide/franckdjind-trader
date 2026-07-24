"use client";

import { useRef } from "react";

type VideoLessonPlayerProps = {
  lessonId: string;
  title: string;
  initialPosition: number;
  nextLessonUrl?: string | null;
};

export function VideoLessonPlayer({
  lessonId,
  title,
  initialPosition,
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
          preload="auto"
          src={`/api/videos/${lessonId}`}
          title={title}
        />
      </div>
    </section>
  );
}
