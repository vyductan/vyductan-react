import { memo, useEffect, useId, useState } from "react";
import { Eye } from "lucide-react";

import { cn } from "@acme/ui/lib/utils";

import { Skeleton } from "../skeleton";
import { ImagePlaceholderSrc as ImagePlaceholderSource } from "./placeholder";
import { ImagePreviewGroup, useImagePreviewGroup } from "./preview-group";

type ImageProperties = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  preview?: boolean;
  placeholder?: React.ReactNode;
  /**
   * Overlay shown on hover while the image is previewable. Pass `null` to
   * remove it.
   */
  cover?: React.ReactNode;
};
const InternalImage = memo(function Image({
  src,
  width,
  height,
  // quality,

  fallback: fallbackProperty,

  preview,
  placeholder = <Skeleton className={cn("size-full")} />,
  cover,

  className,

  ...properties
}: Omit<ImageProperties, "src"> & {
  src?: string;
  bucket?: string;
  // width?: number;
  // height?: number;
  quality?: number;
  fallback?: string;
}) {
  const group = useImagePreviewGroup();
  // Inside a group every image is previewable unless it opts out, matching Ant
  // Design; on its own an image needs `preview` explicitly.
  const isPreviewable = (preview ?? Boolean(group)) && (group?.enabled ?? true);

  const fallback =
    fallbackProperty ?? group?.fallback ?? ImagePlaceholderSource;

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const id = useId();
  const groupRegister = group?.register;
  const groupUnregister = group?.unregister;

  // Registering keeps the group's preview list in mount order, so a plain grid
  // of images previews in the order it reads.
  useEffect(() => {
    if (!groupRegister || !groupUnregister || !isPreviewable || !src) return;
    groupRegister(id, { src, alt: properties.alt });
    return () => groupUnregister(id);
  }, [groupRegister, groupUnregister, isPreviewable, id, src, properties.alt]);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
  };

  const handlePreview = () => {
    if (!isPreviewable) return;
    // A group owns one shared overlay for all of its images; a lone image falls
    // back to its own.
    if (group) {
      group.openAt(id);
      return;
    }
    setPreviewOpen(true);
  };

  const coverNode =
    cover === undefined ? (
      <span className="flex items-center gap-2 text-sm font-medium text-white">
        <Eye className="size-4" />
        Preview
      </span>
    ) : (
      cover
    );

  return (
    <>
      <div
        style={{ width, height }}
        className={cn("group/image relative", className)}
      >
        {/* An errored image never fires `onLoad`, so clear the placeholder on
            `error` too — otherwise it stays pinned over the fallback. */}
        {!loaded && !error && placeholder && (
          <div className="absolute inset-0">{placeholder}</div>
        )}
        {!error && (
          <picture>
            <img
              src={src}
              // `width`/`height` size the wrapper box; mirror them onto the
              // element so the image fills that box instead of overflowing it
              // at its intrinsic size.
              width={width}
              height={height}
              // alt={alt}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handlePreview}
              className={cn(
                isPreviewable ? "cursor-pointer" : undefined,
                loaded ? "opacity-100" : "opacity-0",
              )}
              style={{ transition: "opacity 0.3s" }}
              {...properties}
            />
          </picture>
        )}
        {error && fallback && (
          <picture>
            <img
              src={fallback}
              alt="fallback"
              width={width}
              height={height}
              className={isPreviewable ? "cursor-pointer" : undefined}
              onClick={handlePreview}
            />
          </picture>
        )}
        {isPreviewable && coverNode && (
          <button
            type="button"
            aria-label={
              properties.alt ? `Preview ${properties.alt}` : "Preview image"
            }
            onClick={handlePreview}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/image:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
          >
            {coverNode}
          </button>
        )}
        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setPreviewOpen(false)}
          >
            <picture>
              <img
                src={error && fallback ? fallback : src}
                alt={properties.alt}
                className="max-h-full max-w-full"
              />
            </picture>
          </div>
        )}
      </div>
    </>
  );
});

type CompoundedImage = typeof InternalImage & {
  PreviewGroup: typeof ImagePreviewGroup;
};

const Image = InternalImage as CompoundedImage;
Image.PreviewGroup = ImagePreviewGroup;

export type { ImageProperties as ImageProps };
export { Image };
