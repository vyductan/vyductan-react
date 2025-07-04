import { memo, useState } from "react";

import { cn } from "@acme/ui/lib/utils";

import { Skeleton } from "../skeleton";
import { ImagePlaceholderSrc } from "./placeholder";

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  preview?: boolean;
  placeholder?: React.ReactNode;
};
const Image = memo(function Image({
  src,
  width,
  height,
  // quality,

  fallback: fallbackProp,

  preview,
  placeholder = <Skeleton className={cn("size-full")} />,

  className,

  ...props
}: Omit<ImageProps, "src"> & {
  src?: string;
  bucket?: string;
  // width?: number;
  // height?: number;
  quality?: number;
  fallback?: string;
}) {
  const fallback = fallbackProp ?? ImagePlaceholderSrc;

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
  };

  const handlePreview = () => {
    if (preview) {
      setPreviewOpen(true);
    }
  };

  return (
    <>
      <div style={{ width, height }} className={cn("relative", className)}>
        {!loaded && placeholder && (
          <div className="absolute inset-0">{placeholder}</div>
        )}
        {!error && (
          <img
            src={src}
            // alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={handlePreview}
            className={`cursor-pointer ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ transition: "opacity 0.3s" }}
            {...props}
          />
        )}
        {error && fallback && (
          <img
            src={fallback}
            alt="fallback"
            className="cursor-pointer"
            onClick={handlePreview}
          />
        )}
        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setPreviewOpen(false)}
          >
            <img
              src={error && fallback ? fallback : src}
              // alt={alt}
              className="max-h-full max-w-full"
            />
          </div>
        )}
        {/* <img
          src={error ? fallback : src || fallback}
          sizes={width ? `${width}px` : undefined}
          onError={setError}
          className={cn(loading ? "hidden" : undefined)}
          {...props}
        />
        <Skeleton className={cn("size-full", loading ? undefined : "hidden")} /> */}
      </div>
    </>
  );
});

export type { ImageProps };
export { Image };
