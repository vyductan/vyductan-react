import React from "react";

import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Dialog, DialogContent, shouldKeepDialogOpen } from "./_components";

globalThis.React = React;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mirrors real Radix DOM: Dialog.Portal renders via asChild, so overlay and
// content are portaled into <body> as BARE SIBLINGS — there is no
// [data-slot='dialog-portal'] wrapper. Tests must not assume one.
function add(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  const node = el.firstElementChild as HTMLElement;
  document.body.append(node);
  return node;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("shouldKeepDialogOpen", () => {
  test("own backdrop / overlay → false (dialog closes)", () => {
    const overlay = add("<div data-slot='dialog-overlay'></div>");
    expect(shouldKeepDialogOpen(overlay)).toBe(false);
  });

  test("bare outside click → false (dialog closes)", () => {
    const el = add("<div>somewhere else</div>");
    expect(shouldKeepDialogOpen(el)).toBe(false);
  });

  test("stacked dialog content → true (stay open)", () => {
    const btn = add(
      "<div data-slot='dialog-content'><button>Confirm</button></div>",
    ).querySelector("button")!;
    expect(shouldKeepDialogOpen(btn)).toBe(true);
  });

  test("sonner toast → true (stay open)", () => {
    const toast = add("<div data-sonner-toast></div>");
    expect(shouldKeepDialogOpen(toast)).toBe(true);
  });

  test("floating content (select) → true (stay open)", () => {
    const opt = add(
      "<div data-slot='select-content'><div>Option</div></div>",
    ).querySelector("div")!;
    expect(shouldKeepDialogOpen(opt)).toBe(true);
  });

  test("non-element / null → false", () => {
    expect(shouldKeepDialogOpen(null)).toBe(false);
  });

  // Guards the assumption above against the REAL Radix DOM: render a live
  // dialog and confirm the overlay would close (predicate false) while its
  // content would keep open (predicate true). Catches a Radix DOM-shape change.
  test("against real rendered Radix DOM", () => {
    render(
      <Dialog open>
        <DialogContent>hi</DialogContent>
      </Dialog>,
    );
    const overlay = document.querySelector("[data-slot='dialog-overlay']");
    const content = document.querySelector("[data-slot='dialog-content']");
    expect(overlay).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(shouldKeepDialogOpen(overlay)).toBe(false);
    expect(shouldKeepDialogOpen(content)).toBe(true);
  });
});
