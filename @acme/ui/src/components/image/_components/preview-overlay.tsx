import type React from "react";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
  FlipVertical,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@acme/ui/components/dialog";
import { cn } from "@acme/ui/lib/utils";

import type { ImageTransform, TransformAction } from "./use-image-transform";
import { useImageTransform } from "./use-image-transform";

/** A single entry in the preview list. Extra keys land on the `<img>`. */
export type PreviewItem = {
  src: string;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">;

export type ImgInfo = {
  url: string;
  alt?: string;
};

export type ToolbarRenderInfo = {
  icons: {
    zoomInIcon: React.ReactNode;
    zoomOutIcon: React.ReactNode;
    rotateLeftIcon: React.ReactNode;
    rotateRightIcon: React.ReactNode;
    flipXIcon: React.ReactNode;
    flipYIcon: React.ReactNode;
  };
  actions: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onFlipX: () => void;
    onFlipY: () => void;
    onReset: () => void;
    onClose: () => void;
    onActive: (offset: number) => void;
  };
  transform: ImageTransform;
  current: number;
  image: ImgInfo;
};

export type PreviewMask =
  | boolean
  | { enabled?: boolean; blur?: boolean; closable?: boolean };

export type PreviewOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PreviewItem[];
  current: number;
  onCurrentChange: (next: number, previous: number) => void;
  fallback?: string;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  movable?: boolean;
  countRender?: (current: number, total: number) => React.ReactNode;
  closeIcon?: React.ReactNode;
  imageRender?: (
    originalNode: React.ReactElement,
    info: { transform: ImageTransform; image: ImgInfo; current: number },
  ) => React.ReactNode;
  actionsRender?: (
    originalNode: React.ReactElement,
    info: ToolbarRenderInfo,
  ) => React.ReactNode;
  mask?: PreviewMask;
  onTransform?: (info: {
    transform: ImageTransform;
    action: TransformAction;
  }) => void;
};

function resolveMask(mask: PreviewMask | undefined) {
  if (mask === false) return { enabled: false, blur: false, closable: true };
  if (mask === true || mask === undefined) {
    return { enabled: true, blur: true, closable: true };
  }
  return {
    enabled: mask.enabled ?? true,
    blur: mask.blur ?? true,
    closable: mask.closable ?? true,
  };
}

const toolbarButtonClassName =
  "transition-all hover:scale-110 hover:text-white disabled:opacity-40 disabled:hover:scale-100";

/**
 * The shared full-screen viewer behind `Image.PreviewGroup`. Ant Design's
 * preview API with this library's shadcn styling.
 */
export function PreviewOverlay({
  open,
  onOpenChange,
  items,
  current,
  onCurrentChange,
  fallback,
  minScale = 1,
  maxScale = 50,
  scaleStep = 0.5,
  movable = true,
  countRender,
  closeIcon,
  imageRender,
  actionsRender,
  mask,
  onTransform,
}: PreviewOverlayProps) {
  const transformState = useImageTransform({
    minScale,
    maxScale,
    scaleStep,
    movable,
    onTransform,
  });
  const { reset } = transformState;

  const [failedSources, setFailedSources] = useState<Record<string, true>>({});

  // A new slide (or a reopen) starts from an untransformed image, matching what
  // Ant Design does on `onChange`.
  useEffect(() => {
    reset();
    // `reset` is stable enough for this purpose; re-running on identity changes
    // would clear the transform on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, open]);

  const total = items.length;
  const item = items[current];
  const resolvedMask = resolveMask(mask);

  const goto = (offset: number) => {
    if (total < 2) return;
    const next = (current + offset + total) % total;
    onCurrentChange(next, current);
  };

  if (!item) return null;

  const {
    src,
    alt,
    className: itemClassName,
    style: itemStyle,
    ...imgRest
  } = item;
  const source = failedSources[src] && fallback ? fallback : src;
  const imageInfo: ImgInfo = { url: source, alt };

  const originalImage = (
    <picture>
      <img
        {...imgRest}
        src={source}
        alt={alt ?? `Preview ${current + 1}`}
        onError={() => setFailedSources((prev) => ({ ...prev, [src]: true }))}
        className={cn(
          "max-h-full max-w-full object-contain select-none",
          // Animating every pointermove makes the drag trail the cursor, so
          // only zoom and rotation are transitioned.
          transformState.isDragging
            ? undefined
            : "transition-transform duration-200",
          transformState.isPannable
            ? "cursor-grab touch-none active:cursor-grabbing"
            : "cursor-auto",
          itemClassName,
        )}
        style={{ ...itemStyle, transform: transformState.css }}
        onClick={(event) => event.stopPropagation()}
        {...transformState.panHandlers}
      />
    </picture>
  );

  const toolbarInfo: ToolbarRenderInfo = {
    icons: {
      zoomInIcon: <ZoomIn className="size-5" />,
      zoomOutIcon: <ZoomOut className="size-5" />,
      rotateLeftIcon: <RotateCcw className="size-5" />,
      rotateRightIcon: <RotateCw className="size-5" />,
      flipXIcon: <FlipHorizontal className="size-5" />,
      flipYIcon: <FlipVertical className="size-5" />,
    },
    actions: {
      onZoomIn: transformState.zoomIn,
      onZoomOut: transformState.zoomOut,
      onRotateLeft: transformState.rotateLeft,
      onRotateRight: transformState.rotateRight,
      onFlipX: transformState.flipHorizontal,
      onFlipY: transformState.flipVertical,
      onReset: transformState.reset,
      onClose: () => onOpenChange(false),
      onActive: goto,
    },
    transform: transformState.transform,
    current,
    image: imageInfo,
  };

  const originalToolbar = (
    <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/10 bg-black/30 px-6 py-3 text-white/80 shadow-2xl backdrop-blur-md sm:gap-6">
      <button
        type="button"
        onClick={transformState.zoomIn}
        disabled={!transformState.canZoomIn}
        className={toolbarButtonClassName}
        title="Zoom In"
      >
        {toolbarInfo.icons.zoomInIcon}
      </button>
      <button
        type="button"
        onClick={transformState.zoomOut}
        disabled={!transformState.canZoomOut}
        className={toolbarButtonClassName}
        title="Zoom Out"
      >
        {toolbarInfo.icons.zoomOutIcon}
      </button>
      <button
        type="button"
        onClick={transformState.reset}
        className={toolbarButtonClassName}
        title="Reset"
      >
        <RefreshCcw className="size-5" />
      </button>
      <div className="h-5 w-px bg-white/20" />
      <button
        type="button"
        onClick={transformState.rotateLeft}
        className={toolbarButtonClassName}
        title="Rotate Left"
      >
        {toolbarInfo.icons.rotateLeftIcon}
      </button>
      <button
        type="button"
        onClick={transformState.rotateRight}
        className={toolbarButtonClassName}
        title="Rotate Right"
      >
        {toolbarInfo.icons.rotateRightIcon}
      </button>
      <div className="h-5 w-px bg-white/20" />
      <button
        type="button"
        onClick={transformState.flipHorizontal}
        className={toolbarButtonClassName}
        title="Flip Horizontal"
      >
        {toolbarInfo.icons.flipXIcon}
      </button>
      <button
        type="button"
        onClick={transformState.flipVertical}
        className={toolbarButtonClassName}
        title="Flip Vertical"
      >
        {toolbarInfo.icons.flipYIcon}
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") goto(-1);
          if (event.key === "ArrowRight") goto(1);
        }}
        onClick={(event) => {
          if (resolvedMask.closable && event.target === event.currentTarget) {
            onOpenChange(false);
          }
        }}
        className={cn(
          "m-0 flex h-screen w-screen max-w-none flex-col items-center justify-center overflow-hidden border-none p-0 shadow-none sm:max-w-none",
          resolvedMask.enabled ? "bg-black/70" : "bg-transparent",
          resolvedMask.blur && "backdrop-blur-sm",
        )}
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>

        <div
          className="flex h-full w-full items-center justify-center px-4 py-20 md:px-20"
          onClick={(event) => {
            if (resolvedMask.closable && event.target === event.currentTarget) {
              onOpenChange(false);
            }
          }}
        >
          {imageRender
            ? imageRender(originalImage, {
                transform: transformState.transform,
                image: imageInfo,
                current,
              })
            : originalImage}
        </div>

        <div className="absolute top-4 left-4 flex h-10 items-center rounded-full border border-white/10 bg-black/30 px-4 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md md:top-6 md:left-6">
          {countRender
            ? countRender(current + 1, total)
            : `${current + 1} / ${total}`}
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white md:top-6 md:right-6"
        >
          {closeIcon ?? <X className="size-5" />}
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goto(-1)}
              aria-label="Previous image"
              className="absolute left-4 flex size-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-white/20 sm:left-8"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => goto(1)}
              aria-label="Next image"
              className="absolute right-4 flex size-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-white/20 sm:right-8"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-6 flex justify-center md:bottom-8">
          {actionsRender
            ? actionsRender(originalToolbar, toolbarInfo)
            : originalToolbar}
        </div>
      </DialogContent>
    </Dialog>
  );
}
