import type React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { GalleryMedia } from "../gallery-lightbox";

export interface MediaMosaicProps {
  media: GalleryMedia[];
  /** Tiles rendered before the remainder collapses into a `+N` overlay. */
  max?: number;
  /** Height of the mosaic box; every tile is cropped to fill its cell. */
  height?: number | string;
  /** Base label — each tile is announced as `${alt} - Media <n>`. */
  alt?: string;
  onItemClick?: (index: number) => void;
  /** Pinned to the bottom-right corner, e.g. a "View all photos" button. */
  extra?: React.ReactNode;
  /** Rendered instead of the tiles when `media` is empty. */
  empty?: React.ReactNode;
  className?: string;
}

/**
 * Number of columns and rows the mosaic needs for `count` visible tiles. The
 * hero tile always occupies the top-left block, so the track counts are picked
 * to leave no holes.
 */
function getGridClassName(count: number): string {
  switch (count) {
    case 1: {
      return "grid-cols-1 grid-rows-1";
    }
    case 2: {
      return "grid-cols-2 grid-rows-1";
    }
    case 3: {
      return "grid-cols-2 grid-rows-2";
    }
    default: {
      return "grid-cols-4 grid-rows-2";
    }
  }
}

function getTileClassName(count: number, index: number): string {
  switch (count) {
    case 1:
    case 2: {
      return "col-span-1 row-span-1";
    }
    case 3: {
      return index === 0 ? "col-span-1 row-span-2" : "col-span-1 row-span-1";
    }
    case 4: {
      if (index === 0) return "col-span-2 row-span-2";
      if (index === 3) return "col-span-2 row-span-1";
      return "col-span-1 row-span-1";
    }
    default: {
      return index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";
    }
  }
}

/**
 * An Airbnb-style photo mosaic: a hero tile plus supporting tiles inside a
 * fixed-height box, with the overflow collapsed into a `+N` badge.
 *
 * Not a masonry — every tile is cropped to its cell rather than sized by its
 * own aspect ratio. Reach for a masonry layout when item height should follow
 * the content.
 */
export function MediaMosaic({
  media,
  max = 5,
  height = 450,
  alt = "Media",
  onItemClick,
  extra,
  empty = "No media available",
  className,
}: MediaMosaicProps) {
  const visible = media.slice(0, max);
  const hiddenCount = media.length - visible.length;

  return (
    <div
      style={{ height }}
      className={cn(
        "relative grid gap-2 overflow-hidden rounded-xl",
        getGridClassName(visible.length),
        className,
      )}
    >
      {visible.length === 0 ? (
        <div className="text-muted-foreground bg-muted col-span-full row-span-full flex h-full items-center justify-center">
          {empty}
        </div>
      ) : (
        <>
          {visible.map((item, index) => {
            const label = `${alt} - Media ${index + 1}`;
            const isOverflowTile =
              index === visible.length - 1 && hiddenCount > 0;
            // The hero video plays in place; the rest are thumbnails that open
            // the lightbox, so their controls stay out of the way.
            const isInlineVideo = item.type === "video" && index === 0;

            return (
              <div
                key={item.url}
                className={cn(
                  "relative h-full overflow-hidden",
                  getTileClassName(visible.length, index),
                )}
              >
                {isInlineVideo ? (
                  <video
                    src={item.url}
                    controls
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={label}
                    onClick={() => onItemClick?.(index)}
                    className="focus-visible:ring-ring group block h-full w-full cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        playsInline
                        muted
                        loop
                        className="pointer-events-none h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </button>
                )}

                {isOverflowTile && (
                  <button
                    type="button"
                    aria-label={`Show ${hiddenCount} more`}
                    onClick={() => onItemClick?.(index)}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-xl font-medium text-white transition-colors hover:bg-black/50"
                  >
                    +{hiddenCount}
                  </button>
                )}
              </div>
            );
          })}

          {extra && <div className="absolute right-4 bottom-4">{extra}</div>}
        </>
      )}
    </div>
  );
}
