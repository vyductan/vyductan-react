import type React from "react";
import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import type { CarouselApi } from "@acme/ui/components/carousel";
import { Button } from "@acme/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/components/carousel";
import { cn } from "@acme/ui/lib/utils";

import type { GalleryMedia } from "./gallery-lightbox";
import { MediaMosaic } from "./_components/media-mosaic";
import { GalleryLightbox } from "./gallery-lightbox";

export interface MediaGalleryProps {
  media: GalleryMedia[];
  /** Base label — each item is announced as `${alt} - Media <n>`. */
  alt?: string;
  /** Mosaic tiles rendered before the remainder collapses into `+N`. */
  max?: number;
  /** Height of the desktop mosaic. */
  height?: number | string;
  /** Adds a "Download All" action to the lightbox when provided. */
  onDownloadAll?: () => void;
  /**
   * Buffer lightbox videos to a local blob: URL so scrubbing works even when
   * the origin doesn't honour Range requests. Costs a full download per video.
   */
  seekableVideo?: boolean;
  viewAllLabel?: string;
  empty?: React.ReactNode;
  className?: string;
}

/**
 * The full media surface: a mosaic on desktop, a swipeable carousel on mobile,
 * and a shared `GalleryLightbox` opened from either. Owns the open/index state
 * so callers only pass data.
 */
export function MediaGallery({
  media,
  alt = "Media",
  max = 5,
  height = 450,
  onDownloadAll,
  seekableVideo,
  viewAllLabel = "View all photos",
  empty = "No media available",
  className,
}: MediaGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const openAt = (index: number) => {
    setCurrent(index);
    setOpen(true);
  };

  const hasOverflow = media.length > max;

  return (
    <div className={className}>
      <div className="hidden md:block">
        <MediaMosaic
          media={media}
          max={max}
          height={height}
          alt={alt}
          empty={empty}
          onItemClick={openAt}
          extra={
            hasOverflow ? (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => openAt(0)}
                className="bg-background/90 hover:bg-background text-sm font-medium shadow-sm transition-transform hover:scale-105"
              >
                <ImageIcon className="size-4" />
                {viewAllLabel}
              </Button>
            ) : undefined
          }
        />
      </div>

      <div
        className={cn(
          "bg-muted relative h-72 w-full overflow-hidden rounded-xl sm:h-96 md:hidden",
        )}
      >
        {media.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            {empty}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true, startIndex: current }}
            // `CarouselContent` puts its className on the inner flex track, so
            // the auto-height viewport above it needs to be stretched directly
            // or every slide collapses to its image's aspect ratio.
            className="h-full w-full **:data-[slot=carousel-content]:h-full"
            setApi={(api) => {
              setCarouselApi(api);
              if (!api) return;
              api.on("select", () => setCurrent(api.selectedScrollSnap()));
            }}
          >
            <CarouselContent className="ml-0 h-full">
              {media.map((item, index) => (
                <CarouselItem key={item.url} className="h-full pl-0">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      onClick={() => openAt(index)}
                      className="h-full w-full cursor-pointer object-cover"
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={`${alt} - Media ${index + 1}`}
                      onClick={() => openAt(index)}
                      className="block h-full w-full cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt={`${alt} - Media ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>

            {media.length > 1 && (
              <>
                <CarouselPrevious className="bg-popover/70 hover:bg-popover left-3 border-none" />
                <CarouselNext className="bg-popover/70 hover:bg-popover right-3 border-none" />
                <div className="bg-background/60 text-foreground absolute top-3 left-3 rounded px-2 py-1 text-xs font-medium backdrop-blur-sm">
                  {current + 1} / {media.length}
                </div>
              </>
            )}
          </Carousel>
        )}
      </div>

      <GalleryLightbox
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // Keep the mobile carousel on whatever slide the lightbox ended on.
          if (!next) carouselApi?.scrollTo(current, true);
        }}
        media={media}
        initialIndex={current}
        onDownloadAll={onDownloadAll}
        seekableVideo={seekableVideo}
      />
    </div>
  );
}
