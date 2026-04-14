import { use } from "react";

import { useImageResolver } from "../context/image-resolver-context";

const loadedImageCache = new Set<string>();
const pendingImageCache = new Map<string, Promise<void>>();
const failedImageCache = new Map<string, Error>();
const resolvedUrlCache = new Map<string, string>();
const pendingResolutionCache = new Map<string, Promise<string>>();

function loadImage(source: string): Promise<void> {
  const effectiveSource = resolvedUrlCache.get(source) ?? source;

  if (loadedImageCache.has(effectiveSource)) {
    return Promise.resolve();
  }

  const failed = failedImageCache.get(effectiveSource);
  if (failed) {
    return Promise.reject(failed);
  }

  let pending = pendingImageCache.get(effectiveSource);
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
      pendingImageCache.delete(effectiveSource);
      failedImageCache.delete(effectiveSource);
      loadedImageCache.add(effectiveSource);
      resolve();
    };

    const onError = () => {
      cleanup();
      pendingImageCache.delete(effectiveSource);
      const error = new Error(`Image failed to load: ${effectiveSource}`);
      failedImageCache.set(effectiveSource, error);
      reject(error);
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    img.src = effectiveSource;
  });

  pendingImageCache.set(effectiveSource, pending);
  return pending;
}

export function useSuspenseImage(source: string) {
  const resolveImage = useImageResolver();

  // If no resolver, we just use the src as is (default behavior)
  const effectiveSource = resolveImage ? (resolvedUrlCache.get(source) ?? source) : source;

  // If we have a resolver and haven't resolved yet
  if (resolveImage && !resolvedUrlCache.has(source)) {
    // Check if resolution is pending
    const pendingResolution = pendingResolutionCache.get(source);
    if (pendingResolution) {
      use(pendingResolution);
    }

    // Start resolving
    const promise = resolveImage(source).then((resolvedUrl) => {
      resolvedUrlCache.set(source, resolvedUrl);
      pendingResolutionCache.delete(source);
      return resolvedUrl;
    });

    pendingResolutionCache.set(source, promise);

    use(promise);
  }

  // Now effectiveSrc is the resolved URL (or original if no resolver)
  const promise = loadImage(effectiveSource);
  if (
    !loadedImageCache.has(effectiveSource) &&
    !failedImageCache.has(effectiveSource)
  ) {
    throw promise;
  } else if (failedImageCache.has(effectiveSource)) {
    throw (
      failedImageCache.get(effectiveSource) ??
      new Error(`Image failed to load: ${effectiveSource}`)
    );
  }

  // Return effectiveSrc to ensure we return string even if use returns void (fulfilled)
  return effectiveSource;
}

export function clearImageCache(source: string) {
  const effectiveSource = resolvedUrlCache.get(source) ?? source;

  // Clear the mapping from src to signed URL
  resolvedUrlCache.delete(source);
  pendingResolutionCache.delete(source);

  // Clear the loading/failure state for the signed URL
  failedImageCache.delete(effectiveSource);
  pendingImageCache.delete(effectiveSource);
  loadedImageCache.delete(effectiveSource);
}

export async function preloadImage(
  source: string,
  resolver?: (source_: string) => Promise<string>,
): Promise<void> {
  // 1. Resolve URL if resolver provided and not already resolved
  if (resolver && !resolvedUrlCache.has(source)) {
    // Check pending resolution
    let resolutionPromise = pendingResolutionCache.get(source);
    if (!resolutionPromise) {
      resolutionPromise = resolver(source).then((resolvedUrl) => {
        resolvedUrlCache.set(source, resolvedUrl);
        pendingResolutionCache.delete(source);
        return resolvedUrl;
      });
      pendingResolutionCache.set(source, resolutionPromise);
    }
    await resolutionPromise;
  }

  // 2. Load the image (using resolved URL from cache if available)
  const effectiveSource = resolvedUrlCache.get(source) ?? source;
  return loadImage(effectiveSource);
}
