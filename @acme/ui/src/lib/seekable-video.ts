import { useEffect, useSyncExternalStore } from "react";

// Some storage backends serve video objects without honoring HTTP Range
// requests (or the file wasn't encoded with the index/moov-atom up front), so
// the browser can't seek until the whole file has downloaded — every drag on
// the scrub bar snaps back to 0. Playing back from a local blob: URL sidesteps
// that entirely, since seeking inside an already-buffered blob never needs a
// network round trip.
//
// The trade is memory: the whole file lives in RAM. The cache below is
// therefore bounded on both axes and revokes what it evicts, so a long session
// browsing many videos cannot grow without limit.

/** Files larger than this are left on the network — buffering them costs more than seeking does. */
const MAX_ENTRY_BYTES = 128 * 1024 * 1024;
/** Total budget across every cached video. */
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;

type CacheEntry = {
  objectUrl: string;
  bytes: number;
};

type InFlightRequest = {
  promise: Promise<void>;
  controller: AbortController;
  /** Number of mounted hooks still waiting; the last one to leave aborts. */
  waiters: number;
};

/** Insertion order doubles as the LRU order; a hit re-inserts at the end. */
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, InFlightRequest>();
let totalBytes = 0;

// The cache is an external mutable store, so components read it through
// `useSyncExternalStore` rather than mirroring it into their own state.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function evictUntilUnderBudget(incomingBytes: number) {
  for (const [url, entry] of cache) {
    if (totalBytes + incomingBytes <= MAX_TOTAL_BYTES) break;
    URL.revokeObjectURL(entry.objectUrl);
    cache.delete(url);
    totalBytes -= entry.bytes;
  }
}

async function download(url: string, signal: AbortSignal): Promise<void> {
  // "reload" forces a full, fresh GET instead of letting the browser satisfy
  // this from a cached *partial* response left over from the <video> tag's own
  // earlier Range request, which would truncate the blob to whatever byte range
  // happened to be cached and break seeks past that point.
  const response = await fetch(url, { cache: "reload", signal });
  if (!response.ok) return;

  // Bail before reading the body so an oversized file is never buffered.
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_ENTRY_BYTES) {
    return;
  }

  const blob = await response.blob();
  if (blob.size > MAX_ENTRY_BYTES) return;

  evictUntilUnderBudget(blob.size);
  cache.set(url, { objectUrl: URL.createObjectURL(blob), bytes: blob.size });
  totalBytes += blob.size;
  emit();
}

function startRequest(url: string): InFlightRequest {
  const controller = new AbortController();
  const request: InFlightRequest = {
    controller,
    waiters: 0,
    promise: Promise.resolve().then(() =>
      download(url, controller.signal)
        .catch(() => {
          // Keep serving the direct URL (CORS, offline, aborted, …).
        })
        .finally(() => {
          // Guard against clearing a newer request queued after this settled.
          if (inFlight.get(url) === request) inFlight.delete(url);
        }),
    ),
  };
  inFlight.set(url, request);
  return request;
}

function getServerSnapshot() {
  return undefined;
}

/**
 * Returns a local blob: URL for a video once it has downloaded, falling back to
 * the original `url` until then (and for good, if the file is too large or the
 * request fails) so something always renders.
 */
export function useSeekableVideoUrl(
  url: string | undefined,
  enabled = true,
): string | undefined {
  const objectUrl = useSyncExternalStore(
    subscribe,
    () => (url && enabled ? cache.get(url)?.objectUrl : undefined),
    getServerSnapshot,
  );

  useEffect(() => {
    if (!url || !enabled || cache.has(url)) return;

    // Share one download between every element pointing at the same source.
    const request = inFlight.get(url) ?? startRequest(url);
    request.waiters += 1;

    return () => {
      request.waiters -= 1;
      // Abort only once nobody is left waiting on this download.
      if (request.waiters <= 0 && inFlight.get(url) === request) {
        inFlight.delete(url);
        request.controller.abort();
      }
    };
  }, [url, enabled]);

  // Re-inserting on read keeps the Map's iteration order an LRU order.
  if (url && objectUrl) {
    const entry = cache.get(url);
    if (entry) {
      cache.delete(url);
      cache.set(url, entry);
    }
  }

  return objectUrl ?? url;
}

/** Drops every cached blob and revokes its URL. Exposed for tests and teardown. */
export function clearSeekableVideoCache() {
  for (const entry of cache.values()) URL.revokeObjectURL(entry.objectUrl);
  cache.clear();
  totalBytes = 0;
  emit();
}
