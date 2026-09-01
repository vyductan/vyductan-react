import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import * as PopoverInternalExports from "./_component";
import * as PopoverExports from "./index";
import { Popover } from "./index";

const { popoverContentPropsSpy } = vi.hoisted(() => ({
  popoverContentPropsSpy: vi.fn(),
}));

vi.mock("radix-ui", async () => {
  const React = await import("react");

  return {
    Popover: {
      Root: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Trigger: ({
        children,
        asChild,
        ...props
      }: {
        children?: React.ReactNode;
        asChild?: boolean;
      }) => {
        if (asChild && React.isValidElement(children)) {
          return React.cloneElement(children, props);
        }

        return <button {...props}>{children}</button>;
      },
      Portal: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Content: React.forwardRef<
        HTMLDivElement,
        React.ComponentPropsWithoutRef<"div">
      >(({ children, ...props }, ref) => {
        popoverContentPropsSpy(props);

        return (
          <div ref={ref} data-testid="mock-radix-popover-content" {...props}>
            {children}
          </div>
        );
      }),
      Arrow: (props: React.ComponentPropsWithoutRef<"div">) => (
        <div data-testid="mock-radix-popover-arrow" {...props} />
      ),
      Anchor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Close: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    },
  };
});

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
};

beforeEach(() => {
  popoverContentPropsSpy.mockClear();
  document.body.replaceChildren();
});

describe("Popover", () => {
  test("renders arrow popover content without throwing when opened", () => {
    expect(() => {
      render(
        <Popover open content={<div>Content</div>}>
          <button type="button">Trigger</button>
        </Popover>,
      );
    }).not.toThrow();

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("preserves the shadcn default side offset when align offset is not provided", () => {
    render(
      <Popover open content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    expect(popoverContentPropsSpy).toHaveBeenCalled();
    expect(popoverContentPropsSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        align: "center",
        side: "bottom",
        sideOffset: 4,
      }),
    );
  });

  test("keeps content clickable (pointer-events-auto) and selectable (select-text) when a modal (Drawer/Dialog) locks the body", () => {
    render(
      <Popover open content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    const className = popoverContentPropsSpy.mock.calls.at(-1)?.[0]?.className;
    expect(className).toContain("pointer-events-auto");
    expect(className).toContain("select-text");
  });

  // The real radix dismiss path cannot run here: its outside-pointer handler
  // never fires under jsdom (verified against raw radix too), so these drive
  // the handler we hand to Content directly. The end-to-end proof lives in the
  // chromium storybook project.
  describe("outside-pointer guard while a layer is stacked above", () => {
    function renderAndGetHandler() {
      render(
        <Popover open trigger="click" content={<div>Content</div>}>
          <button type="button">Trigger</button>
        </Popover>,
      );

      return popoverContentPropsSpy.mock.calls.at(-1)?.[0]
        ?.onPointerDownOutside as (event: {
        preventDefault: () => void;
        detail: { originalEvent: Event };
      }) => void;
    }

    // Shaped like Radix's PointerDownOutsideEvent: it carries the originating
    // pointer-down, which the guard uses to look up its pre-dismiss snapshot.
    function outsideEvent() {
      return {
        preventDefault: vi.fn(),
        detail: { originalEvent: new Event("pointerdown") },
      };
    }

    function addLayer(slot: string, state = "open") {
      const node = document.createElement("div");
      node.dataset.slot = slot;
      node.dataset.state = state;
      document.body.append(node);
      return node;
    }

    test("vetoes the dismiss when a drawer opened on top of it", () => {
      const onPointerDownOutside = renderAndGetHandler();
      addLayer("drawer-content");
      const event = outsideEvent();

      onPointerDownOutside(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("lets the dismiss through with nothing above", () => {
      const onPointerDownOutside = renderAndGetHandler();
      const event = outsideEvent();

      onPointerDownOutside(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test("lets it through for a closed layer above", () => {
      const onPointerDownOutside = renderAndGetHandler();
      addLayer("drawer-content", "closed");
      const event = outsideEvent();

      onPointerDownOutside(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  test("does not expose PopoverRoot from the public popover API", () => {
    expect(PopoverExports).not.toHaveProperty("PopoverRoot");
  });

  test("keeps the internal root export under the Popover name", () => {
    expect(PopoverInternalExports).toHaveProperty("Popover");
    expect(PopoverInternalExports).not.toHaveProperty("PopoverRoot");
  });
});
