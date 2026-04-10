import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

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

import * as PopoverInternalExports from "./_component";
import * as PopoverExports from "./index";
import { Popover } from "./index";

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

  test("does not expose PopoverRoot from the public popover API", () => {
    expect(PopoverExports).not.toHaveProperty("PopoverRoot");
  });

  test("keeps the internal root export under the Popover name", () => {
    expect(PopoverInternalExports).toHaveProperty("Popover");
    expect(PopoverInternalExports).not.toHaveProperty("PopoverRoot");
  });
});
