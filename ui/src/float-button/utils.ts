import raf from "rc-util/lib/raf";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export function isWindow(object: any): object is Window {
  return object !== null && object !== undefined && object === object.window;
}

export function getScrollTarget(
  target: HTMLElement | Window | Document | null,
  top: boolean,
): number {
  // eslint-disable-next-line unicorn/prefer-global-this
  if (typeof window === "undefined") {
    return 0;
  }
  const method = top ? "scrollTop" : "scrollLeft";
  let result = 0;
  if (isWindow(target)) {
    result = target[top ? "pageYOffset" : "pageXOffset"];
  } else if (target instanceof Document) {
    result = target.documentElement[method];
  } else if (target instanceof HTMLElement) {
    result = target[method];
  }
  // else if (target) {
  //   // According to the type inference, the `target` is `never` type.
  //   // Since we configured the loose mode type checking, and supports mocking the target with such shape below::
  //   //    `{ documentElement: { scrollLeft: 200, scrollTop: 400 } }`,
  //   //    the program may falls into this branch.
  //   // Check the corresponding tests for details. Don't sure what is the real scenario this happens.
  //   result = target[method];
  // }

  if (target && !isWindow(target) && typeof result !== "number") {
    result = (target.ownerDocument ?? target).documentElement[method];
  }
  return result;
}

interface ScrollToOptions {
  /** Scroll container, default as window */
  getContainer?: () => HTMLElement | Window | Document;
  /** Scroll end callback */
  callback?: () => void;
  /** Animation duration, default as 450 */
  duration?: number;
}

export function scrollTo(y: number, options: ScrollToOptions = {}) {
  // eslint-disable-next-line unicorn/prefer-global-this
  const { getContainer = () => window, callback, duration = 450 } = options;
  const container = getContainer();
  const scrollTop = getScrollTarget(container, true);
  const startTime = Date.now();

  const frameFunction = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(
      Math.min(time, duration),
      scrollTop,
      y,
      duration,
    );
    if (isWindow(container)) {
      container.scrollTo(window.scrollX, nextScrollTop);
    } else if (
      container instanceof Document ||
      container.constructor.name === "HTMLDocument"
    ) {
      (container as Document).documentElement.scrollTop = nextScrollTop;
    } else {
      container.scrollTop = nextScrollTop;
    }
    if (time < duration) {
      raf(frameFunction);
    } else if (typeof callback === "function") {
      callback();
    }
  };
  raf(frameFunction);
}

export function easeInOutCubic(t: number, b: number, c: number, d: number) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return (cc / 2) * t * t * t + b;
  }
  return (cc / 2) * ((t -= 2) * t * t + 2) + b;
}
