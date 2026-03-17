import { useEffect, useRef, useState } from "react";
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
import { cn } from "@acme/ui/lib/utils";

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
}

export function GalleryLightbox({
  open,
  onOpenChange,
  media,
  initialIndex = 0,
  onDownloadAll,
}: GalleryLightboxProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);

  const [prevOpen, setPrevOpen] = useState(open);

  // Sync internal state with initialIndex during render when Lightbox opens
  // (React 18+ recommended pattern to avoid cascading renders)
  if (open && !prevOpen) {
    setPrevOpen(true);
    setCurrentImageIndex(initialIndex);
    setScale(1);
    setRotate(0);
    setFlipX(1);
    setFlipY(1);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const [lightboxCarouselApi, setLightboxCarouselApi] = useState<CarouselApi>();

  const resetTransform = () => {
    setScale(1);
    setRotate(0);
    setFlipX(1);
    setFlipY(1);
  };

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Pause all non-active videos and pause all videos when closing
  useEffect(() => {
    for (const [index, video] of videoRefs.current.entries()) {
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
              className="h-full w-full [&_[data-slot=carousel-content]]:h-full"
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
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          src={item.url}
                          controls
                          playsInline
                          onClick={(e) => e.stopPropagation()}
                          className="max-h-full max-w-full cursor-auto object-contain transition-transform duration-200"
                          style={
                            index === currentImageIndex
                              ? {
                                  transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flipX}) scaleY(${flipY})`,
                                }
                              : {}
                          }
                        />
                      ) : (
                        <picture>
                          <img
                            src={item.url}
                            alt={`Gallery Image ${index + 1}`}
                            className="max-h-full max-w-full cursor-auto object-contain transition-transform duration-200 select-none"
                            style={
                              index === currentImageIndex
                                ? {
                                    transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flipX}) scaleY(${flipY})`,
                                  }
                                : {}
                            }
                            onClick={(e) => e.stopPropagation()}
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
              onClick={() => setScale((s) => s + 0.5)}
              className="transition-all hover:scale-110 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.2, s - 0.5))}
              className="transition-all hover:scale-110 hover:text-white"
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
              onClick={() => setRotate((r) => r - 90)}
              className="transition-all hover:scale-110 hover:text-white"
              title="Rotate Left"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setRotate((r) => r + 90)}
              className="transition-all hover:scale-110 hover:text-white"
              title="Rotate Right"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setFlipX((x) => x * -1)}
              className="transition-all hover:scale-110 hover:text-white"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setFlipY((y) => y * -1)}
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
