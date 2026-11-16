import { act, startTransition, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageResolverProvider } from "../context/image-resolver-context";
import {
  clearImageCache,
  preloadImage,
  useSuspenseImage,
} from "./use-suspense-image";

/*
 * Every render of a component that reads an image must call use() — the rule
 * the warning enforces. The check itself lives only in the React canary that
 * Next ships (next/dist/compiled/react-dom), not in the react-dom these tests
 * run, so it is asserted directly: renders counted, use() calls counted.
 */
const counts = vi.hoisted(() => ({ uses: 0 }));
const rendered = vi.fn();
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    use: ((usable: Parameters<typeof actual.use>[0]) => {
      counts.uses += 1;
      return actual.use(usable);
    }) as typeof actual.use,
  };
});

/*
 * React 19 checks that a component which suspended on use() calls use() again
 * when it resumes. The hook used to call it only while the resolver's answer
 * was missing from its cache — so the resumed render, answer now cached,
 * skipped it, and every pasted image logged "This library called use() to
 * suspend in a previous render but did not call use() when it finished".
 */

// jsdom never loads images; this one "loads" on the next tick.
class InstantImage {
  private listeners: Record<string, (() => void)[]> = {};
  addEventListener(type: string, listener: () => void) {
    (this.listeners[type] ??= []).push(listener);
  }
  removeEventListener() {}
  set src(_: string) {
    setTimeout(() => this.listeners.load?.forEach((l) => l()), 0);
  }
}

const Shown = ({ src }: { src: string }) => {
  rendered();
  return <img data-testid="img" src={useSuspenseImage(src)} alt="" />;
};

let container: HTMLDivElement;
let errors: ReturnType<typeof vi.spyOn>;
const sources: string[] = [];

const render = async (
  src: string,
  resolver?: (source: string) => Promise<string>,
) => {
  sources.push(src);
  const root = createRoot(container);
  // A transition, as an editor update is: only a concurrent render waits on
  // a promise that settles in a microtask and REPLAYS the component — the
  // render the warning is about. A sync render goes straight to the fallback.
  await act(async () => {
    startTransition(() => {
      root.render(
        <ImageResolverProvider value={resolver}>
          <Suspense fallback={<span data-testid="fallback" />}>
            <Shown src={src} />
          </Suspense>
        </ImageResolverProvider>,
      );
    });
  });
  // Resolver, then the image load, then React retrying the boundary.
  for (let i = 0; i < 5; i++)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  return root;
};

/** Renders that reached the end without calling use(). Must be none. */
const conditionalUseWarnings = () =>
  counts.uses >= rendered.mock.calls.length
    ? []
    : [`${rendered.mock.calls.length} renders, ${counts.uses} use() calls`];

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("Image", InstantImage);
  errors = vi.spyOn(console, "error").mockImplementation(() => {});
  rendered.mockClear();
  counts.uses = 0;
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(() => {
  container.remove();
  errors.mockRestore();
  vi.unstubAllGlobals();
  for (const src of sources.splice(0)) clearImageCache(src);
});

describe("useSuspenseImage", () => {
  it("resumes after the resolver answers without a conditional use() warning", async () => {
    const resolver = vi.fn(async (s: string) => `${s}?signed=1`);
    const root = await render("/files/pasted.png", resolver);

    expect(
      container.querySelector('[data-testid="img"]')?.getAttribute("src"),
    ).toBe("/files/pasted.png?signed=1");
    expect(conditionalUseWarnings()).toEqual([]);
    expect(resolver).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
  });

  it("finishes the replayed render cleanly when the resolved image is already loaded", async () => {
    // The pasted-image path that logged the error: the resolver has not
    // answered for this src yet, but the URL it answers with was loaded
    // moments ago (the upload's preload). The render suspends on the
    // resolver, React replays it, and the replay finishes — the old hook got
    // there without calling use().
    await preloadImage("/files/pasted-2.png?signed=3");
    sources.push("/files/pasted-2.png?signed=3");
    const resolver = async (s: string) => `${s}?signed=3`;

    const root = await render("/files/pasted-2.png", resolver);

    expect(
      container.querySelector('[data-testid="img"]')?.getAttribute("src"),
    ).toBe("/files/pasted-2.png?signed=3");
    expect(conditionalUseWarnings()).toEqual([]);
    act(() => root.unmount());
  });

  it("draws without a resolver", async () => {
    const root = await render("/plain.png");

    expect(
      container.querySelector('[data-testid="img"]')?.getAttribute("src"),
    ).toBe("/plain.png");
    expect(conditionalUseWarnings()).toEqual([]);
    act(() => root.unmount());
  });

  it("draws a preloaded image on the first render, never the fallback", async () => {
    // The paste path: drag-drop-paste-plugin preloads the uploaded URL
    // before inserting the node.
    const resolver = async (s: string) => `${s}?signed=2`;
    await preloadImage("/files/preloaded.png", resolver);
    sources.push("/files/preloaded.png");

    const root = createRoot(container);
    act(() => {
      root.render(
        <ImageResolverProvider value={resolver}>
          <Suspense fallback={<span data-testid="fallback" />}>
            <Shown src="/files/preloaded.png" />
          </Suspense>
        </ImageResolverProvider>,
      );
    });

    expect(container.querySelector('[data-testid="fallback"]')).toBeNull();
    expect(
      container.querySelector('[data-testid="img"]')?.getAttribute("src"),
    ).toBe("/files/preloaded.png?signed=2");
    act(() => root.unmount());
  });
});
