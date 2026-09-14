import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, test } from "vitest";

import { hasOpenDialogAbove } from "./_components";

// A vaul Drawer and the app's radix-ui Modal live in SEPARATE DismissableLayer
// stacks, so dismissing a stacked Modal via Escape/outside would also collapse
// the Drawer. `hasOpenDialogAbove` is the guard: while a Radix dialog is open
// ABOVE the Drawer, the Drawer must not self-dismiss.
//
// "Above" has to be read from document order. Answering yes to any open dialog
// also catches the dialog a Drawer was opened FROM — and since every close path
// runs through this guard, such a Drawer cannot be closed at all.
function add(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  const node = el.firstElementChild as HTMLElement;
  document.body.append(node);
  return node;
}

const panel = "<div data-slot='drawer-content' data-state='open'></div>";
const dialog = "<div data-slot='dialog-content' data-state='open'></div>";
const alertDialog =
  "<div data-slot='alert-dialog-content' data-state='open'></div>";

afterEach(() => document.body.replaceChildren());

describe("hasOpenDialogAbove", () => {
  test("no dialog → false (drawer dismisses normally)", () => {
    const drawer = add(panel);

    expect(hasOpenDialogAbove(drawer)).toBe(false);
  });

  test("only the drawer itself → false", () => {
    const drawer = add(panel);

    expect(hasOpenDialogAbove(drawer)).toBe(false);
  });

  test("Modal opened from inside the drawer → true (drawer stays)", () => {
    const drawer = add(panel);
    add(dialog);

    expect(hasOpenDialogAbove(drawer)).toBe(true);
  });

  test("AlertModal opened from inside the drawer → true (drawer stays)", () => {
    const drawer = add(panel);
    add(alertDialog);

    expect(hasOpenDialogAbove(drawer)).toBe(true);
  });

  // The case a dialog-anywhere check gets wrong: here the dialog is what opened
  // the drawer, so it is BELOW it and must not block the drawer's own close.
  test("drawer opened from inside a Modal → false (drawer still closes)", () => {
    add(dialog);
    const drawer = add(panel);

    expect(hasOpenDialogAbove(drawer)).toBe(false);
  });

  test("a dialog that is closing (data-state=closed) → false", () => {
    const drawer = add(panel);
    add("<div data-slot='dialog-content' data-state='closed'></div>");

    expect(hasOpenDialogAbove(drawer)).toBe(false);
  });

  test("without a panel it falls back to dialog-anywhere", () => {
    expect(hasOpenDialogAbove(null)).toBe(false);

    add(dialog);
    expect(hasOpenDialogAbove(null)).toBe(true);
  });
});
