/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

type Force = [number, number];
type Listener = (force: Force, e: TouchEvent) => void;
type ElementValues = {
  start: null | Force;
  listeners: Set<Listener>;
  handleTouchstart: (e: TouchEvent) => void;
  handleTouchend: (e: TouchEvent) => void;
};

const elements = new WeakMap<HTMLElement, ElementValues>();

function readTouch(e: TouchEvent): [number, number] | null {
  const touch = e.changedTouches[0];
  if (touch === undefined) {
    return null;
  }
  return [touch.clientX, touch.clientY];
}

function addListener(element: HTMLElement, callback: Listener): () => void {
  let elementValues = elements.get(element);
  if (elementValues === undefined) {
    const listeners = new Set<Listener>();
    const handleTouchstart = (e: TouchEvent) => {
      if (elementValues !== undefined) {
        elementValues.start = readTouch(e);
      }
    };
    const handleTouchend = (e: TouchEvent) => {
      if (elementValues === undefined) {
        return;
      }
      const start = elementValues.start;
      if (start === null) {
        return;
      }
      const end = readTouch(e);
      for (const listener of listeners) {
        if (end !== null) {
          listener([end[0] - start[0], end[1] - start[1]], e);
        }
      }
    };
    element.addEventListener("touchstart", handleTouchstart);
    element.addEventListener("touchend", handleTouchend);

    elementValues = {
      handleTouchend,
      handleTouchstart,
      listeners,
      start: null,
    };
    elements.set(element, elementValues);
  }
  elementValues.listeners.add(callback);
  return () => deleteListener(element, callback);
}

function deleteListener(element: HTMLElement, callback: Listener): void {
  const elementValues = elements.get(element);
  if (elementValues === undefined) {
    return;
  }
  const listeners = elementValues.listeners;
  listeners.delete(callback);
  if (listeners.size === 0) {
    elements.delete(element);
    element.removeEventListener("touchstart", elementValues.handleTouchstart);
    element.removeEventListener("touchend", elementValues.handleTouchend);
  }
}

export function addSwipeLeftListener(
  element: HTMLElement,
  callback: (_force: number, e: TouchEvent) => void,
) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (x < 0 && -x > Math.abs(y)) {
      callback(x, e);
    }
  });
}

export function addSwipeRightListener(
  element: HTMLElement,
  callback: (_force: number, e: TouchEvent) => void,
) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (x > 0 && x > Math.abs(y)) {
      callback(x, e);
    }
  });
}

export function addSwipeUpListener(
  element: HTMLElement,
  callback: (_force: number, e: TouchEvent) => void,
) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (y < 0 && -y > Math.abs(x)) {
      callback(x, e);
    }
  });
}

export function addSwipeDownListener(
  element: HTMLElement,
  callback: (_force: number, e: TouchEvent) => void,
) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (y > 0 && y > Math.abs(x)) {
      callback(x, e);
    }
  });
}
