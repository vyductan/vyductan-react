import { use } from "react";

import { useImageResolver } from "../context/image-resolver-context";

const loadedImageCache = new Set<string>();
const pendingImageCache = new Map<string, Promise<void>>();
const failedImageCache = new Map<string, Error>();
const resolvedUrlCache = new Map<string, string>();
const pendingResolutionCache = new Map<string, Promise<string>>();

function loadImage(src: string): Promise<void> {
  const effectiveSrc = resolvedUrlCache.get(src) ?? src;

  if (loadedImageCache.has(effectiveSrc)) {
    return Promise.resolve();
  }

  const failed = failedImageCache.get(effectiveSrc);
  if (failed) {
    return Promise.reject(failed);
  }

  let pending = pendingImageCache.get(effectiveSrc);
  if (pending) {
    return pending;
  }

  pending = new Promise((resolve, reject) => {
    const img = new Image();

    const cleanup = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };

    const onLoad = () => {
      cleanup();
      pendingImageCache.delete(effectiveSrc);
      failedImageCache.delete(effectiveSrc);
      loadedImageCache.add(effectiveSrc);
      resolve();
    };

    const onError = () => {
      cleanup();
      pendingImageCache.delete(effectiveSrc);
      const error = new Error(`Image failed to load: ${effectiveSrc}`);
      failedImageCache.set(effectiveSrc, error);
      reject(error);
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    img.src = effectiveSrc;
  });

  pendingImageCache.set(effectiveSrc, pending);
  return pending;
}

export function useSuspenseImage(src: string) {
  const resolveImage = useImageResolver();

  // If no resolver, we just use the src as is (default behavior)
  const effectiveSrc = resolveImage ? (resolvedUrlCache.get(src) ?? src) : src;

  // If we have a resolver and haven't resolved yet
  if (resolveImage && !resolvedUrlCache.has(src)) {
    // Check if resolution is pending
    const pendingResolution = pendingResolutionCache.get(src);
    if (pendingResolution) {
      use(pendingResolution);
    }

    // Start resolving
    const promise = resolveImage(src).then((resolvedUrl) => {
      resolvedUrlCache.set(src, resolvedUrl);
      pendingResolutionCache.delete(src);
      return resolvedUrl;
    });

    pendingResolutionCache.set(src, promise);

    use(promise);
  }

  // Now effectiveSrc is the resolved URL (or original if no resolver)
  const promise = loadImage(effectiveSrc);
  if (
    !loadedImageCache.has(effectiveSrc) &&
    !failedImageCache.has(effectiveSrc)
  ) {
    throw promise;
  } else if (failedImageCache.has(effectiveSrc)) {
    throw (
      failedImageCache.get(effectiveSrc) ??
      new Error(`Image failed to load: ${effectiveSrc}`)
    );
  }

  // Return effectiveSrc to ensure we return string even if use returns void (fulfilled)
  return effectiveSrc;
}

export function clearImageCache(src: string) {
  const effectiveSrc = resolvedUrlCache.get(src) ?? src;

  // Clear the mapping from src to signed URL
  resolvedUrlCache.delete(src);
  pendingResolutionCache.delete(src);

  // Clear the loading/failure state for the signed URL
  failedImageCache.delete(effectiveSrc);
  pendingImageCache.delete(effectiveSrc);
  loadedImageCache.delete(effectiveSrc);
}

export async function preloadImage(
  src: string,
  resolver?: (src: string) => Promise<string>,
): Promise<void> {
  // 1. Resolve URL if resolver provided and not already resolved
  if (resolver && !resolvedUrlCache.has(src)) {
    // Check pending resolution
    let resolutionPromise = pendingResolutionCache.get(src);
    if (!resolutionPromise) {
      resolutionPromise = resolver(src).then((resolvedUrl) => {
        resolvedUrlCache.set(src, resolvedUrl);
        pendingResolutionCache.delete(src);
        return resolvedUrl;
      });
      pendingResolutionCache.set(src, resolutionPromise);
    }
    await resolutionPromise;
  }

  // 2. Load the image (using resolved URL from cache if available)
  const effectiveSrc = resolvedUrlCache.get(src) ?? src;
  return loadImage(effectiveSrc);
}
