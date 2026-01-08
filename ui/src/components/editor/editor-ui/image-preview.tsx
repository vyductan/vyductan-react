import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

import {
  clearImageCache,
  useSuspenseImage,
} from "../editor-hooks/use-suspense-image";

interface ImagePreviewProps {
  src: string;
  altText?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePreview({
  src,
  altText,
  isOpen,
  onClose,
}: ImagePreviewProps) {
  // Only call hook if isOpen is true to avoid suspending when closed?
  // But hooks must be called unconditionally.
  // We can pass null/undefined to hook if we want to skip?
  // or we can just call it.
  // If isOpen is false, we return null early (line 101).
  // But hooks run before that return.
  // If we call useSuspenseImage(src) even when closed, it will pre-load/resolve the image.
  // This is actually good! It means the preview is ready.
  // But wait, if we have many images on page, we don't want to load *high res* or *preview versions* for all of them?
  // `src` passed to ImagePreview is the same `src` as ImageComponent.
  // So it's already resolved by ImageComponent's LazyImage.
  // So calling it here hits the cache.
  // So it's cheap.

  const resolvedSrc = useSuspenseImage(src);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setScale((s) => Math.min(Math.max(s + delta, 0.5), 5));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Toolbar */}
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/50 p-1 text-white backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-12 text-center text-xs font-medium">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20"
          onClick={onClose}
          title="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Image Container */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <picture>
          <img
            src={resolvedSrc}
            alt={altText}
            className={cn(
              "max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-75",
              isDragging ? "cursor-grabbing" : "cursor-grab",
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            draggable={false}
            onError={() => {
              if (retryCount < 1) {
                clearImageCache(src);
                setRetryCount((prev) => prev + 1);
              }
            }}
          />
        </picture>
      </div>
    </div>,
    document.body,
  );
}
