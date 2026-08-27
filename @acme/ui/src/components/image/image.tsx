import { memo, useEffect, useId, useRef, useState } from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/shadcn/hover-card";

import type { PreviewGroupType } from "./preview-group";
import { Skeleton } from "../skeleton";
import { PreviewOverlay } from "./_components/preview-overlay";
import { ImagePlaceholderSrc as ImagePlaceholderSource } from "./placeholder";
import { ImagePreviewGroup, useImagePreviewGroup } from "./preview-group";

/**
 * Peek configuration: hovering the image floats a larger copy beside it, for
 * thumbnails too small to read. Pointer-only — Radix ignores touch, so a tap on
 * mobile goes straight to the full viewer instead of needing two.
 */
export type ImageHoverPreview =
  | boolean
  | {
      /** Width of the floating copy. */
      width?: number;
      /** Larger source to peek at; defaults to the previewed source. */
      src?: string;
      openDelay?: number;
      closeDelay?: number;
      side?: "top" | "right" | "bottom" | "left";
      align?: "start" | "center" | "end";
    };

function resolveHoverPreview(hover: ImageHoverPreview | undefined) {
  if (!hover) return undefined;
  const config = hover === true ? {} : hover;
  return {
    width: config.width ?? 320,
    src: config.src,
    // Radix defaults to 700ms and even 300ms reads as lag; the peek is a
    // glance, so it should land about as fast as the eye settles.
    openDelay: config.openDelay ?? 150,
    closeDelay: config.closeDelay ?? 100,
    side: config.side ?? ("right" as const),
    align: config.align ?? ("center" as const),
  };
}

/**
 * Preview configuration for a single image. Mirrors Ant Design's `PreviewType`
 * minus the multi-image bits, which only a `PreviewGroup` can supply.
 */
export type ImagePreviewType = Omit<
  PreviewGroupType,
  "current" | "onChange"
> & {
  /** Source shown in the overlay; defaults to the image's own `src`. */
  src?: string;
  /**
   * Content of the hover mask. Empty by default, matching Ant Design 6 — pass
   * a node (an icon, a label) to put something back.
   */
  cover?: React.ReactNode;
  /** Float a larger copy while the pointer rests on the image. Off by default. */
  hover?: ImageHoverPreview;
};

type ImageProperties = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  preview?: boolean | ImagePreviewType;
  placeholder?: React.ReactNode;
  /**
   * Class for the wrapper element. `className` styles the `<img>` itself, as in
   * Ant Design — sizing utilities belong there so the hover mask, which tracks
   * the wrapper, keeps matching the image.
   */
  rootClassName?: string;
};
const InternalImage = memo(function Image({
  src,
  width,
  height,
  // quality,

  fallback: fallbackProperty,

  preview,
  placeholder = <Skeleton className={cn("size-full")} />,

  className,
  rootClassName,

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
  const previewConfig: ImagePreviewType =
    typeof preview === "object" ? preview : {};
  // Previewing is on by default, as in Ant Design — `preview={false}` opts out,
  // and a group can switch it off for every image it holds.
  const isPreviewable = preview !== false && (group?.enabled ?? true);

  const fallback =
    fallbackProperty ?? group?.fallback ?? ImagePlaceholderSource;

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const [isPeeking, setPeeking] = useState(false);

  const hoverPreview = isPreviewable
    ? resolveHoverPreview(previewConfig.hover)
    : undefined;

  const isPreviewOpen = previewConfig.open ?? internalPreviewOpen;
  const changePreviewOpen = (next: boolean) => {
    setInternalPreviewOpen(next);
    previewConfig.onOpenChange?.(next, { current: 0 });
  };

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
    changePreviewOpen(true);
  };

  // Ant Design 6 dropped the default eye-and-label from the mask, leaving just
  // the dim; `preview.cover` puts content back.
  const coverNode = previewConfig.cover;

  const previewSource =
    previewConfig.src ?? (error && fallback ? fallback : src) ?? "";
  const peekSource = hoverPreview?.src ?? previewSource;

  // Start fetching the peek while the open delay runs, so a source that differs
  // from the thumbnail isn't a blank card followed by a late paint.
  const peekPreloaded = useRef(false);
  const preloadPeek = () => {
    if (peekPreloaded.current || !peekSource || typeof window === "undefined") {
      return;
    }
    peekPreloaded.current = true;
    new window.Image().src = peekSource;
  };

  const thumbnail = (
    <div
      style={{ width, height }}
      className={cn("group/image relative inline-block", rootClassName)}
      onPointerEnter={hoverPreview ? preloadPeek : undefined}
    >
      {/* An errored image never fires `onLoad`, so clear the placeholder on
            `error` too — otherwise it stays pinned over the fallback. */}
      {!loaded && !error && placeholder && (
        <div className="absolute inset-0">{placeholder}</div>
      )}
      {!error && (
        <picture className="contents">
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
              className,
            )}
            style={{ transition: "opacity 0.3s" }}
            {...properties}
          />
        </picture>
      )}
      {error && fallback && (
        <picture className="contents">
          <img
            src={fallback}
            alt="fallback"
            width={width}
            height={height}
            className={cn(
              isPreviewable ? "cursor-pointer" : undefined,
              className,
            )}
            onClick={handlePreview}
          />
        </picture>
      )}
      {isPreviewable && (
        <button
          type="button"
          aria-label={
            properties.alt ? `Preview ${properties.alt}` : "Preview image"
          }
          onClick={handlePreview}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/image:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
        >
          {coverNode}
        </button>
      )}
    </div>
  );

  return (
    <>
      {hoverPreview ? (
        <HoverCard
          // Closed while the full viewer is up, so the peek never floats over
          // the dialog the click just opened.
          open={isPeeking && !isPreviewOpen}
          onOpenChange={setPeeking}
          openDelay={hoverPreview.openDelay}
          closeDelay={hoverPreview.closeDelay}
        >
          <HoverCardTrigger asChild>{thumbnail}</HoverCardTrigger>
          <HoverCardContent
            side={hoverPreview.side}
            align={hoverPreview.align}
            className="w-auto p-1"
          >
            <picture className="contents">
              <img
                src={peekSource}
                alt={properties.alt}
                style={{ width: hoverPreview.width }}
                className="max-h-[70vh] rounded-sm object-contain"
              />
            </picture>
          </HoverCardContent>
        </HoverCard>
      ) : (
        thumbnail
      )}

      {/* A lone image gets the same viewer a group does — toolbar, zoom, pan
          and all — instead of a bare full-bleed backdrop. */}
      {isPreviewable && !group && (
        <PreviewOverlay
          open={isPreviewOpen}
          onOpenChange={changePreviewOpen}
          items={[{ src: previewSource, alt: properties.alt }]}
          current={0}
          onCurrentChange={() => undefined}
          fallback={fallback}
          minScale={previewConfig.minScale}
          maxScale={previewConfig.maxScale}
          scaleStep={previewConfig.scaleStep}
          movable={previewConfig.movable}
          countRender={previewConfig.countRender}
          closeIcon={previewConfig.closeIcon}
          imageRender={previewConfig.imageRender}
          actionsRender={previewConfig.actionsRender}
          mask={previewConfig.mask}
          onTransform={previewConfig.onTransform}
        />
      )}
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
