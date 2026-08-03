import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, test } from "vitest";

import { hasOpenDialogAbove } from "./_components";

// A vaul Drawer and the app's radix-ui Modal live in SEPARATE DismissableLayer
// stacks, so dismissing a stacked Modal via Escape/outside would also collapse
// the Drawer. `hasOpenDialogAbove` is the guard: while a Radix dialog is open,
// the Drawer must not self-dismiss.
function add(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  const node = el.firstElementChild as HTMLElement;
  document.body.append(node);
  return node;
}

afterEach(() => document.body.replaceChildren());

describe("hasOpenDialogAbove", () => {
  test("no dialog → false (drawer dismisses normally)", () => {
    expect(hasOpenDialogAbove()).toBe(false);
  });

  test("only the drawer itself → false", () => {
    add("<div data-slot='drawer-content' data-state='open'></div>");
    expect(hasOpenDialogAbove()).toBe(false);
  });

  test("open Modal stacked above → true (drawer stays)", () => {
    add("<div data-slot='dialog-content' data-state='open'></div>");
    expect(hasOpenDialogAbove()).toBe(true);
  });

  test("open AlertModal stacked above → true (drawer stays)", () => {
    add("<div data-slot='alert-dialog-content' data-state='open'></div>");
    expect(hasOpenDialogAbove()).toBe(true);
  });

  test("a dialog that is closing (data-state=closed) → false", () => {
    add("<div data-slot='dialog-content' data-state='closed'></div>");
    expect(hasOpenDialogAbove()).toBe(false);
  });
});
