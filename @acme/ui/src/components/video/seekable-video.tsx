import type { ComponentPropsWithoutRef, Ref } from "react";
import { useCallback, useEffect, useRef } from "react";

import { useSeekableVideoUrl } from "@acme/ui/lib/seekable-video";

export type SeekableVideoProps = Omit<
  ComponentPropsWithoutRef<"video">,
  "src"
> & {
  src: string | undefined;
  /** Set to `false` to stream `src` directly and skip the blob download. */
  seekable?: boolean;
  ref?: Ref<HTMLVideoElement>;
};

/**
 * Drop-in replacement for `<video src=…>` that plays back from a local blob:
 * URL once the file has downloaded, so scrubbing works even when the origin
 * doesn't support seeking (no Range support, or a non-faststart mp4).
 *
 * Swapping the source mid-playback would otherwise reload the element and drop
 * the viewer back to 0:00, so the position is carried across the swap.
 */
export function SeekableVideo({
  src,
  seekable = true,
  ref,
  onTimeUpdate,
  onPlay,
  onPause,
  ...properties
}: SeekableVideoProps) {
  const resolvedSource = useSeekableVideoUrl(src, seekable);

  const videoReference = useRef<HTMLVideoElement | null>(null);
  // Tracked from events rather than read off the element mid-render: by the
  // time an effect sees the new source, the element has already reloaded and
  // reports 0. `timeupdate` fires a few times a second, so the restore lands
  // within a fraction of a second of where the viewer was.
  const lastTimeReference = useRef(0);
  const wasPlayingReference = useRef(false);

  const attachRef = useCallback(
    (element: HTMLVideoElement) => {
      videoReference.current = element;
      if (typeof ref === "function") {
        const cleanup = ref(element);
        return () => {
          videoReference.current = null;
          if (typeof cleanup === "function") cleanup();
        };
      }
      if (ref) ref.current = element;
      return () => {
        videoReference.current = null;
        if (ref) ref.current = null;
      };
    },
    [ref],
  );

  useEffect(() => {
    const video = videoReference.current;
    const time = lastTimeReference.current;
    if (!video || time <= 0) return;

    const wasPlaying = wasPlayingReference.current;
    const restore = () => {
      video.currentTime = time;
      if (wasPlaying) {
        void video.play().catch(() => {
          // Autoplay can be refused without a fresh gesture; the controls still
          // work, so leave it paused rather than throwing.
        });
      }
    };

    if (video.readyState >= 1) {
      restore();
      return;
    }
    video.addEventListener("loadedmetadata", restore, { once: true });
    return () => video.removeEventListener("loadedmetadata", restore);
  }, [resolvedSource]);

  return (
    <video
      {...properties}
      ref={attachRef}
      src={resolvedSource}
      onTimeUpdate={(event) => {
        lastTimeReference.current = event.currentTarget.currentTime;
        onTimeUpdate?.(event);
      }}
      onPlay={(event) => {
        wasPlayingReference.current = true;
        onPlay?.(event);
      }}
      onPause={(event) => {
        wasPlayingReference.current = false;
        onPause?.(event);
      }}
    />
  );
}
