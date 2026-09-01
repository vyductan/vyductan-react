import { afterEach, describe, expect, test } from "vitest";

import {
  hasEscapeClaimantAfter,
  hasModalLayerAfter,
  hasOpenDialog,
} from "./modal-layers";

function add(html: string) {
  const host = document.createElement("div");
  host.innerHTML = html;
  const node = host.firstElementChild as HTMLElement;
  document.body.append(node);
  return node;
}

const popover = "<div data-slot='popover-content' data-state='open'></div>";
const drawer = "<div data-slot='drawer-content' data-state='open'></div>";
const dialog = "<div data-slot='dialog-content' data-state='open'></div>";

afterEach(() => document.body.replaceChildren());

describe("hasOpenDialog", () => {
  test("false with nothing open, true for dialog and alert-dialog", () => {
    expect(hasOpenDialog()).toBe(false);

    add(dialog);
    expect(hasOpenDialog()).toBe(true);

    document.body.replaceChildren();
    add("<div data-slot='alert-dialog-content' data-state='open'></div>");
    expect(hasOpenDialog()).toBe(true);
  });

  test("a drawer is not a dialog — the Drawer guard must not gate on itself", () => {
    add(drawer);
    expect(hasOpenDialog()).toBe(false);
  });

  test("a closing dialog does not count", () => {
    add("<div data-slot='dialog-content' data-state='closed'></div>");
    expect(hasOpenDialog()).toBe(false);
  });
});

describe("hasModalLayerAfter", () => {
  test("a drawer that opened AFTER the popover is above it", () => {
    const content = add(popover);
    add(drawer);

    expect(hasModalLayerAfter(content)).toBe(true);
  });

  // The distinction the old store-based check could not make: a popover opened
  // from inside a drawer must still dismiss on outside clicks.
  test("a drawer that was already open is NOT above the popover", () => {
    add(drawer);
    const content = add(popover);

    expect(hasModalLayerAfter(content)).toBe(false);
  });

  test("a layer that contains the popover is never 'above' it", () => {
    const drawerNode = add(drawer);
    const content = document.createElement("div");
    content.dataset.slot = "popover-content";
    drawerNode.append(content);

    expect(hasModalLayerAfter(content)).toBe(false);
  });

  test("dialogs and alert-dialogs count too", () => {
    const content = add(popover);
    add(dialog);

    expect(hasModalLayerAfter(content)).toBe(true);
  });

  test("a closed layer above does not count", () => {
    const content = add(popover);
    add("<div data-slot='drawer-content' data-state='closed'></div>");

    expect(hasModalLayerAfter(content)).toBe(false);
  });

  test("no node, no guard", () => {
    add(drawer);
    expect(hasModalLayerAfter(null)).toBe(false);
    expect(hasModalLayerAfter(undefined)).toBe(false);
  });
});

// The gap reported from the operator dashboard: the single click that dismisses
// a Drawer is also the Popover's outside pointer-down, and the Drawer resolves
// it first — flipping `data-state` to "closed", or leaving the DOM, before the
// Popover's handler gets to ask. A live `data-state` read loses that race; the
// pre-dismiss snapshot does not.
describe("hasModalLayerAfter during the click that dismisses the layer", () => {
  function pointerDownOnDocument() {
    const event = new Event("pointerdown", { bubbles: true });
    document.dispatchEvent(event);
    return event;
  }

  test("holds when the layer above flips itself to closed mid-event", () => {
    const content = add(popover);
    const layer = add(drawer);

    const event = pointerDownOnDocument();
    layer.dataset.state = "closed"; // what the drawer's own dismiss does

    expect(hasModalLayerAfter(content, event)).toBe(true);
    // Without the event, the same question now answers "nothing above me".
    expect(hasModalLayerAfter(content)).toBe(false);
  });

  test("holds when the layer above leaves the DOM mid-event", () => {
    const content = add(popover);
    const layer = add(drawer);

    const event = pointerDownOnDocument();
    layer.remove();

    expect(hasModalLayerAfter(content, event)).toBe(true);
  });

  test("does not invent a guard when nothing was above at click time", () => {
    const content = add(popover);

    const event = pointerDownOnDocument();
    add(drawer); // opened after the click — not this event's business

    expect(hasModalLayerAfter(content, event)).toBe(false);
  });

  test("a drawer that already contained the popover stays unguarded", () => {
    const layer = add(drawer);
    const content = document.createElement("div");
    content.dataset.slot = "popover-content";
    content.dataset.state = "open";
    layer.append(content);

    const event = pointerDownOnDocument();

    expect(hasModalLayerAfter(content, event)).toBe(false);
  });

  test("an unrelated event falls back to the live reading", () => {
    const content = add(popover);
    add(drawer);

    expect(hasModalLayerAfter(content, new Event("pointerdown"))).toBe(true);
  });
});

// Radix couples "this layer stays" with "nobody else acts" — dismissing marks
// the keydown default-prevented — so the Drawer takes Escape itself and needs
// to know when something above it should get the key instead.
describe("hasEscapeClaimantAfter", () => {
  test("a popover parked BEHIND the drawer does not claim Escape", () => {
    const parked = add(popover);
    const drawerNode = add(drawer);

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(false);
    expect(parked.dataset.state).toBe("open");
  });

  test("a popover opened INSIDE/after the drawer claims it", () => {
    const drawerNode = add(drawer);
    add(popover);

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(true);
  });

  test("a select opened in the drawer claims it", () => {
    const drawerNode = add(drawer);
    add("<div data-slot='select-content' data-state='open'></div>");

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(true);
  });

  test("a closed panel above claims nothing", () => {
    const drawerNode = add(drawer);
    add("<div data-slot='select-content' data-state='closed'></div>");

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(false);
  });

  test("a dialog stacked on the drawer claims it", () => {
    const drawerNode = add(drawer);
    add(dialog);

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(true);
  });

  test("nothing open, nothing claimed", () => {
    const drawerNode = add(drawer);

    expect(hasEscapeClaimantAfter(drawerNode)).toBe(false);
    expect(hasEscapeClaimantAfter(null)).toBe(false);
  });
});
