import React from "react";

import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Drawer, DrawerContent, DrawerRoot } from "./index";

globalThis.React = React;

describe("DrawerContent", () => {
  test("applies touch and text selection overrides with valid utility classes", () => {
    render(
      <DrawerRoot open>
        <DrawerContent data-testid="drawer-content">
          <div>Body</div>
        </DrawerContent>
      </DrawerRoot>,
    );

    const content = screen.getByTestId("drawer-content");

    expect(content).toHaveClass("touch-auto!");
    expect(content).toHaveClass("select-text!");
  });
});

describe("Drawer onClose", () => {
  afterEach(() => document.body.replaceChildren());

  test("fires when the user dismisses the drawer", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Title" onClose={onClose}>
        <div>Body</div>
      </Drawer>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // vaul fires its own `onClose` from inside `closeDrawer()`, BEFORE the open
  // state (and so `onOpenChange`) is touched — forwarding the prop straight
  // through would let a stacked Radix dialog's dismiss collapse the drawer even
  // though `hasOpenDialogAbove` blocks `onOpenChange`. Both must stay gated.
  test("stays silent while a Radix dialog is stacked above", async () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Title" onClose={onClose} onOpenChange={onOpenChange}>
        <div>Body</div>
      </Drawer>,
    );
    const dialogAbove = document.createElement("div");
    dialogAbove.dataset.slot = "dialog-content";
    dialogAbove.dataset.state = "open";
    document.body.append(dialogAbove);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("Drawer resizable", () => {
  afterEach(() => document.body.replaceChildren());

  // jsdom has no layout, so the panel reports a 0-size rect. Stub the one
  // measurement the drag reads.
  function stubPanelWidth(width: number) {
    const panel = document.querySelector<HTMLElement>(
      "[data-slot='drawer-content']",
    )!;
    panel.getBoundingClientRect = () =>
      ({ width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 }) as DOMRect;
    return panel;
  }

  function drag(grip: HTMLElement, toClientX: number) {
    // The move/up listeners are on the window, so the drag survives the pointer
    // leaving the 1.5px grip.
    const view = document.defaultView!;
    fireEvent.pointerDown(grip, { clientX: 0, clientY: 0 });
    fireEvent(
      view,
      new MouseEvent("pointermove", { clientX: toClientX, clientY: 0 }),
    );
    fireEvent(view, new MouseEvent("pointerup", {}));
  }

  test("no grip unless resizable", () => {
    render(
      <Drawer open title="Title">
        <div>Body</div>
      </Drawer>,
    );

    expect(
      document.querySelector("[data-slot='drawer-resize-handle']"),
    ).toBeNull();
  });

  test("grip opts out of vaul's drag so resizing never dismisses", () => {
    render(
      <Drawer open resizable title="Title">
        <div>Body</div>
      </Drawer>,
    );

    expect(screen.getByRole("separator", { name: "Resize drawer" })).toHaveAttribute(
      "data-vaul-no-drag",
    );
  });

  test("dragging left grows a right-placed drawer and reports the size", () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    render(
      <Drawer
        open
        title="Title"
        resizable={{ onResizeStart, onResize, onResizeEnd }}
      >
        <div>Body</div>
      </Drawer>,
    );
    const panel = stubPanelWidth(448);

    drag(screen.getByRole("separator", { name: "Resize drawer" }), -100);

    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(548);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(panel.style.getPropertyValue("--drawer-size")).toBe("548px");
  });

  test("maxSize caps the drag", () => {
    const onResize = vi.fn();
    render(
      <Drawer open title="Title" resizable={{ onResize }} maxSize={500}>
        <div>Body</div>
      </Drawer>,
    );
    stubPanelWidth(448);

    drag(screen.getByRole("separator", { name: "Resize drawer" }), -400);

    expect(onResize).toHaveBeenLastCalledWith(500);
  });

  test("arrow keys resize the drawer without a pointing device", () => {
    const onResize = vi.fn();
    render(
      <Drawer open title="Title" resizable={{ onResize }}>
        <div>Body</div>
      </Drawer>,
    );
    stubPanelWidth(448);

    fireEvent.keyDown(screen.getByRole("separator", { name: "Resize drawer" }), {
      key: "ArrowLeft",
    });

    expect(onResize).toHaveBeenLastCalledWith(464);
  });

  test("size presets and the deprecated width both feed --drawer-size", () => {
    const { rerender } = render(
      <Drawer open title="Title" size="large">
        <div>Body</div>
      </Drawer>,
    );
    expect(
      document
        .querySelector<HTMLElement>("[data-slot='drawer-content']")!
        .style.getPropertyValue("--drawer-size"),
    ).toBe("736px");

    rerender(
      <Drawer open title="Title" width={320}>
        <div>Body</div>
      </Drawer>,
    );
    expect(
      document
        .querySelector<HTMLElement>("[data-slot='drawer-content']")!
        .style.getPropertyValue("--drawer-size"),
    ).toBe("320px");
  });
});

describe("Drawer resize persistence", () => {
  afterEach(() => document.body.replaceChildren());

  test("a dragged size survives close and reopen while the Drawer stays mounted", async () => {
    const Harness = ({ open }: { open: boolean }) => (
      <Drawer open={open} title="Title" resizable>
        <div>Body</div>
      </Drawer>
    );
    const { rerender } = render(<Harness open />);

    const panel = document.querySelector<HTMLElement>(
      "[data-slot='drawer-content']",
    )!;
    panel.getBoundingClientRect = () =>
      ({ width: 448, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 }) as DOMRect;
    const view = document.defaultView!;
    fireEvent.pointerDown(
      screen.getByRole("separator", { name: "Resize drawer" }),
      { clientX: 0, clientY: 0 },
    );
    fireEvent(view, new MouseEvent("pointermove", { clientX: -100, clientY: 0 }));
    fireEvent(view, new MouseEvent("pointerup", {}));
    expect(panel.style.getPropertyValue("--drawer-size")).toBe("548px");

    rerender(<Harness open={false} />);
    rerender(<Harness open />);

    const reopened = await screen.findByText("Body");
    expect(
      reopened
        .closest("[data-slot='drawer-content']")!
        .getAttribute("style"),
    ).toContain("548px");
  });
});
