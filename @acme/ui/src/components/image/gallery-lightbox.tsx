import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FlipHorizontal,
  FlipVertical,
  Play,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { CarouselApi } from "@acme/ui/components/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/components/carousel";
import { Dialog, DialogContent, DialogTitle } from "@acme/ui/components/dialog";
import { SeekableVideo } from "@acme/ui/components/video";
import { cn } from "@acme/ui/lib/utils";

import { useImageTransform } from "./_components/use-image-transform";

export type GalleryMedia = {
  type: "image" | "video";
  url: string;
  fileName: string;
};

export interface GalleryLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: GalleryMedia[];
  initialIndex?: number;
  onDownloadAll?: () => void;
  /** Lower bound for the zoom-out button. */
  minScale?: number;
  /** Upper bound for the zoom-in button. */
  maxScale?: number;
  /** Amount added or removed per zoom step. */
  scaleStep?: number;
  /** Whether a zoomed image can be dragged to pan. */
  movable?: boolean;
  /**
   * Buffer videos to a local blob: URL so scrubbing works even when the origin
   * doesn't honour Range requests. Costs a full download per video.
   */
  seekableVideo?: boolean;
  /** Carries a video's playback position in from a copy playing elsewhere. */
  videoSync?: GalleryVideoSync;
}

export type GalleryVideoSync = {
  /** Index in `media` of the video to hand the position to. */
  index: number;
  /** Seconds to seek to — and resume from — once that video is ready. */
  startTime: number;
  /** Mirrors the position back out on every timeupdate while it plays. */
  onTimeUpdate?: (time: number) => void;
};

export function GalleryLightbox({
  open,
  onOpenChange,
  media,
  initialIndex = 0,
  onDownloadAll,
  minScale = 0.2,
  maxScale = 8,
  scaleStep = 0.5,
  movable = true,
  seekableVideo = false,
  videoSync,
}: GalleryLightboxProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);

  const {
    css: activeTransform,
    isPannable,
    isDragging,
    canZoomIn,
    canZoomOut,
    reset: resetTransform,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
    panHandlers,
  } = useImageTransform({ minScale, maxScale, scaleStep, movable });

  const [previousOpen, setPreviousOpen] = useState(open);

  // Sync internal state with initialIndex during render when Lightbox opens
  // (React 18+ recommended pattern to avoid cascading renders)
  if (open && !previousOpen) {
    setPreviousOpen(true);
    setCurrentImageIndex(initialIndex);
    resetTransform();
  } else if (!open && previousOpen) {
    setPreviousOpen(false);
  }

  const [lightboxCarouselApi, setLightboxCarouselApi] = useState<CarouselApi>();

  const videoReferences = useRef<(HTMLVideoElement | null)[]>([]);

  // Radix unmounts the dialog's content while closed, so each open() builds a
  // brand-new video element. An effect watching `open` races that: it can run
  // before Radix has inserted the element, with no later re-check. The ref
  // callback is the one thing guaranteed to fire exactly when the element
  // exists, so the seek lives there.
  const videoSyncReference = useRef(videoSync);
  useEffect(() => {
    videoSyncReference.current = videoSync;
  }, [videoSync]);

  // One stable callback for every slide — a per-index closure would be a new
  // function each render, so React would detach and re-attach it constantly and
  // re-run the seek. The slide index rides along on a data attribute, and the
  // returned cleanup means React never calls this with `null`.
  const attachVideoRef = useCallback((element: HTMLVideoElement) => {
    const index = Number(element.dataset.index);
    videoReferences.current[index] = element;

    const sync = videoSyncReference.current;
    if (sync?.index === index) {
      const seekAndPlay = () => {
        element.currentTime = sync.startTime;
        void element.play().catch(() => {
          // Autoplay can be refused without a fresh gesture; the user can still
          // press play.
        });
      };
      if (element.readyState >= 1) seekAndPlay();
      else {
        element.addEventListener("loadedmetadata", seekAndPlay, { once: true });
      }
    }

    return () => {
      videoReferences.current[index] = null;
    };
  }, []);

  // Pause all non-active videos and pause all videos when closing
  useEffect(() => {
    for (const [index, video] of videoReferences.current.entries()) {
      if (video && (index !== currentImageIndex || !open)) {
        video.pause();
      }
    }
  }, [currentImageIndex, open]);

  // Sync Carousel API position when opened
  useEffect(() => {
    if (!open) return;

    if (lightboxCarouselApi) {
      // Ensure we immediately jump to initialIndex without animation
      lightboxCarouselApi.scrollTo(initialIndex, true);
    }
  }, [open, initialIndex, lightboxCarouselApi]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="pointer-events-none m-0 flex h-screen w-screen max-w-none flex-col items-center justify-center overflow-hidden border-none bg-black/50 p-0 shadow-none backdrop-blur-sm sm:max-w-none [&>button]:hidden"
        showCloseButton={false}
        onClick={(e) => {
          if (e.target === e.currentTarget) onOpenChange(false);
        }}
      >
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>

        {/* Carousel Background */}
        <div className="pointer-events-auto absolute top-16 right-0 bottom-[180px] left-0 z-10 sm:bottom-[190px] md:px-16">
          {media.length > 0 && (
            <Carousel
              opts={{
                align: "center",
                loop: true,
                startIndex: initialIndex,
              }}
              className="h-full w-full **:data-[slot=carousel-content]:h-full"
              onClick={(e) => {
                if (
                  (e.target as HTMLElement).closest("button") ||
                  (e.target as HTMLElement).tagName === "IMG" ||
                  (e.target as HTMLElement).tagName === "VIDEO"
                )
                  return;

                onOpenChange(false);
              }}
              setApi={(api) => {
                setLightboxCarouselApi(api);
                if (!api) return;
                api.on("select", () => {
                  setCurrentImageIndex(api.selectedScrollSnap());
                  resetTransform();
                });
              }}
            >
              <CarouselContent className="ml-0 flex h-full items-center">
                {media.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="flex h-full w-full items-center justify-center pl-0"
                  >
                    <div
                      className="pointer-events-auto relative flex h-full w-full items-center justify-center"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) onOpenChange(false);
                      }}
                    >
                      {item.type === "video" ? (
                        <SeekableVideo
                          ref={attachVideoRef}
                          data-index={index}
                          src={item.url}
                          seekable={seekableVideo}
                          controls
                          playsInline
                          onClick={(e) => e.stopPropagation()}
                          // Keep drags on the scrub bar from reaching the
                          // carousel, which would swipe to the next slide.
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerMove={(e) => e.stopPropagation()}
                          onTimeUpdate={(e) => {
                            if (index === videoSync?.index) {
                              videoSync.onTimeUpdate?.(
                                e.currentTarget.currentTime,
                              );
                            }
                          }}
                          // Without an explicit box the element starts at the
                          // 300x150 default and jumps once metadata arrives.
                          className="h-full max-h-full w-full max-w-full cursor-auto object-contain transition-transform duration-200"
                          style={
                            index === currentImageIndex
                              ? { transform: activeTransform }
                              : {}
                          }
                        />
                      ) : (
                        <picture>
                          <img
                            src={item.url}
                            alt={`Gallery Image ${index + 1}`}
                            className={cn(
                              "max-h-full max-w-full object-contain select-none",
                              // Transitioning every pointermove makes the drag
                              // trail the cursor, so only animate zoom/rotate.
                              isDragging
                                ? undefined
                                : "transition-transform duration-200",
                              index === currentImageIndex && isPannable
                                ? "cursor-grab touch-none active:cursor-grabbing"
                                : "cursor-auto",
                            )}
                            style={
                              index === currentImageIndex
                                ? { transform: activeTransform }
                                : {}
                            }
                            onClick={(e) => e.stopPropagation()}
                            {...(index === currentImageIndex
                              ? panHandlers
                              : {})}
                          />
                        </picture>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {media.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 hidden h-12 w-12 border-white/10 bg-black/30 text-white shadow-xl backdrop-blur-md hover:bg-white/20 hover:text-white sm:left-8 sm:flex" />
                  <CarouselNext className="right-4 hidden h-12 w-12 border-white/10 bg-black/30 text-white shadow-xl backdrop-blur-md hover:bg-white/20 hover:text-white sm:right-8 sm:flex" />
                </>
              )}
            </Carousel>
          )}
        </div>

        {/* Top Overlays */}
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-start justify-between p-4 text-white/80 transition-opacity md:p-6">
          {/* Image Count */}
          <div className="pointer-events-auto flex h-10 items-center rounded-full border border-white/10 bg-black/30 px-4 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md">
            {currentImageIndex + 1} / {media.length}
          </div>

          {/* Right Actions */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1 shadow-lg backdrop-blur-md">
            {onDownloadAll && (
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-full px-4 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                onClick={onDownloadAll}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download All</span>
              </button>
            )}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 hover:text-white"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bottom Overlays */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-50 flex flex-col items-center pb-6 md:pb-8">
          {/* Action Tools Pill */}
          <div className="pointer-events-auto mb-6 flex items-center gap-4 rounded-full border border-white/10 bg-black/30 px-6 py-3 text-white/80 shadow-2xl backdrop-blur-md sm:gap-6">
            <button
              type="button"
              onClick={zoomIn}
              disabled={!canZoomIn}
              className="transition-all hover:scale-110 hover:text-white disabled:opacity-40 disabled:hover:scale-100"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={!canZoomOut}
              className="transition-all hover:scale-110 hover:text-white disabled:opacity-40 disabled:hover:scale-100"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={resetTransform}
              className="transition-all hover:scale-110 hover:text-white"
              title="Reset"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={rotateLeft}
              className="transition-all hover:scale-110 hover:text-white"
              title="Rotate Left"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={rotateRight}
              className="transition-all hover:scale-110 hover:text-white"
              title="Rotate Right"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={flipHorizontal}
              className="transition-all hover:scale-110 hover:text-white"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={flipVertical}
              className="transition-all hover:scale-110 hover:text-white"
              title="Flip Vertical"
            >
              <FlipVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          {media.length > 1 && (
            <div className="hide-scrollbar pointer-events-auto flex max-w-[95vw] items-center gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-2 shadow-2xl backdrop-blur-md sm:max-w-[90vw] md:max-w-2xl">
              {media.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => lightboxCarouselApi?.scrollTo(index)}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                    index === currentImageIndex
                      ? "opacity-100 ring-2 ring-white ring-offset-1 ring-offset-black/50"
                      : "opacity-40 hover:opacity-100",
                  )}
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play
                          className="h-5 w-5 text-white opacity-90 drop-shadow-md"
                          fill="currentColor"
                        />
                      </div>
                    </>
                  ) : (
                    <picture className="flex h-full w-full">
                      <img
                        src={item.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover select-none"
                      />
                    </picture>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
