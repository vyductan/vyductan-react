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

/*
 * One promise per source for "resolved URL, and that URL loaded", handed to
 * use() on EVERY render.
 *
 * React 19 requires use() to be called the same way on the render that
 * resumes after a suspension as on the one that suspended. The old hook
 * called use() only while the resolver's answer was missing from the cache,
 * so the resumed render — answer now cached — skipped it, and React reported
 * "called use() to suspend in a previous render but did not call use() when
 * it finished" on every pasted image.
 *
 * The promise is cached so every render hands use() the same object; React
 * reads its settled state off the object instead of suspending again.
 */
const imagePromiseCache = new Map<string, Promise<string>>();

function imagePromise(
  source: string,
  resolveImage: ((source_: string) => Promise<string>) | null | undefined,
): Promise<string> {
  const cached = imagePromiseCache.get(source);
  if (cached) return cached;

  const resolvedUrl = resolveImage ? resolvedUrlCache.get(source) : source;

  let promise: Promise<string>;
  if (resolvedUrl !== undefined && loadedImageCache.has(resolvedUrl)) {
    /*
     * Already resolved and loaded (preloadImage on paste, or an earlier
     * mount). Handed over pre-settled — the fields React itself writes on a
     * thenable — so a remount draws the image at once instead of suspending
     * for a microtask and flashing the fallback.
     */
    promise = Object.assign(Promise.resolve(resolvedUrl), {
      status: "fulfilled" as const,
      value: resolvedUrl,
    });
  } else {
    promise = (
      resolveImage
        ? resolvedUrl === undefined
          ? resolveUrl(source, resolveImage)
          : Promise.resolve(resolvedUrl)
        : Promise.resolve(source)
    ).then(async (url) => {
      await loadImage(url);
      return url;
    });
  }

  imagePromiseCache.set(source, promise);
  return promise;
}

function resolveUrl(
  source: string,
  resolveImage: (source_: string) => Promise<string>,
): Promise<string> {
  let pending = pendingResolutionCache.get(source);
  if (!pending) {
    pending = resolveImage(source).then((resolvedUrl) => {
      resolvedUrlCache.set(source, resolvedUrl);
      pendingResolutionCache.delete(source);
      return resolvedUrl;
    });
    pendingResolutionCache.set(source, pending);
  }
  return pending;
}

/**
 * The URL to draw for `source`, suspending until it is resolved (when an
 * ImageResolver is provided) and loaded. A failed load throws its error to
 * the nearest error boundary, as before.
 */
export function useSuspenseImage(source: string): string {
  const resolveImage = useImageResolver();
  return use(imagePromise(source, resolveImage));
}

export function clearImageCache(source: string) {
  const effectiveSource = resolvedUrlCache.get(source) ?? source;

  // Clear the mapping from src to signed URL
  imagePromiseCache.delete(source);
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
    await resolveUrl(source, resolver);
  }

  // 2. Load the image (using resolved URL from cache if available)
  const effectiveSource = resolvedUrlCache.get(source) ?? source;
  return loadImage(effectiveSource);
}
