import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { AlertModal } from "./alert-modal";

globalThis.React = React;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
  document.body.style.userSelect = "";
});

const content = () =>
  document.querySelector<HTMLElement>("[data-slot='alert-dialog-content']")!;
const overlay = () =>
  document.querySelector<HTMLElement>("[data-slot='alert-dialog-overlay']")!;

function open() {
  render(
    <AlertModal
      open
      title="Delete item"
      description="This action cannot be undone."
      okText="Delete"
      cancelText="Cancel"
    />,
  );
}

/**
 * The selection containment is keyed by `data-slot`, so the regression it guards
 * against is the alert family silently not opting in: a drag that starts on the
 * content and strays past its (short — ~156px) box collapses the selection to
 * "\n" and copy comes back empty. jsdom can't do a real selection, so assert the
 * mechanism instead: body locked + overlay muted for the length of the gesture.
 */
describe("AlertModal text selection", () => {
  test("content and its text opt into selection", () => {
    open();
    expect(content()).toHaveClass("select-text");
    expect(
      document.querySelector("[data-slot='alert-dialog-title']"),
    ).toHaveClass("select-text");
    expect(
      document.querySelector("[data-slot='alert-dialog-description']"),
    ).toHaveClass("select-text");
    // Header itself is not selectable — keeps grid gaps out of the copy.
    expect(
      document.querySelector("[data-slot='alert-dialog-header']"),
    ).toHaveClass("select-none");
  });

  test("a drag locks the page and mutes the overlay, then restores", () => {
    open();
    const title = document.querySelector("[data-slot='alert-dialog-title']")!;
    // Radix (DismissableLayer) puts an inline `pointer-events` on its own
    // overlay — restoring means going back to THAT, not to empty.
    const overlayBaseline = overlay().style.pointerEvents;

    // pointerdown only ARMS: locking here would shift the anchor the browser
    // computes for this mousedown and drop the first character.
    fireEvent.pointerDown(title, { button: 0 });
    expect(document.body.style.userSelect).toBe("");

    fireEvent.pointerMove(title, { buttons: 1 });
    expect(document.body.style.userSelect).toBe("none");
    expect(overlay().style.pointerEvents).toBe("none");

    fireEvent.pointerUp(title, { button: 0 });
    expect(document.body.style.userSelect).toBe("");
    expect(overlay().style.pointerEvents).toBe(overlayBaseline);
  });

  test("a click without moving never locks the page", () => {
    open();
    const title = document.querySelector("[data-slot='alert-dialog-title']")!;

    fireEvent.pointerDown(title, { button: 0 });
    fireEvent.pointerUp(title, { button: 0 });
    expect(document.body.style.userSelect).toBe("");
  });

  test("a drag started on a button is not treated as a selection drag", () => {
    open();
    const cancel = document.querySelector("[data-slot='alert-dialog-cancel']")!;
    const overlayBaseline = overlay().style.pointerEvents;

    fireEvent.pointerDown(cancel, { button: 0 });
    fireEvent.pointerMove(cancel, { buttons: 1 });
    expect(document.body.style.userSelect).toBe("");
    expect(overlay().style.pointerEvents).toBe(overlayBaseline);
  });

  test("a cancelled gesture still releases the lock", () => {
    open();
    fireEvent.pointerDown(content(), { button: 0 });
    fireEvent.pointerMove(content(), { buttons: 1 });
    expect(document.body.style.userSelect).toBe("none");

    fireEvent.pointerCancel(content(), { button: 0 });
    expect(document.body.style.userSelect).toBe("");
  });
});
